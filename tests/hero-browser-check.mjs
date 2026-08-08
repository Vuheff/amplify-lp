import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const port = process.argv[2] || "9222";
const pageUrl = "http://127.0.0.1:4173/";
const fileUrl = pathToFileURL(resolve("public", "index.html")).href;
const pages = await fetch(`http://127.0.0.1:${port}/json`).then((response) => response.json());
const page = pages.find((candidate) => candidate.type === "page");
if (!page) throw new Error("No browser page available");

const socket = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
const eventWaiters = new Map();
let nextId = 0;

await new Promise((resolveOpen, rejectOpen) => {
  socket.addEventListener("open", resolveOpen, { once: true });
  socket.addEventListener("error", rejectOpen, { once: true });
});

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
    return;
  }

  const waiters = eventWaiters.get(message.method);
  if (waiters?.length) waiters.shift()(message.params);
});

function send(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolveRequest, rejectRequest) => pending.set(id, { resolve: resolveRequest, reject: rejectRequest }));
}

function waitForEvent(method) {
  return new Promise((resolveEvent) => {
    const waiters = eventWaiters.get(method) || [];
    waiters.push(resolveEvent);
    eventWaiters.set(method, waiters);
  });
}

async function evaluate(expression, awaitPromise = false) {
  const response = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
  return response.result.value;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const assetVersion = "v=20260808-2";
const [servedHtml, servedMainCss, servedMainJs, servedPhotoRail, servedLeadModal, servedSectionMotion, servedMotionCss, servedScrollReveal] = await Promise.all([
  fetch(pageUrl).then((response) => response.text()),
  fetch(`${pageUrl}assets/css/main.css?${assetVersion}`).then((response) => response.text()),
  fetch(`${pageUrl}assets/js/main.js?${assetVersion}`).then((response) => response.text()),
  fetch(`${pageUrl}assets/js/modules/photo-rail.js?${assetVersion}`).then((response) => response.text()),
  fetch(`${pageUrl}assets/js/modules/lead-modal.js?${assetVersion}`).then((response) => response.text()),
  fetch(`${pageUrl}assets/js/modules/section-motion.js?${assetVersion}`).then((response) => response.text()),
  fetch(`${pageUrl}assets/css/components/motion.css?${assetVersion}`).then((response) => response.text()),
  fetch(`${pageUrl}assets/vendor/scrollreveal.min.js?v=4.0.9`).then((response) => response.text()),
]);
const cssImports = [...servedMainCss.matchAll(/@import url\("([^"]+)"\)/g)].map((match) => match[1]);
const moduleImports = [servedMainJs, servedPhotoRail, servedLeadModal]
  .flatMap((source) => [...source.matchAll(/from "([^"]+)"/g)].map((match) => match[1]));
assert([
  "assets/css/main.css",
  "assets/js/main.js",
  "assets/js/brand-carousel.js",
  "assets/js/promo-carousel.js",
].every((asset) => servedHtml.includes(`${asset}?${assetVersion}`)), "HTML entries must share one cache-busting version");
assert(servedHtml.includes("assets/vendor/scrollreveal.min.js?v=4.0.9") && servedScrollReveal.includes("ScrollReveal v4.0.9"), "HTML must load the approved local ScrollReveal 4.0.9 asset");
assert(cssImports.length > 0 && cssImports.every((asset) => asset.endsWith(`?${assetVersion}`)), "Every CSS import must share the release version");
assert(moduleImports.length > 0 && moduleImports.every((asset) => asset.endsWith(`?${assetVersion}`)), "Every JavaScript module import must share the release version");
assert(servedSectionMotion.includes("window.ScrollReveal") && !servedSectionMotion.includes("IntersectionObserver"), "Section motion must use only the ScrollReveal runtime");
assert(!servedMotionCss.includes("animation-timeline") && !servedMotionCss.includes("@keyframes motion-"), "Motion CSS must not retain a competing View Timeline engine");

async function readState() {
  return evaluate(`(() => {
    const root = document.querySelector('[data-js="hero-decision-deck"]');
    const cards = root.querySelector('[data-js="decision-cards"]');
    const slides = [...root.querySelectorAll('[data-js="decision-slide"]')];
    const activeSlide = root.querySelector('[data-deck-position="active"]');
    const previous = root.querySelector('[data-js="decision-previous"]');
    const next = root.querySelector('[data-js="decision-next"]');
    const buttons = [...root.querySelectorAll('.c-decision-preview__controls button')];
    return {
      ready: root.dataset.deckReady,
      current: root.querySelector('[data-js="decision-current"]').textContent,
      active: activeSlide.getAttribute('aria-label'),
      activePosition: activeSlide.dataset.deckPosition,
      previousDisabled: previous.disabled,
      nextDisabled: next.disabled,
      h1Count: document.querySelectorAll('h1').length,
      heroTitle: document.querySelector('.c-hero__title')?.textContent.replace(/\\s+/g, ' ').trim(),
      heroEyebrow: document.querySelector('.c-hero__eyebrow')?.textContent.replace(/\\s+/g, ' ').trim(),
      heroLead: document.querySelector('.c-hero__lead')?.textContent.replace(/\\s+/g, ' ').trim(),
      heroCopyAlignment: getComputedStyle(document.querySelector('.c-hero__copy')).textAlign,
      heroProofCount: document.querySelectorAll('.c-hero__proof').length,
      promoText: document.querySelector('.c-promo-strip')?.textContent.replace(/\\s+/g, ' ').trim(),
      promoTarget: document.querySelector('.c-promo-strip__link')?.getAttribute('href'),
      promoOpensModal: document.querySelector('.c-promo-strip__link')?.matches('[data-js="open-lead-modal"]'),
      promoElement: document.querySelector('.c-promo-strip__link')?.tagName,
      promoHeight: document.querySelector('.c-promo-strip__link')?.getBoundingClientRect().height,
      promoFitsViewport: document.querySelector('.c-promo-strip')?.getBoundingClientRect().right <= innerWidth,
      promoBelowNav: document.querySelector('.c-site-nav')?.nextElementSibling === document.querySelector('.c-promo-strip'),
      promoReady: document.querySelector('[data-js="promo-rail"]')?.dataset.railReady === 'true',
      promoGroupsEqual: (() => {
        const groups = [...document.querySelectorAll('.c-promo-strip__group')];
        return groups.length === 2 && Math.abs(groups[0].getBoundingClientRect().width - groups[1].getBoundingClientRect().width) < 0.5;
      })(),
      promoDuplicateHidden: document.querySelectorAll('.c-promo-strip__group')[1]?.getAttribute('aria-hidden') === 'true',
      promoEngine: document.querySelector('[data-js="promo-rail"]')?.dataset.railEngine,
      promoSpeed: Number(document.querySelector('[data-js="promo-rail"]')?.dataset.railSpeed),
      promoAnimationCount: document.querySelector('[data-js="promo-rail-track"]')?.getAnimations().length,
      promoPlayState: document.querySelector('[data-js="promo-rail-track"]')?.getAnimations()[0]?.playState,
      deckTop: root.getBoundingClientRect().top,
      bodyScrollWidth: document.body.scrollWidth,
      viewportWidth: innerWidth,
      hasHorizontalRail: getComputedStyle(cards).overflowX === 'auto',
      realNext: root.querySelector('[data-deck-position="next"] .c-decision-card')?.dataset.decision || null,
      realBack: root.querySelector('[data-deck-position="back"] .c-decision-card')?.dataset.decision || null,
      layerCount: root.querySelectorAll('.c-decision-preview__layer').length,
      inactiveInert: slides.filter((slide) => slide !== activeSlide).every((slide) => slide.hasAttribute('inert') && slide.getAttribute('aria-hidden') === 'true'),
      minimumButtonSize: Math.min(...buttons.map((button) => button.getBoundingClientRect().width)),
      activeCardBorder: getComputedStyle(activeSlide.querySelector('.c-decision-card')).borderTopWidth,
      navLogo: (() => {
        const image = document.querySelector('.c-site-nav__brand img');
        return {
          source: image?.getAttribute('src'),
          width: image?.getAttribute('width'),
          height: image?.getAttribute('height'),
          naturalWidth: image?.naturalWidth,
          renderedSize: image?.getBoundingClientRect().width,
          alt: image?.getAttribute('alt'),
        };
      })(),
      navigation: (() => {
        const nav = document.querySelector('.c-site-nav');
        const menu = nav.querySelector('[data-js="site-nav-menu"]');
        const toggle = nav.querySelector('[data-js="site-nav-toggle"]');
        const icons = [...menu.querySelectorAll('.c-site-nav__link-icon img')];
        return {
          ready: nav.dataset.navigationReady,
          open: nav.dataset.menuOpen,
          scrollState: nav.dataset.scrollState,
          direction: nav.dataset.scrollDirection,
          toggleDisplay: getComputedStyle(toggle).display,
          expanded: toggle.getAttribute('aria-expanded'),
          menuHidden: menu.getAttribute('aria-hidden'),
          menuInert: menu.hasAttribute('inert'),
          linkCount: menu.querySelectorAll('a').length,
          iconCount: icons.length,
          iconsReady: icons.every((icon) => icon.complete && icon.naturalWidth === 24 && icon.getAttribute('width') === '24' && icon.getAttribute('height') === '24' && icon.alt === ''),
          iconsLocal: icons.every((icon) => icon.getAttribute('src')?.startsWith('./assets/icons/google/')),
          iconDisplay: getComputedStyle(icons[0]?.parentElement).display,
          currentTarget: menu.querySelector('[aria-current="location"]')?.getAttribute('href'),
        };
      })(),
      publicCopyUsesEmDash: document.body.innerText.includes('\u2014') || [...document.querySelectorAll('[aria-label]')].some((element) => element.getAttribute('aria-label')?.includes('\u2014')),
      publicCopyUsesCreators: [
        document.body.innerText,
        document.querySelector('meta[name="description"]')?.content,
        ...[...document.querySelectorAll('[aria-label]')].map((element) => element.getAttribute('aria-label')),
      ].some((copy) => /\\bcreators?\\b/i.test(copy || '')),
      requiredSections: ['metodo', 'operacao', 'comparacao', 'prova', 'inscricao', 'proximo-passo'].every((id) => Boolean(document.getElementById(id))),
      heroCtaTarget: document.querySelector('.c-hero .c-conversion-cta')?.getAttribute('href'),
      registrationCtas: [...document.querySelectorAll('[data-js="open-lead-modal"]')].map((link) => link.textContent.replace(/\\s+/g, ' ').trim()),
      registrationCtaMinimumHeight: Math.min(...[...document.querySelectorAll('[data-js="open-lead-modal"]')].map((link) => link.getBoundingClientRect().height)),
      ctaTopology: {
        hero: Boolean(document.querySelector('.c-hero [data-js="open-lead-modal"]')),
        product: Boolean(document.querySelector('.c-product-value [data-js="open-lead-modal"]')),
        final: Boolean(document.querySelector('.c-final-cta [data-js="open-lead-modal"]')),
        redundant: document.querySelectorAll('.c-site-nav [data-js="open-lead-modal"], .c-promo-strip [data-js="open-lead-modal"], .c-comparison [data-js="open-lead-modal"], .c-offer [data-js="open-lead-modal"]').length,
      },
      proofImageDimensions: [...document.querySelectorAll('.c-proof img')].every((image) => Number(image.getAttribute('width')) > 0 && Number(image.getAttribute('height')) > 0 && image.loading === 'lazy'),
      fakeTestimonials: document.querySelectorAll('blockquote, [data-testimonial]').length,
      finalCtaInternal: (() => {
        const link = document.querySelector('.c-final-cta .c-conversion-cta');
        return link?.getAttribute('href') === '#inscricao' && !link?.hasAttribute('target');
      })(),
      noNotionLinks: ![...document.querySelectorAll('a[href]')].some((link) => link.href.includes('notion.so')),
      productValue: (() => {
        const root = document.querySelector('.c-product-value');
        const items = [...root.querySelectorAll('.c-product-value__included-list li')];
        return {
          title: root.querySelector('h2')?.textContent.trim(),
          includedFirst: root.querySelector('.c-product-value__layout')?.firstElementChild?.classList.contains('c-product-value__included'),
          includedItems: items.map((item) => ({
            title: item.querySelector('strong')?.textContent.trim(),
            description: item.querySelector('p')?.textContent.trim(),
          })),
          hasIndividualPrices: items.some((item) => item.textContent.includes('R$')),
          reference: root.querySelector('.c-product-value__reference')?.getAttribute('aria-label'),
          offerTitle: root.querySelector('.c-product-value__topline strong')?.textContent.trim(),
          discount: root.querySelector('.c-product-value__discount')?.textContent.replace(/\\s+/g, ' ').trim(),
          price: root.querySelector('.c-product-value__price')?.getAttribute('aria-label'),
          format: root.querySelector('.c-product-value__badge')?.textContent.trim(),
          facts: [...root.querySelectorAll('.c-product-value__facts li')].map((item) => item.textContent.replace(/\\s+/g, ' ').trim()),
          cta: root.querySelector('.c-conversion-cta')?.textContent.replace(/\\s+/g, ' ').trim(),
          ctaTarget: root.querySelector('.c-conversion-cta')?.getAttribute('href'),
          mentionsMentoring: root.textContent.toLowerCase().includes('mentoria'),
        };
      })(),
      offerCard: (() => {
        const root = document.querySelector('.c-offer__card');
        const bars = [...root.querySelectorAll('.c-offer__bar')];
        const copyBox = root.querySelector('.c-offer__card-copy').getBoundingClientRect();
        const stepsBox = root.querySelector('.c-offer__steps').getBoundingClientRect();
        const footerBox = root.querySelector('.c-offer__footer').getBoundingClientRect();
        return {
          count: document.querySelectorAll('.c-offer__card').length,
          title: root.querySelector('h3')?.textContent.trim(),
          steps: [...root.querySelectorAll('.c-offer__step-copy')].map((step) => step.querySelector('strong').textContent.trim() + ' · ' + step.querySelector('small').textContent.trim()),
          heights: bars.map((bar) => bar.getBoundingClientRect().height),
          transitionDelays: [...root.querySelectorAll('.c-offer__step')].map((step) => getComputedStyle(step).transitionDelay),
          hasCta: Boolean(root.querySelector('.c-conversion-cta, [data-js="open-lead-modal"]')),
          footerSeparated: footerBox.top >= Math.max(copyBox.bottom, stepsBox.bottom) - 0.5,
          oldLayerCount: document.querySelectorAll('.c-offer__growth, .c-offer__grid, .c-offer__scope, .c-offer__action').length,
          absoluteDescendants: [...root.querySelectorAll('*')].filter((element) => getComputedStyle(element).position === 'absolute').length,
          chartLabel: root.querySelector('.c-offer__steps').getAttribute('aria-label'),
        };
      })(),
      fullJourney: Boolean(document.querySelector('.c-site-nav') && document.querySelector('.c-method-timeline') && document.querySelector('.c-product-value') && document.querySelector('.c-comparison') && document.querySelector('.c-offer')),
      methodImageReady: [...document.querySelectorAll('.c-method-timeline img')].length === 1 && [...document.querySelectorAll('.c-method-timeline img')].every((image) => image.width > 0 && image.height > 0 && image.loading === 'lazy'),
      photoRailReady: document.querySelector('[data-js="photo-rail"]')?.dataset.railReady === 'true',
      photoRailDuplicateHidden: document.querySelectorAll('.c-photo-rail__group')[1]?.getAttribute('aria-hidden') === 'true',
      photoRailGroupsEqual: (() => {
        const groups = [...document.querySelectorAll('.c-photo-rail__group')];
        return groups.length === 2 && Math.abs(groups[0].getBoundingClientRect().width - groups[1].getBoundingClientRect().width) < 0.5 && groups.every((group) => group.children.length === 8);
      })(),
      photoRailImagesReady: [...document.querySelectorAll('.c-photo-rail__group:first-child img')].length === 8 && [...document.querySelectorAll('.c-photo-rail__group:first-child img')].every((image) => image.getAttribute('width') === '480' && image.getAttribute('height') === '640' && image.loading === 'lazy'),
      photoRailToggleSize: document.querySelector('[data-js="photo-rail-toggle"]')?.getBoundingClientRect().height,
      photoRailToggleDisplay: getComputedStyle(document.querySelector('[data-js="photo-rail-toggle"]')).display,
      photoRailToggleRight: document.querySelector('[data-js="photo-rail-toggle"]')?.getBoundingClientRect().right,
      photoRailAnimationCount: document.querySelector('[data-js="photo-rail-track"]')?.getAnimations().length,
      brandRailTitle: document.querySelector('.c-brand-rail h2')?.textContent.replace(/\\s+/g, ' ').trim(),
      brandRailReady: document.querySelector('[data-js="brand-rail"]')?.dataset.railReady === 'true',
      brandRailDuplicateHidden: document.querySelectorAll('.c-brand-rail__group')[1]?.getAttribute('aria-hidden') === 'true',
      brandRailGroupsEqual: (() => {
        const groups = [...document.querySelectorAll('.c-brand-rail__group')];
        return groups.length === 2 && Math.abs(groups[0].getBoundingClientRect().width - groups[1].getBoundingClientRect().width) < 0.5 && groups.every((group) => group.children.length === 9);
      })(),
      brandRailImagesReady: [...document.querySelectorAll('.c-brand-rail__group:first-child img')].length === 9 && [...document.querySelectorAll('.c-brand-rail__group:first-child img')].every((image) => Number(image.getAttribute('width')) > 0 && Number(image.getAttribute('height')) > 0 && image.loading === 'lazy' && image.alt.length > 0),
      brandRailHasToggle: Boolean(document.querySelector('[data-js="brand-rail-toggle"]')),
      brandRailEngine: document.querySelector('[data-js="brand-rail"]')?.dataset.railEngine,
      brandRailSpeed: Number(document.querySelector('[data-js="brand-rail"]')?.dataset.railSpeed),
      brandRailAnimationCount: document.querySelector('[data-js="brand-rail-track"]')?.getAnimations().length,
      brandRailPlayState: document.querySelector('[data-js="brand-rail-track"]')?.getAnimations()[0]?.playState,
      motionContentReadable: [...document.querySelectorAll('[data-motion]')].every((target) => Number.parseFloat(getComputedStyle(target).opacity) >= 0.75),
      scrollMotion: (() => {
        const target = document.querySelector('#metodo [data-motion="rise"]');
        const style = getComputedStyle(target);
        const scrollReveal = typeof window.ScrollReveal === 'function' ? window.ScrollReveal() : null;
        return {
          libraryReady: Boolean(scrollReveal),
          version: scrollReveal?.version,
          registered: target.hasAttribute('data-sr-id'),
          animationName: style.animationName,
          animationTimeline: style.animationTimeline,
          opacity: Number.parseFloat(style.opacity),
          transform: style.transform,
        };
      })(),
    };
  })()`);
}

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  screenWidth: 390,
  screenHeight: 844,
  deviceScaleFactor: 1,
  mobile: true,
});
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });

