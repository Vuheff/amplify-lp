export function initSectionMotion(root = document) {
  const targets = [...root.querySelectorAll("[data-motion]")];
  if (!targets.length) return () => {};

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const show = (target) => { target.dataset.motionState = "visible"; };
  const showAll = () => targets.forEach(show);

  if (reducedMotion.matches || typeof window.ScrollReveal !== "function") {
    showAll();
    return () => {};
  }

  const scrollReveal = window.ScrollReveal({
    cleanup: true,
    desktop: true,
    duration: 680,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    mobile: true,
    reset: false,
    useDelay: "once",
    viewFactor: 0.08,
    viewOffset: { top: 0, right: 0, bottom: 40, left: 0 },
  });

  const groups = [...new Set(targets.map((target) => target.closest("section") || target.parentElement))];

  groups.forEach((group) => {
    const groupTargets = targets.filter((target) => (target.closest("section") || target.parentElement) === group);

    groupTargets.forEach((target, index) => {
      const scales = target.dataset.motion === "scale";

      scrollReveal.reveal(target, {
        delay: Math.min(index * 70, 210),
        distance: scales ? "12px" : "24px",
        opacity: scales ? 0.84 : 0.78,
        origin: "bottom",
        scale: scales ? 0.975 : 1,
        beforeReveal: show,
      });
    });
  });

  const handleReducedMotion = (event) => {
    if (!event.matches) return;
    scrollReveal.destroy();
    showAll();
  };

  reducedMotion.addEventListener("change", handleReducedMotion);

  return () => {
    reducedMotion.removeEventListener("change", handleReducedMotion);
    scrollReveal.destroy();
    showAll();
  };
}
