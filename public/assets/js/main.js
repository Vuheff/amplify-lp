import { enableJavaScriptState } from "./core/document-state.js?v=20260808-5";
import { initHeroDecisionDeck } from "./modules/hero-decision-deck.js?v=20260808-5";
import { initLeadModal } from "./modules/lead-modal.js?v=20260808-5";
import { initPhotoRail } from "./modules/photo-rail.js?v=20260808-5";
import { initSiteNavigation } from "./modules/site-navigation.js?v=20260808-5";

enableJavaScriptState(document);

initHeroDecisionDeck(document.querySelector('[data-js="hero-decision-deck"]'));
initPhotoRail(document.querySelector('[data-js="photo-rail"]'));
initSiteNavigation(document.querySelector(".c-site-nav"));
initLeadModal(
  document.querySelector('[data-js="lead-modal"]'),
  document.querySelectorAll('[data-js="open-lead-modal"]'),
);
