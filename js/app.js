/**
 * ST WATCHES - Core Global Application Logic
 * Manages Cart State, LocalStorage, Modals, Navigation, Toasts & Global Interactions
 */

// Cart LocalStorage Key
const CART_STORAGE_KEY = 'st_watches_cart';
const WISHLIST_STORAGE_KEY = 'st_watches_wishlist';

// Global Cart State Helpers
function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading cart from localStorage', e);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
  } catch (e) {
    console.error('Error saving cart to localStorage', e);
  }
}

function addToCart(productId, quantity = 1, showFeedback = true, selectedColor = null) {
  const product = typeof getProductById === 'function' ? getProductById(productId) : null;
  if (!product) {
    showToast('Product not found.', 'error');
    return;
  }

  // Resolve color
  let activeColor = selectedColor;
  if (!activeColor && product.colors && product.colors.length > 0) {
    activeColor = product.colors[0];
  }

  const colorName = activeColor ? activeColor.name : null;
  const colorHex = activeColor ? activeColor.hex : null;
  const colorId = activeColor ? activeColor.id : null;
  const itemImage = (activeColor && activeColor.image) ? activeColor.image : product.image;
  const cartItemId = colorId ? `${product.id}_${colorId}` : product.id;

  const cart = getCart();
  const existingIndex = cart.findIndex(item => (item.cartItemId || item.id) === cartItemId);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
    if (cart[existingIndex].quantity > product.stock) {
      cart[existingIndex].quantity = product.stock;
      showToast(`Maximum stock limit (${product.stock}) reached for this watch.`, 'info');
    }
  } else {
    cart.push({
      cartItemId: cartItemId,
      id: product.id,
      name: product.name,
      color: colorName,
      colorHex: colorHex,
      colorId: colorId,
      price: product.price,
      image: itemImage,
      category: product.category,
      quantity: Math.min(quantity, product.stock)
    });
  }

  saveCart(cart);

  if (showFeedback) {
    const feedbackTitle = colorName ? `"${product.name}" (${colorName})` : `"${product.name}"`;
    showToast(`Added ${feedbackTitle} to your cart.`, 'success');
  }

  // Dispatch custom cart updated event
  window.dispatchEvent(new CustomEvent('st:cartUpdated', { detail: { cart } }));
}

function removeFromCart(cartItemId) {
  let cart = getCart();
  const item = cart.find(i => (i.cartItemId || i.id) === cartItemId);
  cart = cart.filter(i => (i.cartItemId || i.id) !== cartItemId);
  saveCart(cart);
  if (item) {
    const nameStr = item.color ? `${item.name} (${item.color})` : item.name;
    showToast(`Removed "${nameStr}" from cart.`, 'info');
  }
  window.dispatchEvent(new CustomEvent('st:cartUpdated', { detail: { cart } }));
}

function updateCartQuantity(cartItemId, quantity) {
  let cart = getCart();
  const itemIndex = cart.findIndex(i => (i.cartItemId || i.id) === cartItemId);
  if (itemIndex > -1) {
    const productId = cart[itemIndex].id;
    const product = typeof getProductById === 'function' ? getProductById(productId) : null;
    const maxStock = product ? product.stock : 99;

    if (quantity <= 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = Math.min(quantity, maxStock);
    }
    saveCart(cart);
    window.dispatchEvent(new CustomEvent('st:cartUpdated', { detail: { cart } }));
  }
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.quantity || 1), 0);
}

function getCartSubtotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-count-badge');
  const count = getCartCount();
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

// Toast Notifications System
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconSvg = type === 'error'
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A227" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  toast.innerHTML = `
    <span>${iconSvg}</span>
    <span style="font-weight: 500;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3200);
}

