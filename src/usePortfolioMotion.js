import { useEffect } from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Layout offsets stay stable while CSS translates the visual layers.
function layoutTop(element) {
  let top = 0;
  for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
  return top;
}

export default function usePortfolioMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const layers = [...document.querySelectorAll('[data-parallax]')].map(element => ({
      element,
      anchor: element.closest('[data-parallax-anchor]') || element,
      speed: Number(element.dataset.parallax) || 0,
      max: Number(element.dataset.parallaxMax) || 45,
      center: 0,
      height: 0,
    }));
    const ticker = document.querySelector('[data-drift]');
    const stars = [...document.querySelectorAll('[data-spin]')];
    const revealElements = [...document.querySelectorAll('[data-reveal]')];
    let frame = 0;
    let measureFrame = 0;
    let scroll = window.scrollY;
    let target = scroll;
    let viewport = window.innerHeight;
    let scrollable = 1;
    let tickerTop = 0;
    let tickerHeight = 0;
    let previousTime = 0;
    let disposed = false;

    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(({ target: element, isIntersecting }) => {
        if (!isIntersecting) return;
        element.classList.add('is-revealed');
        revealObserver.unobserve(element);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -24px 0px' });

    function revealVisible() {
      revealElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        if (reduced.matches || (rect.top < viewport && rect.bottom > 0)) {
          element.classList.add('is-revealed');
        } else revealObserver.observe(element);
      });
    }

    function render(time) {
      frame = 0;
      const dt = previousTime ? clamp(time - previousTime, 1, 48) : 16.67;
      previousTime = time;
      const blend = 1 - Math.exp(-dt / 90);
      scroll = reduced.matches ? target : scroll + (target - scroll) * blend;
      root.style.setProperty('--scroll-progress', String(clamp(target / scrollable, 0, 1)));
      const mobile = window.innerWidth <= 760;
      const collapse = reduced.matches ? Number(target > 120) : clamp(scroll / (mobile ? 180 : 240), 0, 1);
      root.style.setProperty('--header-collapse', collapse.toFixed(4));
      const strength = reduced.matches ? 0 : mobile ? 0.32 : 1;
      layers.forEach(layer => {
        const distance = (scroll + viewport / 2 - layer.center) * layer.speed;
        layer.element.style.setProperty('--parallax-y', `${(clamp(distance, -layer.max, layer.max) * strength).toFixed(2)}px`);
      });
      stars.forEach(star => star.style.setProperty('--spin-angle', `${reduced.matches ? 0 : (scroll * 0.095 % 360).toFixed(2)}deg`));
      if (ticker) {
        const progress = clamp((scroll + viewport - tickerTop) / (viewport + tickerHeight), 0, 1);
        ticker.style.setProperty('--drift-x', `${reduced.matches || mobile ? 0 : -clamp((scroll + viewport - tickerTop) * 0.16, 0, 360)}px`);
        ticker.style.setProperty('--ticker-shift', `${reduced.matches ? 0 : ((progress - 0.5) * 20).toFixed(2)}px`);
      }
      if (!reduced.matches && Math.abs(target - scroll) > 0.15) frame = requestAnimationFrame(render);
      else previousTime = 0;
    }

    function schedule() {
      if (!frame && !disposed) frame = requestAnimationFrame(render);
    }

    function measure() {
      measureFrame = 0;
      viewport = window.innerHeight;
      scrollable = Math.max(1, root.scrollHeight - viewport);
      layers.forEach(layer => {
        layer.height = layer.anchor.offsetHeight;
        layer.center = layoutTop(layer.anchor) + layer.height / 2;
      });
      if (ticker) {
        tickerTop = layoutTop(ticker.parentElement);
        tickerHeight = ticker.parentElement.offsetHeight;
      }
      target = window.scrollY;
      schedule();
    }

    function queueMeasure() {
      if (!measureFrame && !disposed) measureFrame = requestAnimationFrame(measure);
    }

    function onScroll() { target = window.scrollY; schedule(); }
    function onPreference() {
      root.classList.toggle('motion-reduced', reduced.matches);
      scroll = target = window.scrollY;
      revealVisible();
      schedule();
    }

    // Pointer motion is limited to fine pointers; touch scrolling stays native.
    const pointerCleanups = [];
    document.querySelectorAll('[data-pointer], [data-magnetic], [data-tilt]').forEach(element => {
      let pointerFrame = 0;
      let position = null;
      const magnetic = element.hasAttribute('data-magnetic');
      const tilt = element.hasAttribute('data-tilt');
      const update = () => {
        pointerFrame = 0;
        if (!position) return;
        const { x, y, width, height } = position;
        element.style.setProperty('--pointer-x', `${clamp(x, 58, Math.max(58, width - 58))}px`);
        element.style.setProperty('--pointer-y', `${clamp(y, 58, Math.max(58, height - 58))}px`);
        if (magnetic) {
          element.style.setProperty('--magnetic-x', `${((x / width - 0.5) * 12).toFixed(2)}px`);
          element.style.setProperty('--magnetic-y', `${((y / height - 0.5) * 10).toFixed(2)}px`);
        }
        if (tilt) {
          element.style.setProperty('--tilt-x', `${((0.5 - y / height) * 9).toFixed(2)}deg`);
          element.style.setProperty('--tilt-y', `${((x / width - 0.5) * 11).toFixed(2)}deg`);
        }
      };
      const move = event => {
        if (reduced.matches || !finePointer.matches || event.pointerType === 'touch') return;
        const rect = element.getBoundingClientRect();
        position = { x: event.clientX - rect.left, y: event.clientY - rect.top, width: rect.width, height: rect.height };
        element.classList.add('is-pointer-inside');
        if (!pointerFrame) pointerFrame = requestAnimationFrame(update);
      };
      const reset = () => {
        cancelAnimationFrame(pointerFrame);
        pointerFrame = 0;
        position = null;
        element.classList.remove('is-pointer-inside');
        ['--magnetic-x', '--magnetic-y', '--tilt-x', '--tilt-y'].forEach(name => element.style.removeProperty(name));
      };
      element.addEventListener('pointermove', move, { passive: true });
      element.addEventListener('pointerleave', reset);
      element.addEventListener('pointercancel', reset);
      reduced.addEventListener('change', reset);
      finePointer.addEventListener('change', reset);
      pointerCleanups.push(() => {
        reset();
        element.removeEventListener('pointermove', move);
        element.removeEventListener('pointerleave', reset);
        element.removeEventListener('pointercancel', reset);
        reduced.removeEventListener('change', reset);
        finePointer.removeEventListener('change', reset);
      });
    });

    measure();
    revealVisible();
    root.classList.add('motion-ready');
    root.classList.toggle('motion-reduced', reduced.matches);
    const resizeObserver = new ResizeObserver(queueMeasure);
    resizeObserver.observe(document.body);
    document.fonts.ready.then(() => { if (!disposed) queueMeasure(); });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', queueMeasure, { passive: true });
    reduced.addEventListener('change', onPreference);

    // Focused links must never remain hidden in an unrevealed container.
    function onFocus(event) {
      let node = event.target;
      while (node && node !== document.body) {
        if (node.hasAttribute?.('data-reveal')) node.classList.add('is-revealed');
        node = node.parentElement;
      }
    }
    document.addEventListener('focusin', onFocus);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(measureFrame);
      revealObserver.disconnect();
      resizeObserver.disconnect();
      pointerCleanups.forEach(cleanup => cleanup());
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', queueMeasure);
      reduced.removeEventListener('change', onPreference);
      document.removeEventListener('focusin', onFocus);
      root.classList.remove('motion-ready', 'motion-reduced');
      root.style.removeProperty('--scroll-progress');
      root.style.removeProperty('--header-collapse');
      layers.forEach(({ element }) => element.style.removeProperty('--parallax-y'));
      stars.forEach(star => star.style.removeProperty('--spin-angle'));
      ticker?.style.removeProperty('--drift-x');
      ticker?.style.removeProperty('--ticker-shift');
    };
  }, []);
}
