/**
 * ST WATCHES - Shop Page Logic
 * Search, Category Filtering, Price Slider, Sorting, URL State & Dynamic Rendering
 */

document.addEventListener('DOMContentLoaded', () => {
  initShopPage();
});

let currentFilters = {
  category: 'All',
  search: '',
  maxPrice: 35000,
  sortBy: 'featured'
};

function initShopPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('category');
  const filterParam = urlParams.get('filter');
  const searchParam = urlParams.get('search');

  if (catParam) {
    currentFilters.category = catParam;
  } else if (filterParam === 'sale') {
    currentFilters.category = 'Sale';
  } else if (filterParam === 'new') {
    currentFilters.category = 'New Arrivals';
  }

  if (searchParam) {
    currentFilters.search = searchParam;
    const searchInput = document.getElementById('shop-search-input');
    if (searchInput) searchInput.value = searchParam;
  }

  // Setup UI controls
  setupCategoryButtons();
  setupPriceFilter();
  setupSortDropdown();
  setupSearchInput();

  // Initial render
  renderFilteredProducts();
}

function setupCategoryButtons() {
  const buttons = document.querySelectorAll('.shop-cat-btn');
  buttons.forEach(btn => {
    const cat = btn.getAttribute('data-category');
    if (cat.toLowerCase() === currentFilters.category.toLowerCase()) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }

    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilters.category = cat;
      renderFilteredProducts();
    });
  });
}

function setupPriceFilter() {
  const slider = document.getElementById('price-range-slider');
  const priceDisplay = document.getElementById('price-slider-val');

  if (slider && priceDisplay) {
    slider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      currentFilters.maxPrice = val;
      priceDisplay.textContent = formatPKR(val);
      renderFilteredProducts();
    });
  }
}

function setupSortDropdown() {
  const sortSelect = document.getElementById('shop-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentFilters.sortBy = e.target.value;
      renderFilteredProducts();
    });
  }
}

function setupSearchInput() {
  const searchInput = document.getElementById('shop-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilters.search = e.target.value.trim().toLowerCase();
      renderFilteredProducts();
    });
  }
}

function filterProducts() {
  let products = typeof getAllProducts === 'function' ? getAllProducts() : [];

  // 1. Category Filter
  if (currentFilters.category !== 'All') {
    const cat = currentFilters.category.toLowerCase();
    if (cat === 'new arrivals') {
      products = products.filter(p => p.isNew);
    } else if (cat === 'sale') {
      products = products.filter(p => p.isSale);
    } else if (cat.includes("men's")) {
      products = products.filter(p => p.gender === 'men' || p.category.toLowerCase().includes('men'));
    } else if (cat.includes("women's")) {
      products = products.filter(p => p.gender === 'women' || p.category.toLowerCase().includes('women'));
    } else {
      products = products.filter(p => p.category.toLowerCase() === cat);
    }
  }

  // 2. Search Filter
  if (currentFilters.search) {
    products = products.filter(p => 
      p.name.toLowerCase().includes(currentFilters.search) ||
      p.category.toLowerCase().includes(currentFilters.search) ||
      p.description.toLowerCase().includes(currentFilters.search)
    );
  }

  // 3. Price Filter
  products = products.filter(p => p.price <= currentFilters.maxPrice);

  // 4. Sort
  if (currentFilters.sortBy === 'price-low') {
    products.sort((a, b) => a.price - b.price);
  } else if (currentFilters.sortBy === 'price-high') {
    products.sort((a, b) => b.price - a.price);
  } else if (currentFilters.sortBy === 'newest') {
    products.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  } else if (currentFilters.sortBy === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  }

  return products;
}

function renderFilteredProducts() {
  const grid = document.getElementById('shop-product-grid');
  const countDisplay = document.getElementById('shop-results-count');
  if (!grid) return;

  const products = filterProducts();

  if (countDisplay) {
    countDisplay.textContent = `Showing ${products.length} Timepiece${products.length === 1 ? '' : 's'}`;
  }

  const mobileIndicator = document.getElementById('mobile-filter-active-indicator');
  if (mobileIndicator) {
    mobileIndicator.textContent = products.length;
  }

  if (products.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background-color: var(--color-white); border: 1px solid var(--color-gray-200); border-radius: 2px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C9A227" stroke-width="1.5" style="margin: 0 auto 1rem;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
        <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 0.5rem;">No Timepieces Match Your Filters</h3>
        <p style="color: var(--color-gray-600); max-width: 420px; margin: 0 auto 1.5rem; font-size: 0.9rem;">
          Try adjusting your price threshold, clearing the search query, or browsing all categories.
        </p>
        <button class="btn btn-gold btn-sm" onclick="resetShopFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(p => renderProductCard(p)).join('');
  window.dispatchEvent(new CustomEvent('st:productsRendered'));
}

function openShopFilterDrawer() {
  const sidebar = document.getElementById('shop-filter-sidebar');
  if (sidebar) {
    sidebar.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeShopFilterDrawer() {
  const sidebar = document.getElementById('shop-filter-sidebar');
  if (sidebar) {
    sidebar.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function resetShopFilters() {
  currentFilters = {
    category: 'All',
    search: '',
    maxPrice: 35000,
    sortBy: 'featured'
  };

  const slider = document.getElementById('price-range-slider');
  if (slider) slider.value = 35000;
  const priceDisplay = document.getElementById('price-slider-val');
  if (priceDisplay) priceDisplay.textContent = formatPKR(35000);

  const searchInput = document.getElementById('shop-search-input');
  if (searchInput) searchInput.value = '';

  const sortSelect = document.getElementById('shop-sort-select');
  if (sortSelect) sortSelect.value = 'featured';

  const buttons = document.querySelectorAll('.shop-cat-btn');
  buttons.forEach(b => {
    if (b.getAttribute('data-category') === 'All') b.classList.add('active');
    else b.classList.remove('active');
  });

  renderFilteredProducts();
}
