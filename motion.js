(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const constrained = connection?.saveData || ['slow-2g', '2g'].includes(connection?.effectiveType);
  const canAnimate = !reducedMotion.matches && !constrained && 'IntersectionObserver' in window;
  if (!canAnimate) return;

  const targets = [
    '.collection-intro',
    '.product-card-item:nth-child(-n + 3) .product-card__media',
    '.wholesale-section__intro',
    '.wholesale-capability',
    '.lookbook-section h2',
    '.lookbook-video',
    '.inquiry-process h2',
    '.inquiry-process__intro',
    '.inquiry-step',
    '.final-contact__copy',
    '.final-contact__actions'
  ];
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-revealed');
      revealObserver.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

  const observeReveals = scope => {
    for (const selector of targets) {
      const nodes = scope.matches?.(selector) ? [scope] : [...(scope.querySelectorAll?.(selector) ?? [])];
      for (const node of nodes) {
        if (node.dataset.motionReveal === 'observed') continue;
        node.dataset.motionReveal = 'observed';
        revealObserver.observe(node);
      }
    }
  };

  root.classList.add('motion-ready');
  observeReveals(document);

  const productGrid = document.querySelector('#product-grid');
  if (productGrid) {
    new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) observeReveals(node);
      }
    }).observe(productGrid, { childList: true });
  }

  const hero = document.querySelector('.hero');
  const heroImage = hero?.querySelector('.hero-image--desktop');
  let frame = 0;
  const updateRecession = () => {
    frame = 0;
    if (!hero || !heroImage || window.innerWidth <= 1080) return;
    const bounds = hero.getBoundingClientRect();
    const range = Math.max(1, bounds.height - window.innerHeight * 0.35);
    const progress = Math.min(1, Math.max(0, -bounds.top / range));
    const scale = 1.016 - progress * 0.012;
    heroImage.style.transform = `translate3d(0, ${progress * 4}px, 0) scale(${scale})`;
  };
  const queueRecession = () => {
    if (!frame) frame = window.requestAnimationFrame(updateRecession);
  };
  window.addEventListener('scroll', queueRecession, { passive: true });
  window.addEventListener('resize', queueRecession, { passive: true });
  updateRecession();

  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    root.classList.remove('motion-ready');
    for (const node of document.querySelectorAll('[data-motion-reveal]')) node.classList.add('is-revealed');
    revealObserver.disconnect();
    window.removeEventListener('scroll', queueRecession);
    window.removeEventListener('resize', queueRecession);
    if (heroImage) heroImage.style.transform = '';
  });
})();
