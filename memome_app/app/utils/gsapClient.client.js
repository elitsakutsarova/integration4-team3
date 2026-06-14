/** Client-only GSAP loader. */

let gsapLib = null;
let pending = null;

export function loadGsap() {
  if (gsapLib) return Promise.resolve(gsapLib);
  if (!pending) {
    pending = import('gsap').then((mod) => {
      gsapLib = mod.default;
      return gsapLib;
    });
  }
  return pending;
}

export function getGsap() {
  return gsapLib;
}
