/**
 * ST WATCHES - Checkout & WhatsApp Order Engine
 * Handles Pakistani Delivery Addresses, Form Validation, Order Itemization,
 * and Direct WhatsApp Order String Generation
 */

document.addEventListener('DOMContentLoaded', () => {
  initCheckout();
});

let currentPaymentMode = 'advance'; // 'advance' or 'cod'
let currentWalletProvider = 'jazzcash'; // 'jazzcash' or 'easypaisa'

function initCheckout() {
  const cart = getCart();

  if (!cart || cart.length === 0) {
    const checkoutContainer = document.getElementById('checkout-page-container');
    if (checkoutContainer) {
      checkoutContainer.innerHTML = `
        <div style="text-align: center; padding: 4rem 1.25rem; background: #FFFFFF; border: 1px solid #E5E3DC; border-radius: 6px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); max-width: 520px; margin: 0 auto; box-sizing: border-box;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(201, 162, 39, 0.1); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A227" stroke-width="1.8"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
          </div>
          <h2 style="font-family: var(--font-serif); font-size: 1.65rem; margin-bottom: 0.5rem; color: #0B0B0B;">Your Cart is Empty</h2>
          <p style="color: #65635C; margin-bottom: 1.5rem; font-size: 0.9rem; line-height: 1.5;">Please select at least one luxury timepiece before proceeding to express checkout.</p>
          <a href="shop.html" class="btn btn-gold" style="min-height: 48px; display: inline-flex; align-items: center; justify-content: center; padding: 0.75rem 1.75rem;">Explore Watch Collection</a>
        </div>
      `;
    }
    return;
  }

  // Setup Mobile Summary Accordion Toggle
  setupMobileSummaryToggle();

  // Setup Payment Method Selection Radios
  setupPaymentModeSelector(cart);

  // Initialize Wallet Display
  updateWalletInfoDisplay();

  renderCheckoutSummary(cart);

  // Restore saved customer data from localStorage if available
  restoreSavedCustomerData();

  // Setup Form Handlers
  setupOrderButtons(cart);
}

function setupPaymentModeSelector(cart) {
  const radioAdvance = document.getElementById('pay-method-advance');
  const radioCod = document.getElementById('pay-method-cod');
  const cardAdvance = document.getElementById('card-pay-advance');
  const cardCod = document.getElementById('card-pay-cod');
  const advancePanel = document.getElementById('advance-payment-details-panel');

  function handleModeChange(mode) {
    currentPaymentMode = mode;
    if (mode === 'advance') {
      if (cardAdvance) cardAdvance.classList.add('active');
      if (cardCod) cardCod.classList.remove('active');
      if (advancePanel) advancePanel.style.display = 'block';
      if (radioAdvance) radioAdvance.checked = true;
    } else {
      if (cardAdvance) cardAdvance.classList.remove('active');
      if (cardCod) cardCod.classList.add('active');
      if (advancePanel) advancePanel.style.display = 'none';
      if (radioCod) radioCod.checked = true;
    }
    renderCheckoutSummary(cart);
  }

  if (radioAdvance) {
    radioAdvance.addEventListener('change', () => handleModeChange('advance'));
  }
  if (radioCod) {
    radioCod.addEventListener('change', () => handleModeChange('cod'));
  }

  if (cardAdvance) {
    cardAdvance.addEventListener('click', (e) => {
      if (e.target !== radioAdvance) handleModeChange('advance');
    });
  }
  if (cardCod) {
    cardCod.addEventListener('click', (e) => {
      if (e.target !== radioCod) handleModeChange('cod');
    });
  }
}

// Global functions for wallet tab switcher and app launch
window.switchAdvanceWallet = function(wallet) {
  currentWalletProvider = wallet;
  const tabJc = document.getElementById('tab-btn-jazzcash');
  const tabEp = document.getElementById('tab-btn-easypaisa');

  if (wallet === 'jazzcash') {
    if (tabJc) tabJc.className = 'wallet-tab-btn active jazzcash-active';
    if (tabEp) tabEp.className = 'wallet-tab-btn';
  } else {
    if (tabJc) tabJc.className = 'wallet-tab-btn';
    if (tabEp) tabEp.className = 'wallet-tab-btn active easypaisa-active';
  }

  updateWalletInfoDisplay();
};

