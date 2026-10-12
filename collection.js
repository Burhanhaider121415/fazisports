(() => {
  const grid = document.querySelector('#product-grid');
  if (!grid) return;
  const hoverMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
  const sourceSet = (product, view) => [320, 640, 1122].map(width => `/assets/optimized/${product.reference}-${view}-${width}.webp ${width}w`).join(', ');
  const loadModel = (image, product) => {
    if (image.hasAttribute('src')) return;
    image.srcset = sourceSet(product, 'model');
    image.src = `/assets/optimized/${product.reference}-model-640.webp`;
  };
  const createImage = (product, view, index) => {
    const image = document.createElement('img');
    image.className = `product-card__image product-card__image--${view}`;
    image.alt = product[`${view}Alt`];
    image.width = 1122; image.height = 1402;
    image.loading = index < 4 ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.sizes = '(max-width: 700px) calc((100vw - 56px) / 2), (max-width: 1080px) 44vw, 30vw';
    image.dataset.productView = view;
    if (view === 'clean') {
      image.srcset = sourceSet(product, view);
      image.src = `/assets/optimized/${product.reference}-clean-640.webp`;
    } else image.setAttribute('aria-hidden', 'true');
    return image;
  };
  const renderProduct = (product, index) => {
    const item = document.createElement('li'); item.className = 'product-card-item';
    const card = document.createElement('div'); card.className = 'product-card';
    card.dataset.productReference = product.reference;
    card.dataset.cleanImage = product.cleanImage; card.dataset.modelImage = product.modelImage;
    const media = document.createElement('button'); media.type = 'button'; media.className = 'product-card__media';
    media.setAttribute('aria-label', `Show model wearing ${product.name}`); media.setAttribute('aria-pressed', 'false');
    const clean = createImage(product, 'clean', index), model = createImage(product, 'model', index);
    media.append(clean, model);
    const hint = document.createElement('span'); hint.className = 'product-card__preview-label'; hint.textContent = 'Tap image for model view';
    const inspect = document.createElement('button'); inspect.type = 'button'; inspect.className = 'product-card__inspect'; inspect.dataset.productReference = product.reference;
    inspect.setAttribute('aria-label', `Inspect ${product.name}`);
    const name = document.createElement('span'); name.className = 'product-card__name'; name.textContent = product.name;
    const label = document.createElement('span'); label.className = 'product-card__inspect-label'; label.textContent = 'Inspect product';
    inspect.append(name, label); card.append(media, hint, inspect); item.append(card);
    let showing = false, pending = false;
    const commitView = () => {
      if (!pending) return;
      pending = false; showing = true;
      card.classList.add('is-model-visible'); media.setAttribute('aria-pressed','true');
      media.setAttribute('aria-label', `Show clean product image of ${product.name}`);
      hint.textContent = 'Tap image for product view'; model.setAttribute('aria-hidden','false'); clean.setAttribute('aria-hidden','true');
    };
    model.addEventListener('load', () => { card.classList.add('has-model-ready'); commitView(); });
    model.addEventListener('error', () => { pending = false; hint.textContent = 'Model unavailable. Open inspection to retry.'; });
    media.addEventListener('pointerenter', () => { if (hoverMedia.matches) { loadModel(model, product); model.loading = 'eager'; } });
    media.addEventListener('click', () => {
      if (showing || pending) {
        pending = false; showing = false; card.classList.remove('is-model-visible'); media.setAttribute('aria-pressed','false');
        media.setAttribute('aria-label',`Show model wearing ${product.name}`); hint.textContent = 'Tap image for model view';
        model.setAttribute('aria-hidden','true'); clean.setAttribute('aria-hidden','false'); return;
      }
      pending = true; hint.textContent = 'Loading model…'; model.loading = 'eager'; loadModel(model, product);
      if (model.complete && model.naturalWidth) commitView();
    });
    inspect.addEventListener('click', () => {
      window.faziSelectedProduct = product;
      document.dispatchEvent(new CustomEvent('fazi:product-selected', { detail: product }));
    });
    // Prepare nearby touch previews without downloading the entire model catalog on arrival.
    card.prepareModel = () => loadModel(model, product);
    return item;
  };
  fetch('/assets/products/products.json', { headers: { Accept: 'application/json' } })
    .then(response => { if (!response.ok) throw new Error(`Product data returned HTTP ${response.status}`); return response.json(); })
    .then(products => {
      if (!Array.isArray(products) || products.length !== 10) throw new Error('The approved collection must contain exactly 10 products.');
      window.FAZI_PRODUCTS = Object.freeze(products.map(product => Object.freeze({ ...product })));
      grid.replaceChildren(...window.FAZI_PRODUCTS.map(renderProduct));
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
          for (const entry of entries) if (entry.isIntersecting) { entry.target.prepareModel(); observer.unobserve(entry.target); }
        }, { rootMargin: '200px' });
        grid.querySelectorAll('.product-card').forEach(card => observer.observe(card));
      }
    }).catch(error => console.error('FAZI SPORTS collection failed to load.', error));
})();
