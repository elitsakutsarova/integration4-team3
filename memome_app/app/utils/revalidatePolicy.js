import { paths } from './appPaths';

function normalizeFormActionPath(formAction) {
  if (!formAction || typeof formAction !== 'string') return null;
  try {
    return formAction.startsWith('http')
      ? new URL(formAction).pathname
      : formAction.split('?')[0];
  } catch {
    return formAction.split('?')[0];
  }
}

const SKIP_REVALIDATE_PATHS = new Set([paths.apiMemos]);

/** Memo create already updates map + profile context — skip heavy loader refetch. */
export function shouldRevalidateForFormAction(formAction) {
  const path = normalizeFormActionPath(formAction);
  if (path && SKIP_REVALIDATE_PATHS.has(path)) return false;
  return Boolean(formAction);
}