const loaded = waitForEvent("Page.loadEventFired");
await send("Page.navigate", { url: pageUrl });
await loaded;
await new Promise((resolveDelay) => setTimeout(resolveDelay, 120));

const initial = await readState();
assert(initial.ready === "true", "Enhanced deck must initialize before showing controls");
assert(initial.current === "1", "Initial deck position must be 1");
assert(initial.activePosition === "active", "One real card must be active");
assert(initial.realNext === "creators" && initial.realBack === "content", "The visible stack must use subsequent real cards");
assert(initial.layerCount === 0, "Decorative fake card layers must be removed");
assert(initial.inactiveInert, "Inactive cards must be inert and hidden from assistive technology");
assert(initial.previousDisabled && !initial.nextDisabled, "Controls must reflect the first decision");
assert(initial.h1Count === 1, "Hero must contain exactly one h1");
assert(initial.heroTitle === "A nova era das vendas no Brasil começa no feed.", `Hero must use the approved market position: ${JSON.stringify(initial.heroTitle)}`);
assert(initial.heroEyebrow === "Webinar TikTok Shop · Compra por descoberta" && initial.heroLead.includes("Você termina o webinar com critérios"), "Hero must identify the product and lead with the participant outcome");
assert(initial.heroCopyAlignment === "center", "Mobile Hero copy must use a centered reading axis");
assert(initial.promoText.includes("Condição atual") && initial.promoText.includes("Webinar TikTok Shop") && initial.promoText.includes("R$ 1.632") && initial.promoText.includes("R$ 97 à vista") && initial.promoText.includes("Ver a condição completa"), `Promo strip must use only the confirmed product, price and detail cue: ${JSON.stringify(initial.promoText)}`);
assert(initial.promoTarget === "#operacao" && !initial.promoOpensModal && initial.promoElement === "A" && initial.promoHeight >= 44 && initial.promoFitsViewport, "Promo strip must navigate to the price explanation without opening the modal");
assert(initial.promoBelowNav && initial.promoReady && initial.promoGroupsEqual && initial.promoDuplicateHidden, "Promo strip must sit directly below the navigation and initialize two equal semantic groups");
assert(initial.promoEngine === "web-animations-api" && initial.promoSpeed === 72 && initial.promoAnimationCount === 1 && initial.promoPlayState === "running", `Promo strip must auto-start one nonstop JavaScript carousel: ${JSON.stringify({ engine: initial.promoEngine, speed: initial.promoSpeed, animations: initial.promoAnimationCount, playState: initial.promoPlayState })}`);
assert(initial.heroProofCount === 0 && initial.deckTop < 650, "Hero must remove competing proof copy and reveal the deck sooner");
assert(initial.bodyScrollWidth === initial.viewportWidth, "Page must not overflow horizontally");
assert(!initial.hasHorizontalRail, "Enhanced deck must not remain a horizontal scroll rail");
assert(initial.minimumButtonSize >= 44, "Deck controls must be at least 44 CSS pixels");
assert(initial.activeCardBorder === "0px", "Decision card must not render the rejected outline");
assert(initial.navLogo.source === "./assets/images/web/amplify-nav-logo.png" && initial.navLogo.width === "512" && initial.navLogo.height === "512" && initial.navLogo.naturalWidth === 512 && initial.navLogo.renderedSize === 36 && initial.navLogo.alt === "", `Navigation must use the supplied Amplify symbol without layout shift: ${JSON.stringify(initial.navLogo)}`);
assert(initial.navigation.ready === "true" && initial.navigation.open === "false" && initial.navigation.toggleDisplay === "grid" && initial.navigation.expanded === "false", `Mobile navigation must initialize as a closed menu with an explicit control: ${JSON.stringify(initial.navigation)}`);
assert(initial.navigation.menuHidden === "true" && initial.navigation.menuInert && initial.navigation.linkCount === 4 && initial.navigation.currentTarget === "#main-content", "Closed mobile navigation must be inert while preserving all four destinations");
assert(initial.navigation.iconCount === 4 && initial.navigation.iconsReady && initial.navigation.iconsLocal && initial.navigation.iconDisplay === "grid", `Mobile navigation must use four local, decorative Material Symbols without layout shift: ${JSON.stringify(initial.navigation)}`);
assert(!initial.publicCopyUsesEmDash, "Public landing copy and accessible labels must not use em dashes");
assert(!initial.publicCopyUsesCreators, "Public copy, metadata and accessible labels must use Criadores de conteúdo instead of creator or Creators");
assert(initial.requiredSections, "The full reference structure must exist in the correct journey");
assert(initial.heroCtaTarget === "#inscricao", "Hero CTA must lead to the final conversion section");
assert(initial.registrationCtas.length === 3 && initial.registrationCtas.every((label) => label.includes("Garantir minha vaga")) && initial.registrationCtaMinimumHeight >= 44, `The journey must expose exactly three accessible modal triggers: ${JSON.stringify(initial.registrationCtas)}`);
assert(initial.ctaTopology.hero && initial.ctaTopology.product && initial.ctaTopology.final && initial.ctaTopology.redundant === 0, `Modal triggers must exist only in Hero, price and final CTA: ${JSON.stringify(initial.ctaTopology)}`);
assert(initial.proofImageDimensions, "Proof images must reserve dimensions and lazy load");
assert(initial.fakeTestimonials === 0, "The prototype must not fabricate testimonials");
assert(initial.finalCtaInternal && initial.noNotionLinks, "Conversion paths must stay inside the landing while checkout is pending");
assert(initial.productValue.includedFirst && initial.productValue.includedItems.map((item) => item.title).join("|") === "Produto para começar|Criadores de conteúdo|Conteúdo que vende|Ferramentas e escala", `Product value section must present the four approved value blocks before the commercial condition: ${JSON.stringify(initial.productValue)}`);
assert(!initial.productValue.hasIndividualPrices && initial.productValue.reference === "Valor de referência: R$ 1.632", "Included items must share one reference anchor without artificial individual prices");
assert(initial.productValue.title.includes("webinar completo") && initial.productValue.offerTitle === "Webinar TikTok Shop" && initial.productValue.discount === "94% de desconto" && initial.productValue.price === "R$ 97 à vista", `Product value section must make the approved offer and current price legible: ${JSON.stringify(initial.productValue)}`);
assert(initial.productValue.format === "Aula gravada" && initial.productValue.facts.length === 3 && initial.productValue.facts.join(" ").includes("29 temas") && initial.productValue.facts.join(" ").includes("12 meses") && initial.productValue.facts.join(" ").includes("7 dias"), "Product value section must explain the confirmed delivery, access and guarantee");
assert(initial.productValue.cta.includes("Garantir minha vaga") && initial.productValue.ctaTarget === "#inscricao" && !initial.productValue.mentionsMentoring, "Product value CTA must use the approved action without misrepresenting the recorded webinar as mentoring");
assert(initial.offerCard.count === 1 && initial.offerCard.oldLayerCount === 0, `Offer must use one card without rejected overlapping layers: ${JSON.stringify(initial.offerCard)}`);
assert(initial.offerCard.title === "Cada decisão aumenta o valor da próxima." && initial.offerCard.steps.join("|") === "Produto · Escolher|Criadores de conteúdo · Ativar|Conteúdo · Converter|Escala · Ampliar", `Offer card must connect each decision to one action: ${JSON.stringify(initial.offerCard)}`);
assert(initial.offerCard.heights.every((height, index, heights) => index === 0 || height > heights[index - 1]) && initial.offerCard.chartLabel.includes("sem valores financeiros"), `Offer steps must progress without a financial axis: ${JSON.stringify(initial.offerCard)}`);
assert(initial.offerCard.footerSeparated && initial.offerCard.absoluteDescendants === 0, "Offer content and footer must remain in normal flow without overlap");
assert(!initial.offerCard.hasCta, "Offer card must remain informational and defer conversion to the final CTA");
assert(initial.offerCard.transitionDelays.join("|") === "0s|0.06s|0.12s|0.18s", `Offer steps must use one staggered entrance: ${JSON.stringify(initial.offerCard.transitionDelays)}`);
assert(initial.fullJourney, "Navigation, field context and comparison must compose the full journey");
assert(initial.methodImageReady, "Method image must reserve dimensions and lazy load");
assert(initial.photoRailReady && initial.photoRailDuplicateHidden && initial.photoRailGroupsEqual, "Photo rail must initialize with two equal groups and an assistive-technology-safe duplicate");
assert(initial.photoRailImagesReady && initial.photoRailToggleSize >= 44, `Photo rail images and pause control must meet loading and touch requirements: ${JSON.stringify({ images: initial.photoRailImagesReady, toggle: initial.photoRailToggleSize })}`);
assert(initial.photoRailAnimationCount === 1, "Photo rail must use one Web Animation after initialization");
assert(initial.brandRailTitle === "Estratégias construídas ao lado de marcas que já vendem no digital.", `Brand rail must lead with the approved operational proof: ${JSON.stringify(initial.brandRailTitle)}`);
assert(initial.brandRailReady && initial.brandRailDuplicateHidden && initial.brandRailGroupsEqual, "Brand rail must initialize with two equal groups and an assistive-technology-safe duplicate");
assert(initial.brandRailImagesReady && !initial.brandRailHasToggle && initial.brandRailEngine === "web-animations-api" && initial.brandRailSpeed === 56 && initial.brandRailAnimationCount === 1 && initial.brandRailPlayState === "running", `Brand rail must auto-start one Web Animation without a control: ${JSON.stringify({ images: initial.brandRailImagesReady, hasToggle: initial.brandRailHasToggle, engine: initial.brandRailEngine, speed: initial.brandRailSpeed, animations: initial.brandRailAnimationCount, playState: initial.brandRailPlayState })}`);
assert(initial.motionContentReadable, "Motion enhancement must keep all content visibly readable before reveal completion");
assert(initial.scrollMotion.libraryReady && initial.scrollMotion.version === "4.0.9" && initial.scrollMotion.registered, `ScrollReveal 4.0.9 must register off-screen data-motion targets: ${JSON.stringify(initial.scrollMotion)}`);
assert(initial.scrollMotion.animationName === "none" && initial.scrollMotion.animationTimeline === "auto" && initial.scrollMotion.opacity >= 0.75 && initial.scrollMotion.opacity < 1 && initial.scrollMotion.transform !== "none", `Section motion must use ScrollReveal without a competing CSS timeline: ${JSON.stringify(initial.scrollMotion)}`);