// Render Uniform Product Card HTML
function renderProductCard(product) {
  const isSale = product.isSale && product.oldPrice;
  const badgeHtml = product.badge
    ? `<span class="card-badge ${product.badge.toLowerCase() === 'sale' ? 'sale' : (product.badge.toLowerCase() === 'new arrival' ? 'new' : '')}">${product.badge}</span>`
    : '';

  const oldPriceHtml = isSale
    ? `<span class="old-price">${formatPKR(product.oldPrice)}</span>`
    : '';

  return `
    <article class="product-card" data-id="${product.id}">
      <div class="card-image-wrap">
        ${badgeHtml}
        <span class="zoom-lens-hint" aria-hidden="true" title="Hover to zoom & inspect watch details">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          <span>Zoom</span>
        </span>
        <a href="product.html?id=${product.id}">
          <img src="${product.image}" alt="${product.name} - Luxury Watch Pakistan" loading="lazy" />
        </a>
        <div class="card-quick-actions">
          <button class="btn-card-quickview" onclick="openQuickView('${product.id}')">Quick View</button>
        </div>
      </div>
      <div class="card-body">
        <span class="card-category">${product.category}</span>
        <h3 class="card-title">
          <a href="product.html?id=${product.id}">${product.name}</a>
        </h3>
        ${product.colors && product.colors.length > 0 ? `
          <div class="card-color-dots" title="${product.colors.length} color variants available">
            ${product.colors.map(c => `
              <span class="card-color-dot" style="background-color: ${c.hex};" title="${c.name}"></span>
            `).join('')}
            <span class="card-color-count">${product.colors.length} Colors</span>
          </div>
        ` : ''}
        <div class="card-price-row">
          <span class="current-price">${formatPKR(product.price)}</span>
          ${oldPriceHtml}
        </div>
        <div class="card-footer-btns">
          <button class="btn btn-dark btn-sm" onclick="addToCart('${product.id}')">
            Add to Cart
          </button>
          <a href="product.html?id=${product.id}" class="btn btn-outline-dark btn-sm">
            Details
          </a>
        </div>
      </div>
    </article>
  `;
}

