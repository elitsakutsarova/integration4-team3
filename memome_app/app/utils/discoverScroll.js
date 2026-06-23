export function scrollDiscoverToTop() {
  window.scrollTo(0, 0);
  document.querySelector('.discover-desktop-panel-body')?.scrollTo({ top: 0, left: 0 });
  document.querySelector('.discover-detail-scroll')?.scrollTo({ top: 0, left: 0 });
  document.querySelector('.discover-page')?.scrollTo({ top: 0, left: 0 });
  document.querySelector('.discover-list-page')?.scrollTo({ top: 0, left: 0 });
  document.querySelector('.memo-archive-page')?.scrollTo({ top: 0, left: 0 });
}
