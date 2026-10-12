(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const constrained = connection?.saveData || ['slow-2g', '2g'].includes(connection?.effectiveType);
  let stopMotion = () => {};
  const startMotion = () => {
  const canAnimate = !reducedMotion.matches && !constrained && 'IntersectionObserver' in window;
  if (!canAnimate) return;

  const targets = [
    '.collection-intro h2',
    '.product-card-item:nth-child(-n + 3) .product-card__media',
    '.wholesale-section__intro h2',
    '.wholesale-capability',
    '.lookbook-section h2',
    '.lookbook-video',
    '.inquiry-process h2',
    '.inquiry-step',
    '.final-contact__copy h2'
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

  let productObserver;
  const productGrid = document.querySelector('#product-grid');
  if (productGrid) {
    productObserver = new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) observeReveals(node);
      }
    });
    productObserver.observe(productGrid, { childList: true });
  }

  const hero = document.querySelector('.hero');
  const heroImage = hero?.querySelector('.hero-image--desktop');
  const forwardCut = hero?.querySelector('.forward-cut');
  let frame = 0;
  const updateRecession = () => {
    frame = 0;
    if (!root.classList.contains('motion-ready')) return;
    if (!hero || !heroImage) return;
    const bounds = hero.getBoundingClientRect();
    if (window.innerWidth <= 1080) {
      heroImage.style.transform = '';
      if (forwardCut) {
        forwardCut.style.transform = '';
        if (bounds.bottom <= window.innerHeight * 0.98) forwardCut.classList.add('is-cut-revealed');
      }
      return;
    }
    const range = Math.max(1, bounds.height - window.innerHeight * 0.35);
    const progress = Math.min(1, Math.max(0, -bounds.top / range));
    const scale = 1.028 - progress * 0.024;
    heroImage.style.transform = `translate3d(0, ${progress * 6}px, 0) scale(${scale})`;
    if (forwardCut) {
      const cutProgress = Math.min(1, Math.max(0, (window.innerHeight * 1.02 - bounds.bottom) / (window.innerHeight * 0.32)));
      forwardCut.style.transform = `translate3d(0, ${(1 - cutProgress) * 100}%, 0)`;
    }
  };
  const queueRecession = () => {
    if (!frame) frame = window.requestAnimationFrame(updateRecession);
  };
  window.addEventListener('scroll', queueRecession, { passive: true });
  window.addEventListener('resize', queueRecession, { passive: true });
  updateRecession();

  stopMotion = () => {
    root.classList.remove('motion-ready');
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    for (const node of document.querySelectorAll('[data-motion-reveal]')) node.classList.add('is-revealed');
    revealObserver.disconnect();
    productObserver?.disconnect();
    window.removeEventListener('scroll', queueRecession);
    window.removeEventListener('resize', queueRecession);
    if (heroImage) heroImage.style.transform = '';
    if (forwardCut) forwardCut.style.transform = '';
  };
  };
  startMotion();
  reducedMotion.addEventListener('change', event => {
    if (event.matches) stopMotion(); else startMotion();
  });
})();