// Quick View Modal
function setupQuickViewModal() {
  if (document.getElementById('quickview-modal')) return;

  const modalHtml = `
    <div id="quickview-modal" class="modal-overlay" onclick="handleModalOverlayClick(event, 'quickview-modal')">
      <div class="modal-container">
        <button class="modal-close-btn" onclick="closeQuickView()" aria-label="Close modal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div id="quickview-content" style="padding: 2rem;">
          <!-- Dynamically populated -->
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

let qvCurrentQty = 1;
let qvSelectedColor = null;

function openQuickView(productId) {
  const product = typeof getProductById === 'function' ? getProductById(productId) : null;
  if (!product) return;

  setupQuickViewModal();
  const content = document.getElementById('quickview-content');
  const modal = document.getElementById('quickview-modal');

  qvCurrentQty = 1;
  qvSelectedColor = (product.colors && product.colors.length > 0) ? product.colors[0] : null;

  const oldPriceHtml = product.oldPrice
    ? `<span style="text-decoration: line-through; color: #9B9890; margin-left: 0.5rem; font-size: 1rem;">${formatPKR(product.oldPrice)}</span>`
    : '';

  const initialImage = (qvSelectedColor && qvSelectedColor.image) ? qvSelectedColor.image : product.image;

  content.innerHTML = `
    <div class="quickview-grid">
      <div style="background-color: #171717; border-radius: 2px; overflow: hidden;">
        <img id="qv-main-img" src="${initialImage}" alt="${product.name}" style="width: 100%; aspect-ratio: 1/1; object-fit: cover; transition: opacity 0.2s ease;" />
        <div style="display: flex; gap: 0.5rem; padding: 0.75rem; background: #0B0B0B; overflow-x: auto;">
          ${product.gallery.map(img => `
            <img src="${img}" style="width: 60px; height: 60px; object-fit: cover; cursor: pointer; border: 1px solid rgba(255,255,255,0.2);" onclick="document.getElementById('qv-main-img').src='${img}'" />
          `).join('')}
        </div>
      </div>
      <div>
        <span style="font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; color: #C9A227; font-weight: 600;">${product.category}</span>
        <h2 style="font-family: var(--font-serif); font-size: 1.85rem; margin: 0.5rem 0 0.85rem; color: #0B0B0B;">${product.name}</h2>
        <div style="font-size: 1.35rem; font-weight: 700; color: #0B0B0B; margin-bottom: 1rem;">
          ${formatPKR(product.price)} ${oldPriceHtml}
        </div>
        <p style="color: #65635C; font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.25rem;">${product.shortDesc || product.description}</p>
        
        ${product.colors && product.colors.length > 0 ? `
          <div style="margin-bottom: 1.25rem; background: #F9F9F8; padding: 0.75rem 1rem; border: 1px solid #E5E3DC; border-radius: 4px;">
            <div style="font-size: 0.82rem; font-weight: 600; margin-bottom: 0.5rem; color: #111;">
              Color / Edition: <span id="qv-color-name" style="color: #C9A227; font-weight: 700;">${qvSelectedColor.name}</span>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${product.colors.map(c => `
                <button type="button" class="color-swatch-btn ${qvSelectedColor.id === c.id ? 'active' : ''}" onclick="selectQvColor('${product.id}', '${c.id}', this)" style="padding: 0.3rem 0.75rem; font-size: 0.78rem;">
                  <span class="color-swatch-circle" style="width: 14px; height: 14px; background-color: ${c.hex};"></span>
                  <span>${c.name}</span>
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; border: 1px solid #E5E3DC; border-radius: 2px;">
            <button onclick="decrementQvQty()" style="padding: 0.5rem 0.85rem; font-weight: 700;">-</button>
            <span id="qv-qty" style="padding: 0 0.75rem; font-weight: 600;">1</span>
            <button onclick="incrementQvQty(${product.stock})" style="padding: 0.5rem 0.85rem; font-weight: 700;">+</button>
          </div>
          <button class="btn btn-gold" style="flex: 1; min-width: 140px;" onclick="addQuickViewToCart('${product.id}')">
            Add to Cart
          </button>
        </div>

        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <a href="product.html?id=${product.id}" class="btn btn-outline-dark btn-sm" style="flex: 1; text-align: center; min-width: 120px;">Full Details</a>
          <button onclick="buyNowQuickView('${product.id}')" class="btn btn-dark btn-sm" style="flex: 1; min-width: 120px;">Buy Now (COD)</button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
}

function selectQvColor(productId, colorId, btn) {
  const product = typeof getProductById === 'function' ? getProductById(productId) : null;
  if (!product || !product.colors) return;
  const found = product.colors.find(c => c.id === colorId);
  if (!found) return;

  qvSelectedColor = found;
  const nameEl = document.getElementById('qv-color-name');
  if (nameEl) nameEl.textContent = found.name;

  const mainImg = document.getElementById('qv-main-img');
  if (mainImg && found.image) {
    mainImg.style.opacity = '0.3';
    setTimeout(() => {
      mainImg.src = found.image;
      mainImg.style.opacity = '1';
    }, 150);
  }

  const buttons = btn.parentElement.querySelectorAll('.color-swatch-btn');
  buttons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function incrementQvQty(max) {
  if (qvCurrentQty < max) {
    qvCurrentQty++;
    document.getElementById('qv-qty').textContent = qvCurrentQty;
  }
}
function decrementQvQty() {
  if (qvCurrentQty > 1) {
    qvCurrentQty--;
    document.getElementById('qv-qty').textContent = qvCurrentQty;
  }
}
function addQuickViewToCart(productId) {
  addToCart(productId, qvCurrentQty, true, qvSelectedColor);
  closeQuickView();
}
function buyNowQuickView(productId) {
  addToCart(productId, qvCurrentQty, false, qvSelectedColor);
  closeQuickView();
  window.location.href = 'checkout.html';
}

function closeQuickView() {
  const modal = document.getElementById('quickview-modal');
  if (modal) modal.classList.remove('open');
  qvCurrentQty = 1;
}

// Live Search Modal
function setupSearchModal() {
  if (document.getElementById('search-modal')) return;

  const modalHtml = `
    <div id="search-modal" class="modal-overlay" onclick="handleModalOverlayClick(event, 'search-modal')">
      <div class="modal-container search-modal-container">
        <button class="modal-close-btn" onclick="closeSearchModal()" aria-label="Close search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div class="search-input-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A227" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="global-search-input" placeholder="Search luxury timepieces..." oninput="handleGlobalSearch(this.value)" autocomplete="off" />
        </div>
        <div id="search-results-box" class="search-results-list">
          <div style="text-align: center; color: #9B9890; padding: 2rem 0; font-size: 0.9rem;">
            Type watch name, series, or category (e.g. Royal Gold, Chronograph, Classic)...
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function openSearchModal() {
  setupSearchModal();
  const modal = document.getElementById('search-modal');
  modal.classList.add('open');
  setTimeout(() => {
    const input = document.getElementById('global-search-input');
    if (input) input.focus();
  }, 100);
}

function closeSearchModal() {
  const modal = document.getElementById('search-modal');
  if (modal) modal.classList.remove('open');
}

function handleGlobalSearch(query) {
  const resultsBox = document.getElementById('search-results-box');
  if (!resultsBox) return;

  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    resultsBox.innerHTML = `
      <div style="text-align: center; color: #9B9890; padding: 2rem 0; font-size: 0.9rem;">
        Type watch name, series, or category (e.g. Royal Gold, Chronograph, Classic)...
      </div>
    `;
    return;
  }

  const products = typeof getAllProducts === 'function' ? getAllProducts() : [];
  const matches = products.filter(p => 
    p.name.toLowerCase().includes(trimmed) || 
    p.category.toLowerCase().includes(trimmed) ||
    p.description.toLowerCase().includes(trimmed)
  );

  if (matches.length === 0) {
    resultsBox.innerHTML = `
      <div style="text-align: center; color: #9B9890; padding: 2rem 0; font-size: 0.9rem;">
        No watches found matching "<strong>${query}</strong>". Explore our <a href="shop.html" style="color: #C9A227; text-decoration: underline;">catalog</a>.
      </div>
    `;
    return;
  }

  resultsBox.innerHTML = matches.map(p => `
    <a href="product.html?id=${p.id}" class="search-result-item">
      <img src="${p.image}" alt="${p.name}" />
      <div style="flex-grow: 1;">
        <h4 style="font-family: var(--font-serif); font-size: 0.95rem; color: #FFFFFF; margin-bottom: 0.2rem;">${p.name}</h4>
        <span style="font-size: 0.72rem; color: #C9A227; text-transform: uppercase; letter-spacing: 0.08em;">${p.category}</span>
      </div>
      <span style="font-weight: 700; color: #FFFFFF; font-size: 0.9rem;">${formatPKR(p.price)}</span>
    </a>
  `).join('');
}

function handleModalOverlayClick(e, modalId) {
  if (e.target.id === modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  }
}

// Mobile Menu Navigation Toggle
function initMobileMenu() {
  const openBtn = document.querySelector('.mobile-menu-btn');
  const closeBtn = document.querySelector('.mobile-menu-close');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const backdrop = document.querySelector('.mobile-nav-backdrop');

  if (!openBtn || !drawer) return;

  const toggle = (open) => {
    if (open) {
      drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  openBtn.addEventListener('click', () => toggle(true));
  if (closeBtn) closeBtn.addEventListener('click', () => toggle(false));
  if (backdrop) backdrop.addEventListener('click', () => toggle(false));
}

// Newsletter Subscription Form with FormSubmit Direct Delivery
function initNewsletter() {
  const forms = document.querySelectorAll('.newsletter-form');
  if (!forms || forms.length === 0) return;

  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const submitBtn = form.querySelector('button[type="submit"]');
      if (!input || !input.value.trim()) return;

      const email = input.value.trim().toLowerCase();
      // Basic email regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast('Please provide a valid email address.', 'error');
        input.focus();
        return;
      }

      const originalBtnHTML = submitBtn ? submitBtn.innerHTML : 'Subscribe';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg style="animation: spin 1s linear infinite; display: inline-block; margin-right: 4px;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10"></path>
          </svg>
          Subscribing...
        `;
      }

      // Store locally so store retains all subscribers list
      try {
        const stored = JSON.parse(localStorage.getItem('st_subscribers') || '[]');
        const existing = stored.find(s => (typeof s === 'string' ? s : s.email) === email);
        if (!existing) {
          stored.push({
            email: email,
            date: new Date().toISOString(),
            page: window.location.pathname || 'Home'
          });
          localStorage.setItem('st_subscribers', JSON.stringify(stored));
        }
      } catch (err) {
        console.error(err);
      }

      // Send instant notification to asadkabir722@gmail.com via FormSubmit
      const targetEmail = (typeof ST_CONFIG !== 'undefined' && ST_CONFIG.orderEmail)
        ? ST_CONFIG.orderEmail
        : 'asadkabir722@gmail.com';

      const payload = {
        _subject: `📬 New VIP Watch Collector Subscriber: ${email}`,
        _template: 'table',
        _captcha: 'false',
        _autoresponse: 'Thank you for joining the ST Watches Collector Circle. You will receive private previews of our rare and limited horological collections.',
        'Subscriber Email': email,
        'Subscription Tier': "VIP Collector's Circle & Horological Journal",
        'Subscribed At (PKT)': new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi', dateStyle: 'full', timeStyle: 'medium' }),
        'Source Page': window.location.href,
        'Platform': 'ST Watches Pakistan Web Boutique',
        'Market & Currency': 'Pakistan (PKR) - Cash on Delivery',
        'VIP Status': '✓ Active Subscriber'
      };

      let sentSuccessfully = false;

      try {
        const response = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          sentSuccessfully = true;
        }
      } catch (err) {
        console.warn('FormSubmit AJAX notification failed, attempting standard submission:', err);
      }

      // If AJAX failed (e.g. ad blocker blocked FormSubmit AJAX request), submit via standard POST
      if (!sentSuccessfully && form.getAttribute('action')) {
        form.submit();
        return;
      }

      showToast('Thank you! You are now subscribed to the ST Watches VIP Collector Circle. Check your inbox for updates.', 'success');
      input.value = '';

      if (submitBtn) {
        submitBtn.innerHTML = '✓ Subscribed!';
        submitBtn.style.backgroundColor = '#15803D';
        submitBtn.style.color = '#FFFFFF';
        submitBtn.style.borderColor = '#15803D';

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
          submitBtn.style.backgroundColor = '';
          submitBtn.style.color = '';
          submitBtn.style.borderColor = '';
        }, 4000);
      }
    });
  });
}

