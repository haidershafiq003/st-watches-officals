/**
 * ST WATCHES - Cart Page Logic
 * Renders Shopping Bag, Quantity Controls, Subtotals, Delivery Calculations, Promo Codes
 */

let activePromo = null;

document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();

  window.addEventListener('st:cartUpdated', () => {
    renderCartPage();
  });

  setupPromoCode();
});

function renderCartPage() {
  const cart = getCart();
  const cartContainer = document.getElementById('cart-items-container');
  const emptyState = document.getElementById('cart-empty-state');
  const contentState = document.getElementById('cart-content-wrapper');

  if (!cart || cart.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (contentState) contentState.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (contentState) contentState.style.display = 'grid';

  if (cartContainer) {
    cartContainer.innerHTML = cart.map(item => {
      const itemKey = item.cartItemId || item.id;
      const itemTotal = item.price * item.quantity;
      return `
        <div class="cart-item-row" data-id="${itemKey}">
          <a href="product.html?id=${item.id}" class="cart-item-img">
            <img src="${item.image}" alt="${item.name}" loading="lazy" />
          </a>
          <div class="cart-item-info">
            <span class="cart-item-cat">${item.category || 'Luxury Timepiece'}</span>
            <h3 class="cart-item-title">
              <a href="product.html?id=${item.id}">${item.name}</a>
            </h3>
            ${item.color ? `
              <div class="cart-item-variant-badge">
                <span class="cart-item-variant-dot" style="background-color: ${item.colorHex || '#C9A227'};"></span>
                <span>Edition: <strong>${item.color}</strong></span>
              </div>
            ` : ''}
            <span class="cart-item-unit-price">Unit Price: ${formatPKR(item.price)}</span>
          </div>

          <div class="cart-item-stepper">
            <button onclick="handleCartItemQty('${itemKey}', ${item.quantity - 1})" aria-label="Decrease quantity">-</button>
            <span>${item.quantity}</span>
            <button onclick="handleCartItemQty('${itemKey}', ${item.quantity + 1})" aria-label="Increase quantity">+</button>
          </div>

          <div class="cart-item-price-col">
            <div class="cart-item-subtotal">
              ${formatPKR(itemTotal)}
            </div>
            <button class="cart-item-remove-btn" onclick="removeFromCart('${itemKey}')">
              Remove
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  updateCartSummary(cart);
}

function handleCartItemQty(itemKey, newQty) {
  if (newQty <= 0) {
    removeFromCart(itemKey);
  } else {
    updateCartQuantity(itemKey, newQty);
  }
}

function updateCartSummary(cart) {
  const subtotal = getCartSubtotal();
  const isFreeDelivery = subtotal >= ST_CONFIG.freeDeliveryThreshold;
  const delivery = isFreeDelivery ? 0 : ST_CONFIG.deliveryFee;

  let discount = 0;
  if (activePromo) {
    if (activePromo.type === 'percent') {
      discount = Math.round((subtotal * activePromo.value) / 100);
    } else if (activePromo.type === 'fixed') {
      discount = activePromo.value;
    }
  }

  const grandTotal = Math.max(0, subtotal - discount + delivery);

  // Update elements
  const subtotalEl = document.getElementById('cart-subtotal');
  const deliveryEl = document.getElementById('cart-delivery');
  const discountRow = document.getElementById('cart-discount-row');
  const discountEl = document.getElementById('cart-discount');
  const totalEl = document.getElementById('cart-total');
  const thresholdNote = document.getElementById('free-delivery-note');

  if (subtotalEl) subtotalEl.textContent = formatPKR(subtotal);
  if (deliveryEl) {
    deliveryEl.textContent = isFreeDelivery ? 'FREE (Complimentary)' : formatPKR(delivery);
    if (isFreeDelivery) deliveryEl.style.color = '#15803D';
    else deliveryEl.style.color = '#0B0B0B';
  }

  if (discountRow && discountEl) {
    if (discount > 0) {
      discountRow.style.display = 'flex';
      discountEl.textContent = `- ${formatPKR(discount)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  if (totalEl) totalEl.textContent = formatPKR(grandTotal);

  if (thresholdNote) {
    if (isFreeDelivery) {
      thresholdNote.innerHTML = `<span style="color: #15803D; font-weight: 600;">✓ You have unlocked Complimentary Express Delivery!</span>`;
    } else {
      const remaining = ST_CONFIG.freeDeliveryThreshold - subtotal;
      thresholdNote.innerHTML = `Add <strong>${formatPKR(remaining)}</strong> more to unlock <strong>Free Express Delivery</strong> across Pakistan.`;
    }
  }
}

function setupPromoCode() {
  const applyBtn = document.getElementById('apply-promo-btn');
  const promoInput = document.getElementById('promo-code-input');
  const promoMessage = document.getElementById('promo-message');

  if (!applyBtn || !promoInput) return;

  applyBtn.addEventListener('click', () => {
    const code = promoInput.value.trim().toUpperCase();
    if (!code) {
      if (promoMessage) {
        promoMessage.textContent = 'Please enter a valid coupon code.';
        promoMessage.style.color = '#B91C1C';
      }
      return;
    }

    if (code === 'ST10') {
      activePromo = { code: 'ST10', type: 'percent', value: 10, label: '10% Launch Discount' };
      showToast('Coupon ST10 applied: 10% discount!', 'success');
      if (promoMessage) {
        promoMessage.textContent = 'Promo applied: 10% off your order.';
        promoMessage.style.color = '#15803D';
      }
    } else if (code === 'WELCOME') {
      activePromo = { code: 'WELCOME', type: 'fixed', value: 1000, label: 'PKR 1,000 Welcome Voucher' };
      showToast('Coupon WELCOME applied: PKR 1,000 discount!', 'success');
      if (promoMessage) {
        promoMessage.textContent = 'Promo applied: PKR 1,000 voucher applied.';
        promoMessage.style.color = '#15803D';
      }
    } else {
      activePromo = null;
      if (promoMessage) {
        promoMessage.textContent = 'Invalid promo code. Try "ST10" for 10% off.';
        promoMessage.style.color = '#B91C1C';
      }
      showToast('Invalid coupon code.', 'error');
    }

    renderCartPage();
  });
}

function clearWholeCart() {
  if (confirm('Are you sure you want to empty your shopping bag?')) {
    saveCart([]);
    window.dispatchEvent(new CustomEvent('st:cartUpdated', { detail: { cart: [] } }));
    showToast('Shopping bag cleared.', 'info');
  }
}
