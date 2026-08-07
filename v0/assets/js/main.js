import { enableJavaScriptState } from "./core/document-state.js";
import { initHeroDecisionDeck } from "./modules/hero-decision-deck.js";
import { initPhotoRail } from "./modules/photo-rail.js";
import { initSectionMotion } from "./modules/section-motion.js";

enableJavaScriptState(document);

initHeroDecisionDeck(document.querySelector('[data-js="hero-decision-deck"]'));
initPhotoRail(document.querySelector('[data-js="photo-rail"]'));
initSectionMotion(document);
