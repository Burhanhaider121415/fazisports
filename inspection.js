(() => {
  const dialog = document.querySelector('.product-inspection');
  const cleanImage = dialog?.querySelector('[data-inspection-clean]');
  const modelImage = dialog?.querySelector('[data-inspection-model]');
  const name = dialog?.querySelector('#inspection-name');
  const description = dialog?.querySelector('#inspection-description');
  const cta = dialog?.querySelector('[data-inspection-cta]');
  const close = dialog?.querySelector('.product-inspection__close');
  if (!dialog || !cleanImage || !modelImage || !name || !description || !cta || !close) return;

  const buildInquiryUrl = product => {
    const message = [
      `Hi FAZI SPORTS, I’m interested in ${product.name} for a wholesale order.`,
      'Quantity:',
      '___',
      'Required sizes:',
      '___',
      'Destination:',
      '___',
      'I’d like to discuss the order details.'
    ].join('\n');
    return `https://wa.me/923144724407?text=${encodeURIComponent(message)}`;
  };

  const openInspection = event => {
    const product = event.detail;
    if (!product || !product.reference || !product.name || !product.cleanImage || !product.modelImage || !product.description) return;

    cleanImage.srcset = [640, 1122].map(width => `/assets/optimized/${product.reference}-clean-${width}.webp ${width}w`).join(', ');
    cleanImage.sizes = '(max-width: 700px) 100vw, (max-width: 1080px) 48vw, 38vw';
    cleanImage.src = `/assets/optimized/${product.reference}-clean-1122.webp`;
    cleanImage.alt = product.cleanAlt;
    cleanImage.loading = 'eager';
    cleanImage.fetchPriority = 'high';
    modelImage.srcset = [640, 1122].map(width => `/assets/optimized/${product.reference}-model-${width}.webp ${width}w`).join(', ');
    modelImage.sizes = cleanImage.sizes;
    modelImage.src = `/assets/optimized/${product.reference}-model-1122.webp`;
    modelImage.alt = product.modelAlt;
    modelImage.loading = 'eager';
    modelImage.fetchPriority = 'auto';
    name.textContent = product.name;
    description.textContent = product.description;
    cta.href = buildInquiryUrl(product);

    if (!dialog.open) dialog.showModal();
    close.focus();
  };

  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter(element => !element.hidden && element.getAttribute('aria-hidden') !== 'true');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  document.addEventListener('fazi:product-selected', openInspection);
})();
