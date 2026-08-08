import { enableJavaScriptState } from "./core/document-state.js";
import { initHeroDecisionDeck } from "./modules/hero-decision-deck.js";
import { initLeadModal } from "./modules/lead-modal.js";
import { initPhotoRail } from "./modules/photo-rail.js";
import { initSectionMotion } from "./modules/section-motion.js";
import { initSiteNavigation } from "./modules/site-navigation.js";

enableJavaScriptState(document);

initHeroDecisionDeck(document.querySelector('[data-js="hero-decision-deck"]'));
initPhotoRail(document.querySelector('[data-js="photo-rail"]'));
initSectionMotion(document);
initSiteNavigation(document.querySelector(".c-site-nav"));
initLeadModal(
  document.querySelector('[data-js="lead-modal"]'),
  document.querySelectorAll('[data-js="open-lead-modal"]'),
);