await evaluate(`document.querySelector('[data-js="site-nav-toggle"]').click()`);
const navigationOpen = await evaluate(`(() => {
  const root = document.querySelector('.c-site-nav');
  const menu = root.querySelector('[data-js="site-nav-menu"]');
  const toggle = root.querySelector('[data-js="site-nav-toggle"]');
  return {
    open: root.dataset.menuOpen,
    expanded: toggle.getAttribute('aria-expanded'),
    label: toggle.getAttribute('aria-label'),
    hidden: menu.getAttribute('aria-hidden'),
    inert: menu.hasAttribute('inert'),
    visibility: getComputedStyle(menu).visibility,
    minimumLinkHeight: Math.min(...[...menu.querySelectorAll('a')].map((link) => link.getBoundingClientRect().height)),
  };
})()`);
assert(navigationOpen.open === "true" && navigationOpen.expanded === "true" && navigationOpen.label.startsWith("Fechar") && navigationOpen.hidden === "false" && !navigationOpen.inert && navigationOpen.visibility === "visible", `Menu button must expose the mobile navigation state: ${JSON.stringify(navigationOpen)}`);
assert(navigationOpen.minimumLinkHeight >= 48, "Every mobile navigation destination must expose a comfortable touch target");
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
const navigationClosed = await evaluate(`(() => {
  const root = document.querySelector('.c-site-nav');
  const toggle = root.querySelector('[data-js="site-nav-toggle"]');
  return { open: root.dataset.menuOpen, expanded: toggle.getAttribute('aria-expanded'), focused: document.activeElement === toggle };
})()`);
assert(navigationClosed.open === "false" && navigationClosed.expanded === "false" && navigationClosed.focused, "Escape must close the mobile menu and restore focus to its trigger");

await evaluate(`document.querySelector('.c-promo-strip__link').click()`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 180));
const promoNavigation = await evaluate(`({
  hash: location.hash,
  modalOpen: document.querySelector('[data-js="lead-modal"]').open,
  productReached: document.querySelector('#operacao').getBoundingClientRect().top < innerHeight,
})`);
assert(promoNavigation.hash === "#operacao" && !promoNavigation.modalOpen && promoNavigation.productReached, `Promo strip must navigate to price details without capturing the lead: ${JSON.stringify(promoNavigation)}`);
await evaluate(`(() => {
  history.replaceState(null, '', location.pathname + location.search);
  window.scrollTo({ top: 0, behavior: 'instant' });
})()`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 120));

await evaluate(`(() => {
  window.__webinarRequests = [];
  window.fetch = async (url, options = {}) => {
    const payload = options.body ? JSON.parse(options.body) : null;
    window.__webinarRequests.push({ url: String(url), payload });
    const body = String(url).endsWith('webinar-tiktok-shop-lead')
      ? { ok: true, lead_id: 'lead-browser-check' }
      : { ok: true, stage: 'purchase_intent' };
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  document.querySelector('.c-hero [data-js="open-lead-modal"]').click();
})()`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 60));

