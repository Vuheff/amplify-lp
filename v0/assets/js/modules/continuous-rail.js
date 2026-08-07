export function initContinuousRail(root, options = {}) {
  if (!root) return () => {};

  const { hookPrefix, speed = 24, motionLabel = "do trilho" } = options;
  const find = (name) => root.querySelector(`[data-js="${hookPrefix}-${name}"]`);
  const track = find("track");
  const group = find("group");
  const toggle = find("toggle");
  const toggleLabel = find("toggle-label");
  const toggleIcon = find("toggle-icon");
  const viewport = track?.parentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const precisePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  if (!hookPrefix || !track || !group || !toggle || !toggleLabel || !toggleIcon || !viewport || typeof track.animate !== "function") {
    return () => {};
  }

  const existingDuplicate = [...track.children].find((child) => child !== group && child.getAttribute("aria-hidden") === "true");
  const duplicate = existingDuplicate || group.cloneNode(true);
  const ownsDuplicate = !existingDuplicate;

  if (ownsDuplicate) {
    duplicate.querySelectorAll("[data-js]").forEach((node) => node.removeAttribute("data-js"));
    duplicate.removeAttribute("data-js");
    duplicate.setAttribute("aria-hidden", "true");
    duplicate.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    duplicate.querySelectorAll("img").forEach((image) => image.setAttribute("alt", ""));
    track.append(duplicate);
  }

  let animation = null;
  let rebuildQueued = false;
  let destroyed = false;
  let manuallyPaused = false;
  let pointerPaused = false;
  let pageHidden = document.hidden;

  const shouldPause = () => manuallyPaused || (pointerPaused && precisePointer.matches) || pageHidden || reducedMotion.matches;

  function renderControl() {
    root.dataset.paused = String(shouldPause());
    toggle.setAttribute("aria-pressed", String(manuallyPaused));
    toggle.setAttribute("aria-label", `${manuallyPaused ? "Retomar" : "Pausar"} movimento ${motionLabel}`);
    toggleLabel.textContent = manuallyPaused ? "Retomar" : "Pausar";
    toggleIcon.textContent = manuallyPaused ? "▶" : "Ⅱ";
  }

  function syncPlayback() {
    renderControl();
    if (!animation) return;
    if (shouldPause()) animation.pause();
    else animation.play();
  }

  function readProgress() {
    if (!animation) return 0;
    const duration = Number(animation.effect?.getTiming().duration);
    const currentTime = Number(animation.currentTime);
    if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(currentTime)) return 0;
    return (currentTime % duration) / duration;
  }

  function buildAnimation() {
    if (destroyed) return;
    if (reducedMotion.matches) {
      animation?.cancel();
      animation = null;
      syncPlayback();
      return;
    }

    const distance = group.getBoundingClientRect().width;
    if (distance <= 0) return;

    const progress = readProgress();
    animation?.cancel();
    animation = track.animate(
      [{ transform: "translate3d(0, 0, 0)" }, { transform: `translate3d(${-distance}px, 0, 0)` }],
      { duration: (distance / speed) * 1000, easing: "linear", iterations: Infinity },
    );
    animation.currentTime = progress * Number(animation.effect.getTiming().duration);
    syncPlayback();
  }

  function scheduleAnimationBuild() {
    if (rebuildQueued) return;
    rebuildQueued = true;
    queueMicrotask(() => {
      rebuildQueued = false;
      buildAnimation();
    });
  }

  function toggleMotion() {
    if (reducedMotion.matches) return;
    manuallyPaused = !manuallyPaused;
    syncPlayback();
  }

  function handlePointerEnter() {
    if (!precisePointer.matches) return;
    pointerPaused = true;
    syncPlayback();
  }

  function handlePointerLeave() {
    pointerPaused = false;
    syncPlayback();
  }

  function handlePointerPreference() {
    if (!precisePointer.matches) pointerPaused = false;
    syncPlayback();
  }

  function handleVisibilityChange() {
    pageHidden = document.hidden;
    syncPlayback();
  }

  const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(scheduleAnimationBuild) : null;
  resizeObserver?.observe(group);
  window.addEventListener("resize", scheduleAnimationBuild);
  toggle.addEventListener("click", toggleMotion);
  viewport.addEventListener("mouseenter", handlePointerEnter);
  viewport.addEventListener("mouseleave", handlePointerLeave);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  reducedMotion.addEventListener?.("change", scheduleAnimationBuild);
  precisePointer.addEventListener?.("change", handlePointerPreference);

  root.dataset.railReady = "true";
  renderControl();
  scheduleAnimationBuild();

  return () => {
    destroyed = true;
    animation?.cancel();
    resizeObserver?.disconnect();
    window.removeEventListener("resize", scheduleAnimationBuild);
    toggle.removeEventListener("click", toggleMotion);
    viewport.removeEventListener("mouseenter", handlePointerEnter);
    viewport.removeEventListener("mouseleave", handlePointerLeave);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    reducedMotion.removeEventListener?.("change", scheduleAnimationBuild);
    precisePointer.removeEventListener?.("change", handlePointerPreference);
    if (ownsDuplicate) duplicate.remove();
    delete root.dataset.railReady;
    delete root.dataset.paused;
  };
}
