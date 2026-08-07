(() => {
  document.documentElement.classList.add('motion-pending');
  document.documentElement.classList.add('motion-capable');

  const releaseMotionLock = () => {
    document.body?.classList.add('motion-ready');
    document.documentElement.classList.remove('motion-pending');
  };
  window.setTimeout(releaseMotionLock, 3600);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = document.querySelector('[data-page-loader]');
  const loaderStartedAt = performance.now();
  let loaderComplete = false;

  const completePageLoader = () => {
    if (loaderComplete) return;
    loaderComplete = true;

    let hasSeenLoader = false;
    try {
      hasSeenLoader = window.sessionStorage.getItem('amplify-loader-seen') === '1';
      window.sessionStorage.setItem('amplify-loader-seen', '1');
    } catch (_) {}

    const minimum = reduceMotion ? 0 : (hasSeenLoader ? 180 : 720);
    const wait = Math.max(0, minimum - (performance.now() - loaderStartedAt));
    window.setTimeout(() => {
      window.setTimeout(() => {
        releaseMotionLock();
        loader?.classList.add('is-leaving');
        loader?.setAttribute('aria-hidden', 'true');
        window.setTimeout(() => loader?.remove(), reduceMotion ? 0 : 1300);
      }, reduceMotion ? 0 : 90);
    }, wait);
  };

  if (!loader) {
    releaseMotionLock();
  }

  const readingProgress = document.querySelector('[data-reading-progress]');
  let readingFrame = 0;
  const paintReadingProgress = () => {
    readingFrame = 0;
    if (!readingProgress) return;
    const distance = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / distance));
    readingProgress.style.transform = `scaleX(${progress})`;
  };
  const scheduleReadingProgress = () => {
    if (readingFrame) return;
    readingFrame = window.requestAnimationFrame(paintReadingProgress);
  };
  window.addEventListener('scroll', scheduleReadingProgress, { passive: true });
  window.addEventListener('resize', scheduleReadingProgress, { passive: true });
  scheduleReadingProgress();

  const initializedRoots = new WeakSet();
  let revealRootId = 0;
  let activeRoot = null;
  let activeCleanup = () => {};

  const initRoot = (root) => {
    if (!root || initializedRoots.has(root)) return;
    if (activeRoot && activeRoot !== root) activeCleanup();
    initializedRoots.add(root);
    activeRoot = root;
    const abortController = new AbortController();
    const { signal } = abortController;
    const cleanupTasks = [];
    let revealEngine = null;
    activeCleanup = () => {
      abortController.abort();
      cleanupTasks.splice(0).forEach((cleanup) => cleanup());
      if (revealEngine) {
        root.querySelectorAll('[data-motion]').forEach((element) => {
          try { revealEngine.clean(element); } catch (_) {}
        });
      }
      initializedRoots.delete(root);
      if (activeRoot === root) activeRoot = null;
    };
    root.dataset.motionStatus = 'initializing';

    const header = root.querySelector('.site-header');
    const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 18);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true, signal });

    root.querySelectorAll('main > section').forEach((section) => section.classList.add('motion-scene'));

    const journeySteps = Array.from(root.querySelectorAll('.journey-section[data-journey-step]'));
    let journeyFrame = 0;
    const updateJourneyState = () => {
      journeyFrame = 0;
      const focusLine = Math.min(window.innerHeight * 0.34, 320);
      let activeStep = null;
      let activeDistance = Number.POSITIVE_INFINITY;

      journeySteps.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.bottom <= 70 || rect.top >= window.innerHeight) return;
        const containsFocusLine = rect.top <= focusLine && rect.bottom >= focusLine;
        const distance = containsFocusLine ? 0 : Math.min(Math.abs(rect.top - focusLine), Math.abs(rect.bottom - focusLine));
        if (distance < activeDistance) {
          activeDistance = distance;
          activeStep = section;
        }
      });

      journeySteps.forEach((section) => {
        const isActive = section === activeStep;
        section.classList.toggle('is-journey-active', isActive);
        const question = section.querySelector('.journey-question');
        if (isActive) question?.setAttribute('aria-current', 'step');
        else question?.removeAttribute('aria-current');
      });
    };
    const scheduleJourneyState = () => {
      if (journeyFrame) return;
      journeyFrame = window.requestAnimationFrame(updateJourneyState);
    };
    window.addEventListener('scroll', scheduleJourneyState, { passive: true, signal });
    window.addEventListener('resize', scheduleJourneyState, { passive: true, signal });
    cleanupTasks.push(() => window.cancelAnimationFrame(journeyFrame));
    scheduleJourneyState();

    root.querySelectorAll('[data-rail-label]').forEach((rail) => {
      const label = rail.dataset.railLabel || 'Conteúdo relacionado';
      const hint = rail.previousElementSibling?.classList.contains('journey-swipe-hint')
        ? rail.previousElementSibling
        : null;
      const hintAction = hint?.querySelector('strong');
      let railFrame = 0;

      rail.setAttribute('role', 'region');
      if (!rail.hasAttribute('aria-label')) rail.setAttribute('aria-label', label);
      if (!rail.hasAttribute('tabindex')) rail.tabIndex = 0;

      const updateRail = () => {
        railFrame = 0;
        const limit = Math.max(0, rail.scrollWidth - rail.clientWidth);
        const progress = limit > 1 ? Math.min(1, Math.max(0, rail.scrollLeft / limit)) : 1;
        hint?.style.setProperty('--rail-progress', progress.toFixed(3));
        rail.dataset.railPosition = progress >= 0.96 ? 'end' : progress > 0.04 ? 'middle' : 'start';
        if (hintAction) hintAction.textContent = progress >= 0.96 ? 'Fim ✓' : progress > 0.04 ? 'Continue →' : 'Deslize →';
      };
      const scheduleRail = () => {
        if (railFrame) return;
        railFrame = window.requestAnimationFrame(updateRail);
      };

      rail.addEventListener('scroll', scheduleRail, { passive: true, signal });
      rail.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        rail.scrollBy({
          left: rail.clientWidth * 0.82 * (event.key === 'ArrowRight' ? 1 : -1),
          behavior: reduceMotion ? 'auto' : 'smooth'
        });
      }, { signal });
      window.addEventListener('resize', scheduleRail, { passive: true, signal });
      cleanupTasks.push(() => window.cancelAnimationFrame(railFrame));
      scheduleRail();
    });

    const conversionDock = root.querySelector('[data-conversion-dock]');
    const hero = root.querySelector('.hero');
    const deliverables = root.querySelector('#entregas');
    const finalDecision = root.querySelector('.final-decision');
    const footer = root.querySelector('footer');
    let dockFrame = 0;
    const updateConversionDock = () => {
      dockFrame = 0;
      if (!conversionDock || !hero) return;
      const heroRect = hero.getBoundingClientRect();
      const deliverablesRect = deliverables?.getBoundingClientRect();
      const finalDecisionRect = finalDecision?.getBoundingClientRect();
      const footerRect = footer?.getBoundingClientRect();
      const passedHero = heroRect.bottom < Math.max(72, window.innerHeight * 0.12);
      const overOffer = !!deliverablesRect && deliverablesRect.top < window.innerHeight * 0.9 && deliverablesRect.bottom > 72;
      const overClosing = !!finalDecisionRect && finalDecisionRect.top < window.innerHeight * 0.9 && finalDecisionRect.bottom > 72;
      const overFooter = !!footerRect && footerRect.top < window.innerHeight;
      const isVisible = passedHero && !overOffer && !overClosing && !overFooter;
      conversionDock.classList.toggle('is-visible', isVisible);
      conversionDock.setAttribute('aria-hidden', String(!isVisible));
    };
    const scheduleConversionDock = () => {
      if (dockFrame) return;
      dockFrame = window.requestAnimationFrame(updateConversionDock);
    };
    window.addEventListener('scroll', scheduleConversionDock, { passive: true, signal });
    window.addEventListener('resize', scheduleConversionDock, { passive: true, signal });
    cleanupTasks.push(() => window.cancelAnimationFrame(dockFrame));
    scheduleConversionDock();

    const mediaReveals = root.querySelectorAll('.motion-media-reveal');
    if (reduceMotion || typeof window.IntersectionObserver !== 'function') {
      mediaReveals.forEach((element) => element.classList.add('is-motion-visible'));
    } else {
      const mediaObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-motion-visible');
          mediaObserver.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      cleanupTasks.push(() => mediaObserver.disconnect());
      mediaReveals.forEach((element) => {
        element.classList.add('is-motion-prepared');
        mediaObserver.observe(element);
        window.setTimeout(() => element.classList.add('is-motion-visible'), 5000);
      });
    }

    root.querySelectorAll('a[href^="#"]:not([data-offer-open])').forEach((link) => {
      link.addEventListener('click', () => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) target.classList.add('attention-pulse');
        window.setTimeout(() => target?.classList.remove('attention-pulse'), 900);
      }, { signal });
    });

    const heroVisual = root.querySelector('.hero-visual');
    if (heroVisual && !reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      heroVisual.addEventListener('pointermove', (event) => {
        const rect = heroVisual.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * -2;
        heroVisual.style.setProperty('--tilt-x', `${y}deg`);
        heroVisual.style.setProperty('--tilt-y', `${x}deg`);
      }, { signal });
      heroVisual.addEventListener('pointerleave', () => {
        heroVisual.style.setProperty('--tilt-x', '0deg');
        heroVisual.style.setProperty('--tilt-y', '0deg');
      }, { signal });
    }

    const questionDeck = root.querySelector('[data-question-deck]');
    if (questionDeck && typeof window.Swiper === 'function') {
      try {
        const deckShell = questionDeck.closest('.hero-question-deck');
        const currentQuestion = deckShell?.querySelector('[data-question-current]');
        const questionStatus = deckShell?.querySelector('[data-question-status]');
        const previousButton = deckShell?.querySelector('.question-deck-prev');
        const nextButton = deckShell?.querySelector('.question-deck-next');
        const pagination = deckShell?.querySelector('.question-deck-pagination');
        const updateQuestion = (swiper) => {
          const current = swiper.realIndex + 1;
          if (currentQuestion) currentQuestion.textContent = String(current);
          if (questionStatus) questionStatus.textContent = `Pergunta ${current} de 4`;
          deckShell?.setAttribute('data-active-question', String(current));
        };

        const questionSwiper = new window.Swiper(questionDeck, {
        effect: reduceMotion ? 'slide' : 'cards',
        slidesPerView: 1,
        speed: reduceMotion ? 0 : 520,
        grabCursor: !reduceMotion,
        rewind: false,
        watchOverflow: true,
        observer: true,
        observeParents: true,
        observeSlideChildren: true,
        navigation: { prevEl: previousButton, nextEl: nextButton },
        pagination: { el: pagination, clickable: true },
        cardsEffect: {
          perSlideOffset: 9,
          perSlideRotate: 1.4,
          rotate: !reduceMotion,
          slideShadows: false
        },
        a11y: {
          enabled: true,
          containerRole: 'region',
          containerRoleDescriptionMessage: 'Carrossel de perguntas',
          containerMessage: 'Quatro perguntas para organizar sua operação no TikTok Shop',
          itemRoleDescriptionMessage: 'pergunta',
          slideLabelMessage: 'Pergunta {{index}} de {{slidesLength}}',
          prevSlideMessage: 'Mostrar pergunta anterior',
          nextSlideMessage: 'Mostrar próxima pergunta',
          paginationBulletMessage: 'Ir para a pergunta {{index}}',
          wrapperLiveRegion: false
        },
        on: {
          init: updateQuestion,
          slideChange: updateQuestion
        }
        });
        questionDeck.dataset.deckStatus = 'ready';

        let teaserCancelled = false;
        const teaserTimers = [];
        const cancelTeaser = () => {
          teaserCancelled = true;
          teaserTimers.splice(0).forEach((timer) => window.clearTimeout(timer));
        };
        deckShell?.addEventListener('pointerdown', cancelTeaser, { signal });
        deckShell?.addEventListener('focusin', cancelTeaser, { signal });
        deckShell?.addEventListener('keydown', cancelTeaser, { signal });

        let teaserObserver = null;
        if (!reduceMotion && typeof window.IntersectionObserver === 'function') {
          teaserObserver = new IntersectionObserver((entries) => {
            if (!entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.55)) return;
            teaserObserver?.disconnect();
            teaserTimers.push(window.setTimeout(() => {
              if (teaserCancelled || questionSwiper.destroyed || questionSwiper.activeIndex !== 0) return;
              questionSwiper.slideNext(420);
              teaserTimers.push(window.setTimeout(() => {
                if (!teaserCancelled && !questionSwiper.destroyed && questionSwiper.activeIndex === 1) {
                  questionSwiper.slidePrev(420);
                }
              }, 760));
            }, 720));
          }, { threshold: [0.55] });
          teaserObserver.observe(deckShell);
        }

        cleanupTasks.push(() => {
          cancelTeaser();
          teaserObserver?.disconnect();
          if (!questionSwiper.destroyed) questionSwiper.destroy(true, true);
        });
      } catch (error) {
        questionDeck.dataset.deckStatus = 'native';
        console.warn('[amplify] Swiper indisponível; usando scroll nativo.', error);
      }
    } else if (questionDeck) {
      questionDeck.dataset.deckStatus = 'native';
    }

    if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      root.querySelectorAll('[data-offer-open]').forEach((button) => {
        button.classList.add('motion-magnetic');
        button.addEventListener('pointermove', (event) => {
          const rect = button.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width - 0.5) * 7;
          const y = ((event.clientY - rect.top) / rect.height - 0.5) * 5;
          button.style.setProperty('--magnetic-x', `${x}px`);
          button.style.setProperty('--magnetic-y', `${y}px`);
        }, { signal });
        button.addEventListener('pointerleave', () => {
          button.style.setProperty('--magnetic-x', '0px');
          button.style.setProperty('--magnetic-y', '0px');
        }, { signal });
      });
    }

    const offerModal = root.querySelector('#oferta.offer-modal');
    if (offerModal) {
      const offerDialog = offerModal.querySelector('.offer-modal-dialog');
      const closeButton = offerModal.querySelector('.offer-modal-close');
      let lastFocused = null;

      const openOffer = (event) => {
        event?.preventDefault();
        lastFocused = event?.currentTarget || document.activeElement;
        offerModal.classList.add('is-open');
        offerModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('offer-modal-open');
        window.requestAnimationFrame(() => closeButton?.focus());
      };

      const closeOffer = () => {
        if (!offerModal.classList.contains('is-open')) return;
        offerModal.classList.remove('is-open');
        offerModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('offer-modal-open');
        lastFocused?.focus?.();
      };

      root.querySelectorAll('[data-offer-open]').forEach((button) => {
        button.addEventListener('click', openOffer, { signal });
      });
      offerModal.querySelectorAll('[data-offer-close]').forEach((button) => {
        button.addEventListener('click', closeOffer, { signal });
      });
      if (window.location.hash === '#oferta') {
        window.setTimeout(() => openOffer(), 0);
      }

      document.addEventListener('keydown', (event) => {
        if (!offerModal.classList.contains('is-open')) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          closeOffer();
          return;
        }
        if (event.key !== 'Tab') return;
        const focusable = Array.from(offerDialog.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }, { signal });
    }

    const selectors = ['[data-motion]'];

    if (typeof window.ScrollReveal !== 'function') {
      root.dataset.motionStatus = 'fallback';
      initFallback(root, selectors, signal);
      window.dispatchEvent(new CustomEvent('amplify:motion-ready', {
        detail: { engine: 'intersection-observer', reduced: reduceMotion }
      }));
      completePageLoader();
      return;
    }

    const rootId = String(++revealRootId);
    root.dataset.srRoot = rootId;
    const base = `[data-sr-root="${rootId}"]`;
    const sr = window.ScrollReveal({
      distance: reduceMotion ? '0px' : '24px',
      duration: reduceMotion ? 360 : 820,
      easing: 'cubic-bezier(.25,.1,.25,1)',
      origin: 'bottom',
      opacity: 1,
      reset: false,
      mobile: true,
      cleanup: false,
      viewFactor: 0.08,
      viewOffset: { top: 0, right: 0, bottom: 34, left: 0 },
      beforeReveal: (element) => { element.dataset.motionState = 'revealing'; },
      afterReveal: (element) => { element.dataset.motionState = 'revealed'; }
    });
    revealEngine = sr;

    sr.reveal(`${base} [data-motion="rise"]`, { interval: 75, distance: reduceMotion ? '0px' : '22px' });
    sr.reveal(`${base} [data-motion="scale"]`, { distance: reduceMotion ? '0px' : '22px', scale: reduceMotion ? 1 : 0.985 });
    sr.reveal(`${base} [data-motion="top"]`, { origin: 'top', distance: reduceMotion ? '0px' : '18px', scale: reduceMotion ? 1 : 0.995 });
    sr.reveal(`${base} [data-motion="left"]`, { origin: 'left', distance: reduceMotion ? '0px' : '36px' });
    sr.reveal(`${base} [data-motion="right"]`, { origin: 'right', distance: reduceMotion ? '0px' : '36px', delay: reduceMotion ? 0 : 100 });

    const guarded = new WeakSet();
    const guardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        guardObserver.unobserve(entry.target);
        window.setTimeout(() => {
          if (!entry.target.isConnected) return;
          const style = window.getComputedStyle(entry.target);
          if (style.visibility === 'hidden' || Number(style.opacity) < 0.08) {
            sr.clean(entry.target);
            entry.target.classList.add('motion-force-visible');
            entry.target.dataset.motionState = 'forced-visible';
          }
        }, reduceMotion ? 700 : 1500);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
    cleanupTasks.push(() => guardObserver.disconnect());

    const registerGuards = () => {
      root.querySelectorAll(selectors.join(',')).forEach((element) => {
        if (guarded.has(element)) return;
        guarded.add(element);
        guardObserver.observe(element);
      });
    };
    registerGuards();

    let syncFrame = 0;
    const contentObserver = new MutationObserver((mutations) => {
      if (!mutations.some((mutation) => mutation.addedNodes.length)) return;
      window.cancelAnimationFrame(syncFrame);
      syncFrame = window.requestAnimationFrame(() => {
        sr.sync();
        registerGuards();
      });
    });
    contentObserver.observe(root, { childList: true, subtree: true });
    cleanupTasks.push(() => {
      window.cancelAnimationFrame(syncFrame);
      contentObserver.disconnect();
    });

    root.dataset.motionStatus = reduceMotion ? 'reduced' : 'ready';
    window.dispatchEvent(new CustomEvent('amplify:motion-ready', {
      detail: { engine: 'scrollreveal', reduced: reduceMotion }
    }));

    completePageLoader();

  };

  const initFallback = (root, selectors, signal) => {
    const registered = new WeakSet();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        entry.target.dataset.motionState = 'revealed';
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -34px 0px' });

    const scan = () => {
      root.querySelectorAll(selectors.join(',')).forEach((element, index) => {
        if (registered.has(element)) return;
        registered.add(element);
        element.classList.add('motion-fallback');
        element.style.setProperty('--motion-delay', `${Math.min(index % 4, 3) * 75}ms`);
        observer.observe(element);
      });
    };

    scan();
    const contentObserver = new MutationObserver(scan);
    contentObserver.observe(root, { childList: true, subtree: true });
    signal.addEventListener('abort', () => {
      observer.disconnect();
      contentObserver.disconnect();
    }, { once: true });
  };

  const findRenderedRoots = () => {
    if (activeRoot && !activeRoot.isConnected) {
      activeCleanup();
      activeRoot = null;
      activeCleanup = () => {};
    }
    const roots = Array.from(document.querySelectorAll('.landing-page'));
    const outsideTemplate = roots.filter((root) => !root.closest('x-dc'));
    const candidates = outsideTemplate.length ? outsideTemplate : roots.filter((root) => {
      if (!root.isConnected || !root.getClientRects().length) return false;
      return !root.textContent.includes('{{');
    });
    const visibleCandidate = [...candidates].reverse().find((root) => {
      const style = window.getComputedStyle(root);
      return root.isConnected && root.getClientRects().length && style.display !== 'none' && style.visibility !== 'hidden';
    });
    if (visibleCandidate) initRoot(visibleCandidate);
  };

  let findFrame = 0;
  const scheduleFind = () => {
    window.cancelAnimationFrame(findFrame);
    findFrame = window.requestAnimationFrame(findRenderedRoots);
  };

  const pageObserver = new MutationObserver(scheduleFind);
  pageObserver.observe(document.documentElement, { childList: true, subtree: true });

  let discoveryAttempts = 0;
  const discoveryTimer = window.setInterval(() => {
    discoveryAttempts += 1;
    findRenderedRoots();
    if (activeRoot || discoveryAttempts >= 24) window.clearInterval(discoveryTimer);
  }, 150);

  findRenderedRoots();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleFind, { once: true });
  } else {
    scheduleFind();
  }
  window.addEventListener('load', scheduleFind, { once: true });
  window.setTimeout(findRenderedRoots, 250);
  window.setTimeout(findRenderedRoots, 1000);
  window.setTimeout(completePageLoader, 3200);
})();