const modalInitial = await evaluate(`(() => {
  const root = document.querySelector('[data-js="lead-modal"]');
  return {
    open: root.open,
    state: root.dataset.state,
    triggerCount: document.querySelectorAll('[data-js="open-lead-modal"]').length,
    stepCount: root.querySelectorAll('[data-js="lead-step"]').length,
    visibleSteps: [...root.querySelectorAll('[data-js="lead-step"]')].filter((step) => !step.hidden).length,
    label: root.querySelector('[data-js="lead-step-label"]').textContent,
    bodyLocked: document.body.dataset.modalOpen,
    activeName: document.activeElement?.name,
    closeSize: root.querySelector('[data-js="lead-modal-close"]').getBoundingClientRect().height,
    fitsViewport: root.getBoundingClientRect().width <= innerWidth && root.getBoundingClientRect().height <= innerHeight,
    entranceAnimation: getComputedStyle(root).animationName,
    backdropAnimation: getComputedStyle(root, '::backdrop').animationName,
    closeAnimation: getComputedStyle(root.querySelector('[data-js="lead-modal-close"]')).animationName,
    pageViewCount: window.dataLayer.filter((entry) => entry.event === 'page_view_webinar').length,
    formStartCount: window.dataLayer.filter((entry) => entry.event === 'form_start_webinar').length,
  };
})()`);
assert(modalInitial.open && modalInitial.state === "form" && modalInitial.stepCount === 6 && modalInitial.visibleSteps === 1, `Every CTA must open the same six-step modal: ${JSON.stringify(modalInitial)}`);
assert(modalInitial.triggerCount === 3 && modalInitial.label === "Pergunta 1 de 6" && modalInitial.bodyLocked === "true", "Modal opening must preserve the three-point CTA hierarchy and lock background scroll");
assert(modalInitial.activeName === "lead" && modalInitial.closeSize >= 44 && modalInitial.fitsViewport, `Mobile modal must focus the first field, fit the viewport and expose a 44px close target: ${JSON.stringify(modalInitial)}`);
assert(modalInitial.entranceAnimation === "lead-modal-in" && modalInitial.backdropAnimation === "lead-modal-backdrop-in" && modalInitial.closeAnimation === "lead-modal-close-in", `Modal, backdrop and close control must enter with coordinated motion: ${JSON.stringify(modalInitial)}`);
assert(modalInitial.pageViewCount === 1 && modalInitial.formStartCount === 1, "Webinar page and form-start events must be deduplicated");

await evaluate(`document.querySelector('[data-js="lead-form"]').requestSubmit()`);
const modalValidation = await evaluate(`(() => ({
  message: document.querySelector('[data-js="lead-error"]').textContent,
  invalid: document.querySelector('input[name="lead"]').getAttribute('aria-invalid'),
}))()`);
assert(modalValidation.message === "Preencha este campo." && modalValidation.invalid === "true", "Empty fields must use the approved validation message and invalid state");

await evaluate(`(() => {
  const form = document.querySelector('[data-js="lead-form"]');
  form.elements.lead.value = 'Pessoa Teste';
  form.elements.lead.dispatchEvent(new Event('input', { bubbles: true }));
  form.requestSubmit();
})()`);
const modalStepMotion = await evaluate(`(() => {
  const step = document.querySelector('input[name="whats"]').closest('[data-js="lead-step"]');
  const animation = step.getAnimations()[0];
  return {
    label: document.querySelector('[data-js="lead-step-label"]').textContent,
    animationCount: step.getAnimations().length,
    startTransform: animation?.effect.getKeyframes()[0]?.transform,
    duration: Number(animation?.effect.getTiming().duration || 0),
  };
})()`);
assert(modalStepMotion.label === "Pergunta 2 de 6" && modalStepMotion.animationCount === 1 && modalStepMotion.startTransform.includes("translateX") && modalStepMotion.duration === 240, `Each question must enter with a short directional motion: ${JSON.stringify(modalStepMotion)}`);

await evaluate(`(() => {
  const form = document.querySelector('[data-js="lead-form"]');
  const submitText = (name, value) => {
    const input = form.elements[name];
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    form.requestSubmit();
  };
  submitText('whats', '(11) 99999-9999');
  submitText('email', 'pessoa@empresa.com.br');
  submitText('empresa', 'Empresa Teste');
  const revenue = form.querySelector('input[name="faturamentoMensal"]');
  revenue.checked = true;
  revenue.dispatchEvent(new Event('change', { bubbles: true }));
})()`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 220));

const choiceAdvanced = await evaluate(`document.querySelector('[data-js="lead-step-label"]').textContent`);
assert(choiceAdvanced === "Pergunta 6 de 6", "A choice must advance automatically after the short feedback delay");

await evaluate(`(() => {
  const option = document.querySelector('input[name="jaTemLoja"]');
  option.checked = true;
  option.dispatchEvent(new Event('change', { bubbles: true }));
  document.querySelector('[data-js="lead-form"]').requestSubmit();
})()`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 80));

const modalOffer = await evaluate(`(() => {
  const root = document.querySelector('[data-js="lead-modal"]');
  const requests = window.__webinarRequests;
  const first = requests[0];
  return {
    state: root.dataset.state,
    price: root.querySelector('.c-lead-modal__price').textContent.replace(/\\s+/g, ' ').trim(),
    values: [...root.querySelectorAll('.c-lead-modal__value li')].map((item) => item.textContent.replace(/\\s+/g, ' ').trim()),
    notice: root.querySelector('.c-lead-modal__notice').textContent.replace(/\\s+/g, ' ').trim(),
    disclaimer: root.querySelector('.c-lead-modal__disclaimer').textContent.replace(/\\s+/g, ' ').trim(),
    requestCount: requests.length,
    leadUrl: first?.url,
    payload: first?.payload,
    formSubmitCount: window.dataLayer.filter((entry) => entry.event === 'form_submit_webinar').length,
    bodyOverflow: document.body.scrollWidth <= innerWidth,
    animations: root.querySelector('[data-js="lead-offer-view"]').getAnimations({ subtree: true }).map((animation) => animation.animationName),
  };
})()`);
assert(modalOffer.state === "offer" && modalOffer.price.includes("R$ 1.632") && modalOffer.price.includes("R$ 97"), `Confirmed lead creation must reveal the current value contrast: ${JSON.stringify(modalOffer)}`);
assert(modalOffer.animations.includes("lead-modal-content-in") && modalOffer.animations.includes("lead-modal-price-in"), `Offer value must reveal in a controlled stagger: ${JSON.stringify(modalOffer.animations)}`);
assert(modalOffer.values.length === 4 && modalOffer.values.join(" ").includes("29 temas") && modalOffer.values.join(" ").includes("12 meses") && modalOffer.values.join(" ").includes("7 dias"), "Offer state must explain topics, access and guarantee without a fake countdown");
assert(modalOffer.notice.includes("Condição promocional atual") && modalOffer.disclaimer.includes("Nenhuma cobrança acontece agora"), "Loss framing must remain honest about promotion and the absence of a charge");
assert(modalOffer.requestCount === 1 && modalOffer.leadUrl.endsWith("webinar-tiktok-shop-lead") && modalOffer.formSubmitCount === 1 && modalOffer.bodyOverflow, "Lead submission must be deduplicated and keep the mobile viewport stable");
assert(modalOffer.payload.lead === "Pessoa Teste" && modalOffer.payload.whats === "(11) 99999-9999" && modalOffer.payload.email === "pessoa@empresa.com.br" && modalOffer.payload.empresa === "Empresa Teste", "Lead payload must preserve the four text answers");
assert(modalOffer.payload.faturamentoMensal === "Até R$ 50 mil" && modalOffer.payload.jaTemLoja === "Ainda não conheço direito", "Lead payload must preserve the two exact choice values");
assert(modalOffer.payload.variante === "lp_victor_intent_validation" && modalOffer.payload.produto === "Webinar TikTok Shop para Marcas" && modalOffer.payload.oferta === "97 reais", "Lead payload must include the approved funnel metadata");
assert(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"].every((key) => key in modalOffer.payload), "Lead payload must always include attribution fields");

await evaluate(`document.querySelector('[data-js="lead-intent"]').click()`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 80));
const modalSuccess = await evaluate(`(() => {
  const root = document.querySelector('[data-js="lead-modal"]');
  const requests = window.__webinarRequests;
  const intentRequest = requests[1];
  return {
    state: root.dataset.state,
    message: root.querySelector('[data-js="lead-success-view"]').textContent.replace(/\\s+/g, ' ').trim(),
    requestCount: requests.length,
    intentUrl: intentRequest?.url,
    intentPayload: intentRequest?.payload,
    checkoutEvents: window.dataLayer.filter((entry) => entry.event === 'checkout_click_webinar'),
  };
})()`);
assert(modalSuccess.state === "success" && modalSuccess.message.includes("Avisaremos quando o Webinar TikTok Shop estiver disponível"), "Intent confirmation must not imply a completed purchase");
assert(modalSuccess.requestCount === 2 && modalSuccess.intentUrl.endsWith("webinar-tiktok-shop-intencao") && modalSuccess.intentPayload.lead_id === "lead-browser-check", "Intent must update the same confirmed lead instead of creating another one");
assert(modalSuccess.checkoutEvents.length === 1 && modalSuccess.checkoutEvents[0].charged === false, "Intent analytics must explicitly record that no charge occurred");

await evaluate(`document.querySelector('[data-js="lead-success-close"]').click()`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 50));
const modalClosed = await evaluate(`(() => ({
  open: document.querySelector('[data-js="lead-modal"]').open,
  bodyLocked: document.body.hasAttribute('data-modal-open'),
  focusRestored: document.activeElement === document.querySelector('.c-hero [data-js="open-lead-modal"]'),
}))()`);
assert(!modalClosed.open && !modalClosed.bodyLocked && modalClosed.focusRestored, "Closing must restore page scroll and focus to the CTA that opened the modal");

await evaluate(`document.querySelector('.c-hero [data-js="open-lead-modal"]').click()`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 40));
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
await new Promise((resolveDelay) => setTimeout(resolveDelay, 40));
const modalEscape = await evaluate(`(() => ({
  open: document.querySelector('[data-js="lead-modal"]').open,
  bodyLocked: document.body.hasAttribute('data-modal-open'),
}))()`);
assert(!modalEscape.open && !modalEscape.bodyLocked, "Escape must close the modal and unlock the page");

await evaluate(`(() => {
  document.querySelector('.c-hero [data-js="open-lead-modal"]').click();
  const root = document.querySelector('[data-js="lead-modal"]');
  root.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  root.dispatchEvent(new MouseEvent('click', { bubbles: true }));
})()`);
const modalBackdrop = await evaluate(`document.querySelector('[data-js="lead-modal"]').open`);
assert(!modalBackdrop, "A pointer click on the backdrop must close the modal");

