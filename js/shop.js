// js/shop.js - Updated for Base64 images
/* ============================================
   KJ'S FASHION — SHOP PAGE JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    let allProducts = [];
    let filteredProducts = [];
    let currentPage = 1;
    const productsPerPage = 12;

    const filterToggle = document.getElementById('filterToggle');
    const shopSidebar = document.getElementById('shopSidebar');
    const sidebarClose = document.getElementById('sidebarClose');
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    const productsGrid = document.getElementById('productsGrid');
    const resultsCount = document.getElementById('resultsCount');
    const sortSelect = document.getElementById('sortSelect');
    const pagination = document.getElementById('pagination');
    const productModal = document.getElementById('productModal');
    const modalClose = document.getElementById('modalClose');
    const orderBtn = document.getElementById('orderBtn');

    if (filterToggle && shopSidebar) {
        filterToggle.addEventListener('click', () => {
            shopSidebar.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (sidebarClose && shopSidebar) {
        sidebarClose.addEventListener('click', () => {
            shopSidebar.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (priceRange && priceValue) {
        priceRange.addEventListener('input', function() {
            priceValue.textContent = '$' + parseInt(this.value).toLocaleString();
            applyFilters();
        });
    }

    async function loadProducts() {
        if (!productsGrid) return;
        showSkeletonLoading();
        
        try {
            await waitForFirebase();
            const products = await FirebaseDB.products.getAll();
            allProducts = products;
            filteredProducts = [...products];
            
            const urlParams = new URLSearchParams(window.location.search);
            const categoryParam = urlParams.get('cat');
            if (categoryParam) {
                const checkbox = document.querySelector(`.filter-checkbox input[value="${categoryParam}"]`);
                if (checkbox) checkbox.checked = true;
            }
            
            applyFilters();
        } catch (error) {
            console.error('Error loading products:', error);
            productsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 4rem;">
                    <p style="color: var(--soft-silver); opacity: 0.6;">Unable to load products. Please check your connection.</p>
                    <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 1rem;">Retry</button>
                </div>
            `;
        }
    }

    function waitForFirebase() {
        return new Promise((resolve) => {
            const check = () => {
                if (typeof FirebaseDB !== 'undefined' && db) resolve();
                else setTimeout(check, 100);
            };
            check();
        });
    }

    function showSkeletonLoading() {
        productsGrid.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            productsGrid.innerHTML += `
                <div class="product-card skeleton">
                    <div class="product-img skeleton-bg"></div>
                    <div class="product-info">
                        <div class="skeleton-line short"></div>
                        <div class="skeleton-line"></div>
                    </div>
                </div>
            `;
        }
    }

    function renderImage(product, className = '') {
        if (!product.image) {
            return `<div class="${className}" style="background: linear-gradient(135deg, var(--deep-royal) 0%, var(--dark-bg) 100%); display: flex; align-items: center; justify-content: center;">
                <span style="font-family: var(--font-display); font-style: italic; color: rgba(245, 233, 208, 0.08); font-size: 1.2rem;">${product.name}</span>
            </div>`;
        }
        
        // Check if it's a base64 image or URL
        const isBase64 = product.image.startsWith('data:image');
        const src = product.image;
        
        return `<div class="${className}" style="position: relative; overflow: hidden;">
            <img src="${src}" alt="${escapeHtml(product.name)}" loading="lazy" 
                style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;"
                onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--deep-royal) 0%,var(--dark-bg) 100%);\\'><span style=\\'font-family:var(--font-display);font-style:italic;color:rgba(245,233,208,0.08);font-size:1.2rem;\\'>${escapeHtml(product.name)}</span></div>'"
                onload="this.style.opacity='1'"
            >
        </div>`;
    }

    function renderProducts(products) {
        if (!productsGrid) return;
        
        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 4rem;">
                    <p style="color: var(--soft-silver); opacity: 0.6; font-size: 1.1rem;">No products found matching your criteria.</p>
                    <button class="btn btn-outline" onclick="window.ShopApp.clearFilters()" style="margin-top: 1rem;">Clear Filters</button>
                </div>
            `;
            if (resultsCount) resultsCount.textContent = 'No products found';
            if (pagination) pagination.style.display = 'none';
            return;
        }

        const totalPages = Math.ceil(products.length / productsPerPage);
        const start = (currentPage - 1) * productsPerPage;
        const paginatedProducts = products.slice(start, start + productsPerPage);
        
        productsGrid.innerHTML = paginatedProducts.map(product => `
            <div class="product-card" data-id="${product.id}" onclick="window.ShopApp.openProductModal('${product.id}')">
                <div class="product-img">
                    ${product.featured ? '<span class="product-badge">Featured</span>' : ''}
                    ${renderImage(product)}
                </div>
                <div class="product-info">
                    <span class="product-category">${formatCategory(product.category)}${product.subcategory ? ' / ' + formatCategory(product.subcategory) : ''}</span>
                    <h3 class="product-name">${escapeHtml(product.name)}</h3>
                    <p class="product-price">${window.KJApp ? window.KJApp.formatPrice(product.price) : '$' + product.price}</p>
                </div>
            </div>
        `).join('');
        
        if (resultsCount) {
            resultsCount.textContent = `Showing ${start + 1}-${Math.min(start + productsPerPage, products.length)} of ${products.length} products`;
        }
        
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        if (!pagination) return;
        if (totalPages <= 1) { pagination.style.display = 'none'; return; }
        
        pagination.style.display = 'flex';
        let html = '';
        html += `<button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" onclick="window.ShopApp.goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>←</button>`;
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.ShopApp.goToPage(${i})">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                html += `<span class="page-ellipsis">...</span>`;
            }
        }
        
        html += `<button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" onclick="window.ShopApp.goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>→</button>`;
        pagination.innerHTML = html;
    }

    function formatCategory(cat) {
        if (!cat) return '';
        return cat.charAt(0).toUpperCase() + cat.slice(1);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function applyFilters() {
        let result = [...allProducts];
        
        const checkedCategories = Array.from(document.querySelectorAll('.filter-checkbox input:checked')).map(cb => cb.value);
        if (checkedCategories.length > 0) {
            result = result.filter(p => checkedCategories.includes(p.category) || checkedCategories.includes(p.subcategory));
        }
        
        if (priceRange) {
            const maxPrice = parseInt(priceRange.value);
            result = result.filter(p => (p.price || 0) <= maxPrice);
        }
        
        const sortValue = sortSelect ? sortSelect.value : 'newest';
        switch(sortValue) {
            case 'price-low': result.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
            case 'price-high': result.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
            case 'name': result.sort((a, b) => (a.name || '').localeCompare(b.name || '')); break;
            default: result.sort((a, b) => {
                const aTime = a.createdAt?.toMillis?.() || 0;
                const bTime = b.createdAt?.toMillis?.() || 0;
                return bTime - aTime;
            });
        }
        
        filteredProducts = result;
        currentPage = 1;
        renderProducts(filteredProducts);
    }

    function clearFilters() {
        document.querySelectorAll('.filter-checkbox input').forEach(cb => cb.checked = false);
        if (priceRange) { priceRange.value = 5000; if (priceValue) priceValue.textContent = '$5,000'; }
        if (sortSelect) sortSelect.value = 'newest';
        applyFilters();
    }

    function goToPage(page) {
        currentPage = page;
        renderProducts(filteredProducts);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function openProductModal(productId) {
        if (!productModal) return;
        
        try {
            await waitForFirebase();
            const product = await FirebaseDB.products.getById(productId);
            
            if (!product) {
                window.KJApp && window.KJApp.showToast('Product not found', 'error');
                return;
            }
            
            const modalTitle = productModal.querySelector('.modal-title');
            const modalCategory = productModal.querySelector('.modal-category');
            const modalPrice = productModal.querySelector('.modal-price');
            const modalDesc = productModal.querySelector('.modal-description');
            const modalImg = productModal.querySelector('.modal-main-img');
            
            if (modalTitle) modalTitle.textContent = product.name;
            if (modalCategory) modalCategory.textContent = formatCategory(product.category).toUpperCase();
            if (modalPrice) modalPrice.textContent = window.KJApp ? window.KJApp.formatPrice(product.price) : '$' + product.price;
            if (modalDesc) modalDesc.textContent = product.description || 'No description available.';
            
            if (modalImg) {
                if (product.image) {
                    modalImg.innerHTML = `<img src="${product.image}" alt="${escapeHtml(product.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--deep-royal) 0%,var(--dark-bg) 100%);border-radius:12px;\\'><span style=\\'font-family:var(--font-display);font-style:italic;color:rgba(245,233,208,0.1);font-size:1.5rem;\\'>${escapeHtml(product.name)}</span></div>'">`;
                } else {
                    modalImg.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--deep-royal) 0%,var(--dark-bg) 100%);border-radius:12px;"><span style="font-family:var(--font-display);font-style:italic;color:rgba(245,233,208,0.1);font-size:1.5rem;">${escapeHtml(product.name)}</span></div>`;
                }
            }
            
            if (orderBtn) {
                const message = encodeURIComponent(
                    `Hi KJ's Fashion! 👋\n\nI'm interested in ordering:\n\n*Product:* ${product.name}\n*Category:* ${formatCategory(product.category)}\n*Price:* $${product.price}\n\nPlease let me know if it's available. Thank you!`
                );
                orderBtn.href = `https://wa.me/1234567890?text=${message}`;
                orderBtn.target = '_blank';
            }
            
            productModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
        } catch (error) {
            console.error('Error loading product:', error);
            window.KJApp && window.KJApp.showToast('Error loading product details', 'error');
        }
    }

    function closeProductModal() {
        if (!productModal) return;
        productModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (modalClose) modalClose.addEventListener('click', closeProductModal);
    if (productModal) productModal.addEventListener('click', function(e) { if (e.target === productModal) closeProductModal(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeProductModal(); });

    if (sortSelect) sortSelect.addEventListener('change', applyFilters);
    document.querySelectorAll('.filter-checkbox input').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });

    async function loadFeaturedProducts() {
        const featuredGrid = document.getElementById('featuredProducts');
        if (!featuredGrid) return;
        
        featuredGrid.innerHTML = '<div class="product-card skeleton"><div class="product-img skeleton-bg"></div><div class="product-info"><div class="skeleton-line short"></div><div class="skeleton-line"></div></div></div>'.repeat(4);
        
        try {
            await waitForFirebase();
            const products = await FirebaseDB.products.getFeatured();
            
            if (products.length === 0) {
                featuredGrid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                        <p style="color: var(--soft-silver); opacity: 0.6;">No featured products yet.</p>
                        <a href="shop.html" class="btn btn-outline" style="margin-top: 1rem;">Browse Shop</a>
                    </div>
                `;
                return;
            }
            
            featuredGrid.innerHTML = products.map(product => `
                <div class="product-card" data-id="${product.id}" onclick="window.ShopApp.openProductModal('${product.id}')">
                    <div class="product-img">
                        ${product.featured ? '<span class="product-badge">Featured</span>' : ''}
                        ${renderImage(product)}
                    </div>
                    <div class="product-info">
                        <span class="product-category">${formatCategory(product.category)}</span>
                        <h3 class="product-name">${escapeHtml(product.name)}</h3>
                        <p class="product-price">${window.KJApp ? window.KJApp.formatPrice(product.price) : '$' + product.price}</p>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading featured products:', error);
        }
    }

    if (productsGrid) loadProducts();
    else loadFeaturedProducts();

    window.ShopApp = {
        openProductModal,
        closeProductModal,
        applyFilters,
        clearFilters,
        goToPage
    };

})();