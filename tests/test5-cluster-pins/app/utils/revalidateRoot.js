/** Lets route clientLoaders refresh root loader data (e.g. after collecting a sticker). */
let revalidateFn = null;
let pendingRevalidation = false;

export function registerRootRevalidator(revalidate) {
  revalidateFn = revalidate;
  if (pendingRevalidation) {
    pendingRevalidation = false;
    revalidateFn();
  }
}

export function revalidateRoot() {
  if (revalidateFn) {
    revalidateFn();
    return;
  }
  pendingRevalidation = true;
}
