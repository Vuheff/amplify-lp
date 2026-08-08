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
  const duration = reducedProfile ? 650 : 720;
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
        distance: reducedProfile ? "0px" : (scales ? "20px" : "40px"),
        opacity: reducedProfile ? 0.35 : (scales ? 0.3 : 0.25),
        origin: "bottom",
        scale: scales && !reducedProfile ? 0.96 : 1,
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
    setEngine("static");
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
