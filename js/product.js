/**
 * ST WATCHES - Product Detail Page Logic
 * Gallery, Quantity Stepper, Stock Indicators, Add to Cart, Buy Now, WhatsApp Inquiry, Related Products
 */

document.addEventListener('DOMContentLoaded', () => {
  initProductPage();
});

let currentProduct = null;
let currentQuantity = 1;
let selectedColor = null;

function initProductPage() {
  const urlParams = new URLSearchParams(window.location.search);
  let productId = urlParams.get('id');

  const products = typeof getAllProducts === 'function' ? getAllProducts() : [];
  if (!products.length) return;

  if (!productId || !getProductById(productId)) {
    productId = products[0].id; // Fallback to first watch
  }

  currentProduct = getProductById(productId);
  renderProductDetails(currentProduct);
  renderRelatedProducts(currentProduct);
}

function renderProductDetails(product) {
  // Update document title for SEO
  document.title = `${product.name} | ST Watches Pakistan`;

  // Initialize selected color (default to first color variant or null)
  if (product.colors && product.colors.length > 0) {
    selectedColor = product.colors[0];
  } else {
    selectedColor = null;
  }

  // Breadcrumbs
  const breadcrumbName = document.getElementById('pdp-breadcrumb-name');
  const breadcrumbCat = document.getElementById('pdp-breadcrumb-cat');
  if (breadcrumbName) breadcrumbName.textContent = product.name;
  if (breadcrumbCat) {
    breadcrumbCat.textContent = product.category;
    breadcrumbCat.href = `shop.html?category=${encodeURIComponent(product.category)}`;
  }

  // Gallery
  const mainImg = document.getElementById('pdp-main-img');
  const thumbsContainer = document.getElementById('pdp-gallery-thumbs');
  if (mainImg) {
    mainImg.src = (selectedColor && selectedColor.image) ? selectedColor.image : product.image;
    mainImg.alt = `${product.name} - Luxury Watch Pakistan`;
  }

  if (thumbsContainer && product.gallery && product.gallery.length > 0) {
    thumbsContainer.innerHTML = product.gallery.map((img, idx) => `
      <button class="pdp-thumb-btn ${idx === 0 ? 'active' : ''}" onclick="switchPdpImage('${img}', this)">
        <img src="${img}" alt="${product.name} view ${idx + 1}" />
      </button>
    `).join('');
  }

  // Color Variants Selector
  renderColorSwatches(product);

  // Badges & Category
  const catEl = document.getElementById('pdp-category');
  if (catEl) catEl.textContent = product.category;

  const badgeEl = document.getElementById('pdp-badge');
  if (badgeEl) {
    if (product.badge) {
      badgeEl.textContent = product.badge;
      badgeEl.className = `card-badge ${product.badge.toLowerCase() === 'sale' ? 'sale' : (product.badge.toLowerCase() === 'new arrival' ? 'new' : '')}`;
      badgeEl.style.display = 'inline-block';
    } else {
      badgeEl.style.display = 'none';
    }
  }

  // Title
  const titleEl = document.getElementById('pdp-title');
  if (titleEl) titleEl.textContent = product.name;

  // Rating
  const ratingEl = document.getElementById('pdp-rating');
  if (ratingEl) {
    ratingEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.25rem; color: #C9A227;">
        ${'★'.repeat(Math.floor(product.rating))}
        <span style="color: #65635C; font-size: 0.8rem; margin-left: 0.5rem;">${product.rating} (${product.reviewsCount} customer reviews)</span>
      </div>
    `;
  }

  // Pricing
  const priceEl = document.getElementById('pdp-price');
  const oldPriceEl = document.getElementById('pdp-old-price');
  const savingsEl = document.getElementById('pdp-savings');

  if (priceEl) priceEl.textContent = formatPKR(product.price);
  if (oldPriceEl) {
    if (product.oldPrice) {
      oldPriceEl.textContent = formatPKR(product.oldPrice);
      oldPriceEl.style.display = 'inline';
      if (savingsEl) {
        const savings = product.oldPrice - product.price;
        savingsEl.textContent = `Save ${formatPKR(savings)}`;
        savingsEl.style.display = 'inline-block';
      }
    } else {
      oldPriceEl.style.display = 'none';
      if (savingsEl) savingsEl.style.display = 'none';
    }
  }

  // Descriptions
  const shortDescEl = document.getElementById('pdp-short-desc');
  if (shortDescEl) shortDescEl.textContent = product.shortDesc;

  const fullDescEl = document.getElementById('pdp-full-desc');
  if (fullDescEl) fullDescEl.textContent = product.description;

  // Features List
  const featuresList = document.getElementById('pdp-features-list');
  if (featuresList && product.features) {
    featuresList.innerHTML = product.features.map(f => `
      <li style="display: flex; align-items: flex-start; gap: 0.6rem; margin-bottom: 0.5rem; font-size: 0.9rem; color: #262523;">
        <span style="color: #C9A227; font-size: 1.1rem; line-height: 1;">✦</span>
        <span>${f}</span>
      </li>
    `).join('');
  }

  // Stock status
  const stockEl = document.getElementById('pdp-stock-status');
  if (stockEl) {
    stockEl.innerHTML = `
      <span style="display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; font-weight: 600; color: #15803D;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background-color: #22C55E;"></span>
        In Stock (${product.stock} units available — ready for dispatch)
      </span>
    `;
  }

  // WhatsApp Single Product Inquiry button
  const waBtn = document.getElementById('pdp-whatsapp-btn');
  if (waBtn) {
    waBtn.onclick = () => {
      const colorText = selectedColor ? ` (Color: ${selectedColor.name})` : '';
      const msg = `Hello ST Watches, I would like to inquire about ordering the *${product.name}*${colorText} (Price: ${formatPKR(product.price)}). Please confirm availability and delivery timeframe to my city.`;
      const url = `https://wa.me/${ST_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
      window.location.href = url;
    };
  }

  // Reset Quantity Counter
  currentQuantity = 1;
  updatePdpQtyDisplay();
}

