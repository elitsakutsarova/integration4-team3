/** Pop browser history when possible; avoids navigate(returnTo) pushing duplicate entries. */
export function goBack(navigate, fallback = '/') {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    navigate(-1);
    return;
  }
  navigate(fallback);
}
