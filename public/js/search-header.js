/**
 * Implements debounced search functionality for desktop and mobile.
 * - Fetches products from server
 * - Renders results dynamically
 * - Handles outside-click closing
 */

document.addEventListener('DOMContentLoaded', () => {
  /* -------------------- DOM REFERENCES -------------------- */
  const searchInput = document.getElementById('searchInput');
  const searchIcon = document.getElementById('searchIcon');

  const mobileSearchBar = document.getElementById('mobileSearchBar');
  const mobileSearchInput = mobileSearchBar?.querySelector('input');

  const searchResultContainer = document.getElementById('searchResult');
  const searchMobileResultContainer = document.getElementById('searchMobileResult');

  /* -------------------- UTILITIES -------------------- */

  function debounce(fn, delay = 400) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  function sanitizeQuery(value) {
    return value.replace(/[*%$?\\]/g, '').trim();
  }

  /* -------------------- SEARCH HANDLER -------------------- */

  async function productSearch(event) {
    let searchQuery = sanitizeQuery(event.target.value);

    toggleSearchIcon(searchQuery);

    if (!searchQuery) {
      clearResults();
      return;
    }

    try {
      const response = await axios.get(
        `/user/products/searchProducts?search=${encodeURIComponent(searchQuery)}`
      );

      renderSearchProducts(response.data || []);
    } catch (err) {
      console.error('Search failed:', err);
    }
  }

  const handleSearch = debounce(productSearch);

  /* -------------------- RENDERING -------------------- */

  function renderSearchProducts(products) {
    if (!products.length) {
      renderNoResults();
      return;
    }

    const html = products.map(buildProductHTML).join('');

    searchResultContainer.innerHTML = html;
    searchMobileResultContainer.innerHTML = html;

    showResults();
  }

  function buildProductHTML(product) {
    const image =
      product?.variants?.[0]?.attributes?.productImages?.[0] || '/placeholder.png';

    return `
      <div class="flex items-center gap-4 p-2 bg-white cursor-pointer border border-gray-200 rounded-[1.1rem]">
        <a href="/user/products/productPage/${product._id}" class="flex items-center gap-4 w-full">
          <img src="${image}" alt="${product.name}" class="w-8 h-6 object-contain rounded">
          <span class="text-sm text-gray-800 font-medium">${product.name}</span>
        </a>
      </div>
    `;
  }

  function renderNoResults() {
    const html = `
      <div class="p-2 bg-white border border-gray-200 rounded-xl">
        <p class="text-sm text-gray-500">No Products Found</p>
      </div>
    `;

    searchResultContainer.innerHTML = html;
    searchMobileResultContainer.innerHTML = html;

    showResults();
  }

  /* -------------------- VISIBILITY HELPERS -------------------- */

  function showResults() {
    searchResultContainer.classList.remove('hidden');
    searchMobileResultContainer.classList.remove('hidden');
  }

  function clearResults() {
    searchResultContainer.innerHTML = '';
    searchMobileResultContainer.innerHTML = '';
    searchResultContainer.classList.add('hidden');
    searchMobileResultContainer.classList.add('hidden');
  }

  function toggleSearchIcon(value) {
    searchIcon.classList.toggle('pointer-events-none', !value);
    searchIcon.classList.toggle('pointer-events-auto', !!value);
  }

  /* -------------------- EVENT LISTENERS -------------------- */

  searchInput.addEventListener('input', handleSearch);
  mobileSearchInput?.addEventListener('input', handleSearch);

  document.addEventListener('click', (e) => {
    const clickedOutsideDesktop =
      !searchInput.contains(e.target) &&
      !searchResultContainer.contains(e.target);

    const clickedOutsideMobile =
      !mobileSearchBar.contains(e.target) &&
      !searchMobileResultContainer.contains(e.target);

    if (clickedOutsideDesktop && clickedOutsideMobile) {
      clearResults();
      searchInput.value = '';
      if (mobileSearchInput) mobileSearchInput.value = '';
    }
  });

  searchIcon.addEventListener('click', () => {
    const query = sanitizeQuery(searchInput.value);
    if (query) {
      window.location.href = `/user/products/searchProductsPage?${query}`;
    }
  });
});
