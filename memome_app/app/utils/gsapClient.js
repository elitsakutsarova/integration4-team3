/** Client-only GSAP loader — avoids static `import 'gsap'` (breaks Vercel SSR). */

const noopTween = { kill: () => {} };

const gsapStub = {
  set: () => {},
  to: (_target, config) => {
    config?.onComplete?.();
    return noopTween;
  },
  fromTo: (_target, _from, config) => {
    config?.onComplete?.();
    return noopTween;
  },
};

let gsapInstance = null;
let gsapLoadPromise = null;

function loadGsap() {
  if (typeof window === 'undefined') {
    return Promise.resolve(gsapStub);
  }

  if (gsapInstance) {
    return Promise.resolve(gsapInstance);
  }

  if (!gsapLoadPromise) {
    gsapLoadPromise = import('gsap').then(mod => {
      gsapInstance = mod.default ?? mod;
      return gsapInstance;
    });
  }

  return gsapLoadPromise;
}

/** Preload GSAP after mount so drag handlers can use sync access. */
export function preloadGsap() {
  void loadGsap();
}

/** Sync access in pointer handlers (after preload). Safe noop on SSR. */
export function getGsapSync() {
  return gsapInstance ?? gsapStub;
}

/** Async access when you can await before animating. */
export function getGsap() {
  return loadGsap();
}
