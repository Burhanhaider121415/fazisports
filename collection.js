(() => {
  const grid = document.querySelector('#product-grid');
  if (!grid) return;

  const imageUrl = path => encodeURI(path);

  const createImage = (product, view) => {
    const isClean = view === 'clean';
    const image = document.createElement('img');
    image.className = `product-card__image product-card__image--${view}`;
    image.alt = product[`${view}Alt`];
    image.width = 1122;
    image.height = 1402;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.dataset.productView = view;
    if (isClean) {
      image.src = imageUrl(product.cleanImage);
      image.fetchPriority = 'low';
    } else {
      image.dataset.productSrc = imageUrl(product.modelImage);
      image.setAttribute('aria-hidden', 'true');
    }
    return image;
  };

  const renderProduct = product => {
    const item = document.createElement('li');
    item.className = 'product-card-item';
    const button = document.createElement('button');
    button.className = 'product-card';
    button.type = 'button';
    button.setAttribute('aria-label', `Select ${product.reference} ${product.name} for inspection`);
    button.setAttribute('aria-pressed', 'false');
    button.dataset.productReference = product.reference;
    button.dataset.cleanImage = product.cleanImage;
    button.dataset.modelImage = product.modelImage;

    const media = document.createElement('span');
    media.className = 'product-card__media';
    media.append(createImage(product, 'clean'), createImage(product, 'model'));

    const name = document.createElement('span');
    name.className = 'product-card__name';
    name.textContent = product.name;

    const reference = document.createElement('span');
    reference.className = 'product-card__reference';
    reference.textContent = product.reference;

    button.append(media, name, reference);
    item.append(button);
    return item;
  };

  fetch('/assets/products/products.json', { headers: { Accept: 'application/json' } })
    .then(response => {
      if (!response.ok) throw new Error(`Product data returned HTTP ${response.status}`);
      return response.json();
    })
    .then(products => {
      if (!Array.isArray(products) || products.length !== 10) throw new Error('The approved collection must contain exactly 10 products.');
      window.FAZI_PRODUCTS = Object.freeze(products.map(product => Object.freeze({ ...product })));
      grid.replaceChildren(...window.FAZI_PRODUCTS.map(renderProduct));

      const hoverMedia = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 701px)');
      const syncModelSources = () => {
        for (const image of grid.querySelectorAll('.product-card__image--model')) {
          if (hoverMedia.matches && !image.hasAttribute('src')) image.src = image.dataset.productSrc;
          if (!hoverMedia.matches && image.hasAttribute('src')) image.removeAttribute('src');
        }
      };
      syncModelSources();
      hoverMedia.addEventListener('change', syncModelSources);

      grid.addEventListener('click', event => {
        const button = event.target.closest('button[data-product-reference]');
        if (!button) return;
        const product = window.FAZI_PRODUCTS.find(item => item.reference === button.dataset.productReference);
        if (!product) return;
        for (const candidate of grid.querySelectorAll('button[data-product-reference]')) {
          candidate.setAttribute('aria-pressed', String(candidate === button));
        }
        window.faziSelectedProduct = Object.freeze({ ...product });
        document.dispatchEvent(new CustomEvent('fazi:product-selected', { detail: window.faziSelectedProduct }));
      });
    })
    .catch(error => {
      console.error('FAZI SPORTS collection failed to load.', error);
    });
})();
