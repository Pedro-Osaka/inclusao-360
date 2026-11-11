/** Inclusão 360° 4.0 — divulgação progressiva e navegação clara. */
(() => {
  'use strict';
  const advanced = document.getElementById('advanced-content');
  const openAdvanced = document.getElementById('advanced-toggle');
  const moreDemos = document.getElementById('more-demos-content');
  const moreDemosButton = document.getElementById('more-demos-button');

  function setAdvanced(open) {
    advanced.hidden = !open;
    openAdvanced.setAttribute('aria-expanded', String(open));
    openAdvanced.firstChild.textContent = open ? 'Ocultar recursos extras ' : 'Mostrar mais recursos ';
    openAdvanced.querySelector('span').textContent = open ? '↑' : '↓';
  }
  function setMoreDemos(open) {
    moreDemos.hidden = !open;
    moreDemosButton.setAttribute('aria-expanded', String(open));
    moreDemosButton.firstChild.textContent = open ? 'Ocultar exemplos extras ' : 'Ver mais 2 exemplos: legendas e teclado ';
    moreDemosButton.querySelector('span').textContent = open ? '−' : '＋';
  }
  openAdvanced.addEventListener('click', () => setAdvanced(advanced.hidden));
  moreDemosButton.addEventListener('click', () => setMoreDemos(moreDemos.hidden));

  function revealAnchor(hash) {
    if (!hash || !hash.startsWith('#')) return;
    let target;
    try { target = document.getElementById(decodeURIComponent(hash.slice(1))); } catch { return; }
    if (!target) return;
    if (advanced.contains(target) || target === advanced) setAdvanced(true);
    if (moreDemos.contains(target)) setMoreDemos(true);
  }
  document.addEventListener('click', event => {
    const a = event.target.closest('a[href^="#"]');
    if (a) revealAnchor(a.getAttribute('href'));
  }, true);
  window.addEventListener('hashchange', () => revealAnchor(location.hash));
  revealAnchor(location.hash);
  // The footer has the same access action, so don't let the floating one
  // overlap footer text or links.
  const floatingAccess = document.querySelector('.floating-access');
  const footer = document.querySelector('.site-footer');
  if (floatingAccess && footer && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      floatingAccess.hidden = entries[0].isIntersecting;
    }, { threshold: 0.01 }).observe(footer);
  }

  // The mobile navigation closes as soon as someone chooses a section.
  const mobileDetails = document.querySelector('.mobile-nav details');
  mobileDetails?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { mobileDetails.open = false; }));
})();