await evaluate(`document.querySelector('#metodo').scrollIntoView({ block: 'start' })`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 180));
const navigationDown = await evaluate(`(() => {
  const root = document.querySelector('.c-site-nav');
  return {
    state: root.dataset.scrollState,
    direction: root.dataset.scrollDirection,
    transform: getComputedStyle(root).transform,
    progress: parseFloat(getComputedStyle(root).getPropertyValue('--nav-scroll-progress')),
    current: root.querySelector('[data-js="site-nav-menu"] [aria-current="location"]')?.getAttribute('href'),
  };
})()`);
assert(navigationDown.state === "scrolled" && navigationDown.direction === "down" && navigationDown.transform !== "none" && navigationDown.progress > 0 && navigationDown.current === "#metodo", `Scrolling down must hide the navbar, advance progress and update the active destination: ${JSON.stringify(navigationDown)}`);
await evaluate(`window.scrollBy(0, -320)`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 180));
const navigationUp = await evaluate(`(() => {
  const root = document.querySelector('.c-site-nav');
  return { direction: root.dataset.scrollDirection, transform: getComputedStyle(root).transform };
})()`);
assert(navigationUp.direction === "up", `Scrolling up must reveal the navigation again: ${JSON.stringify(navigationUp)}`);
const offerMotionBefore = await evaluate(`[...document.querySelectorAll('.c-offer__step')].map((step) => getComputedStyle(step).transform)`);
await evaluate(`document.querySelector('.c-offer__card').scrollIntoView({ block: 'center' })`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 700));
const offerMotionAfter = await evaluate(`(() => ({
  state: document.querySelector('.c-offer__card').dataset.motionState,
  transforms: [...document.querySelectorAll('.c-offer__step')].map((step) => getComputedStyle(step).transform),
}))()`);
assert(offerMotionBefore.every((transform) => transform !== "none") && offerMotionAfter.state === "visible" && offerMotionAfter.transforms.every((transform) => transform === "none"), `Offer steps must rise once when the card enters the viewport: ${JSON.stringify({ offerMotionBefore, offerMotionAfter })}`);
await evaluate(`window.scrollTo(0, 0)`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 120));

const promoBefore = await evaluate(`new DOMMatrix(getComputedStyle(document.querySelector('[data-js="promo-rail-track"]')).transform).m41`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 520));
const promoAfter = await evaluate(`new DOMMatrix(getComputedStyle(document.querySelector('[data-js="promo-rail-track"]')).transform).m41`);
assert(promoAfter < promoBefore - 20, `Promo strip must move continuously through JavaScript: ${JSON.stringify({ promoBefore, promoAfter })}`);

const brandBefore = await evaluate(`new DOMMatrix(getComputedStyle(document.querySelector('[data-js="brand-rail-track"]')).transform).m41`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 500));
const brandMotion = await evaluate(`(() => {
  const root = document.querySelector('[data-js="brand-rail"]');
  const track = document.querySelector('[data-js="brand-rail-track"]');
  const group = document.querySelector('[data-js="brand-rail-group"]');
  return {
    transform: getComputedStyle(track).transform,
    offset: new DOMMatrix(getComputedStyle(track).transform).m41,
    engine: root.dataset.railEngine,
    speed: Number(root.dataset.railSpeed),
    distance: group.getBoundingClientRect().width,
    animationCount: track.getAnimations().length,
    playState: track.getAnimations()[0]?.playState,
  };
})()`);
assert(brandMotion.offset < brandBefore - 12 && brandMotion.engine === "web-animations-api" && brandMotion.animationCount === 1 && brandMotion.playState === "running", `Brand rail must move continuously through one auto-started Web Animation: ${JSON.stringify({ brandBefore, brandMotion })}`);
assert(brandMotion.speed === 56 && brandMotion.distance > 0, `Brand rail must expose its measured JavaScript loop at 56px/s: ${JSON.stringify(brandMotion)}`);

await evaluate(`document.querySelector('.c-brand-rail__viewport').dispatchEvent(new MouseEvent('mouseenter'))`);
const brandHoverBefore = await evaluate(`new DOMMatrix(getComputedStyle(document.querySelector('[data-js="brand-rail-track"]')).transform).m41`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 260));
const brandHoverAfter = await evaluate(`new DOMMatrix(getComputedStyle(document.querySelector('[data-js="brand-rail-track"]')).transform).m41`);
assert(brandHoverAfter < brandHoverBefore - 8, `Brand carousel must keep moving while the cursor is over it: ${JSON.stringify({ brandHoverBefore, brandHoverAfter })}`);

const railViewports = [];
for (const viewport of [
  { width: 320, height: 568, mobile: true },
  { width: 360, height: 800, mobile: true },
  { width: 390, height: 844, mobile: true },
  { width: 430, height: 932, mobile: true },
  { width: 720, height: 900, mobile: false },
  { width: 1440, height: 900, mobile: false },
]) {
  await send("Emulation.setDeviceMetricsOverride", {
    ...viewport,
    screenWidth: viewport.width,
    screenHeight: viewport.height,
    deviceScaleFactor: 1,
  });
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 160));
  const before = await evaluate(`getComputedStyle(document.querySelector('[data-js="photo-rail-track"]')).transform`);
  const brandBeforeViewport = await evaluate(`getComputedStyle(document.querySelector('[data-js="brand-rail-track"]')).transform`);
  const promoBeforeViewport = await evaluate(`getComputedStyle(document.querySelector('[data-js="promo-rail-track"]')).transform`);
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 500));
  const state = await evaluate(`(() => {
    const track = document.querySelector('[data-js="photo-rail-track"]');
    const group = document.querySelector('[data-js="photo-rail-group"]');
    const animation = track.getAnimations()[0];
    const duration = Number(animation?.effect.getTiming().duration || 0);
    const distance = group.getBoundingClientRect().width;
    const endTransform = animation?.effect.getKeyframes().at(-1)?.transform || '';
    const endOffset = endTransform ? new DOMMatrix(endTransform).m41 : 0;
    return {
      transform: getComputedStyle(track).transform,
      animations: track.getAnimations().length,
      playState: animation?.playState,
      duration,
      distance,
      calculatedSpeed: duration > 0 ? distance / (duration / 1000) : 0,
      endOffset,
      exactDistance: Math.abs(endOffset + distance) < 0.01,
    };
  })()`);
  assert(state.transform !== before && state.animations === 1 && state.playState === "running", `Photo rail must move at ${viewport.width}px: ${JSON.stringify(state)}`);
  assert(Math.abs(state.calculatedSpeed - 22) < 0.01 && state.exactDistance, `Photo rail must use the measured group width at 22px/s: ${JSON.stringify(state)}`);
  const brandState = await evaluate(`(() => {
    const track = document.querySelector('[data-js="brand-rail-track"]');
    const group = document.querySelector('[data-js="brand-rail-group"]');
    const animation = track.getAnimations()[0];
    const duration = Number(animation?.effect.getTiming().duration || 0);
    const distance = group.getBoundingClientRect().width;
    const endTransform = animation?.effect.getKeyframes().at(-1)?.transform || '';
    const endOffset = endTransform ? new DOMMatrix(endTransform).m41 : 0;
    return {
      transform: getComputedStyle(track).transform,
      animations: track.getAnimations().length,
      playState: animation?.playState,
      calculatedSpeed: duration > 0 ? distance / (duration / 1000) : 0,
      exactDistance: Math.abs(endOffset + distance) < 0.01,
    };
  })()`);
  assert(brandState.transform !== brandBeforeViewport && brandState.animations === 1 && brandState.playState === "running", `Brand rail must auto-start at ${viewport.width}px without a button: ${JSON.stringify(brandState)}`);
  assert(Math.abs(brandState.calculatedSpeed - 56) < 0.01 && brandState.exactDistance, `Brand rail must use the measured group width at 56px/s: ${JSON.stringify(brandState)}`);
  const promoState = await evaluate(`(() => {
    const track = document.querySelector('[data-js="promo-rail-track"]');
    const group = document.querySelector('[data-js="promo-rail-group"]');
    const animation = track.getAnimations()[0];
    const duration = Number(animation?.effect.getTiming().duration || 0);
    const distance = group.getBoundingClientRect().width;
    const endTransform = animation?.effect.getKeyframes().at(-1)?.transform || '';
    const endOffset = endTransform ? new DOMMatrix(endTransform).m41 : 0;
    return {
      transform: getComputedStyle(track).transform,
      animations: track.getAnimations().length,
      playState: animation?.playState,
      calculatedSpeed: duration > 0 ? distance / (duration / 1000) : 0,
      exactDistance: Math.abs(endOffset + distance) < 0.01,
    };
  })()`);
  assert(promoState.transform !== promoBeforeViewport && promoState.animations === 1 && promoState.playState === "running", `Promo rail must auto-start below the navigation at ${viewport.width}px: ${JSON.stringify(promoState)}`);
  assert(Math.abs(promoState.calculatedSpeed - 72) < 0.01 && promoState.exactDistance, `Promo rail must use the measured group width at 72px/s: ${JSON.stringify(promoState)}`);
  const offerState = await evaluate(`(() => {
    const card = document.querySelector('.c-offer__card');
    const cardBox = card.getBoundingClientRect();
    const copyBox = card.querySelector('.c-offer__card-copy').getBoundingClientRect();
    const stepsBox = card.querySelector('.c-offer__steps').getBoundingClientRect();
    const footerBox = card.querySelector('.c-offer__footer').getBoundingClientRect();
    const labelsFit = [...card.querySelectorAll('.c-offer__step-copy')].every((label) => label.scrollWidth <= label.clientWidth + 0.5);
    return {
      withinViewport: cardBox.left >= 0 && cardBox.right <= innerWidth,
      bodyFits: document.body.scrollWidth <= innerWidth,
      labelsFit,
      footerSeparated: footerBox.top >= Math.max(copyBox.bottom, stepsBox.bottom) - 0.5,
    };
  })()`);
  assert(offerState.withinViewport && offerState.bodyFits && offerState.labelsFit && offerState.footerSeparated, `Offer card must remain organized at ${viewport.width}px: ${JSON.stringify(offerState)}`);
  await evaluate(`document.querySelector('.c-hero [data-js="open-lead-modal"]').click()`);
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 70));
  const modalState = await evaluate(`(() => {
    const root = document.querySelector('[data-js="lead-modal"]');
    const box = root.getBoundingClientRect();
    const close = root.querySelector('[data-js="lead-modal-close"]').getBoundingClientRect();
    return {
      open: root.open,
      width: box.width,
      height: box.height,
      left: box.left,
      right: box.right,
      closeWidth: close.width,
      closeHeight: close.height,
      bodyOverflow: document.body.scrollWidth <= innerWidth,
      focused: document.activeElement?.name,
      navigation: (() => {
        const navigation = document.querySelector('.c-site-nav');
        const menu = navigation.querySelector('[data-js="site-nav-menu"]');
        return {
          toggleDisplay: getComputedStyle(navigation.querySelector('[data-js="site-nav-toggle"]')).display,
          visibility: getComputedStyle(menu).visibility,
          inert: menu.hasAttribute('inert'),
          iconDisplay: getComputedStyle(menu.querySelector('.c-site-nav__link-icon')).display,
        };
      })(),
    };
  })()`);
  assert(modalState.open && modalState.width <= viewport.width && modalState.height <= viewport.height && modalState.left >= 0 && modalState.right <= viewport.width, `Modal must remain inside the ${viewport.width}px viewport: ${JSON.stringify(modalState)}`);
  assert(modalState.closeWidth >= 44 && modalState.closeHeight >= 44 && modalState.bodyOverflow && modalState.focused === "lead", `Modal controls and focus must remain usable at ${viewport.width}px: ${JSON.stringify(modalState)}`);
  if (viewport.width >= 704) assert(modalState.navigation.toggleDisplay === "none" && modalState.navigation.visibility === "visible" && !modalState.navigation.inert && modalState.navigation.iconDisplay === "none", `Desktop navigation must remain text-only and visible at ${viewport.width}px: ${JSON.stringify(modalState.navigation)}`);
  else assert(modalState.navigation.toggleDisplay === "grid" && modalState.navigation.visibility === "hidden" && modalState.navigation.inert && modalState.navigation.iconDisplay === "grid", `Mobile navigation must remain controlled and expose its orientation icons at ${viewport.width}px: ${JSON.stringify(modalState.navigation)}`);
  await evaluate(`document.querySelector('[data-js="lead-modal-close"]').click()`);
  railViewports.push({ width: viewport.width, ...state, brand: brandState, promo: promoState, offer: offerState, modal: modalState });
}

