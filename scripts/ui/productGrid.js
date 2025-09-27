/**
 * Product Grid Component
 * Handles displaying products in a responsive grid with loading states
 */

class ProductGrid {
  constructor(containerSelector, options = {}) {
    this.container = document.querySelector(containerSelector);
    
    if (!this.container) {
      console.warn('Product grid container not found:', containerSelector);
      return;
    }
    
    this.options = {
      showQuickActions: true,
      showColorOptions: true,
      loadingCount: 8,
      cardVariant: 'default', // 'default', 'compact', 'wide'
      lazyLoad: true,
      ...options
    };
    
    this.products = [];
    this.isLoading = false;
    
    // Bind methods
    this.render = this.render.bind(this);
    this.renderProduct = this.renderProduct.bind(this);
    this.handleAddToCart = this.handleAddToCart.bind(this);
    this.handleQuickView = this.handleQuickView.bind(this);
    this.handleWishlist = this.handleWishlist.bind(this);
    
    this.init();
  }

  /**
   * Initialize the product grid
   */
  init() {
    // Add loading state initially
    this.showLoading();
    
    // Listen for product service ready
    document.addEventListener('appready', () => {
      this.loadProducts();
    });
    
    // If app is already ready, load immediately
    if (window.app && window.app.isInitialized) {
      this.loadProducts();
    }
  }

  /**
   * Load products based on container's data attributes
   */
  async loadProducts() {
    try {
      const productService = window.app?.getService('product');
      if (!productService) {
        console.warn('Product service not available');
        return;
      }
      
      // Check container data attributes for specific product types
      const productType = this.container.dataset.productType || 'all';
      const category = this.container.dataset.category;
      const limit = parseInt(this.container.dataset.limit) || 8;
      
      let products = [];
      
      switch (productType) {
        case 'featured':
          products = productService.getFeaturedProducts(limit);
          break;
        case 'new-arrivals':
          products = productService.getNewArrivals(limit);
          break;
        case 'category':
          products = category ? productService.getProductsByCategory(category) : [];
          break;
        default:
          products = productService.getProducts().slice(0, limit);
      }
      
      this.products = products;
      this.render();
      
    } catch (error) {
      console.error('Failed to load products:', error);
      this.showError();
    }
  }

  /**
   * Render the product grid
   */
  render() {
    if (this.isLoading) {
      this.showLoading();
      return;
    }
    
    if (this.products.length === 0) {
      this.showEmpty();
      return;
    }
    
    const productsHTML = this.products.map(product => this.renderProduct(product)).join('');
    this.container.innerHTML = productsHTML;
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize intersection observer for lazy loading
    if (this.options.lazyLoad) {
      this.initializeLazyLoading();
    }
  }

  /**
   * Render a single product card
   */
  renderProduct(product) {
    const discountedPrice = product.discountPercentage > 0 
      ? product.price * (1 - product.discountPercentage / 100)
      : product.price;
    
    const isOutOfStock = product.stock <= 0;
    const isNew = this.isNewProduct(product);
    const hasDiscount = product.discountPercentage > 0;
    
    // Generate star rating
    const starsHTML = this.generateStarsHTML(product.rating);
    
    // Generate color options
    const colorsHTML = this.options.showColorOptions 
      ? this.generateColorsHTML(product.colorOptions)
      : '';
    
    // Generate quick actions
    const quickActionsHTML = this.options.showQuickActions 
      ? this.generateQuickActionsHTML(product)
      : '';
    
    // Generate badges
    const badgesHTML = this.generateBadgesHTML(product, isNew, hasDiscount);
    
    return `
      <article class="product-card ${this.options.cardVariant ? `product-card--${this.options.cardVariant}` : ''} ${isOutOfStock ? 'product-card--out-of-stock' : ''}" 
               data-product-id="${product.id}"
               tabindex="0"
               role="button"
               aria-label="View ${product.title}">
        
        <div class="product-card__image-container">
          <img 
            src="${product.thumbnail}" 
            alt="${product.title}"
            class="product-card__image"
            loading="${this.options.lazyLoad ? 'lazy' : 'eager'}"
            onerror="this.src='./Build-and-Deploy-Ecommerce-Website-main/img/products/placeholder.jpg'"
          >
          
          ${badgesHTML}
          ${quickActionsHTML}
        </div>
        
        <div class="product-card__content">
          <div class="product-card__brand">${product.brand}</div>
          
          <h3 class="product-card__title">${product.title}</h3>
          
          <div class="product-card__rating">
            <div class="product-card__stars">
              ${starsHTML}
            </div>
            <span class="product-card__rating-value">(${product.rating.toFixed(1)})</span>
          </div>
          
          ${colorsHTML}
          
          <div class="product-card__price-container">
            <span class="product-card__price">
              $${discountedPrice.toFixed(2)}
            </span>
            ${hasDiscount ? `
              <span class="product-card__price--original">$${product.price.toFixed(2)}</span>
              <span class="product-card__discount">-${product.discountPercentage}%</span>
            ` : ''}
          </div>
          
          <button 
            class="product-card__add-to-cart btn btn-primary"
            data-product-id="${product.id}"
            data-action="add-to-cart"
            ${isOutOfStock ? 'disabled' : ''}
            aria-label="Add ${product.title} to cart"
          >
            <i class="fas fa-shopping-cart icon-left" aria-hidden="true"></i>
            ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </article>
    `;
  }

