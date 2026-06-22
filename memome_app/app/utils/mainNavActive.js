export function isHomeNavActive(_match, { pathname }) {
  return !pathname.startsWith('/profile')
    && !pathname.startsWith('/stickers')
    && !pathname.startsWith('/journals')
    && !pathname.startsWith('/diary')
    && !pathname.startsWith('/discover')
    && !pathname.startsWith('/location');
}

export function isDiscoverNavActive(_match, { pathname }) {
  return pathname.startsWith('/discover') || pathname.startsWith('/location');
}

export function isJournalNavActive(_match, { pathname }) {
  return pathname.startsWith('/journals') || pathname.startsWith('/diary');
}

export function isProfileNavActive(_match, { pathname }) {
  return pathname.startsWith('/profile') || pathname.startsWith('/stickers');
}
