import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const cwd = process.cwd();
const reducedMode = process.argv.includes('--reduced');
const fallbackMode = process.argv.includes('--fallback');
const swiperFallbackMode = process.argv.includes('--swiper-fallback');
const quietMode = process.argv.includes('--quiet');
const viewportArg = process.argv.find((argument) => argument.startsWith('--viewport='));
const captureArg = process.argv.find((argument) => argument.startsWith('--capture='));
const captureSelector = captureArg?.slice('--capture='.length);
const viewportWidth = Math.max(320, Math.min(768, Number(viewportArg?.split('=')[1]) || 390));
const modePortOffset = (reducedMode ? 1000 : 0) + (fallbackMode ? 2000 : 0) + (swiperFallbackMode ? 4000 : 0);
const port = 8000 + viewportWidth + modePortOffset;
const debugPort = 20000 + viewportWidth + modePortOffset;
const profile = mkdtempSync(join(tmpdir(), 'amplify-motion-'));
const pageUrl = `http://127.0.0.1:${port}/Webinar%20Landing%20v3.dc.html?motion-smoke=1`;
const chromeCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];
const chromePath = chromeCandidates.find(existsSync);

assert(chromePath, 'Google Chrome não encontrado para o smoke test.');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitForJson = async (url, attempts = 40) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch (_) {}
    await wait(150);
  }
  throw new Error(`Timeout aguardando ${url}`);
};

const waitForHttp = async (url, attempts = 40) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch (_) {}
    await wait(150);
  }
  throw new Error(`Timeout aguardando ${url}`);
};

const server = spawn('py', ['-3', '-m', 'http.server', String(port), '--bind', '127.0.0.1'], {
  cwd,
  windowsHide: true,
  stdio: 'ignore'
});

