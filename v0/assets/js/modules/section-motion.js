export function initSectionMotion(root = document) {
  const targets = [...root.querySelectorAll("[data-motion]")];
  if (!targets.length) return () => {};

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reveal = (target) => { target.dataset.motionState = "visible"; };

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    targets.forEach(reveal);
    return () => {};
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -6%" });

  targets.forEach((target) => observer.observe(target));
  return () => observer.disconnect();
}
