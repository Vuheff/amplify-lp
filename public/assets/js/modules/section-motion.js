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
  const profiles = {
    cascade: { distance: "0px", duration, opacity: 1, origin: "bottom", scale: 1 },
    rise: { distance: reducedProfile ? "18px" : "40px", duration, opacity: reducedProfile ? 0.35 : 0.25, origin: "bottom", scale: 1 },
    scale: { distance: reducedProfile ? "10px" : "20px", duration, opacity: reducedProfile ? 0.35 : 0.3, origin: "bottom", scale: reducedProfile ? 0.98 : 0.96 },
    "slide-left": { distance: reducedProfile ? "20px" : "56px", duration: reducedProfile ? 650 : 760, opacity: reducedProfile ? 0.35 : 0.2, origin: "left", scale: 1 },
    "slide-right": { distance: reducedProfile ? "20px" : "56px", duration: reducedProfile ? 650 : 760, opacity: reducedProfile ? 0.35 : 0.2, origin: "right", scale: 1 },
    zoom: { distance: reducedProfile ? "8px" : "16px", duration: reducedProfile ? 650 : 760, opacity: reducedProfile ? 0.35 : 0.2, origin: "bottom", scale: reducedProfile ? 0.98 : 0.94 },
  };

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
      const profile = profiles[target.dataset.motion] || profiles.rise;

      scrollReveal.reveal(target, {
        delay: Math.min(index * stepDelay, maximumDelay),
        ...profile,
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