  /**
   * Generate star rating HTML
   */
  generateStarsHTML(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<i class="fas fa-star product-card__star" aria-hidden="true"></i>';
    }
    
    // Half star
    if (hasHalfStar) {
      starsHTML += '<i class="fas fa-star-half-alt product-card__star" aria-hidden="true"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<i class="far fa-star product-card__star product-card__star--empty" aria-hidden="true"></i>';
    }
    
    return starsHTML;
  }

  /**
   * Generate color options HTML
   */
  generateColorsHTML(colorOptions) {
    if (!colorOptions || colorOptions.length <= 1) return '';
    
    const colorsHTML = colorOptions.slice(0, 4).map(color => {
      const colorClass = color.toLowerCase().replace(/[^a-z0-9]/g, '');
      return `
        <button 
          class="product-card__color product-card__color--${colorClass}" 
          title="${color}"
          aria-label="Select ${color} color"
        ></button>
      `;
    }).join('');
    
    return `<div class="product-card__colors">${colorsHTML}</div>`;
  }

  /**
   * Generate quick actions HTML
   */
  generateQuickActionsHTML(product) {
    return `
      <div class="product-card__actions">
        <button 
          class="product-card__action-btn" 
          data-action="quick-view"
          data-product-id="${product.id}"
          title="Quick View"
          aria-label="Quick view ${product.title}"
        >
          <i class="fas fa-eye" aria-hidden="true"></i>
        </button>
        <button 
          class="product-card__action-btn" 
          data-action="wishlist"
          data-product-id="${product.id}"
          title="Add to Wishlist"
          aria-label="Add ${product.title} to wishlist"
        >
          <i class="far fa-heart" aria-hidden="true"></i>
        </button>
        <button 
          class="product-card__action-btn" 
          data-action="compare"
          data-product-id="${product.id}"
          title="Compare"
          aria-label="Compare ${product.title}"
        >
          <i class="fas fa-balance-scale" aria-hidden="true"></i>
        </button>
      </div>
    `;
  }

  /**
   * Generate badges HTML
   */
  generateBadgesHTML(product, isNew, hasDiscount) {
    let badgesHTML = '';
    
    if (hasDiscount) {
      badgesHTML += `<span class="product-card__badge product-card__badge--discount">-${product.discountPercentage}%</span>`;
    }
    
    if (isNew) {
      badgesHTML += `<span class="product-card__badge product-card__badge--new">New</span>`;
    }
    
    if (product.stock <= 5 && product.stock > 0) {
      badgesHTML += `<span class="product-card__badge product-card__badge--sale">Limited Stock</span>`;
    }
    
    return badgesHTML ? `<div class="product-card__badges">${badgesHTML}</div>` : '';
  }

  /**
   * Check if product is new (mock logic)
   */
  isNewProduct(product) {
    // Mock logic - consider products with higher IDs as newer
    return parseInt(product.id) > 5;
  }

  /**
   * Set up event listeners for product interactions
   */
  setupEventListeners() {
    // Delegate event handling to container
    this.container.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      const productId = e.target.dataset.productId || 
                        e.target.closest('[data-product-id]')?.dataset.productId;
      
      if (!productId) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      switch (action) {
        case 'add-to-cart':
          this.handleAddToCart(productId, e.target);
          break;
        case 'quick-view':
          this.handleQuickView(productId);
          break;
        case 'wishlist':
          this.handleWishlist(productId, e.target);
          break;
        case 'compare':
          this.handleCompare(productId, e.target);
          break;
      }
    });
    
    // Handle card clicks for navigation
    this.container.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      if (card && !e.target.closest('button')) {
        const productId = card.dataset.productId;
        this.navigateToProduct(productId);
      }
    });
    
    // Handle keyboard navigation
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.product-card');
        if (card && !e.target.closest('button')) {
          e.preventDefault();
          const productId = card.dataset.productId;
          this.navigateToProduct(productId);
        }
      }
    });
  }

  /**
   * Handle add to cart action
   */
  handleAddToCart(productId, button) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    
    // Add loading state to button
    button.classList.add('btn-loading');
    button.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
      // Add to cart via cart service
      const cartService = window.app?.getService('cart');
      if (cartService) {
        cartService.addItem(product);
      }
      
      // Remove loading state
      button.classList.remove('btn-loading');
      button.disabled = false;
      
      // Show success feedback
      this.showAddToCartSuccess(product);
      
      // Emit cart update event
      document.dispatchEvent(new CustomEvent('cartupdate', {
        detail: { product, action: 'add' }
      }));
      
    }, 800);
  }

  /**
   * Handle quick view action
   */
  handleQuickView(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    
    // Emit quick view event
    document.dispatchEvent(new CustomEvent('quickview', {
      detail: { product }
    }));
  }

  /**
   * Handle wishlist action
   */
  handleWishlist(productId, button) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    
    // Toggle wishlist state
    const icon = button.querySelector('i');
    const isInWishlist = icon.classList.contains('fas');
    
    if (isInWishlist) {
      icon.classList.remove('fas');
      icon.classList.add('far');
      button.title = 'Add to Wishlist';
    } else {
      icon.classList.remove('far');
      icon.classList.add('fas');
      button.title = 'Remove from Wishlist';
    }
    
    // Emit wishlist event
    document.dispatchEvent(new CustomEvent('wishlistupdate', {
      detail: { product, action: isInWishlist ? 'remove' : 'add' }
    }));
  }

  /**
   * Handle compare action
   */
  handleCompare(productId, button) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    
    // Emit compare event
    document.dispatchEvent(new CustomEvent('compareupdate', {
      detail: { product, action: 'add' }
    }));
  }

  /**
   * Navigate to product detail page
   */
  navigateToProduct(productId) {
    window.location.href = `./Build-and-Deploy-Ecommerce-Website-main/sproduct.html?id=${productId}`;
  }

  /**
   * Show add to cart success feedback
   */
  showAddToCartSuccess(product) {
    // Create toast notification if toast manager is available
    if (window.app?.getComponent('toast')) {
      window.app.getComponent('toast').show({
        type: 'success',
        title: 'Added to Cart',
        message: `${product.title} has been added to your cart`,
        duration: 3000
      });
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.isLoading = true;
    const loadingHTML = Array.from({ length: this.options.loadingCount }, (_, i) => `
      <div class="product-card product-card--loading">
        <div class="product-card__image-container">
          <div class="product-card__image"></div>
        </div>
        <div class="product-card__content">
          <div class="product-card__brand">Loading...</div>
          <div class="product-card__title">Loading product title...</div>
          <div class="product-card__rating">★★★★★</div>
          <div class="product-card__price-container">
            <span class="product-card__price">$0.00</span>
          </div>
          <button class="product-card__add-to-cart">Add to Cart</button>
        </div>
      </div>
    `).join('');
    
    this.container.innerHTML = loadingHTML;
  }

  /**
   * Show empty state
   */
  showEmpty() {
    this.container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-box-open" style="font-size: 48px; color: var(--color-text-muted); margin-bottom: 16px;"></i>
        <h3>No products found</h3>
        <p>Try adjusting your search or filter criteria</p>
      </div>
    `;
  }

  /**
   * Show error state
   */
  showError() {
    this.container.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--color-error); margin-bottom: 16px;"></i>
        <h3>Unable to load products</h3>
        <p>Please try again later</p>
        <button class="btn btn-primary" onclick="location.reload()">Retry</button>
      </div>
    `;
  }

  /**
   * Initialize lazy loading with Intersection Observer
   */
  initializeLazyLoading() {
    if (!('IntersectionObserver' in window)) return;
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });
    
    // Observe all lazy images
    this.container.querySelectorAll('img[loading="lazy"]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  /**
   * Update products and re-render
   */
  updateProducts(products) {
    this.products = products;
    this.render();
  }

  /**
   * Get current products
   */
  getProducts() {
    return this.products;
  }
}

// Export for use in other modules
export default ProductGrid;
window.ProductGrid = ProductGrid;