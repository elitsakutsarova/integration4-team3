export const LOCAL_AUTHOR_TAG = 'Added by a local';

export function isLocalAuthor(pin) {
  return pin?.authorRole === 'local';
}

export function buildMemorySheetTags(pin) {
  const tags = [...(pin?.tags ?? [])];
  if (isLocalAuthor(pin) && !tags.includes(LOCAL_AUTHOR_TAG)) {
    tags.push(LOCAL_AUTHOR_TAG);
  }
  return tags;
}
