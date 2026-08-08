const DESKTOP_QUERY = "(min-width: 44rem)";

export function initSiteNavigation(root) {
  if (!root) return () => {};

  const toggle = root.querySelector('[data-js="site-nav-toggle"]');
  const menu = root.querySelector('[data-js="site-nav-menu"]');
  if (!toggle || !menu) return () => {};

  const links = [...menu.querySelectorAll('a[href^="#"]')];
  const sections = links
    .map((link) => ({ link, target: document.querySelector(link.getAttribute("href")) }))
    .filter(({ target }) => target);
  const desktop = window.matchMedia(DESKTOP_QUERY);
  const listeners = new AbortController();

  let menuOpen = false;
  let lastScrollY = Math.max(0, window.scrollY);
  let scrollFrame = 0;

  function setMenu(open, restoreFocus = false) {
    menuOpen = open && !desktop.matches;
    root.dataset.menuOpen = String(menuOpen);
    toggle.setAttribute("aria-expanded", String(menuOpen));
    toggle.setAttribute("aria-label", menuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação");

    if (desktop.matches) {
      menu.removeAttribute("aria-hidden");
      menu.removeAttribute("inert");
    } else {
      menu.setAttribute("aria-hidden", String(!menuOpen));
      menu.toggleAttribute("inert", !menuOpen);
    }

    if (menuOpen) root.dataset.scrollDirection = "up";
    if (!menuOpen && restoreFocus) toggle.focus();
  }

  function setActiveLink() {
    const marker = window.innerHeight * 0.34;
    let active = sections[0];
    for (const section of sections) {
      if (section.target.getBoundingClientRect().top <= marker) active = section;
    }

    for (const section of sections) {
      if (section === active) section.link.setAttribute("aria-current", "location");
      else section.link.removeAttribute("aria-current");
    }
  }

  function updateScrollState() {
    scrollFrame = 0;
    const current = Math.max(0, window.scrollY);
    const distance = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(100, Math.max(0, (current / distance) * 100));
    const delta = current - lastScrollY;

    root.style.setProperty("--nav-scroll-progress", `${progress}%`);
    root.dataset.scrollState = current > 16 ? "scrolled" : "top";

    if (!menuOpen && current > 160 && delta > 6) root.dataset.scrollDirection = "down";
    else if (delta < -6 || current <= 160 || menuOpen) root.dataset.scrollDirection = "up";

    lastScrollY = current;
    setActiveLink();
  }

  function requestScrollUpdate() {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollState);
  }

  toggle.addEventListener("click", () => setMenu(!menuOpen), { signal: listeners.signal });
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  }, { signal: listeners.signal });
  root.addEventListener("click", (event) => {
    if (event.target.closest('[data-js="open-lead-modal"]')) setMenu(false);
  }, { signal: listeners.signal });
  root.addEventListener("focusin", () => { root.dataset.scrollDirection = "up"; }, { signal: listeners.signal });
  document.addEventListener("pointerdown", (event) => {
    if (menuOpen && !root.contains(event.target)) setMenu(false);
  }, { signal: listeners.signal });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen) setMenu(false, true);
  }, { signal: listeners.signal });
  window.addEventListener("scroll", requestScrollUpdate, { passive: true, signal: listeners.signal });
  desktop.addEventListener("change", () => setMenu(false), { signal: listeners.signal });

  root.dataset.navigationReady = "true";
  setMenu(false);
  updateScrollState();

  return () => {
    listeners.abort();
    if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    root.style.removeProperty("--nav-scroll-progress");
    menu.removeAttribute("aria-hidden");
    menu.removeAttribute("inert");
  };
}
