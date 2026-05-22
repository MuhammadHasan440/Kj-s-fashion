// js/admin.js - FULLY UPDATED WITH BASE64 IMAGE UPLOAD
/* ============================================
   KJ'S FASHION — ADMIN DASHBOARD JAVASCRIPT
   Hardcoded Login & Firebase CRUD with Base64 Images
   ============================================ */

(function() {
    'use strict';

    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'kjfashion2024';
    const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    // DOM Elements
    const loginOverlay = document.getElementById('adminLoginOverlay');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const adminDashboard = document.getElementById('adminDashboard');
    const logoutBtn = document.getElementById('logoutBtn');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const adminSidebar = document.getElementById('adminSidebar');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const adminSections = document.querySelectorAll('.admin-section');
    
    // Product modal elements
    const productModal = document.getElementById('productModal');
    const addProductBtn = document.getElementById('addProductBtn');
    const productModalClose = document.getElementById('productModalClose');
    const cancelProductBtn = document.getElementById('cancelProductBtn');
    const productForm = document.getElementById('productForm');
    const modalTitle = document.getElementById('modalTitle');
    
    // Image upload elements
    const imageUploadArea = document.getElementById('imageUploadArea');
    const prodImageFile = document.getElementById('prodImageFile');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewImg = document.getElementById('previewImg');
    const removeImageBtn = document.getElementById('removeImage');
    const prodImageBase64 = document.getElementById('prodImageBase64');
    const uploadHint = document.getElementById('uploadHint');

    let editingProductId = null;
    let currentBase64Image = null;

    // ==========================================
    // SESSION MANAGEMENT
    // ==========================================
    function checkSession() {
        const isLoggedIn = sessionStorage.getItem('kj_admin_logged_in') === 'true';
        if (isLoggedIn) {
            showDashboard();
            loadDashboardData();
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('adminUsername').value.trim();
            const password = document.getElementById('adminPassword').value;
            
            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                sessionStorage.setItem('kj_admin_logged_in', 'true');
                loginError.classList.remove('show');
                showDashboard();
                loadDashboardData();
            } else {
                loginError.classList.add('show');
                document.getElementById('adminPassword').value = '';
                loginForm.style.animation = 'shake 0.5s ease';
                setTimeout(() => loginForm.style.animation = '', 500);
            }
        });
    }

    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `@keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-10px); } 40%, 80% { transform: translateX(10px); } }`;
    document.head.appendChild(shakeStyle);

    function showDashboard() {
        if (loginOverlay) loginOverlay.classList.add('hidden');
        if (adminDashboard) adminDashboard.style.display = 'flex';
        document.body.style.overflow = '';
    }

    function hideDashboard() {
        sessionStorage.removeItem('kj_admin_logged_in');
        if (loginOverlay) loginOverlay.classList.remove('hidden');
        if (adminDashboard) adminDashboard.style.display = 'none';
        if (loginForm) loginForm.reset();
    }

    if (logoutBtn) logoutBtn.addEventListener('click', hideDashboard);

    // ==========================================
    // SIDEBAR NAVIGATION
    // ==========================================
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            adminSections.forEach(s => s.classList.remove('active'));
            const targetSection = document.getElementById(`section-${section}`);
            if (targetSection) targetSection.classList.add('active');
            if (section === 'products') loadProductsTable();
            if (section === 'orders') loadOrdersTable();
            if (section === 'dashboard') loadDashboardData();
            if (window.innerWidth <= 1024) adminSidebar.classList.remove('active');
        });
    });

    if (sidebarToggle && adminSidebar) {
        sidebarToggle.addEventListener('click', () => adminSidebar.classList.toggle('active'));
    }

    // ==========================================
    // BASE64 IMAGE UPLOAD HANDLING
    // ==========================================
    
    function initImageUpload() {
        if (!imageUploadArea || !prodImageFile) return;

        // Click to upload
        imageUploadArea.addEventListener('click', (e) => {
            if (e.target.closest('.remove-image')) return;
            prodImageFile.click();
        });

        // File input change
        prodImageFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handleImageFile(file);
        });

        // Drag and drop
        imageUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            imageUploadArea.classList.add('drag-over');
        });

        imageUploadArea.addEventListener('dragleave', () => {
            imageUploadArea.classList.remove('drag-over');
        });

        imageUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            imageUploadArea.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) handleImageFile(file);
        });

        // Remove image
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                clearImage();
            });
        }
    }

    function handleImageFile(file) {
        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            showUploadError('Invalid file type. Please use PNG, JPG, WEBP, or GIF.');
            return;
        }

        // Validate file size
        if (file.size > MAX_IMAGE_SIZE) {
            showUploadError('File too large. Maximum size is 2MB.');
            return;
        }

        // Show loading
        imageUploadArea.classList.add('uploading');

        const reader = new FileReader();
        
        reader.onload = function(e) {
            const base64 = e.target.result;
            
            // Validate it's a valid image by creating an Image object
            const img = new Image();
            img.onload = function() {
                // Check dimensions
                if (this.width < 100 || this.height < 100) {
                    showUploadError('Image too small. Minimum dimensions: 100x100px.');
                    imageUploadArea.classList.remove('uploading');
                    return;
                }

                // Success - store and display
                currentBase64Image = base64;
                if (prodImageBase64) prodImageBase64.value = base64;
                
                // Show preview
                previewImg.src = base64;
                uploadPlaceholder.style.display = 'none';
                uploadPreview.style.display = 'block';
                imageUploadArea.classList.remove('uploading');
                
                // Clear any error
                uploadHint.classList.remove('error');
                uploadHint.textContent = `Image loaded: ${formatFileSize(file.size)} · ${this.width}x${this.height}px`;
            };
            
            img.onerror = function() {
                showUploadError('Invalid image file.');
                imageUploadArea.classList.remove('uploading');
            };
            
            img.src = base64;
        };

        reader.onerror = function() {
            showUploadError('Error reading file.');
            imageUploadArea.classList.remove('uploading');
        };

        reader.readAsDataURL(file);
    }

    function clearImage() {
        currentBase64Image = null;
        if (prodImageBase64) prodImageBase64.value = '';
        if (prodImageFile) prodImageFile.value = '';
        if (previewImg) previewImg.src = '';
        if (uploadPlaceholder) uploadPlaceholder.style.display = 'flex';
        if (uploadPreview) uploadPreview.style.display = 'none';
        if (uploadHint) {
            uploadHint.classList.remove('error');
            uploadHint.textContent = 'Maximum file size: 2MB. Recommended: 800x1000px';
        }
    }

    function showUploadError(message) {
        if (uploadHint) {
            uploadHint.textContent = message;
            uploadHint.classList.add('error');
        }
        imageUploadArea.classList.remove('uploading');
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // ==========================================
    // PRODUCT MODAL
    // ==========================================
    function openProductModal(mode = 'add', product = null) {
        if (!productModal) return;
        
        editingProductId = product ? product.id : null;
        if (modalTitle) modalTitle.textContent = mode === 'edit' ? 'Edit Product' : 'Add Product';
        
        if (productForm) productForm.reset();
        clearImage();
        
        if (product && mode === 'edit') {
            document.getElementById('prodName').value = product.name || '';
            document.getElementById('prodPrice').value = product.price || '';
            document.getElementById('prodCategory').value = product.category || '';
            document.getElementById('prodSubcategory').value = product.subcategory || '';
            document.getElementById('prodDescription').value = product.description || '';
            document.getElementById('prodFeatured').checked = product.featured || false;
            
            // Load existing image
            if (product.image) {
                currentBase64Image = product.image;
                if (prodImageBase64) prodImageBase64.value = product.image;
                previewImg.src = product.image;
                uploadPlaceholder.style.display = 'none';
                uploadPreview.style.display = 'block';
                uploadHint.textContent = 'Existing image loaded. Upload new to replace.';
            }
            
            // Show/hide subcategory
            const subcategoryGroup = document.getElementById('subcategoryGroup');
            subcategoryGroup.style.display = product.category === 'accessories' ? 'block' : 'none';
        } else {
            const subcategoryGroup = document.getElementById('subcategoryGroup');
            subcategoryGroup.style.display = 'none';
        }
        
        productModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeProductModal() {
        if (!productModal) return;
        productModal.classList.remove('active');
        document.body.style.overflow = '';
        editingProductId = null;
        clearImage();
    }

    if (addProductBtn) addProductBtn.addEventListener('click', () => openProductModal('add'));
    if (productModalClose) productModalClose.addEventListener('click', closeProductModal);
    if (cancelProductBtn) cancelProductBtn.addEventListener('click', closeProductModal);
    
    if (productModal) {
        productModal.addEventListener('click', function(e) {
            if (e.target === productModal) closeProductModal();
        });
    }

    // ==========================================
    // SAVE PRODUCT
    // ==========================================
    if (productForm) {
        productForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const btn = document.getElementById('saveProductBtn');
            const originalText = btn.textContent;
            btn.textContent = 'Saving...';
            btn.disabled = true;
            
            const productData = {
                name: document.getElementById('prodName').value.trim(),
                price: parseFloat(document.getElementById('prodPrice').value),
                category: document.getElementById('prodCategory').value,
                subcategory: document.getElementById('prodSubcategory').value || null,
                description: document.getElementById('prodDescription').value.trim(),
                image: currentBase64Image || null,
                featured: document.getElementById('prodFeatured').checked
            };
            
            try {
                await waitForFirebase();
                
                if (editingProductId) {
                    await FirebaseDB.products.update(editingProductId, productData);
                    window.KJApp && window.KJApp.showToast('Product updated successfully!', 'success');
                } else {
                    await FirebaseDB.products.add(productData);
                    window.KJApp && window.KJApp.showToast('Product added successfully!', 'success');
                }
                
                closeProductModal();
                loadProductsTable();
                loadDashboardData();
                
            } catch (error) {
                console.error('Error saving product:', error);
                window.KJApp && window.KJApp.showToast('Error saving product. Please try again.', 'error');
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    }

    // ==========================================
    // EDIT & DELETE PRODUCT
    // ==========================================
    async function editProduct(productId) {
        try {
            await waitForFirebase();
            const product = await FirebaseDB.products.getById(productId);
            if (product) {
                openProductModal('edit', product);
            } else {
                window.KJApp && window.KJApp.showToast('Product not found', 'error');
            }
        } catch (error) {
            console.error('Error loading product for edit:', error);
            window.KJApp && window.KJApp.showToast('Error loading product', 'error');
        }
    }

    async function deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
        
        try {
            await waitForFirebase();
            await FirebaseDB.products.delete(productId);
            window.KJApp && window.KJApp.showToast('Product deleted successfully!', 'success');
            loadProductsTable();
            loadDashboardData();
        } catch (error) {
            console.error('Error deleting product:', error);
            window.KJApp && window.KJApp.showToast('Error deleting product', 'error');
        }
    }

    // ==========================================
    // SUBCATEGORY TOGGLE
    // ==========================================
    const prodCategory = document.getElementById('prodCategory');
    if (prodCategory) {
        prodCategory.addEventListener('change', function() {
            const subcategoryGroup = document.getElementById('subcategoryGroup');
            subcategoryGroup.style.display = this.value === 'accessories' ? 'block' : 'none';
            if (this.value !== 'accessories') {
                document.getElementById('prodSubcategory').value = '';
            }
        });
    }

    // ==========================================
    // DASHBOARD DATA
    // ==========================================
    async function loadDashboardData() {
        try {
            await waitForFirebase();
            const stats = await FirebaseDB.stats.getCounts();
            
            document.getElementById('totalProducts').textContent = stats.products;
            document.getElementById('totalOrders').textContent = stats.orders;
            document.getElementById('totalRevenue').textContent = '$' + stats.revenue.toLocaleString();
            document.getElementById('totalCustomers').textContent = stats.customers;
            
            const products = await FirebaseDB.products.getAll();
            const recentProducts = products.slice(0, 5);
            const recentList = document.getElementById('recentProducts');
            
            if (recentList) {
                if (recentProducts.length === 0) {
                    recentList.innerHTML = '<p class="empty-state">No products yet. Add your first product.</p>';
                } else {
                    recentList.innerHTML = recentProducts.map(p => `
                        <div class="recent-item">
                            <div class="recent-thumb">
                                ${p.image ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=\\'color:rgba(201,214,234,0.2);font-size:0.6rem;\\'>No Img</span>'">` : '<span style="color:rgba(201,214,234,0.2);font-size:0.6rem;">No Img</span>'}
                            </div>
                            <div class="recent-info">
                                <p class="recent-name">${escapeHtml(p.name)}</p>
                                <p class="recent-cat">${formatCategory(p.category)}</p>
                            </div>
                            <span class="recent-price">$${p.price}</span>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    // ==========================================
    // PRODUCTS TABLE
    // ==========================================
    async function loadProductsTable() {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;"><span class="loading-spinner"></span> Loading...</td></tr>';
        
        try {
            await waitForFirebase();
            const products = await FirebaseDB.products.getAll();
            
            if (products.length === 0) {
                tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No products found. Click "Add Product" to create one.</td></tr>';
                return;
            }
            
            tbody.innerHTML = products.map(product => `
                <tr>
                    <td>
                        ${product.image 
                            ? `<img src="${product.image}" class="product-thumb" alt="${product.name}" onerror="this.onerror=null;this.src='';this.style.background='var(--deep-royal)';this.style.display='flex';this.style.alignItems='center';this.style.justifyContent='center';this.innerHTML='<span style=\\'color:rgba(201,214,234,0.3);font-size:0.6rem;\\'>No Img</span>';">`
                            : `<div class="product-thumb" style="display:flex;align-items:center;justify-content:center;"><span style="color:rgba(201,214,234,0.3);font-size:0.6rem;">No Img</span></div>`
                        }
                    </td>
                    <td class="product-name-cell">${escapeHtml(product.name)}</td>
                    <td>${formatCategory(product.category)}${product.subcategory ? ' / ' + formatCategory(product.subcategory) : ''}</td>
                    <td>$${product.price}</td>
                    <td><span class="status-badge status-active">Active</span></td>
                    <td>
                        <div class="table-actions">
                            <button class="action-btn" onclick="window.AdminApp.editProduct('${product.id}')" title="Edit">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="action-btn delete" onclick="window.AdminApp.deleteProduct('${product.id}')" title="Delete">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
            
        } catch (error) {
            console.error('Error loading products:', error);
            tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Error loading products. Please refresh.</td></tr>';
        }
    }

    // ==========================================
    // ORDERS TABLE
    // ==========================================
    async function loadOrdersTable() {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;"><span class="loading-spinner"></span> Loading...</td></tr>';
        
        try {
            await waitForFirebase();
            const orders = await FirebaseDB.orders.getAll();
            
            if (orders.length === 0) {
                tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No orders yet. Orders will appear here when customers place them via WhatsApp.</td></tr>';
                return;
            }
            
            tbody.innerHTML = orders.map(order => {
                const date = order.createdAt ? new Date(order.createdAt.toMillis()).toLocaleDateString() : 'N/A';
                return `
                    <tr>
                        <td>#${order.id.slice(-6).toUpperCase()}</td>
                        <td>${escapeHtml(order.customerName || 'N/A')}</td>
                        <td>${escapeHtml(order.productName || 'N/A')}</td>
                        <td>$${order.amount || 0}</td>
                        <td>${date}</td>
                        <td><span class="status-badge status-${order.status || 'pending'}">${order.status || 'Pending'}</span></td>
                    </tr>
                `;
            }).join('');
            
        } catch (error) {
            console.error('Error loading orders:', error);
            tbody.innerHTML = '<tr class="empty-row"><td colspan="6">Error loading orders. Please refresh.</td></tr>';
        }
    }

    // ==========================================
    // SEARCH
    // ==========================================
    const productSearch = document.getElementById('productSearch');
    if (productSearch) {
        productSearch.addEventListener('input', window.KJApp ? window.KJApp.debounce(async function() {
            const query = this.value.toLowerCase().trim();
            const tbody = document.getElementById('productsTableBody');
            if (!tbody) return;
            
            try {
                await waitForFirebase();
                const products = await FirebaseDB.products.getAll();
                const filtered = products.filter(p => 
                    p.name.toLowerCase().includes(query) || 
                    p.category.toLowerCase().includes(query)
                );
                
                if (filtered.length === 0) {
                    tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No products match your search.</td></tr>';
                    return;
                }
                
                tbody.innerHTML = filtered.map(product => `
                    <tr>
                        <td>
                            ${product.image 
                                ? `<img src="${product.image}" class="product-thumb" alt="${product.name}" onerror="this.onerror=null;this.src='';this.style.background='var(--deep-royal)';this.style.display='flex';this.style.alignItems='center';this.style.justifyContent='center';this.innerHTML='<span style=\\'color:rgba(201,214,234,0.3);font-size:0.6rem;\\'>No Img</span>';">`
                                : `<div class="product-thumb" style="display:flex;align-items:center;justify-content:center;"><span style="color:rgba(201,214,234,0.3);font-size:0.6rem;">No Img</span></div>`
                            }
                        </td>
                        <td class="product-name-cell">${escapeHtml(product.name)}</td>
                        <td>${formatCategory(product.category)}${product.subcategory ? ' / ' + formatCategory(product.subcategory) : ''}</td>
                        <td>$${product.price}</td>
                        <td><span class="status-badge status-active">Active</span></td>
                        <td>
                            <div class="table-actions">
                                <button class="action-btn" onclick="window.AdminApp.editProduct('${product.id}')" title="Edit">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </button>
                                <button class="action-btn delete" onclick="window.AdminApp.deleteProduct('${product.id}')" title="Delete">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                
            } catch (error) {
                console.error('Error searching products:', error);
            }
        }, 300) : null);
    }

    // ==========================================
    // SETTINGS
    // ==========================================
    const storeSettingsForm = document.getElementById('storeSettingsForm');
    if (storeSettingsForm) {
        storeSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            window.KJApp && window.KJApp.showToast('Settings saved!', 'success');
        });
    }

    // ==========================================
    // HELPERS
    // ==========================================
    function waitForFirebase() {
        return new Promise((resolve) => {
            const check = () => {
                if (typeof FirebaseDB !== 'undefined') {
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
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

    // ==========================================
    // INITIALIZE
    // ==========================================
    initImageUpload();
    checkSession();

    // ==========================================
    // EXPOSE TO GLOBAL
    // ==========================================
    window.AdminApp = {
        editProduct,
        deleteProduct,
        openProductModal,
        closeProductModal
    };

})();