const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profile}`,
  '--window-size=500,900',
  'about:blank'
], { windowsHide: true, stdio: 'ignore' });

let socket;
let commandId = 0;
const pending = new Map();
const runtimeErrors = [];

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++commandId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});

const evaluate = async (expression) => {
  const response = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
  return response.result.value;
};

try {
  await waitForHttp(`http://127.0.0.1:${port}`);
  const targets = await waitForJson(`http://127.0.0.1:${debugPort}/json/list`);
  const pageTarget = targets.find((target) => target.type === 'page' && !target.url.startsWith('chrome-extension://'));
  assert(pageTarget, 'Nenhuma aba navegável encontrada no Chrome.');
  socket = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') {
      runtimeErrors.push(message.params?.exceptionDetails?.exception?.description || message.params?.exceptionDetails?.text || 'Runtime exception');
    }
    if (!message.id || !pending.has(message.id)) return;
    const task = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) task.reject(new Error(message.error.message));
    else task.resolve(message.result);
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: viewportWidth,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true
  });
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: reducedMode ? 'reduce' : 'no-preference' }]
  });
  if (fallbackMode || swiperFallbackMode) {
    await send('Network.enable');
    const blockedURLs = [];
    if (fallbackMode) blockedURLs.push('*scrollreveal*');
    if (swiperFallbackMode) blockedURLs.push('*swiper*');
    await send('Network.setBlockedURLs', { urls: blockedURLs });
  }
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `(() => {
      const nativeMatchMedia = window.matchMedia.bind(window);
      window.matchMedia = (query) => {
        const result = nativeMatchMedia(query);
        if (query !== '(prefers-reduced-motion: reduce)') return result;
        return new Proxy(result, {
          get(target, property) {
            if (property === 'matches') return ${reducedMode};
            const value = Reflect.get(target, property, target);
            return typeof value === 'function' ? value.bind(target) : value;
          }
        });
      };
    })();`
  });
  await send('Page.navigate', { url: pageUrl });
  await wait(3200);

  const initial = await evaluate(`(() => {
    const root = [...document.querySelectorAll('.landing-page')].find((element) => !element.closest('x-dc'));
    const target = root?.querySelector('#metodo [data-motion="rise"]');
    const style = target ? getComputedStyle(target) : null;
    return {
      href: location.href,
      title: document.title,
      viewport: { width: innerWidth, height: innerHeight },
      htmlClass: document.documentElement.className,
      bodyClass: document.body?.className || '',
      scripts: [...document.scripts].map((script) => script.src || script.type).filter(Boolean),
      landingNodes: document.querySelectorAll('.landing-page').length,
      bodyText: document.body?.innerText.slice(0, 120) || '',
      root: !!root,
      status: root?.dataset.motionStatus || null,
      targets: root?.querySelectorAll('[data-motion]').length || 0,
      registered: root?.querySelectorAll('[data-motion][data-sr-id]').length || 0,
      targetOpacity: style ? Number(style.opacity) : null,
      targetTransform: style?.transform || null,
      methodRailScrollable: (() => {
        const rail = root?.querySelector('.method-card-rail');
        return !!rail && rail.scrollWidth > rail.clientWidth;
      })(),
      productRailScrollable: (() => {
        const rail = root?.querySelector('.product-experience-grid');
        return !!rail && rail.scrollWidth > rail.clientWidth;
      })(),
      outcomesRailScrollable: (() => {
        const rail = root?.querySelector('.outcomes-grid');
        return !!rail && rail.scrollWidth > rail.clientWidth;
      })(),
      journeyChapters: [...(root?.querySelectorAll('.journey-section[data-journey-step]') || [])].map((section) => section.dataset.journeyStep),
      diagnosisDecisions: root?.querySelectorAll('.diagnosis .journey-card').length || 0,
      methodDecisions: root?.querySelectorAll('.method-card-rail .curriculum-card').length || 0,
      methodQuestions: root?.querySelectorAll('.method-card-rail .curriculum-question').length || 0,
      methodResults: root?.querySelectorAll('.method-card-rail .curriculum-result').length || 0,
      hiddenJourneyCards: [...(root?.querySelectorAll('.journey-card') || [])].filter((card) => {
        const cardStyle = getComputedStyle(card);
        return cardStyle.display === 'none' || cardStyle.visibility === 'hidden' || Number(cardStyle.opacity) < 0.9;
      }).length,
      truncatedCriticalCopy: [...(root?.querySelectorAll('.case-study-copy p,.mentor-copy .u-091,.method-card-rail .curriculum-topics,.discount-course-copy p') || [])].filter((element) => {
        const copyStyle = getComputedStyle(element);
        return copyStyle.overflow === 'hidden' && !['none', 'unset'].includes(copyStyle.webkitLineClamp);
      }).length,
      dockInitiallyVisible: root?.querySelector('[data-conversion-dock]')?.classList.contains('is-visible') || false,
      badPriceSpacing: [...(root?.querySelectorAll('a') || [])].filter((link) => /porR\$/i.test(link.textContent)).length,
      scrollable: document.documentElement.scrollHeight > innerHeight,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
      heroDecision: (() => {
        const card = root?.querySelector('.hero-question-deck');
        const deck = card?.querySelector('[data-question-deck]');
        return {
          present: !!card,
          decisions: card?.querySelectorAll('.question-card').length || 0,
          output: card?.querySelectorAll('.question-card-answer').length === 4,
          interactive: !!deck?.classList.contains('swiper-initialized'),
          nativeScrollable: !!deck && deck.querySelector('.swiper-wrapper')?.scrollWidth > deck.querySelector('.swiper-wrapper')?.clientWidth,
          deckStatus: deck?.dataset.deckStatus || null,
          current: card?.querySelector('[data-question-current]')?.textContent || null,
          offerElements: card?.querySelectorAll('.hero-quick-offer,.hero-clock,.hero-deadline,.hero-offer-cta').length || 0,
          height: card?.getBoundingClientRect().height || 0
        };
      })(),
      deliverables: (() => {
        const section = root?.querySelector('#entregas');
        const descriptions = [...(section?.querySelectorAll('.discount-course-copy p') || [])];
        return {
          hasIntro: !!section?.querySelector('.deliverables-intro'),
          courses: section?.querySelectorAll('.discount-course').length || 0,
          visibleDescriptions: descriptions.filter((element) => getComputedStyle(element).display !== 'none').length,
          hasOfferBridge: !!section?.querySelector('.offer-bridge')
        };
      })(),
      conversionNarrative: (() => {
        const sections = [...(root?.querySelectorAll('main > section') || [])];
        const indexOf = (selector) => sections.findIndex((section) => section.matches(selector));
        const finalCheckout = root?.querySelector('#oferta .u-107');
        return {
          experience: indexOf('#experiencia'),
          context: indexOf('.context'),
          diagnosis: indexOf('.diagnosis'),
          outcomes: indexOf('.outcomes-section'),
          audience: indexOf('.audience-section'),
          brands: indexOf('.brand-proof'),
          results: indexOf('#resultados'),
          mentor: indexOf('#mentor'),
          method: indexOf('#metodo'),
          deliverables: indexOf('#entregas'),
          faq: indexOf('#faq'),
          finalDecision: indexOf('.final-decision'),
          finalDecisionCta: !!root?.querySelector('.final-decision [data-offer-open]'),
          purchaseSteps: root?.querySelectorAll('.purchase-journey li').length || 0,
          caseLogicSteps: root?.querySelectorAll('.case-logic>div').length || 0,
          genericProofCards: root?.querySelectorAll('.proof-card').length || 0,
          finalCheckoutHref: finalCheckout?.getAttribute('href') || null
        };
      })()
    };
  })()`);

  assert(initial.root, `A landing renderizada não foi encontrada: ${JSON.stringify(initial)}`);
  const expectedStatus = fallbackMode ? 'fallback' : (reducedMode ? 'reduced' : 'ready');
  assert.equal(initial.status, expectedStatus, `Engine inesperado: ${JSON.stringify({ initial, runtimeErrors })}`);
  assert(initial.targets >= 15, 'Poucos alvos data-motion foram renderizados.');
  if (fallbackMode) assert.equal(initial.registered, 0, 'Fallback não deveria depender de data-sr-id.');
  else assert(initial.registered >= 15, 'ScrollReveal não registrou todos os alvos.');
  assert(initial.scrollable, 'A página não está rolável.');
  assert.equal(initial.horizontalOverflow, false, `A página criou overflow horizontal: ${JSON.stringify(initial)}`);
  assert.deepEqual(initial.journeyChapters, ['01', '02', '03', '04', '05', '06', '07'], 'Os sete capítulos comerciais perderam ordem ou identidade.');
  assert.equal(initial.diagnosisDecisions, 4, 'O diagnóstico precisa refletir Produto, Creators, Conteúdo e Escala.');
  assert.equal(initial.methodDecisions, 4, 'O método precisa apresentar quatro decisões sem sequência duplicada.');
  assert.equal(initial.methodQuestions, 4, 'Cada card do método precisa começar pela pergunta correspondente.');
  assert.equal(initial.methodResults, 4, 'Cada card do método precisa terminar na decisão produzida.');
  assert.equal(initial.hiddenJourneyCards, 0, 'Há cards da jornada ocultos antes da interação.');
  if (viewportWidth <= 699) assert.equal(initial.truncatedCriticalCopy, 0, 'Textos críticos continuam truncados no mobile.');
  assert.equal(initial.dockInitiallyVisible, false, 'A barra de compra não deve disputar atenção com o hero.');
  assert.equal(initial.badPriceSpacing, 0, 'Um CTA juntou o texto ao preço dinâmico.');
  assert(initial.heroDecision.present, 'O deck de perguntas do hero não foi renderizado.');
  assert.equal(initial.heroDecision.decisions, 4, 'O deck precisa apresentar as quatro perguntas da operação.');
  assert(initial.heroDecision.output, 'Cada pergunta precisa revelar a decisão prática correspondente.');
  if (swiperFallbackMode) {
    assert.equal(initial.heroDecision.interactive, false, 'O fallback não deve depender de uma instância do Swiper.');
    assert(initial.heroDecision.nativeScrollable, 'Sem Swiper, os cartões precisam continuar arrastáveis por scroll nativo.');
    assert.equal(initial.heroDecision.deckStatus, 'native', 'O fallback nativo do deck não foi ativado.');
  } else {
    assert(initial.heroDecision.interactive, 'O deck não foi inicializado como um container arrastável.');
    assert.equal(initial.heroDecision.deckStatus, 'ready', 'O deck não informou estado pronto.');
  }
  assert(['1', '2', '3', '4'].includes(initial.heroDecision.current), 'O progresso do deck não foi atualizado.');
  assert.equal(initial.heroDecision.offerElements, 0, 'Preço, cronômetro e CTA não devem disputar atenção dentro do visual do hero.');
  if (viewportWidth <= 699) assert(initial.heroDecision.height < initial.viewport.height * 0.76, 'O deck de perguntas ficou alto demais para uso rápido no mobile.');
  if (viewportWidth <= 699) {
    assert(initial.methodRailScrollable, 'Os cards do método não formaram um rail horizontal rolável no mobile.');
    assert(initial.productRailScrollable, 'A experiência de compra não formou um rail horizontal no mobile.');
    assert(initial.outcomesRailScrollable, 'Os benefícios não formaram um rail horizontal no mobile.');
  }
  assert(initial.deliverables.hasIntro, 'A introdução de valor das entregas não foi renderizada.');
  assert.equal(initial.deliverables.courses, 5, 'A lista de quatro blocos e do acesso ficou incompleta.');
  assert.equal(initial.deliverables.visibleDescriptions, 5, 'As descrições das entregas não estão visíveis.');
  assert(initial.deliverables.hasOfferBridge, 'A transição entre valor e oferta não foi renderizada.');
  assert(initial.conversionNarrative.experience < initial.conversionNarrative.context, 'A explicação do produto deve vir antes do contexto.');
  assert(initial.conversionNarrative.context < initial.conversionNarrative.diagnosis, 'A oportunidade deve vir antes do diagnóstico.');
  assert(initial.conversionNarrative.diagnosis < initial.conversionNarrative.outcomes, 'O problema deve vir antes da transformação.');
  assert(initial.conversionNarrative.outcomes < initial.conversionNarrative.audience, 'A transformação deve vir antes da identificação.');
  assert(initial.conversionNarrative.audience < initial.conversionNarrative.results, 'A identificação deve vir antes do case.');
  assert(initial.conversionNarrative.results < initial.conversionNarrative.mentor, 'A prova deve vir antes da autoridade do mentor.');
  assert(initial.conversionNarrative.mentor < initial.conversionNarrative.method, 'A autoridade deve vir antes do método.');
  assert(initial.conversionNarrative.method < initial.conversionNarrative.deliverables, 'O método deve vir antes da oferta.');
  assert(initial.conversionNarrative.deliverables < initial.conversionNarrative.faq, 'A oferta deve vir antes das objeções finais.');
  assert(initial.conversionNarrative.faq < initial.conversionNarrative.finalDecision, 'A página precisa fechar a decisão depois do FAQ.');
  assert(initial.conversionNarrative.finalDecisionCta, 'O fechamento precisa oferecer um próximo passo explícito.');
  assert.equal(initial.conversionNarrative.purchaseSteps, 4, 'A experiência pós-compra ficou incompleta.');
  assert.equal(initial.conversionNarrative.caseLogicSteps, 3, 'O case não apresenta contexto, decisão e resultado.');
  assert.equal(initial.conversionNarrative.genericProofCards, 0, 'Foram renderizados depoimentos genéricos não autorizados.');

  if (!swiperFallbackMode) {
    const deckInteraction = await evaluate(`(async () => {
      const root = [...document.querySelectorAll('.landing-page')].find((element) => !element.closest('x-dc'));
      const deck = root?.querySelector('[data-question-deck]');
      const shell = deck?.closest('.hero-question-deck');
      if (!deck?.swiper || !shell) return null;
      shell.dispatchEvent(new Event('pointerdown', { bubbles: true }));
      deck.swiper.slideTo(0, 0);
      shell.querySelector('.question-deck-next')?.click();
      await new Promise((resolve) => setTimeout(resolve, ${reducedMode ? 80 : 700}));
      return {
        activeIndex: deck.swiper.activeIndex,
        current: shell.querySelector('[data-question-current]')?.textContent || null
      };
    })()`);
    assert(deckInteraction, 'A instância interativa do deck não está acessível.');
    assert.equal(deckInteraction.activeIndex, 1, 'O botão de avanço não moveu o deck para a segunda pergunta.');
    assert.equal(deckInteraction.current, '2', 'O contador não acompanhou a pergunta ativa.');
  }

  if (captureSelector) {
    const found = await evaluate(`(async () => {
      const root = [...document.querySelectorAll('.landing-page')].find((element) => !element.closest('x-dc'));
      const target = root?.querySelector(${JSON.stringify(captureSelector)});
      if (!target) return false;
      target.scrollIntoView({ block: 'start' });
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return true;
    })()`);
    assert(found, `Seletor de captura não encontrado: ${captureSelector}`);
    const screenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    const captureName = captureSelector.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'page';
    const capturePath = join(cwd, '_archive', 'references', `capture-${viewportWidth}-${captureName}.png`);
    writeFileSync(capturePath, Buffer.from(screenshot.data, 'base64'));
    console.log(`Captura visual: ${capturePath}`);
  }

  const ribbonBefore = await evaluate(`(() => {
    const results = document.querySelector('.results-ribbon-track');
    const brands = document.querySelector('.brands-track');
    return {
      results: results ? getComputedStyle(results).transform : null,
      brands: brands ? getComputedStyle(brands).transform : null,
      resultsAnimation: results ? getComputedStyle(results).animationName : null,
      brandsAnimation: brands ? getComputedStyle(brands).animationName : null
    };
  })()`);
  await wait(420);
  const ribbonAfter = await evaluate(`(() => {
    const results = document.querySelector('.results-ribbon-track');
    const brands = document.querySelector('.brands-track');
    return {
      results: results ? getComputedStyle(results).transform : null,
      brands: brands ? getComputedStyle(brands).transform : null,
      resultsAnimation: results ? getComputedStyle(results).animationName : null,
      brandsAnimation: brands ? getComputedStyle(brands).animationName : null
    };
  })()`);
  if (reducedMode) {
    assert.equal(ribbonBefore.resultsAnimation, 'none', 'A faixa de oferta não parou no modo reduzido.');
    assert.equal(ribbonBefore.brandsAnimation, 'none', 'A faixa de marcas não parou no modo reduzido.');
  } else {
    assert.notEqual(ribbonBefore.resultsAnimation, 'none', 'A faixa de oferta perdeu sua animação leve.');
    assert.notEqual(ribbonBefore.brandsAnimation, 'none', 'A faixa de marcas perdeu sua animação leve.');
  }

  const railVisibility = await evaluate(`(async () => {
    const root = [...document.querySelectorAll('.landing-page')].find((element) => !element.closest('x-dc'));
    const rails = [...root.querySelectorAll('[data-rail-label]')];
    const results = [];
    for (const rail of rails) {
      rail.scrollLeft = rail.scrollWidth;
      rail.dispatchEvent(new Event('scroll'));
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      results.push({
        label: rail.dataset.railLabel,
        position: rail.dataset.railPosition,
        visible: [...rail.children].every((card) => {
          const cardStyle = getComputedStyle(card);
          return cardStyle.display !== 'none' && cardStyle.visibility !== 'hidden' && Number(cardStyle.opacity) > 0.9;
        })
      });
    }
    return results;
  })()`);
  assert(railVisibility.every((rail) => rail.visible), `Um rail manteve cards ocultos após o arraste: ${JSON.stringify(railVisibility)}`);
  if (viewportWidth <= 699) assert(railVisibility.every((rail) => rail.position === 'end'), `O progresso dos rails não acompanhou o arraste: ${JSON.stringify(railVisibility)}`);

  const reveal = await evaluate(`(async () => {
    const root = [...document.querySelectorAll('.landing-page')].find((element) => !element.closest('x-dc'));
    const target = root.querySelector('#metodo [data-motion="rise"]');
    const before = { opacity: Number(getComputedStyle(target).opacity), state: target.dataset.motionState || null };
    target.scrollIntoView({ block: 'center' });
    await new Promise((resolve) => setTimeout(resolve, 1800));
    const after = { opacity: Number(getComputedStyle(target).opacity), state: target.dataset.motionState || null };
    return { before, after, scrollY };
  })()`);

  assert(reveal.scrollY > 0, 'O scroll programático não avançou.');
  assert(reveal.after.opacity > 0.9, `O alvo continuou invisível: ${JSON.stringify(reveal)}`);
  const revealSettled = ['revealed', 'forced-visible'].includes(reveal.after.state)
    || (reveal.after.state === 'revealing' && reveal.after.opacity > 0.95);
  assert(revealSettled, `Estado final inválido: ${JSON.stringify(reveal)}`);

  const modal = await evaluate(`(async () => {
    const root = [...document.querySelectorAll('.landing-page')].find((element) => !element.closest('x-dc'));
    root.querySelector('[data-offer-open]').click();
    await new Promise((resolve) => setTimeout(resolve, 380));
    const offer = root.querySelector('#oferta');
    const open = offer.classList.contains('is-open') && offer.getAttribute('aria-hidden') === 'false';
    offer.querySelector('[data-offer-close]').click();
    return { open };
  })()`);
  assert(modal.open, 'O modal de oferta não abriu durante o smoke test.');

  if (!quietMode) console.log(JSON.stringify({ initial, ribbons: { before: ribbonBefore, after: ribbonAfter }, railVisibility, reveal, modal }, null, 2));
  console.log('Browser motion smoke OK.');
} finally {
  socket?.close();
  chrome.kill();
  server.kill();
  await Promise.race([
    new Promise((resolve) => chrome.once('exit', resolve)),
    wait(1500)
  ]);
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
  } catch (_) {
    // O Chrome pode manter arquivos de telemetria abertos por alguns instantes no Windows.
  }
}