// Subtle Scroll Animations with IntersectionObserver
function initScrollAnimations() {
  // If browser doesn't support IntersectionObserver, reveal everything immediately
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal-on-scroll, .reveal-scale, .product-card').forEach(el => {
      el.classList.add('is-revealed');
    });
    return;
  }

  // Pre-reveal margin so items are ready smoothly before user scrolls to them
  const observerOptions = {
    root: null,
    rootMargin: '120px 0px 40px 0px',
    threshold: 0.05
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        // Check if element has a data-delay specified
        const delay = target.getAttribute('data-delay') || 0;
        if (delay > 0) {
          setTimeout(() => {
            target.classList.add('is-revealed');
          }, Math.min(parseInt(delay, 10), 180));
        } else {
          target.classList.add('is-revealed');
        }
        obs.unobserve(target);
      }
    });
  }, observerOptions);

  // Observe all sections and animated elements
  const observeElements = () => {
    const targets = document.querySelectorAll(
      '.reveal-on-scroll:not(.is-revealed), .reveal-scale:not(.is-revealed), .product-card:not(.is-revealed), .feature-box, .category-card, .review-card, .story-split'
    );
    targets.forEach((el) => {
      if (!el.classList.contains('reveal-on-scroll') && !el.classList.contains('product-card')) {
        el.classList.add('reveal-on-scroll');
      }
      // Immediate reveal for elements already in initial viewport to eliminate wait
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100) {
        el.classList.add('is-revealed');
        return;
      }
      // Add subtle stagger to product cards within the same grid
      if (el.classList.contains('product-card') && !el.hasAttribute('data-delay')) {
        const siblingCards = Array.from(el.parentElement?.querySelectorAll('.product-card') || []);
        const cardIndex = siblingCards.indexOf(el);
        if (cardIndex > 0) {
          el.setAttribute('data-delay', (cardIndex % 4) * 50);
        }
      }
      observer.observe(el);
    });
  };

  observeElements();
  setTimeout(observeElements, 100);
  setTimeout(observeElements, 400);

  // Re-run observer when dynamic content might have loaded
  window.addEventListener('st:productsRendered', () => {
    setTimeout(observeElements, 30);
    setTimeout(observeElements, 200);
  });
}

