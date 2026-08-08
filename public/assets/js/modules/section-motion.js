(function bootstrapSectionMotion() {
function initSectionMotion(root) {
  const targets = [...root.querySelectorAll("[data-motion]")];
  if (!targets.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const show = (target) => { target.dataset.motionState = "visible"; };
  const showAll = () => targets.forEach(show);
  const settle = (target) => {
    show(target);
    ["visibility", "opacity", "transform", "transition"].forEach((property) => target.style.removeProperty(property));
  };
  const setEngine = (engine) => { root.documentElement.dataset.motionEngine = engine; };

  if (typeof window.ScrollReveal !== "function") {
    showAll();
    setEngine("static");
    return;
  }

  const reducedProfile = reducedMotion.matches;
  const duration = reducedProfile ? 480 : 760;
  const stepDelay = reducedProfile ? 50 : 80;
  const maximumDelay = reducedProfile ? 150 : 240;

  const scrollReveal = window.ScrollReveal({
    cleanup: true,
    desktop: true,
    duration,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    mobile: true,
    reset: false,
    useDelay: "once",
    viewFactor: 0.08,
    viewOffset: { top: 0, right: 0, bottom: 40, left: 0 },
  });
  setEngine(reducedProfile ? "scrollreveal-reduced" : "scrollreveal");

  const groups = [...new Set(targets.map((target) => target.closest("section") || target.parentElement))];

  groups.forEach((group) => {
    const groupTargets = targets.filter((target) => (target.closest("section") || target.parentElement) === group);

    groupTargets.forEach((target, index) => {
      const scales = target.dataset.motion === "scale";

      scrollReveal.reveal(target, {
        delay: Math.min(index * stepDelay, maximumDelay),
        distance: reducedProfile ? (scales ? "8px" : "12px") : (scales ? "16px" : "32px"),
        opacity: reducedProfile ? (scales ? 0.88 : 0.84) : (scales ? 0.8 : 0.75),
        origin: "bottom",
        scale: scales ? (reducedProfile ? 0.985 : 0.965) : 1,
        beforeReveal: show,
      });
    });
  });

  const settleHashDestination = () => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;

    const destination = root.getElementById(id);
    if (!destination) return;

    const destinationTargets = [...destination.querySelectorAll("[data-motion]")];
    scrollReveal.clean(destinationTargets);
    destinationTargets.forEach(settle);
  };

  if (window.location.hash) {
    window.requestAnimationFrame(() => window.requestAnimationFrame(settleHashDestination));
  }

  const handleReducedMotion = (event) => {
    if (!event.matches) return;
    scrollReveal.destroy();
    showAll();
    setEngine("static-changed-preference");
  };

  reducedMotion.addEventListener("change", handleReducedMotion);
  window.addEventListener("pagehide", () => {
    reducedMotion.removeEventListener("change", handleReducedMotion);
    scrollReveal.destroy();
    showAll();
  }, { once: true });
}

if (document.readyState === "complete") initSectionMotion(document);
else window.addEventListener("load", () => initSectionMotion(document), { once: true });
}());