function updateWalletInfoDisplay() {
  const cfg = (typeof ST_CONFIG !== 'undefined' && ST_CONFIG[currentWalletProvider])
    ? ST_CONFIG[currentWalletProvider]
    : {
        name: currentWalletProvider === 'jazzcash' ? 'JazzCash' : 'Easypaisa',
        accountNumber: '03708111223',
        accountTitle: 'ST Watches / Asad Kabir'
      };

  const nameVal = document.getElementById('wallet-name-val');
  const titleVal = document.getElementById('wallet-title-val');
  const numVal = document.getElementById('wallet-number-val');
  const instructionsVal = document.getElementById('wallet-instructions-val');
  const copyBtnText = document.getElementById('copy-btn-text');

  if (nameVal) nameVal.textContent = `${cfg.name} Mobile Account`;
  if (titleVal) titleVal.textContent = cfg.accountTitle;
  if (numVal) numVal.textContent = cfg.accountNumber;
  if (copyBtnText) copyBtnText.textContent = `Copy ${cfg.name} Number (${cfg.accountNumber})`;
  if (instructionsVal) {
    instructionsVal.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
      <span>Open your <strong>${cfg.name} App</strong> > Send Money > Enter <strong>${cfg.accountNumber}</strong> > Transfer discounted total.</span>
    `;
  }
}

window.copyWalletAccountNumber = function() {
  const cfg = (typeof ST_CONFIG !== 'undefined' && ST_CONFIG[currentWalletProvider])
    ? ST_CONFIG[currentWalletProvider]
    : { name: currentWalletProvider === 'jazzcash' ? 'JazzCash' : 'Easypaisa', accountNumber: '03708111223' };

  const num = cfg.accountNumber.replace(/\s+/g, '');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(num).then(() => {
      showCopySuccess(cfg.name, num);
    }).catch(() => {
      fallbackCopy(cfg.name, num);
    });
  } else {
    fallbackCopy(cfg.name, num);
  }
};

function fallbackCopy(walletName, text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showCopySuccess(walletName, text);
  } catch (err) {
    showToast(`${walletName} Account number: ${text}`, 'info');
  }
  document.body.removeChild(ta);
}

function showCopySuccess(walletName, num) {
  const copyBtnText = document.getElementById('copy-btn-text');
  if (copyBtnText) {
    const orig = copyBtnText.textContent;
    copyBtnText.textContent = `✓ Copied ${walletName} (${num})!`;
    setTimeout(() => {
      updateWalletInfoDisplay();
    }, 2500);
  }
  showToast(`${walletName} account number (${num}) copied to clipboard!`, 'success');
}

window.launchWalletApp = function(provider) {
  if (provider && provider !== currentWalletProvider) {
    switchAdvanceWallet(provider);
  }
  const targetProvider = provider || currentWalletProvider;
  const cfg = (typeof ST_CONFIG !== 'undefined' && ST_CONFIG[targetProvider])
    ? ST_CONFIG[targetProvider]
    : {
        name: targetProvider === 'jazzcash' ? 'JazzCash' : 'Easypaisa',
        accountNumber: '03708111223',
        deepLink: targetProvider === 'jazzcash' ? 'jazzcash://' : 'easypaisa://',
        playStoreUrl: 'https://play.google.com/store/apps',
        appStoreUrl: 'https://apps.apple.com'
      };

  // Automatically copy account number to clipboard for customer convenience
  try {
    const cleanNum = cfg.accountNumber.replace(/\s+/g, '');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cleanNum);
    }
  } catch (e) {
    console.log(e);
  }

  showToast(`Opening ${cfg.name}... Number (${cfg.accountNumber}) copied!`, 'info');

  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isAndroid) {
    // Attempt app deep link scheme
    window.location.href = cfg.deepLink;
    setTimeout(() => {
      window.open(cfg.playStoreUrl, '_blank');
    }, 1800);
  } else if (isIOS) {
    window.location.href = cfg.deepLink;
    setTimeout(() => {
      if (cfg.appStoreUrl) window.open(cfg.appStoreUrl, '_blank');
    }, 1800);
  } else {
    // Desktop: Open Play Store/Web instructions
    if (cfg.playStoreUrl) {
      window.open(cfg.playStoreUrl, '_blank');
    }
  }
};

window.openSelectedWalletApp = function() {
  window.launchWalletApp(currentWalletProvider);
};

function setupMobileSummaryToggle() {
  const toggleBtn = document.getElementById('mobile-summary-toggle-btn');
  const collapsible = document.getElementById('mobile-summary-collapsible');
  const toggleText = document.getElementById('mobile-toggle-text');

  if (toggleBtn && collapsible) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isExpanded = toggleBtn.classList.toggle('expanded');
      collapsible.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      if (toggleText) {
        toggleText.textContent = isExpanded ? 'Hide order summary' : 'Show order summary';
      }
    });
  }
}

function renderCheckoutSummary(cart) {
  const itemsList = document.getElementById('checkout-items-list');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const deliveryEl = document.getElementById('checkout-delivery');
  const totalEl = document.getElementById('checkout-total');
  const discountRow = document.getElementById('checkout-discount-row');
  const discountEl = document.getElementById('checkout-discount');
  const summaryBadge = document.getElementById('summary-badge-mode');

  // Mobile elements
  const mobileItemsList = document.getElementById('mobile-checkout-items-list');
  const mobileSubtotalEl = document.getElementById('mobile-checkout-subtotal');
  const mobileDeliveryEl = document.getElementById('mobile-checkout-delivery');
  const mobileTotalEl = document.getElementById('mobile-checkout-total');
  const mobileDiscountRow = document.getElementById('mobile-checkout-discount-row');
  const mobileDiscountEl = document.getElementById('mobile-checkout-discount');
  const mobileToggleTotalEl = document.getElementById('mobile-toggle-total');

  // Advance badge & amount in wallet panel
  const advanceBadgeAmount = document.getElementById('advance-discount-badge-amount');
  const walletAmountVal = document.getElementById('wallet-amount-val');

  // Buttons
  const waBtn = document.getElementById('btn-place-whatsapp-order');
  const directBtn = document.getElementById('btn-place-cod-order');

  const subtotal = getCartSubtotal();
  const isAdvance = currentPaymentMode === 'advance';
  const discountPercent = (typeof ST_CONFIG !== 'undefined' && ST_CONFIG.advanceDiscountPercent) || 10;
  const advanceDiscount = isAdvance ? Math.round((subtotal * discountPercent) / 100) : 0;

  const isFreeDelivery = subtotal >= ST_CONFIG.freeDeliveryThreshold;
  const delivery = isFreeDelivery ? 0 : ST_CONFIG.deliveryFee;
  const grandTotal = Math.max(0, subtotal - advanceDiscount + delivery);

  const itemHtml = cart.map(item => `
    <div class="checkout-item-row">
      <div class="checkout-item-left">
        <img src="${item.image}" alt="${item.name}" class="checkout-item-thumb" />
        <div class="checkout-item-details">
          <div class="checkout-item-name">${item.name}</div>
          ${item.color ? `<div style="font-size: 0.78rem; color: #C9A227; font-weight: 600; margin: 1px 0;">Edition: ${item.color}</div>` : ''}
          <div class="checkout-item-qty">Qty: ${item.quantity} × ${formatPKR(item.price)}</div>
        </div>
      </div>
      <div class="checkout-item-total">
        ${formatPKR(item.price * item.quantity)}
      </div>
    </div>
  `).join('');

  if (itemsList) itemsList.innerHTML = itemHtml;
  if (mobileItemsList) mobileItemsList.innerHTML = itemHtml;

  const formattedSubtotal = formatPKR(subtotal);
  const formattedDelivery = isFreeDelivery ? 'FREE (Complimentary)' : formatPKR(delivery);
  const formattedTotal = formatPKR(grandTotal);
  const formattedDiscount = `- ${formatPKR(advanceDiscount)}`;

  if (subtotalEl) subtotalEl.textContent = formattedSubtotal;
  if (deliveryEl) {
    deliveryEl.textContent = formattedDelivery;
    if (isFreeDelivery) deliveryEl.style.color = '#15803D';
    else deliveryEl.style.color = 'var(--color-black)';
  }
  if (totalEl) totalEl.textContent = formattedTotal;

  // Toggle discount row
  if (discountRow) {
    if (isAdvance && advanceDiscount > 0) {
      discountRow.style.display = 'flex';
      if (discountEl) discountEl.textContent = formattedDiscount;
    } else {
      discountRow.style.display = 'none';
    }
  }

  // Update mobile summary values
  if (mobileSubtotalEl) mobileSubtotalEl.textContent = formattedSubtotal;
  if (mobileDeliveryEl) {
    mobileDeliveryEl.textContent = formattedDelivery;
    if (isFreeDelivery) mobileDeliveryEl.style.color = '#15803D';
    else mobileDeliveryEl.style.color = 'var(--color-black)';
  }
  if (mobileDiscountRow) {
    if (isAdvance && advanceDiscount > 0) {
      mobileDiscountRow.style.display = 'flex';
      if (mobileDiscountEl) mobileDiscountEl.textContent = formattedDiscount;
    } else {
      mobileDiscountRow.style.display = 'none';
    }
  }
  if (mobileTotalEl) mobileTotalEl.textContent = formattedTotal;
  if (mobileToggleTotalEl) mobileToggleTotalEl.textContent = formattedTotal;

  // Advance banner & wallet amount
  if (advanceBadgeAmount) advanceBadgeAmount.textContent = formatPKR(advanceDiscount);
  if (walletAmountVal) walletAmountVal.textContent = formattedTotal;

  // Summary badge mode
  if (summaryBadge) {
    if (isAdvance) {
      summaryBadge.textContent = '10% Discount Active';
      summaryBadge.style.color = '#15803D';
    } else {
      summaryBadge.textContent = 'COD Express';
      summaryBadge.style.color = 'var(--color-gray-600)';
    }
  }

  // Update button texts
  if (waBtn) {
    const span = waBtn.querySelector('span');
    if (span) {
      span.textContent = isAdvance
        ? 'CONFIRM ADVANCE ORDER ON WHATSAPP (10% OFF)'
        : 'PLACE ORDER ON WHATSAPP';
    }
  }
  if (directBtn) {
    directBtn.textContent = isAdvance
      ? 'Confirm Order with Advance Payment (10% OFF)'
      : 'Place Cash on Delivery (COD) Order';
  }
}

function restoreSavedCustomerData() {
  try {
    const saved = localStorage.getItem('st_customer_info');
    if (saved) {
      const data = JSON.parse(saved);
      if (document.getElementById('cust-name') && data.name) document.getElementById('cust-name').value = data.name;
      if (document.getElementById('cust-phone') && data.phone) document.getElementById('cust-phone').value = data.phone;
      if (document.getElementById('cust-city') && data.city) document.getElementById('cust-city').value = data.city;
      if (document.getElementById('cust-address') && data.address) document.getElementById('cust-address').value = data.address;
    }
  } catch (e) {
    console.error(e);
  }
}

function saveCustomerData(data) {
  try {
    localStorage.setItem('st_customer_info', JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}

function getFormData() {
  const name = document.getElementById('cust-name')?.value.trim();
  const phone = document.getElementById('cust-phone')?.value.trim();
  const city = document.getElementById('cust-city')?.value.trim();
  const address = document.getElementById('cust-address')?.value.trim();
  const notes = document.getElementById('cust-notes')?.value.trim() || 'None';

  if (!name) {
    showToast('Please enter your full name.', 'error');
    document.getElementById('cust-name')?.focus();
    return null;
  }

  if (!phone || phone.length < 10) {
    showToast('Please provide a valid Pakistani contact phone number.', 'error');
    document.getElementById('cust-phone')?.focus();
    return null;
  }

  if (!city) {
    showToast('Please select or specify your delivery city.', 'error');
    document.getElementById('cust-city')?.focus();
    return null;
  }

  if (!address || address.length < 10) {
    showToast('Please provide your complete street address for courier dispatch.', 'error');
    document.getElementById('cust-address')?.focus();
    return null;
  }

  const customerData = { name, phone, city, address, notes };
  saveCustomerData(customerData);
  return customerData;
}

function setupOrderButtons(cart) {
  const whatsappBtn = document.getElementById('btn-place-whatsapp-order');
  const codBtn = document.getElementById('btn-place-cod-order');

  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleWhatsAppOrder(cart);
    });
  }

  if (codBtn) {
    codBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleCodOrder(cart);
    });
  }
}

/**
 * Generates WhatsApp Order Message according to user requirements:
 * 
 * ST WATCHES — NEW ORDER
 * 
 * Customer Information:
 * Name:
 * Phone:
 * City:
 * Address:
 * Notes:
 * 
 * Order:
 * * Product name × quantity — price
 * 
 * Subtotal:
 * Delivery:
 * Total:
 */
function handleWhatsAppOrder(cart) {
  const customer = getFormData();
  if (!customer) return;

  const subtotal = getCartSubtotal();
  const isAdvance = currentPaymentMode === 'advance';
  const discountPercent = (typeof ST_CONFIG !== 'undefined' && ST_CONFIG.advanceDiscountPercent) || 10;
  const discount = isAdvance ? Math.round((subtotal * discountPercent) / 100) : 0;

  const isFreeDelivery = subtotal >= ST_CONFIG.freeDeliveryThreshold;
  const delivery = isFreeDelivery ? 0 : ST_CONFIG.deliveryFee;
  const total = Math.max(0, subtotal - discount + delivery);

  const tid = document.getElementById('advance-tid')?.value.trim() || '';
  const walletCfg = (typeof ST_CONFIG !== 'undefined' && ST_CONFIG[currentWalletProvider])
    ? ST_CONFIG[currentWalletProvider]
    : { name: currentWalletProvider === 'jazzcash' ? 'JazzCash' : 'Easypaisa', accountNumber: '03708111223', accountTitle: 'ST Watches / Asad Kabir' };

  const methodLabel = isAdvance
    ? `Advance Cash (${walletCfg.name}) - 10% Discount Applied`
    : 'Cash on Delivery (COD)';

  // Build itemized string
  const itemsText = cart.map(item => 
    `* ${item.name}${item.color ? ` (Color: ${item.color})` : ''} × ${item.quantity} — ${formatPKR(item.price * item.quantity)}`
  ).join('\n');

  const deliveryStr = isFreeDelivery ? 'PKR 0 (Free Express)' : formatPKR(delivery);

  let paymentDetailsText = `Payment Method: ${methodLabel}\n`;
  if (isAdvance) {
    paymentDetailsText += `Payment Wallet: ${walletCfg.name} (${walletCfg.accountNumber} - ${walletCfg.accountTitle})\n`;
    if (tid) {
      paymentDetailsText += `Transaction ID / Sender: ${tid}\n`;
    }
  }

  const message = 
`ST WATCHES — NEW ORDER

Customer Information:
Name: ${customer.name}
Phone: ${customer.phone}
City: ${customer.city}
Address: ${customer.address}
Notes: ${customer.notes}

${paymentDetailsText}Order:
${itemsText}

Subtotal: ${formatPKR(subtotal)}
${isAdvance ? `10% Advance Discount: - ${formatPKR(discount)}\n` : ''}Delivery: ${deliveryStr}
Total: ${formatPKR(total)}`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${ST_CONFIG.whatsappNumber}?text=${encodedMessage}`;

  // Record order locally
  const orderId = 'ST-' + Math.floor(100000 + Math.random() * 900000);
  saveOrderHistory({
    orderId,
    customer,
    cart,
    subtotal,
    discount,
    delivery,
    total,
    method: methodLabel,
    wallet: isAdvance ? walletCfg.name : null,
    tid: tid || null,
    date: new Date().toISOString()
  });

  // Dispatch instant order notification email to owner inbox via FormSubmit
  sendOrderEmailViaFormSubmit(orderId, customer, cart, subtotal, discount, delivery, total, methodLabel, isAdvance ? walletCfg : null, tid);

  // Empty cart
  saveCart([]);
  window.dispatchEvent(new CustomEvent('st:cartUpdated', { detail: { cart: [] } }));

  // Display success confirmation modal with direct WhatsApp trigger
  showOrderSuccessModal(orderId, customer, cart, subtotal, discount, delivery, total, 'WhatsApp', whatsappUrl, methodLabel);

  // Navigate to WhatsApp after slight delay to ensure background fetch starts
  setTimeout(() => {
    try {
      window.location.href = whatsappUrl;
    } catch (e) {
      console.error(e);
    }
  }, 400);
}

function handleCodOrder(cart) {
  const customer = getFormData();
  if (!customer) return;

  const subtotal = getCartSubtotal();
  const isAdvance = currentPaymentMode === 'advance';
  const discountPercent = (typeof ST_CONFIG !== 'undefined' && ST_CONFIG.advanceDiscountPercent) || 10;
  const discount = isAdvance ? Math.round((subtotal * discountPercent) / 100) : 0;

  const isFreeDelivery = subtotal >= ST_CONFIG.freeDeliveryThreshold;
  const delivery = isFreeDelivery ? 0 : ST_CONFIG.deliveryFee;
  const total = Math.max(0, subtotal - discount + delivery);

  const tid = document.getElementById('advance-tid')?.value.trim() || '';
  const walletCfg = (typeof ST_CONFIG !== 'undefined' && ST_CONFIG[currentWalletProvider])
    ? ST_CONFIG[currentWalletProvider]
    : { name: currentWalletProvider === 'jazzcash' ? 'JazzCash' : 'Easypaisa', accountNumber: '03708111223', accountTitle: 'ST Watches / Asad Kabir' };

  const methodLabel = isAdvance
    ? `Advance Cash (${walletCfg.name}) - 10% Discount Applied`
    : 'Cash on Delivery (COD)';

  const orderId = 'ST-' + Math.floor(100000 + Math.random() * 900000);

  saveOrderHistory({
    orderId,
    customer,
    cart,
    subtotal,
    discount,
    delivery,
    total,
    method: methodLabel,
    wallet: isAdvance ? walletCfg.name : null,
    tid: tid || null,
    date: new Date().toISOString()
  });

  // Dispatch instant order notification email to owner inbox via FormSubmit
  sendOrderEmailViaFormSubmit(orderId, customer, cart, subtotal, discount, delivery, total, methodLabel, isAdvance ? walletCfg : null, tid);

  // Clear cart
  saveCart([]);
  window.dispatchEvent(new CustomEvent('st:cartUpdated', { detail: { cart: [] } }));

  showOrderSuccessModal(orderId, customer, cart, subtotal, discount, delivery, total, isAdvance ? 'Advance' : 'COD', '', methodLabel);
}

/**
 * Sends order notification directly to store owner's inbox via FormSubmit AJAX API
 */
async function sendOrderEmailViaFormSubmit(orderId, customer, cart, subtotal, discount, delivery, total, method, walletCfg, tid) {
  const targetEmail = (typeof ST_CONFIG !== 'undefined' && ST_CONFIG.orderEmail)
    ? ST_CONFIG.orderEmail
    : 'asadkabir722@gmail.com';

  const isFreeDelivery = delivery <= 0;
  const deliveryStr = isFreeDelivery ? 'FREE (Complimentary TCS Express)' : formatPKR(delivery);

  // Format timepiece items list for email table
  const watchesListFormatted = (cart && cart.length > 0)
    ? cart.map((item, idx) => `${idx + 1}. ${item.name}${item.color ? ` [Edition: ${item.color}]` : ''} | Qty: ${item.quantity} | Unit: ${formatPKR(item.price)} | Subtotal: ${formatPKR(item.price * item.quantity)}`).join('\n')
    : 'Timepiece Order';

  const orderDateStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }) + ' PKT';

  const payload = {
    _subject: `New ST Watches Order #${orderId} - ${customer.name} (${formatPKR(total)})`,
    _template: 'table',
    _captcha: 'false',
    'Order ID': `#${orderId}`,
    'Customer Name': customer.name,
    'Phone / WhatsApp (Courier Dial)': customer.phone,
    'Delivery City': customer.city,
    'Full Street Address': customer.address,
    'Courier Delivery Instructions': customer.notes || 'None',
    'Payment Method': method,
    'Ordered Timepieces': watchesListFormatted,
    'Subtotal': formatPKR(subtotal),
    ...(discount > 0 ? { '10% Advance Discount': `- ${formatPKR(discount)}` } : {}),
    'TCS Express Delivery': deliveryStr,
    'Grand Total Payable': formatPKR(total),
    ...(walletCfg ? { 'Payment Account': `${walletCfg.name} (${walletCfg.accountNumber} - ${walletCfg.accountTitle})` } : {}),
    ...(tid ? { 'Customer Transaction ID / Sender': tid } : {}),
    'Order Placed At': orderDateStr
  };

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    console.log('FormSubmit notification response:', result);
    return result;
  } catch (err) {
    console.warn('FormSubmit background notification error:', err);
    return null;
  }
}