// Continuous Sliding Announcement Bar Setup
function initAnnouncementTicker() {
  const bars = document.querySelectorAll('.announcement-bar');
  bars.forEach(bar => {
    if (!bar.querySelector('.announcement-ticker-track')) {
      const existingText = bar.innerText.trim();
      const content = existingText || 'Complimentary Express Delivery on orders over PKR 20,000 · Cash on Delivery (COD) Across Pakistan';
      bar.innerHTML = `
        <div class="announcement-ticker-track">
          <div class="announcement-item">
            <span>${content}</span>
            <span class="ticker-divider">✦</span>
            <span>Handcrafted Luxury &amp; Swiss-Grade Precision</span>
            <span class="ticker-divider">✦</span>
            <span>WhatsApp Quick Order: <strong>+92 300 1234567</strong></span>
            <span class="ticker-divider">✦</span>
            <span>Official 1-Year National Warranty</span>
            <span class="ticker-divider">✦</span>
          </div>
          <div class="announcement-item" aria-hidden="true">
            <span>${content}</span>
            <span class="ticker-divider">✦</span>
            <span>Handcrafted Luxury &amp; Swiss-Grade Precision</span>
            <span class="ticker-divider">✦</span>
            <span>WhatsApp Quick Order: <strong>+92 300 1234567</strong></span>
            <span class="ticker-divider">✦</span>
            <span>Official 1-Year National Warranty</span>
            <span class="ticker-divider">✦</span>
          </div>
        </div>
      `;
    }
  });
}