await send("Emulation.setDeviceMetricsOverride", {
  width: 720,
  height: 900,
  screenWidth: 720,
  screenHeight: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await new Promise((resolveDelay) => setTimeout(resolveDelay, 160));
const offerZoomEquivalent = await evaluate(`(() => {
  const card = document.querySelector('.c-offer__card');
  return {
    bodyFits: document.body.scrollWidth <= innerWidth,
    cardFits: card.getBoundingClientRect().right <= innerWidth,
    labelsFit: [...card.querySelectorAll('.c-offer__step-copy')].every((label) => label.scrollWidth <= label.clientWidth + 0.5),
  };
})()`);
assert(offerZoomEquivalent.bodyFits && offerZoomEquivalent.cardFits && offerZoomEquivalent.labelsFit, `Offer card must reflow at the 1440px viewport's 200% zoom equivalent: ${JSON.stringify(offerZoomEquivalent)}`);

await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  screenWidth: 390,
  screenHeight: 844,
  deviceScaleFactor: 1,
  mobile: true,
});
await new Promise((resolveDelay) => setTimeout(resolveDelay, 160));
await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 2, y: 2, button: "none", buttons: 0 });
await evaluate(`document.querySelector('.c-photo-rail__viewport').dispatchEvent(new MouseEvent('mouseleave'))`);

await evaluate(`(() => {
  const toggle = document.querySelector('[data-js="photo-rail-toggle"]');
  toggle.focus();
  toggle.click();
})()`);
const railPaused = await evaluate(`(() => {
  const root = document.querySelector('[data-js="photo-rail"]');
  const toggle = root.querySelector('[data-js="photo-rail-toggle"]');
  const animation = root.querySelector('[data-js="photo-rail-track"]').getAnimations()[0];
  return {
    paused: root.dataset.paused,
    pressed: toggle.getAttribute('aria-pressed'),
    label: toggle.getAttribute('aria-label'),
    icon: root.querySelector('[data-js="photo-rail-toggle-icon"]').textContent,
    focused: document.activeElement === toggle,
    playState: animation?.playState,
  };
})()`);
assert(railPaused.paused === "true" && railPaused.pressed === "true" && railPaused.label.includes("Retomar") && railPaused.icon === "▶" && railPaused.focused && railPaused.playState === "paused", `Photo rail pause control must expose and preserve its state: ${JSON.stringify(railPaused)}`);

const resumeBefore = await evaluate(`getComputedStyle(document.querySelector('[data-js="photo-rail-track"]')).transform`);
await evaluate(`document.querySelector('[data-js="photo-rail-toggle"]').click()`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 260));
const railResumed = await evaluate(`(() => {
  const root = document.querySelector('[data-js="photo-rail"]');
  const toggle = root.querySelector('[data-js="photo-rail-toggle"]');
  const track = root.querySelector('[data-js="photo-rail-track"]');
  return {
    paused: root.dataset.paused,
    pressed: toggle.getAttribute('aria-pressed'),
    icon: root.querySelector('[data-js="photo-rail-toggle-icon"]').textContent,
    focused: document.activeElement === toggle,
    playState: track.getAnimations()[0]?.playState,
    transform: getComputedStyle(track).transform,
    hidden: document.hidden,
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    precise: matchMedia('(hover: hover) and (pointer: fine)').matches,
    hovered: root.querySelector('.c-photo-rail__viewport').matches(':hover'),
  };
})()`);
assert(railResumed.paused === "false" && railResumed.pressed === "false" && railResumed.icon === "Ⅱ" && railResumed.focused && railResumed.playState === "running" && railResumed.transform !== resumeBefore, `Photo rail must resume while its control remains focused: ${JSON.stringify(railResumed)}`);

await evaluate(`document.querySelector('[data-js="photo-rail-toggle"]').click()`);
const resizeBefore = await evaluate(`(() => {
  const animation = document.querySelector('[data-js="photo-rail-track"]').getAnimations()[0];
  const duration = Number(animation.effect.getTiming().duration);
  return { progress: Number(animation.currentTime) / duration, duration, width: innerWidth, distance: document.querySelector('[data-js="photo-rail-group"]').getBoundingClientRect().width };
})()`);
await send("Emulation.setDeviceMetricsOverride", {
  width: 430,
  height: 932,
  screenWidth: 430,
  screenHeight: 932,
  deviceScaleFactor: 1,
  mobile: true,
});
await new Promise((resolveDelay) => setTimeout(resolveDelay, 80));
await evaluate(`window.dispatchEvent(new Event('resize'))`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 180));
const resizeAfter = await evaluate(`(() => {
  const animation = document.querySelector('[data-js="photo-rail-track"]').getAnimations()[0];
  const duration = Number(animation.effect.getTiming().duration);
  return { progress: Number(animation.currentTime) / duration, duration, playState: animation.playState, width: innerWidth, distance: document.querySelector('[data-js="photo-rail-group"]').getBoundingClientRect().width };
})()`);
assert(resizeBefore.duration !== resizeAfter.duration && Math.abs(resizeBefore.progress - resizeAfter.progress) < 0.01 && resizeAfter.playState === "paused", `Resize must preserve the paused rail progress: ${JSON.stringify({ resizeBefore, resizeAfter })}`);
await evaluate(`document.querySelector('[data-js="photo-rail-toggle"]').click()`);

await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  screenWidth: 1440,
  screenHeight: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await new Promise((resolveDelay) => setTimeout(resolveDelay, 160));
const hoverEnvironment = await evaluate(`(() => {
  const viewport = document.querySelector('.c-photo-rail__viewport');
  viewport.scrollIntoView({ block: 'center' });
  viewport.dispatchEvent(new MouseEvent('mouseenter'));
  return { precise: matchMedia('(hover: hover) and (pointer: fine)').matches };
})()`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
const hoverBefore = await evaluate(`getComputedStyle(document.querySelector('[data-js="photo-rail-track"]')).transform`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 240));
const hoverPaused = await evaluate(`(() => {
  const root = document.querySelector('[data-js="photo-rail"]');
  const track = root.querySelector('[data-js="photo-rail-track"]');
  return { paused: root.dataset.paused, playState: track.getAnimations()[0]?.playState, transform: getComputedStyle(track).transform };
})()`);
assert(hoverEnvironment.precise && hoverPaused.paused === "true" && hoverPaused.playState === "paused" && hoverPaused.transform === hoverBefore, `Fine-pointer hover must pause the photo rail: ${JSON.stringify({ hoverEnvironment, hoverPaused })}`);
await evaluate(`document.querySelector('.c-photo-rail__viewport').dispatchEvent(new MouseEvent('mouseleave'))`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 240));
const hoverResumed = await evaluate(`(() => {
  const root = document.querySelector('[data-js="photo-rail"]');
  const track = root.querySelector('[data-js="photo-rail-track"]');
  return { paused: root.dataset.paused, playState: track.getAnimations()[0]?.playState, transform: getComputedStyle(track).transform };
})()`);
assert(hoverResumed.paused === "false" && hoverResumed.playState === "running" && hoverResumed.transform !== hoverBefore, `Photo rail must resume after pointer leave: ${JSON.stringify({ hoverEnvironment, hoverResumed })}`);

const pageVisibility = await evaluate(`(() => {
  Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  document.dispatchEvent(new Event('visibilitychange'));
  const track = document.querySelector('[data-js="photo-rail-track"]');
  const hiddenState = { paused: document.querySelector('[data-js="photo-rail"]').dataset.paused, playState: track.getAnimations()[0]?.playState };
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  document.dispatchEvent(new Event('visibilitychange'));
  return { hiddenState, visibleState: { paused: document.querySelector('[data-js="photo-rail"]').dataset.paused, playState: track.getAnimations()[0]?.playState } };
})()`);
assert(pageVisibility.hiddenState.paused === "true" && pageVisibility.hiddenState.playState === "paused" && pageVisibility.visibleState.paused === "false" && pageVisibility.visibleState.playState === "running", `Page visibility must control rail playback: ${JSON.stringify(pageVisibility)}`);

await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  screenWidth: 390,
  screenHeight: 844,
  deviceScaleFactor: 1,
  mobile: true,
});
await new Promise((resolveDelay) => setTimeout(resolveDelay, 120));
await send("Page.bringToFront");
await evaluate(`(() => {
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  document.dispatchEvent(new Event('visibilitychange'));
})()`);

await evaluate(`window.scrollTo(0, 0)`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 80));
const scrollMotionBefore = await evaluate(`(() => {
  const target = document.querySelector('#metodo [data-motion="rise"]');
  const style = getComputedStyle(target);
  return { opacity: Number.parseFloat(style.opacity), transform: style.transform, registered: target.hasAttribute('data-sr-id') };
})()`);
await evaluate(`document.querySelector('#metodo [data-motion]').scrollIntoView({ block: 'center' })`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 1000));
const sectionMotion = await evaluate(`(() => {
  const target = document.querySelector('#metodo [data-motion]');
  return { state: target.dataset.motionState, transform: getComputedStyle(target).transform, opacity: getComputedStyle(target).opacity, registered: target.hasAttribute('data-sr-id') };
})()`);
assert(!scrollMotionBefore.registered && scrollMotionBefore.opacity === 1 && ["none", "matrix(1, 0, 0, 1, 0, 0)"].includes(scrollMotionBefore.transform), `Previously revealed content must remain settled when the journey returns to the top: ${JSON.stringify(scrollMotionBefore)}`);
assert(sectionMotion.state === "visible" && !sectionMotion.registered && ["none", "matrix(1, 0, 0, 1, 0, 0)"].includes(sectionMotion.transform) && sectionMotion.opacity === "1", `ScrollReveal must settle, clean inline state and keep content visible: ${JSON.stringify(sectionMotion)}`);

await evaluate(`window.scrollTo(0, 0)`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 120));
await evaluate(`document.querySelector('#metodo [data-motion]').scrollIntoView({ block: 'center' })`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 160));
const sectionMotionReturn = await evaluate(`(() => {
  const target = document.querySelector('#metodo [data-motion]');
  const style = getComputedStyle(target);
  return { state: target.dataset.motionState, transform: style.transform, opacity: style.opacity, registered: target.hasAttribute('data-sr-id') };
})()`);
assert(sectionMotionReturn.state === "visible" && !sectionMotionReturn.registered && ["none", "matrix(1, 0, 0, 1, 0, 0)"].includes(sectionMotionReturn.transform) && sectionMotionReturn.opacity === "1", `Revealed content must not animate again when returning to the section: ${JSON.stringify(sectionMotionReturn)}`);
await evaluate(`window.scrollTo(0, 0)`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 120));

