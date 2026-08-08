const AXIS_LOCK_DISTANCE = 8;
const COMMIT_RATIO = 0.22;
const FLICK_VELOCITY = 0.55;
const MAX_DRAG_OFFSET = 68;
const VELOCITY_WEIGHT = 0.55;
export function initHeroDecisionDeck(root) {
  if (!root) return () => {};
  const cards = root.querySelector('[data-js="decision-cards"]');
  const slides = [...root.querySelectorAll('[data-js="decision-slide"]')];
  const previousButton = root.querySelector('[data-js="decision-previous"]');
  const nextButton = root.querySelector('[data-js="decision-next"]');
  const currentLabels = [...root.querySelectorAll('[data-js="decision-current"]')];
  const indicators = [...root.querySelectorAll('[data-js="decision-indicator"]')];
  if (!cards || slides.length === 0 || !previousButton || !nextButton) return () => {};
  let activeIndex = 0;
  let pointerId = null;
  let activeSlide = null;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastTime = 0;
  let dragX = 0;
  let velocityX = 0;
  let axis = null;
  let slideWidth = 0;
  let visualOffset = 0;
  let dragFrame = 0;
  let settleFrame = 0;
  let settlingSlide = null;
  function positionFor(relative) {
    if (relative === 0) return "active";
    if (relative === 1) return "next";
    if (relative === 2) return "back";
    return relative < 0 ? "before" : "after";
  }
  function resetDrag(slide) {
    if (!slide) return;
    slide.style.removeProperty("--drag-x");
    slide.style.removeProperty("--drag-rotate");
    slide.style.removeProperty("--drag-scale");
  }
  function render(nextIndex) {
    activeIndex = Math.max(0, Math.min(nextIndex, slides.length - 1));
    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.dataset.relative = String(index - activeIndex);
      slide.dataset.deckPosition = positionFor(index - activeIndex);
      slide.setAttribute("aria-current", isActive ? "step" : "false");
      if (isActive) slide.removeAttribute("aria-hidden");
      else slide.setAttribute("aria-hidden", "true");
      slide.toggleAttribute("inert", !isActive);
    });
    indicators.forEach((indicator, index) => indicator.setAttribute("aria-current", String(index === activeIndex)));
    currentLabels.forEach((label) => { label.textContent = String(activeIndex + 1); });
    previousButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === slides.length - 1;
  }
  function setActive(nextIndex) {
    const targetIndex = Math.max(0, Math.min(nextIndex, slides.length - 1));
    if (targetIndex !== activeIndex) render(targetIndex);
  }
  function clearGesture() {
    pointerId = null;
    activeSlide = null;
    dragX = 0;
    velocityX = 0;
    axis = null;
    delete root.dataset.dragging;
    delete root.dataset.dragDirection;
  }

  function applyDragFrame() {
    dragFrame = 0;
    if (!activeSlide || axis !== "x") return;
    root.dataset.dragging = "true";
    root.dataset.dragDirection = dragX < 0 ? "next" : "previous";
    activeSlide.style.setProperty("--drag-x", `${visualOffset}px`);
    activeSlide.style.setProperty("--drag-rotate", `${Math.max(-3, Math.min(3, visualOffset / 22))}deg`);
    activeSlide.style.setProperty("--drag-scale", "1.006");
  }

  function scheduleDragFrame() {
    if (!dragFrame) dragFrame = window.requestAnimationFrame(applyDragFrame);
  }

  function finishSettling() {
    window.cancelAnimationFrame(settleFrame);
    settleFrame = 0;
    resetDrag(settlingSlide);
    settlingSlide = null;
    delete root.dataset.settling;
  }

  function beginDrag(event) {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;

    const slide = event.target.closest('[data-js="decision-slide"]');
    if (slide !== slides[activeIndex]) return;

    if (settleFrame) finishSettling();

    pointerId = event.pointerId;
    activeSlide = slide;
    startX = event.clientX;
    startY = event.clientY;
    lastX = startX;
    lastTime = event.timeStamp;
    dragX = 0;
    velocityX = 0;
    axis = null;
    slideWidth = slide.getBoundingClientRect().width;
    visualOffset = 0;

    try { slide.setPointerCapture(pointerId); } catch {}
  }

  function moveDrag(event) {
    if (event.pointerId !== pointerId || !activeSlide) return;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    if (!axis && Math.hypot(deltaX, deltaY) >= AXIS_LOCK_DISTANCE) {
      axis = Math.abs(deltaX) > Math.abs(deltaY) ? "x" : "y";
    }

    if (axis !== "x") return;
    event.preventDefault();

    const movingPastStart = deltaX > 0 && activeIndex === 0;
    const movingPastEnd = deltaX < 0 && activeIndex === slides.length - 1;
    const resistance = movingPastStart || movingPastEnd ? 0.16 : 0.58;
    visualOffset = Math.max(-MAX_DRAG_OFFSET, Math.min(MAX_DRAG_OFFSET, deltaX * resistance));
    const elapsed = Math.max(1, event.timeStamp - lastTime);
    const instantaneousVelocity = (event.clientX - lastX) / elapsed;

    dragX = deltaX;
    velocityX = (velocityX * (1 - VELOCITY_WEIGHT)) + (instantaneousVelocity * VELOCITY_WEIGHT);
    lastX = event.clientX;
    lastTime = event.timeStamp;
    scheduleDragFrame();
  }

  function endDrag(event, cancelled = false) {
    if (event.pointerId !== pointerId || !activeSlide) return;

    const slide = activeSlide;
    const direction = dragX < 0 ? 1 : -1;
    const targetIndex = activeIndex + direction;
    const canMove = targetIndex >= 0 && targetIndex < slides.length;
    if (dragFrame) {
      window.cancelAnimationFrame(dragFrame);
      applyDragFrame();
    }

    const passedDistance = Math.abs(dragX) >= slideWidth * COMMIT_RATIO;
    const passedVelocity = Math.abs(velocityX) >= FLICK_VELOCITY;
    const shouldCommit = !cancelled && axis === "x" && canMove && (passedDistance || passedVelocity);

    try {
      if (slide.hasPointerCapture(pointerId)) slide.releasePointerCapture(pointerId);
    } catch {}

    root.dataset.settling = "true";
    settlingSlide = slide;
    if (shouldCommit) setActive(targetIndex);
    clearGesture();
    settleFrame = window.requestAnimationFrame(finishSettling);
  }

  function handleKeydown(event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActive(activeIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setActive(activeIndex + 1);
    }
  }

  function showPrevious() { setActive(activeIndex - 1); }
  function showNext() { setActive(activeIndex + 1); }
  function preventNativeDrag(event) { event.preventDefault(); }
  function cancelDrag(event) { endDrag(event, true); }

  previousButton.addEventListener("click", showPrevious);
  nextButton.addEventListener("click", showNext);
  cards.addEventListener("keydown", handleKeydown);
  cards.addEventListener("pointerdown", beginDrag);
  cards.addEventListener("pointermove", moveDrag);
  cards.addEventListener("pointerup", endDrag);
  cards.addEventListener("pointercancel", cancelDrag);
  cards.addEventListener("dragstart", preventNativeDrag);

  render(0);
  root.dataset.deckReady = "true";

  return () => {
    window.cancelAnimationFrame(dragFrame);
    window.cancelAnimationFrame(settleFrame);
    previousButton.removeEventListener("click", showPrevious);
    nextButton.removeEventListener("click", showNext);
    cards.removeEventListener("keydown", handleKeydown);
    cards.removeEventListener("pointerdown", beginDrag);
    cards.removeEventListener("pointermove", moveDrag);
    cards.removeEventListener("pointerup", endDrag);
    cards.removeEventListener("pointercancel", cancelDrag);
    cards.removeEventListener("dragstart", preventNativeDrag);
    slides.forEach(resetDrag);
    settlingSlide = null;
    clearGesture();
    delete root.dataset.settling;
  };
}
