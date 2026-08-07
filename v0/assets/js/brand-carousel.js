(() => {
  const SPEED_PX_PER_SECOND = 56;

  function initBrandCarousel() {
    const root = document.querySelector('[data-js="brand-rail"]');
    if (!root) return;

    const track = root.querySelector('[data-js="brand-rail-track"]');
    const group = root.querySelector('[data-js="brand-rail-group"]');
    const duplicate = track?.querySelector('.c-brand-rail__group[aria-hidden="true"]');

    if (!track || !group || !duplicate || typeof track.animate !== 'function') return;

    let animation = null;
    let rebuildQueued = false;

    function readProgress() {
      if (!animation) return 0;
      const duration = Number(animation.effect?.getTiming().duration);
      const currentTime = Number(animation.currentTime);
      if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(currentTime)) return 0;
      return (currentTime % duration) / duration;
    }

    function buildAnimation() {
      const distance = group.getBoundingClientRect().width;
      if (distance <= 0) return;

      const progress = readProgress();
      animation?.cancel();
      animation = track.animate(
        [
          { transform: 'translate3d(0, 0, 0)' },
          { transform: `translate3d(${-distance}px, 0, 0)` },
        ],
        {
          duration: (distance / SPEED_PX_PER_SECOND) * 1000,
          easing: 'linear',
          iterations: Infinity,
        },
      );
      animation.currentTime = progress * Number(animation.effect.getTiming().duration);
      root.dataset.paused = 'false';
    }

    function scheduleAnimationBuild() {
      if (rebuildQueued) return;
      rebuildQueued = true;
      queueMicrotask(() => {
        rebuildQueued = false;
        buildAnimation();
      });
    }

    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(scheduleAnimationBuild) : null;
    resizeObserver?.observe(group);
    window.addEventListener('resize', scheduleAnimationBuild);

    root.dataset.railReady = 'true';
    root.dataset.railEngine = 'web-animations-api';
    root.dataset.railSpeed = String(SPEED_PX_PER_SECOND);
    scheduleAnimationBuild();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBrandCarousel, { once: true });
  } else {
    initBrandCarousel();
  }
})();