function renderColorSwatches(product) {
  const container = document.getElementById('pdp-color-selector');
  const swatchesWrap = document.getElementById('pdp-color-swatches');
  const selectedNameEl = document.getElementById('pdp-selected-color-name');

  if (!container || !swatchesWrap) return;

  if (!product.colors || product.colors.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  if (selectedNameEl && selectedColor) {
    selectedNameEl.textContent = selectedColor.name;
  }

  swatchesWrap.innerHTML = product.colors.map(color => {
    const isSelected = selectedColor && selectedColor.id === color.id;
    return `
      <button 
        type="button" 
        class="color-swatch-btn ${isSelected ? 'active' : ''}" 
        data-color-id="${color.id}"
        onclick="selectPdpColor('${color.id}')"
        aria-label="Select color ${color.name}"
      >
        <span class="color-swatch-circle" style="background-color: ${color.hex};"></span>
        <span>${color.name}</span>
      </button>
    `;
  }).join('');
}

function selectPdpColor(colorId) {
  if (!currentProduct || !currentProduct.colors) return;
  const found = currentProduct.colors.find(c => c.id === colorId);
  if (!found) return;

  selectedColor = found;

  // Update Label
  const selectedNameEl = document.getElementById('pdp-selected-color-name');
  if (selectedNameEl) selectedNameEl.textContent = selectedColor.name;

  // Update active state on buttons
  const buttons = document.querySelectorAll('.color-swatch-btn');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-color-id') === colorId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Dynamically change main watch image to match selected color!
  if (selectedColor.image) {
    const mainImg = document.getElementById('pdp-main-img');
    if (mainImg) {
      mainImg.style.opacity = '0.3';
      setTimeout(() => {
        mainImg.src = selectedColor.image;
        mainImg.style.opacity = '1';
      }, 150);
    }
  }

  // Update thumb active state
  const thumbBtns = document.querySelectorAll('.pdp-thumb-btn');
  thumbBtns.forEach(b => {
    const imgInside = b.querySelector('img');
    if (imgInside && imgInside.src.includes(selectedColor.image)) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  showToast(`Selected "${selectedColor.name}" edition`, 'info');
}

function switchPdpImage(src, btnElement) {
  const mainImg = document.getElementById('pdp-main-img');
  if (mainImg) mainImg.src = src;

  const buttons = document.querySelectorAll('.pdp-thumb-btn');
  buttons.forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
}

function incrementPdpQty() {
  if (currentProduct && currentQuantity < currentProduct.stock) {
    currentQuantity++;
    updatePdpQtyDisplay();
  }
}

function decrementPdpQty() {
  if (currentQuantity > 1) {
    currentQuantity--;
    updatePdpQtyDisplay();
  }
}

function updatePdpQtyDisplay() {
  const qtyEl = document.getElementById('pdp-qty-display');
  if (qtyEl) qtyEl.textContent = currentQuantity;
}

function addCurrentProductToCart() {
  if (!currentProduct) return;
  addToCart(currentProduct.id, currentQuantity, true, selectedColor);
}

function buyCurrentProductNow() {
  if (!currentProduct) return;
  addToCart(currentProduct.id, currentQuantity, false, selectedColor);
  window.location.href = 'checkout.html';
}

function renderRelatedProducts(product) {
  const container = document.getElementById('pdp-related-grid');
  if (!container) return;

  const products = typeof getAllProducts === 'function' ? getAllProducts() : [];
  const related = products
    .filter(p => p.id !== product.id)
    .sort((a, b) => (a.category === product.category ? -1 : 1))
    .slice(0, 4);

  container.innerHTML = related.map(p => renderProductCard(p)).join('');
  window.dispatchEvent(new CustomEvent('st:productsRendered'));
}