// Interactive Mouse-Hover Zoom for Watch Product Images
function initProductCardZoom() {
  // Only activate for devices with mouse pointer hover capability
  if (window.matchMedia && !window.matchMedia('(hover: hover)').matches) {
    return;
  }

  // Delegated mouseover / mousemove / mouseout for instant 60fps tracking on all product cards
  document.addEventListener('mouseover', (e) => {
    const wrap = e.target.closest('.card-image-wrap');
    if (!wrap) return;
    const img = wrap.querySelector('img');
    if (!img) return;

    wrap.classList.add('is-zoomed');
    applyZoomCoordinates(e, wrap, img);
  }, { passive: true });

  document.addEventListener('mousemove', (e) => {
    const wrap = e.target.closest('.card-image-wrap');
    if (!wrap) return;
    const img = wrap.querySelector('img');
    if (!img) return;

    applyZoomCoordinates(e, wrap, img);
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    const wrap = e.target.closest('.card-image-wrap');
    if (!wrap) return;

    // Check if moving to another element inside the same wrap
    if (e.relatedTarget && wrap.contains(e.relatedTarget)) return;

    wrap.classList.remove('is-zoomed');
    const img = wrap.querySelector('img');
    if (img) {
      img.style.transformOrigin = 'center center';
      img.style.transform = '';
    }
  }, { passive: true });
}

function applyZoomCoordinates(e, wrap, img) {
  const rect = wrap.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;

  // Calculate mouse position percentage relative to the image container
  const rawX = ((e.clientX - rect.left) / rect.width) * 100;
  const rawY = ((e.clientY - rect.top) / rect.height) * 100;

  const x = Math.max(0, Math.min(100, rawX));
  const y = Math.max(0, Math.min(100, rawY));

  img.style.transformOrigin = `${x.toFixed(1)}% ${y.toFixed(1)}%`;
  img.style.transform = 'scale(2.2)';
}

// Instant Page Pre-fetching on Hover & Touch for instant transitions
function initInstantPagePrefetch() {
  const prefetchedUrls = new Set();
  const prefetchLink = (url) => {
    if (!url || prefetchedUrls.has(url)) return;
    if (url.startsWith('#') || url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('javascript:')) return;
    prefetchedUrls.add(url);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  };

  const handlePointer = (e) => {
    const a = e.target.closest('a');
    if (a && a.href && a.origin === window.location.origin) {
      prefetchLink(a.pathname);
    }
  };

  document.addEventListener('mouseover', handlePointer, { passive: true });
  document.addEventListener('touchstart', handlePointer, { passive: true });
}

// Off-main-thread image decoding for buttery smooth 60fps scrolling
function initImageOptimization() {
  const setupImages = () => {
    document.querySelectorAll('img').forEach(img => {
      if (!img.getAttribute('decoding')) {
        img.decoding = 'async';
      }
    });
  };
  setupImages();
  window.addEventListener('st:productsRendered', setupImages);
}

// Sticky header smooth class toggle with requestAnimationFrame
function initStickyHeaderPerformance() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 40) {
          header.classList.add('is-scrolled');
        } else {
          header.classList.remove('is-scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initImageOptimization();
  initAnnouncementTicker();
  updateCartBadge();
  initMobileMenu();
  initNewsletter();
  initScrollAnimations();
  initProductCardZoom();
  initInstantPagePrefetch();
  initStickyHeaderPerformance();
});