function saveOrderHistory(order) {
  try {
    const raw = localStorage.getItem('st_recent_orders');
    const orders = raw ? JSON.parse(raw) : [];
    orders.unshift(order);
    localStorage.setItem('st_recent_orders', JSON.stringify(orders.slice(0, 10)));
  } catch (e) {
    console.error(e);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showOrderSuccessModal(orderId, customer, cart, subtotal, discount, delivery, total, type, whatsappUrl = '', methodLabel = '', walletCfg = null, tid = '') {
  const existing = document.getElementById('order-success-modal');
  if (existing) existing.remove();

  const isFreeDelivery = delivery <= 0;
  const totalItemCount = (cart && cart.length > 0)
    ? cart.reduce((acc, item) => acc + item.quantity, 0)
    : 1;

  const orderTimeStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) + ' · ' + new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const whatsappButtonHtml = (type === 'WhatsApp' && whatsappUrl) ? `
    <a href="${whatsappUrl}" class="btn btn-whatsapp btn-block" style="min-height: 50px;">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.8 14.16c-.24.68-1.4 1.25-1.92 1.33-.5.08-1.15.11-3.72-.94-3.28-1.34-5.4-4.66-5.56-4.88-.16-.22-1.33-1.77-1.33-3.38 0-1.61.84-2.4 1.14-2.73.3-.33.65-.41.87-.41.22 0 .43 0 .62.01.2.01.47-.08.73.55.27.65.92 2.24 1 2.4.08.16.14.36.03.57-.11.22-.16.36-.32.55-.16.19-.34.42-.49.57-.16.16-.33.34-.14.67.19.33.84 1.39 1.8 2.25 1.24 1.1 2.28 1.45 2.61 1.61.33.16.52.14.71-.08.2-.22.84-.98 1.06-1.32.22-.34.45-.28.75-.17.3.11 1.91.9 2.24 1.06.33.16.55.24.63.38.08.14.08.82-.16 1.5z"/></svg>
      <span>Open WhatsApp Order Chat</span>
    </a>
  ` : '';

  const itemsHtml = (cart && cart.length > 0) ? `
    <div class="invoice-items-section">
      <div class="invoice-items-title">Ordered Timepieces (${totalItemCount} item${totalItemCount > 1 ? 's' : ''})</div>
      <div class="invoice-items-list">
        ${cart.map(item => `
          <div class="invoice-item-row">
            <div class="invoice-item-left">
              <img src="${item.image}" alt="${escapeHtml(item.name)}" class="invoice-item-thumb" />
              <div style="min-width: 0;">
                <div class="invoice-item-name">${escapeHtml(item.name)}</div>
                ${item.color ? `<div style="font-size: 0.75rem; color: #C9A227; font-weight: 600;">Edition: ${escapeHtml(item.color)}</div>` : ''}
                <div class="invoice-item-sub">Qty: ${item.quantity} × ${formatPKR(item.price)}</div>
              </div>
            </div>
            <div class="invoice-item-price">${formatPKR(item.price * item.quantity)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const displayPaymentMode = methodLabel || (type === 'WhatsApp' ? 'WhatsApp Order' : 'Cash on Delivery (COD)');

  const modalHtml = `
    <div id="order-success-modal" class="modal-overlay open" role="dialog" aria-modal="true" aria-labelledby="invoice-title">
      <div class="modal-container order-success-dialog">
        <!-- Close (X) Button -->
        <button type="button" class="modal-close-btn" onclick="document.getElementById('order-success-modal')?.remove()" aria-label="Close invoice popup">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <!-- Header -->
        <div class="order-success-header">
          <div class="order-success-icon-badge">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <span class="order-success-badge-text">Order Confirmed & Logged</span>
          <h2 id="invoice-title" class="order-success-title">
            Thank You, ${escapeHtml(customer.name)}
          </h2>
          <p class="order-success-subtext">
            Your timepiece has been scheduled for dispatch via TCS Courier from our Mirpur, Azad Kashmir horological facility.
          </p>
        </div>

        <!-- Official Horological Invoice Card -->
        <div class="order-invoice-card" id="printable-order-invoice">
          <!-- Top Strip -->
          <div class="invoice-top-strip">
            <div class="invoice-brand">
              ST <span>WATCHES</span>
              <small style="font-size: 0.7rem; color: #65635C; font-weight: 600; margin-left: 6px; text-transform: uppercase;">Official Invoice</small>
            </div>
            <div class="invoice-order-id-badge">#${orderId}</div>
          </div>

          <!-- Customer & Dispatch Coordinates -->
          <div class="invoice-meta-grid">
            <div class="invoice-meta-item">
              <span class="invoice-meta-label">Recipient</span>
              <span class="invoice-meta-val">${escapeHtml(customer.name)}</span>
            </div>
            <div class="invoice-meta-item">
              <span class="invoice-meta-label">Courier Contact</span>
              <span class="invoice-meta-val">${escapeHtml(customer.phone)}</span>
            </div>
            <div class="invoice-meta-item">
              <span class="invoice-meta-label">Delivery City</span>
              <span class="invoice-meta-val">${escapeHtml(customer.city)}</span>
            </div>
            <div class="invoice-meta-item">
              <span class="invoice-meta-label">Payment Mode</span>
              <span class="invoice-meta-val" style="color: ${discount > 0 ? '#15803D' : '#111827'}; font-weight: 700;">${escapeHtml(displayPaymentMode)}</span>
            </div>
            <div class="invoice-meta-item full-width">
              <span class="invoice-meta-label">Street Address</span>
              <span class="invoice-meta-val">${escapeHtml(customer.address)}</span>
            </div>
            ${walletCfg ? `
              <div class="invoice-meta-item full-width" style="background: #F0FDF4; border: 1px solid #BBF7D0; padding: 0.6rem 0.85rem; border-radius: 4px;">
                <span class="invoice-meta-label" style="color: #166534;">Advance Wallet Transfer (${walletCfg.name})</span>
                <span class="invoice-meta-val" style="color: #166534; font-size: 0.85rem;">Account: <strong>${walletCfg.accountNumber}</strong> (${walletCfg.accountTitle})</span>
                ${tid ? `<div style="font-size: 0.8rem; color: #166534; margin-top: 2px;">Transaction Reference / Sender: <strong>${escapeHtml(tid)}</strong></div>` : ''}
              </div>
            ` : ''}
            ${(customer.notes && customer.notes !== 'None') ? `
              <div class="invoice-meta-item full-width">
                <span class="invoice-meta-label">Courier Instructions</span>
                <span class="invoice-meta-val" style="font-style: italic; color: #65635C;">${escapeHtml(customer.notes)}</span>
              </div>
            ` : ''}
            <div class="invoice-meta-item full-width">
              <span class="invoice-meta-label">Order Date & Timestamp</span>
              <span class="invoice-meta-val" style="font-size: 0.78rem; color: #65635C;">${orderTimeStr}</span>
            </div>
          </div>

          <!-- Ordered Items Breakdown -->
          ${itemsHtml}

          <!-- Financial Calculation Rows -->
          <div class="invoice-calc-row">
            <span>Subtotal</span>
            <strong style="color: #0B0B0B; font-variant-numeric: tabular-nums;">${formatPKR(subtotal)}</strong>
          </div>
          ${discount > 0 ? `
            <div class="invoice-calc-row" style="color: #15803D; font-weight: 600;">
              <span>Advance Discount (10% OFF)</span>
              <strong style="color: #15803D; font-variant-numeric: tabular-nums;">- ${formatPKR(discount)}</strong>
            </div>
          ` : ''}
          <div class="invoice-calc-row">
            <span>Express Delivery (TCS)</span>
            <strong style="font-variant-numeric: tabular-nums; color: ${isFreeDelivery ? '#15803D' : '#0B0B0B'};">${isFreeDelivery ? 'FREE (Complimentary)' : formatPKR(delivery)}</strong>
          </div>
          <div class="invoice-calc-row total">
            <span>Grand Total Payable</span>
            <span class="invoice-total-amount">${formatPKR(total)}</span>
          </div>

          <!-- Dispatch Guarantee Notice -->
          <div class="invoice-dispatch-note">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <div>
              <strong>Open-Box Inspection Enabled:</strong> Inspect and verify the timepiece upon doorstep delivery before paying. A tracking number will be SMS-dispatched to <strong>${escapeHtml(customer.phone)}</strong>.
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="invoice-actions-group">
          ${whatsappButtonHtml}

          <div class="invoice-secondary-btns">
            <button type="button" class="btn btn-outline-dark btn-download-invoice" id="btn-download-invoice" style="min-height: 48px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Download Invoice</span>
            </button>

            <a href="shop.html" class="btn btn-dark" style="min-height: 48px;">
              <span>Continue Shopping</span>
            </a>
          </div>

          <a href="index.html" style="display: block; text-align: center; font-size: 0.82rem; color: #65635C; padding: 0.4rem 0; text-decoration: underline;">
            Return to ST Watches Homepage
          </a>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Attach Download Invoice Handler
  const downloadBtn = document.getElementById('btn-download-invoice');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      downloadOrderInvoice(orderId, customer, cart, subtotal, discount, delivery, total, type, displayPaymentMode, walletCfg, tid);
    });
  }
}

/**
 * Downloads the Official Horological Invoice
 * Uses jsPDF when available for direct PDF file generation;
 * Falls back gracefully to a responsive, standalone HTML invoice file download.
 */
function downloadOrderInvoice(orderId, customer, cart, subtotal, discount, delivery, total, type, methodLabel = '', walletCfg = null, tid = '') {
  try {
    const isFreeDelivery = delivery <= 0;
    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Try jsPDF for instant .pdf download
    const jspdfLib = window.jspdf ? window.jspdf.jsPDF : null;
    if (jspdfLib) {
      const doc = new jspdfLib({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const margin = 16;
      let y = 18;

      // Header Bar
      doc.setFillColor(11, 11, 11);
      doc.rect(0, 0, 210, 24, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('ST WATCHES', margin, 15);

      doc.setTextColor(201, 162, 39);
      doc.setFontSize(10);
      doc.text('PAKISTAN', margin + 44, 15);

      doc.setTextColor(220, 220, 220);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('OFFICIAL HOROLOGICAL INVOICE', 210 - margin, 15, { align: 'right' });

      y = 34;

      // Order Reference & Date
      doc.setTextColor(11, 11, 11);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(`Invoice #${orderId}`, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(110, 110, 110);
      doc.text(`Issued: ${dateStr} · ${timeStr}`, 210 - margin, y, { align: 'right' });

      y += 6;
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, y, 210 - margin, y);
      y += 6;

      // Recipient Coordinates Card
      doc.setFillColor(250, 249, 246);
      doc.rect(margin, y, 210 - (margin * 2), 34, 'F');
      doc.setDrawColor(225, 223, 216);
      doc.rect(margin, y, 210 - (margin * 2), 34, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(160, 125, 20);
      doc.text('DISPATCH & RECIPIENT DETAILS', margin + 4, y + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text(`Recipient: ${customer.name}`, margin + 4, y + 12);
      doc.text(`Contact: ${customer.phone}`, margin + 4, y + 18);

      doc.text(`City: ${customer.city}`, 115, y + 12);
      doc.text(`Payment: ${(methodLabel || 'Cash on Delivery').substring(0, 32)}`, 115, y + 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      const addressLines = doc.splitTextToSize(`Address: ${customer.address}`, 210 - (margin * 2) - 8);
      doc.text(addressLines, margin + 4, y + 25);

      y += 40;

      // Items Table Header
      doc.setFillColor(11, 11, 11);
      doc.rect(margin, y, 210 - (margin * 2), 7.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('TIMEPIECE ITEM', margin + 4, y + 5);
      doc.text('QTY', 125, y + 5, { align: 'center' });
      doc.text('UNIT PRICE', 158, y + 5, { align: 'right' });
      doc.text('TOTAL', 210 - margin - 4, y + 5, { align: 'right' });

      y += 7.5;

      // Items List
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 20, 20);
      doc.setFontSize(8.5);

      if (cart && cart.length > 0) {
        cart.forEach((item, index) => {
          if (index % 2 === 1) {
            doc.setFillColor(250, 250, 250);
            doc.rect(margin, y, 210 - (margin * 2), 8.5, 'F');
          }
          const itemTitle = `${item.name}${item.color ? ` (${item.color})` : ''}`.substring(0, 48);
          doc.text(itemTitle, margin + 4, y + 5.5);
          doc.text(String(item.quantity), 125, y + 5.5, { align: 'center' });
          doc.text(formatPKR(item.price), 158, y + 5.5, { align: 'right' });
          doc.text(formatPKR(item.price * item.quantity), 210 - margin - 4, y + 5.5, { align: 'right' });
          y += 8.5;
        });
      }

      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y, 210 - margin, y);
      y += 6;

      // Calculations
      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      doc.text('Subtotal:', 140, y);
      doc.setTextColor(20, 20, 20);
      doc.text(formatPKR(subtotal), 210 - margin - 4, y, { align: 'right' });
      y += 5.5;

      if (discount > 0) {
        doc.setTextColor(22, 128, 61);
        doc.text('10% Advance Discount:', 140, y);
        doc.text(`- ${formatPKR(discount)}`, 210 - margin - 4, y, { align: 'right' });
        y += 5.5;
      }

      doc.setTextColor(80, 80, 80);
      doc.text('Express Courier (TCS):', 140, y);
      doc.setTextColor(isFreeDelivery ? 22 : 20, isFreeDelivery ? 128 : 20, isFreeDelivery ? 61 : 20);
      doc.text(isFreeDelivery ? 'FREE (Complimentary)' : formatPKR(delivery), 210 - margin - 4, y, { align: 'right' });
      y += 6.5;

      doc.setDrawColor(201, 162, 39);
      doc.setLineWidth(0.4);
      doc.line(135, y, 210 - margin, y);
      y += 6.5;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(11, 11, 11);
      doc.text('Grand Total Payable:', 140, y);
      doc.setTextColor(170, 130, 20);
      doc.text(formatPKR(total), 210 - margin - 4, y, { align: 'right' });
      y += 12;

      // Trust Strip
      doc.setFillColor(240, 253, 244);
      doc.rect(margin, y, 210 - (margin * 2), 15, 'F');
      doc.setDrawColor(187, 247, 208);
      doc.rect(margin, y, 210 - (margin * 2), 15, 'S');
      doc.setTextColor(22, 101, 52);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('100% Risk-Free Cash on Delivery & Open-Box Inspection Enabled', margin + 4, y + 5.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text('Dispatched securely via TCS Courier across Pakistan. Inspect the package before paying the courier rider.', margin + 4, y + 10.5);

      // Footer
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.text('ST Watches Pakistan · Flagship Mirpur, Azad Kashmir · WhatsApp Orders: +92 370 8111223 · asadkabir722@gmail.com', 105, 285, { align: 'center' });

      doc.save(`ST-Watches-Invoice-${orderId}.pdf`);
      showToast('Invoice PDF downloaded successfully!', 'success');
      return;
    }

    // Fallback: Standalone Responsive HTML Invoice File Download
    downloadHtmlInvoice(orderId, customer, cart, subtotal, discount, delivery, total, type, methodLabel, walletCfg, tid, dateStr, timeStr);
  } catch (err) {
    console.error('Invoice download error, using HTML invoice download fallback:', err);
    const dateStr = new Date().toLocaleDateString('en-GB');
    const timeStr = new Date().toLocaleTimeString('en-US');
    downloadHtmlInvoice(orderId, customer, cart, subtotal, discount, delivery, total, type, methodLabel, walletCfg, tid, dateStr, timeStr);
  }
}

function downloadHtmlInvoice(orderId, customer, cart, subtotal, discount, delivery, total, type, methodLabel, walletCfg, tid, dateStr, timeStr) {
  const isFreeDelivery = delivery <= 0;
  const itemsRows = (cart && cart.length > 0) ? cart.map(i => `
    <tr>
      <td style="padding: 10px 8px; border-bottom: 1px solid #E5E3DC; font-weight: 600;">
        ${escapeHtml(i.name)}${i.color ? ` <span style="color: #C9A227; font-size: 11px;">(${escapeHtml(i.color)})</span>` : ''}
      </td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #E5E3DC; text-align: center;">${i.quantity}</td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #E5E3DC; text-align: right;">${formatPKR(i.price)}</td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #E5E3DC; text-align: right; font-weight: 600;">${formatPKR(i.price * i.quantity)}</td>
    </tr>
  `).join('') : `
    <tr>
      <td colspan="4" style="padding: 12px; text-align: center;">ST Watches Luxury Timepiece</td>
    </tr>
  `;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ST Watches Official Invoice - #${orderId}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px 16px; background: #F8F7F4; color: #111; }
    .invoice-container { max-width: 650px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E5E3DC; border-radius: 8px; padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .invoice-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #C9A227; padding-bottom: 16px; margin-bottom: 20px; }
    .brand-title { font-size: 22px; font-weight: 700; letter-spacing: 0.05em; color: #0B0B0B; }
    .brand-title span { color: #C9A227; }
    .invoice-id-pill { background: #FAFAFA; border: 1px solid #E5E3DC; padding: 4px 10px; border-radius: 4px; font-family: monospace; font-weight: 700; font-size: 14px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #FAFAFA; border: 1px solid #E5E3DC; padding: 14px; border-radius: 6px; margin-bottom: 20px; font-size: 13px; }
    .info-col-full { grid-column: 1 / -1; }
    .info-label { font-size: 11px; text-transform: uppercase; color: #777; font-weight: 600; margin-bottom: 2px; }
    .info-val { font-weight: 600; color: #111; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
    th { text-align: left; padding: 10px 8px; border-bottom: 2px solid #111; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    .totals-box { margin-left: auto; width: 280px; font-size: 14px; }
    .calc-line { display: flex; justify-content: space-between; margin-bottom: 8px; color: #666; }
    .calc-line.discount { color: #15803D; font-weight: 600; }
    .calc-line.grand { font-size: 16px; font-weight: 700; color: #0B0B0B; border-top: 1px solid #E5E3DC; padding-top: 10px; margin-top: 10px; }
    .grand-amount { color: #C9A227; }
    .dispatch-badge { background: #F0FDF4; border: 1px solid #BBF7D0; color: #166534; padding: 12px; border-radius: 6px; font-size: 12px; line-height: 1.4; margin-top: 20px; }
    .footer-note { text-align: center; font-size: 11px; color: #888; margin-top: 24px; padding-top: 16px; border-top: 1px solid #E5E3DC; }
    @media print { body { background: #FFF; padding: 0; } .invoice-container { box-shadow: none; border: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="invoice-header">
      <div>
        <div class="brand-title">ST <span>WATCHES</span></div>
        <div style="font-size: 12px; color: #666; margin-top: 2px;">Official Horological Invoice</div>
      </div>
      <div class="invoice-id-pill">#${orderId}</div>
    </div>
    <div class="info-grid">
      <div><div class="info-label">Recipient</div><div class="info-val">${escapeHtml(customer.name)}</div></div>
      <div><div class="info-label">Courier Phone</div><div class="info-val">${escapeHtml(customer.phone)}</div></div>
      <div><div class="info-label">Delivery City</div><div class="info-val">${escapeHtml(customer.city)}</div></div>
      <div><div class="info-label">Payment Mode</div><div class="info-val" style="color: ${discount > 0 ? '#15803D' : '#111'}; font-weight: 700;">${escapeHtml(methodLabel || 'Cash on Delivery')}</div></div>
      <div class="info-col-full"><div class="info-label">Street Address</div><div class="info-val">${escapeHtml(customer.address)}</div></div>
      ${walletCfg ? `
        <div class="info-col-full" style="background: #F0FDF4; border: 1px solid #BBF7D0; padding: 8px 10px; border-radius: 4px;">
          <div class="info-label" style="color: #166534;">Payment Wallet (${walletCfg.name})</div>
          <div class="info-val" style="color: #166534;">Account: <strong>${walletCfg.accountNumber}</strong> (${walletCfg.accountTitle})</div>
          ${tid ? `<div style="font-size: 11px; color: #166534; margin-top: 2px;">Transaction Reference / Sender: <strong>${escapeHtml(tid)}</strong></div>` : ''}
        </div>
      ` : ''}
      <div class="info-col-full"><div class="info-label">Date & Timestamp</div><div class="info-val">${dateStr} · ${timeStr}</div></div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Timepiece</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>
    <div class="totals-box">
      <div class="calc-line"><span>Subtotal:</span><span>${formatPKR(subtotal)}</span></div>
      ${discount > 0 ? `<div class="calc-line discount"><span>Advance Discount (10% OFF):</span><span>- ${formatPKR(discount)}</span></div>` : ''}
      <div class="calc-line"><span>Express Delivery (TCS):</span><span style="color: ${isFreeDelivery ? '#15803D' : '#111'}; font-weight: 600;">${isFreeDelivery ? 'FREE (Complimentary)' : formatPKR(delivery)}</span></div>
      <div class="calc-line grand"><span>Total Payable:</span><span class="grand-amount">${formatPKR(total)}</span></div>
    </div>
    <div class="dispatch-badge">
      🔒 <strong>Open-Box Doorstep Verification:</strong> Pay cash to the courier rider upon delivery after verifying the package.
    </div>
    <div class="footer-note">
      ST Watches Pakistan · Flagship Mirpur, Azad Kashmir Facility · WhatsApp Orders: +92 370 8111223 · asadkabir722@gmail.com
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ST-Watches-Invoice-${orderId}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('Invoice downloaded successfully!', 'success');
}