await evaluate(`document.querySelector('[data-js="decision-next"]').click()`);
const second = await readState();
assert(second.current === "2" && second.active.includes("Criadores de conteúdo"), "Next button must activate Criadores de conteúdo");
assert(!second.previousDisabled, "Previous button must be enabled after advancing");

await evaluate(`document.querySelector('[data-js="decision-next"]').click()`);
await evaluate(`document.querySelector('[data-js="decision-next"]').click()`);
const fourth = await readState();
assert(fourth.current === "4" && fourth.nextDisabled, "Deck must reach the final decision");

await evaluate(`document.querySelector('[data-js="decision-cards"]').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))`);
const keyboard = await readState();
assert(keyboard.current === "3", "ArrowLeft must return to decision 3");

const reloaded = waitForEvent("Page.loadEventFired");
await send("Page.navigate", { url: pageUrl });
await reloaded;
await send("Page.bringToFront");
await evaluate(`(() => {
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  document.dispatchEvent(new Event('visibilitychange'));
})()`);

await evaluate(`document.querySelector('[data-deck-position="active"]').scrollIntoView({ block: 'center' })`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 120));

const dragPoint = await evaluate(`(() => {
  const slide = document.querySelector('[data-deck-position="active"]');
  const box = slide.getBoundingClientRect();
  return { x: box.left + box.width * 0.72, y: box.top + box.height * 0.5, distance: box.width * 0.42, transform: getComputedStyle(slide).transform };
})()`);

await send("Input.dispatchMouseEvent", { type: "mousePressed", x: dragPoint.x, y: dragPoint.y, button: "left", buttons: 1, clickCount: 1 });
await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: dragPoint.x - dragPoint.distance, y: dragPoint.y, button: "left", buttons: 1 });
await new Promise((resolveDelay) => setTimeout(resolveDelay, 40));

const dragFeedback = await evaluate(`(() => {
  const root = document.querySelector('[data-js="hero-decision-deck"]');
  const slide = root.querySelector('[data-deck-position="active"]');
  return { dragging: root.dataset.dragging, direction: root.dataset.dragDirection, transform: getComputedStyle(slide).transform };
})()`);
assert(dragFeedback.dragging === "true" && dragFeedback.direction === "next", `Horizontal movement must activate drag feedback: ${JSON.stringify(dragFeedback)}`);
assert(dragFeedback.transform !== dragPoint.transform, "Active card must follow the pointer without changing the stack model");

await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: dragPoint.x - dragPoint.distance, y: dragPoint.y, button: "left", buttons: 0, clickCount: 1 });
await new Promise((resolveDelay) => setTimeout(resolveDelay, 300));
const dragged = await readState();
assert(dragged.current === "2" && dragged.active.includes("Criadores de conteúdo"), "A committed left drag must activate Criadores de conteúdo");

const backPoint = await evaluate(`(() => {
  const box = document.querySelector('[data-deck-position="active"]').getBoundingClientRect();
  return { x: box.left + box.width * 0.28, y: box.top + box.height * 0.5, distance: box.width * 0.42 };
})()`);
await send("Input.dispatchMouseEvent", { type: "mousePressed", x: backPoint.x, y: backPoint.y, button: "left", buttons: 1, clickCount: 1 });
await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: backPoint.x + backPoint.distance, y: backPoint.y, button: "left", buttons: 1 });
await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: backPoint.x + backPoint.distance, y: backPoint.y, button: "left", buttons: 0, clickCount: 1 });
await new Promise((resolveDelay) => setTimeout(resolveDelay, 300));
const draggedBack = await readState();
assert(draggedBack.current === "1", "A committed right drag must return to Produto");

const verticalGesture = await evaluate(`(() => {
  const cards = document.querySelector('[data-js="decision-cards"]');
  const box = cards.getBoundingClientRect();
  const options = { bubbles: true, pointerId: 31, isPrimary: true, pointerType: 'touch', clientX: box.left + box.width / 2, clientY: box.top + box.height / 2 };
  cards.dispatchEvent(new PointerEvent('pointerdown', options));
  cards.dispatchEvent(new PointerEvent('pointermove', { ...options, clientX: options.clientX + 3, clientY: options.clientY + 48 }));
  cards.dispatchEvent(new PointerEvent('pointerup', { ...options, clientX: options.clientX + 3, clientY: options.clientY + 48 }));
  const root = document.querySelector('[data-js="hero-decision-deck"]');
  return { current: root.querySelector('[data-js="decision-current"]').textContent, dragging: root.dataset.dragging || null };
})()`);
assert(verticalGesture.current === "1" && verticalGesture.dragging === null, "Vertical movement must remain available for page scrolling");

await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
const reducedLoaded = waitForEvent("Page.loadEventFired");
await send("Page.navigate", { url: pageUrl });
await reducedLoaded;

const reducedModal = await evaluate(`(() => {
  document.querySelector('.c-hero [data-js="open-lead-modal"]').click();
  const root = document.querySelector('[data-js="lead-modal"]');
  const form = root.querySelector('[data-js="lead-form"]');
  form.elements.lead.value = 'Pessoa Teste';
  form.requestSubmit();
  const step = form.elements.whats.closest('[data-js="lead-step"]');
  const state = {
    rootAnimation: getComputedStyle(root).animationName,
    backdropAnimation: getComputedStyle(root, '::backdrop').animationName,
    stepAnimations: step.getAnimations().length,
    label: root.querySelector('[data-js="lead-step-label"]').textContent,
  };
  root.querySelector('[data-js="lead-modal-close"]').click();
  return state;
})()`);
assert(reducedModal.rootAnimation === "none" && reducedModal.backdropAnimation === "none" && reducedModal.stepAnimations === 0 && reducedModal.label === "Pergunta 2 de 6", `Reduced motion must preserve the modal journey without spatial animation: ${JSON.stringify(reducedModal)}`);

const reducedMotion = await evaluate(`({
  matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
  duration: getComputedStyle(document.querySelector('.c-conversion-cta')).transitionDuration,
  automaticMotion: document.querySelector('[data-js="hero-decision-deck"]').dataset.hinting || null,
  railAnimations: document.querySelector('[data-js="photo-rail-track"]').getAnimations().length,
  railPaused: document.querySelector('[data-js="photo-rail"]').dataset.paused,
  railDuplicateDisplay: getComputedStyle(document.querySelector('.c-photo-rail__group[aria-hidden="true"]')).display,
  railToggleDisplay: getComputedStyle(document.querySelector('[data-js="photo-rail-toggle"]')).display,
  railOverflow: getComputedStyle(document.querySelector('.c-photo-rail__viewport')).overflowX,
  promoAnimations: document.querySelector('[data-js="promo-rail-track"]').getAnimations().length,
  promoPlayState: document.querySelector('[data-js="promo-rail-track"]').getAnimations()[0]?.playState,
  promoPaused: document.querySelector('[data-js="promo-rail"]').dataset.paused,
  promoDuplicateDisplay: getComputedStyle(document.querySelector('.c-promo-strip__group[aria-hidden="true"]')).display,
  promoOverflow: getComputedStyle(document.querySelector('.c-promo-strip__viewport')).overflowX,
  brandAnimations: document.querySelector('[data-js="brand-rail-track"]').getAnimations().length,
  brandPlayState: document.querySelector('[data-js="brand-rail-track"]').getAnimations()[0]?.playState,
  brandPaused: document.querySelector('[data-js="brand-rail"]').dataset.paused,
  brandDuplicateDisplay: getComputedStyle(document.querySelector('.c-brand-rail__group[aria-hidden="true"]')).display,
  brandHasToggle: Boolean(document.querySelector('[data-js="brand-rail-toggle"]')),
  brandOverflow: getComputedStyle(document.querySelector('.c-brand-rail__viewport')).overflowX,
  sectionMotionStatic: [...document.querySelectorAll('[data-motion]')].every((target) => {
    const style = getComputedStyle(target);
    return style.transform === 'none' && style.animationName === 'none' && style.opacity === '1';
  }),
  offerStepsStatic: [...document.querySelectorAll('.c-offer__step')].every((step) => getComputedStyle(step).transform === 'none' && getComputedStyle(step).transitionDuration === '0s'),
  navigationDuration: getComputedStyle(document.querySelector('.c-site-nav')).transitionDuration,
})`);
assert(reducedMotion.matches, "Reduced motion emulation must be active");
assert(reducedMotion.duration === "0.001s", "CTA transition must collapse under reduced motion");
assert(reducedMotion.navigationDuration.split(',').every((duration) => duration.trim() === "0.001s"), "Navigation scroll transitions must collapse under reduced motion");
assert(reducedMotion.automaticMotion === null, "Deck must not autoplay a teaser");
assert(reducedMotion.railAnimations === 0 && reducedMotion.railPaused === "true" && reducedMotion.railDuplicateDisplay === "none" && reducedMotion.railToggleDisplay === "none", "Reduced motion must stop and simplify the photo rail");
assert(reducedMotion.promoAnimations === 1 && reducedMotion.promoPlayState === "running" && reducedMotion.promoPaused === "false" && reducedMotion.promoDuplicateDisplay === "flex" && reducedMotion.promoOverflow === "clip", "The explicitly approved promo rail must keep moving under reduced motion");
assert(reducedMotion.brandAnimations === 1 && reducedMotion.brandPlayState === "running" && reducedMotion.brandPaused === "false" && reducedMotion.brandDuplicateDisplay === "flex" && !reducedMotion.brandHasToggle, "The explicitly approved brand rail exception must keep running without a control under reduced motion");
assert(reducedMotion.railOverflow === "auto" && reducedMotion.brandOverflow === "clip" && reducedMotion.sectionMotionStatic && reducedMotion.offerStepsStatic, "Reduced motion must remove section timelines and keep offer steps static while preserving the approved nonstop brand rail exception");

await send("Emulation.setScriptExecutionDisabled", { value: true });
const noScriptLoaded = waitForEvent("Page.loadEventFired");
await send("Page.navigate", { url: pageUrl });
await noScriptLoaded;

