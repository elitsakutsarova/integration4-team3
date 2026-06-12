/** Root revalidate callback — registered from App, used by auth actions. */
let revalidateFn = null;

export function registerAppRevalidate(revalidate) {
  revalidateFn = revalidate;
}

export function revalidateApp() {
  revalidateFn?.();
}