const noScript = await evaluate(`(() => {
  const root = document.querySelector('[data-js="hero-decision-deck"]');
  const slides = [...root.querySelectorAll('[data-js="decision-slide"]')];
  const tops = slides.map((slide) => slide.getBoundingClientRect().top);
  const rail = document.querySelector('[data-js="photo-rail"]');
  const brandRail = document.querySelector('[data-js="brand-rail"]');
  const promoRail = document.querySelector('[data-js="promo-rail"]');
  return {
    className: document.documentElement.className,
    deckReady: root.dataset.deckReady || null,
    controlsVisible: getComputedStyle(root.querySelector('.c-decision-preview__controls')).display !== 'none',
    allReadable: slides.every((slide) => !slide.hasAttribute('inert') && !slide.hasAttribute('aria-hidden')),
    verticalFlow: tops.every((top, index) => index === 0 || top > tops[index - 1]),
    railReady: rail.dataset.railReady || null,
    railToggleVisible: getComputedStyle(rail.querySelector('[data-js="photo-rail-toggle"]')).display !== 'none',
    railImageCount: rail.querySelectorAll('.c-photo-rail__group img').length,
    railOverflow: getComputedStyle(rail.querySelector('.c-photo-rail__viewport')).overflowX,
    brandRailReady: brandRail.dataset.railReady || null,
    brandRailHasToggle: Boolean(brandRail.querySelector('[data-js="brand-rail-toggle"]')),
    brandRailImageCount: brandRail.querySelectorAll('.c-brand-rail__group:first-child img').length,
    brandRailDuplicateDisplay: getComputedStyle(brandRail.querySelector('.c-brand-rail__group[aria-hidden="true"]')).display,
    brandRailOverflow: getComputedStyle(brandRail.querySelector('.c-brand-rail__viewport')).overflowX,
    promoRailReady: promoRail.dataset.railReady || null,
    promoRailDuplicateDisplay: getComputedStyle(promoRail.querySelector('.c-promo-strip__group[aria-hidden="true"]')).display,
    promoRailOverflow: getComputedStyle(promoRail.querySelector('.c-promo-strip__viewport')).overflowX,
    promoText: document.querySelector('.c-promo-strip')?.textContent.replace(/\\s+/g, ' ').trim(),
    promoTarget: document.querySelector('.c-promo-strip__link')?.getAttribute('href'),
    navigationToggleDisplay: getComputedStyle(document.querySelector('[data-js="site-nav-toggle"]')).display,
    navigationLinkCount: document.querySelectorAll('[data-js="site-nav-menu"] a').length,
    navigationLinksVisible: [...document.querySelectorAll('[data-js="site-nav-menu"] a')].every((link) => getComputedStyle(link).display !== 'none'),
    navigationMenuHidden: document.querySelector('[data-js="site-nav-menu"]').hasAttribute('aria-hidden'),
  };
})()`);
assert(noScript.className.includes("no-js"), "No-script fallback must preserve the technical no-js state");
assert(noScript.deckReady === null && !noScript.controlsVisible, "No-script fallback must not expose inactive controls");
assert(noScript.allReadable && noScript.verticalFlow, "No-script fallback must render all cards in vertical reading order");
assert(noScript.railReady === null && !noScript.railToggleVisible && noScript.railImageCount === 8 && noScript.railOverflow === "auto", "No-script photo rail must stay static, readable and manually scrollable");
assert(noScript.brandRailReady === null && !noScript.brandRailHasToggle && noScript.brandRailImageCount === 9 && noScript.brandRailDuplicateDisplay === "none" && noScript.brandRailOverflow === "auto", "No-script brand rail must stay static, readable and manually scrollable");
assert(noScript.promoRailReady === null && noScript.promoRailDuplicateDisplay === "none" && noScript.promoRailOverflow === "auto" && noScript.promoText.includes("Webinar TikTok Shop") && noScript.promoTarget === "#operacao", "No-script promo strip must remain readable, manually scrollable and linked to the price explanation");
assert(noScript.navigationToggleDisplay === "none" && noScript.navigationLinkCount === 4 && noScript.navigationLinksVisible && !noScript.navigationMenuHidden, "No-script navigation must expose every destination without an inactive menu control");
await send("Emulation.setScriptExecutionDisabled", { value: false });

await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
await send("Network.enable");
await send("Network.setBlockedURLs", { urls: ["*scrollreveal.min.js*"] });
const missingLibraryLoaded = waitForEvent("Page.loadEventFired");
await send("Page.navigate", { url: pageUrl });
await missingLibraryLoaded;
await new Promise((resolveDelay) => setTimeout(resolveDelay, 300));

const missingLibrary = await evaluate(`(() => ({
  libraryMissing: typeof window.ScrollReveal === 'undefined',
  javascriptReady: document.documentElement.classList.contains('js'),
  deckReady: document.querySelector('[data-js="hero-decision-deck"]')?.dataset.deckReady,
  targetsStatic: [...document.querySelectorAll('[data-motion]')].every((target) => {
    const style = getComputedStyle(target);
    return target.dataset.motionState === 'visible' && !target.hasAttribute('data-sr-id') && style.opacity === '1' && style.transform === 'none';
  }),
}))()`);
assert(missingLibrary.libraryMissing && missingLibrary.javascriptReady && missingLibrary.deckReady === "true" && missingLibrary.targetsStatic, `A missing ScrollReveal asset must degrade to static content without stopping other modules: ${JSON.stringify(missingLibrary)}`);

await send("Network.setBlockedURLs", { urls: [] });
const deepLinkLoaded = waitForEvent("Page.loadEventFired");
await send("Page.navigate", { url: `${pageUrl}?motion-deep-link=1#operacao` });
await deepLinkLoaded;
await new Promise((resolveDelay) => setTimeout(resolveDelay, 1100));

const deepLinkMotion = await evaluate(`(() => {
  const target = document.querySelector('#operacao [data-motion]');
  const style = getComputedStyle(target);
  return {
    hash: location.hash,
    scrollY,
    version: window.ScrollReveal?.().version,
    state: target.dataset.motionState,
    registered: target.hasAttribute('data-sr-id'),
    opacity: style.opacity,
    transform: style.transform,
  };
})()`);
assert(deepLinkMotion.hash === "#operacao" && deepLinkMotion.scrollY > 0 && deepLinkMotion.version === "4.0.9" && deepLinkMotion.state === "visible" && !deepLinkMotion.registered && deepLinkMotion.opacity === "1" && ["none", "matrix(1, 0, 0, 1, 0, 0)"].includes(deepLinkMotion.transform), `Deep links must reveal and settle the destination without leaving hidden content: ${JSON.stringify(deepLinkMotion)}`);

const historyReturn = await evaluate(`(async () => {
  history.replaceState({}, '', '#operacao');
  history.pushState({}, '', '#metodo');
  await new Promise((resolve) => {
    addEventListener('popstate', resolve, { once: true });
    history.back();
    setTimeout(resolve, 1000);
  });
  return {
    hash: location.hash,
    readable: [...document.querySelectorAll('[data-motion]')].every((target) => Number.parseFloat(getComputedStyle(target).opacity) >= 0.75),
  };
})()`, true);
assert(historyReturn.hash === "#operacao" && historyReturn.readable, `History navigation must restore a readable section state: ${JSON.stringify(historyReturn)}`);

const fileLoaded = waitForEvent("Page.loadEventFired");
await send("Page.navigate", { url: fileUrl });
await fileLoaded;
await new Promise((resolveDelay) => setTimeout(resolveDelay, 180));

const fileCarouselBefore = await evaluate(`(() => {
  const root = document.querySelector('[data-js="brand-rail"]');
  const track = root.querySelector('[data-js="brand-rail-track"]');
  const promoRoot = document.querySelector('[data-js="promo-rail"]');
  const promoTrack = promoRoot.querySelector('[data-js="promo-rail-track"]');
  return {
    className: document.documentElement.className,
    ready: root.dataset.railReady,
    engine: root.dataset.railEngine,
    speed: Number(root.dataset.railSpeed),
    groupCount: root.querySelectorAll('.c-brand-rail__group').length,
    duplicateDisplay: getComputedStyle(root.querySelector('.c-brand-rail__group[aria-hidden="true"]')).display,
    hasToggle: Boolean(root.querySelector('[data-js="brand-rail-toggle"]')),
    animationCount: track.getAnimations().length,
    playState: track.getAnimations()[0]?.playState,
    offset: new DOMMatrix(getComputedStyle(track).transform).m41,
    promoReady: promoRoot.dataset.railReady,
    promoEngine: promoRoot.dataset.railEngine,
    promoSpeed: Number(promoRoot.dataset.railSpeed),
    promoAnimationCount: promoTrack.getAnimations().length,
    promoPlayState: promoTrack.getAnimations()[0]?.playState,
    promoOffset: new DOMMatrix(getComputedStyle(promoTrack).transform).m41,
  };
})()`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 500));
const fileCarouselMoving = await evaluate(`(() => {
  const track = document.querySelector('[data-js="brand-rail-track"]');
  const promoTrack = document.querySelector('[data-js="promo-rail-track"]');
  return {
    offset: new DOMMatrix(getComputedStyle(track).transform).m41,
    promoOffset: new DOMMatrix(getComputedStyle(promoTrack).transform).m41,
  };
})()`);
await new Promise((resolveDelay) => setTimeout(resolveDelay, 260));
const fileCarouselAfter = await evaluate(`(() => ({
  offset: new DOMMatrix(getComputedStyle(document.querySelector('[data-js="brand-rail-track"]')).transform).m41,
  promoOffset: new DOMMatrix(getComputedStyle(document.querySelector('[data-js="promo-rail-track"]')).transform).m41,
}))()`);
assert(fileCarouselBefore.className.includes("no-js") && fileCarouselBefore.ready === "true" && fileCarouselBefore.engine === "web-animations-api", `Direct-file preview must initialize the JavaScript carousel: ${JSON.stringify(fileCarouselBefore)}`);
assert(fileCarouselBefore.speed === 56 && fileCarouselBefore.groupCount === 2 && fileCarouselBefore.duplicateDisplay === "flex" && !fileCarouselBefore.hasToggle && fileCarouselBefore.animationCount === 1 && fileCarouselBefore.playState === "running", `Direct-file preview must auto-start one continuous animation without a control: ${JSON.stringify(fileCarouselBefore)}`);
assert(fileCarouselBefore.promoReady === "true" && fileCarouselBefore.promoEngine === "web-animations-api" && fileCarouselBefore.promoSpeed === 72 && fileCarouselBefore.promoAnimationCount === 1 && fileCarouselBefore.promoPlayState === "running", `Direct-file preview must auto-start the promo carousel: ${JSON.stringify(fileCarouselBefore)}`);
assert(fileCarouselMoving.offset < fileCarouselBefore.offset - 12, `Direct-file JavaScript carousel must move horizontally: ${JSON.stringify({ fileCarouselBefore, fileCarouselMoving })}`);
assert(fileCarouselMoving.promoOffset < fileCarouselBefore.promoOffset - 16, `Direct-file promo carousel must move horizontally: ${JSON.stringify({ fileCarouselBefore, fileCarouselMoving })}`);
assert(fileCarouselAfter.offset < fileCarouselMoving.offset - 8 && fileCarouselAfter.promoOffset < fileCarouselMoving.promoOffset - 10, `Direct-file JavaScript carousels must continue without stopping: ${JSON.stringify({ fileCarouselMoving, fileCarouselAfter })}`);

socket.close();
console.log(JSON.stringify({ initial, promoBefore, promoAfter, brandMotion, brandHoverBefore, brandHoverAfter, railViewports, railPaused, railResumed, hoverPaused, hoverResumed, pageVisibility, resizeBefore, resizeAfter, sectionMotion, second, fourth, keyboard, dragFeedback, dragged, draggedBack, verticalGesture, reducedMotion, noScript, missingLibrary, deepLinkMotion, historyReturn, fileCarouselBefore, fileCarouselMoving, fileCarouselAfter }, null, 2));
