/**
 * Main Application Bootstrap
 * Initializes all core functionality and components
 */

class App {
  constructor() {
    this.isInitialized = false;
    this.components = {};
    this.services = {};
    
    // Bind methods
    this.init = this.init.bind(this);
    this.initializeComponents = this.initializeComponents.bind(this);
    this.initializeServices = this.initializeServices.bind(this);
    this.handleRouting = this.handleRouting.bind(this);
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.init);
    } else {
      this.init();
    }
  }

  /**
   * Initialize the application
   */
  async init() {
    if (this.isInitialized) return;
    
    console.log('🚀 Initializing Ecommerce App...');
    
    try {
      // Initialize services first
      await this.initializeServices();
      
      // Initialize UI components
      this.initializeComponents();
      
      // Set up routing
      this.handleRouting();
      
      // Set up global event listeners
      this.setupGlobalEventListeners();
      
      // Initialize page-specific functionality
      this.initializePageSpecific();
      
      this.isInitialized = true;
      
      console.log('✅ App initialized successfully');
      
      // Emit app ready event
      this.emitAppReadyEvent();
      
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
    }
  }

  /**
   * Initialize core services
   */
  async initializeServices() {
    console.log('📦 Initializing services...');
    
    // Initialize theme manager (already done in theme.js)
    if (window.themeManager) {
      this.services.theme = window.themeManager;
    }
    
    // Initialize storage service
    if (window.StorageService) {
      this.services.storage = new window.StorageService();
    }
    
    // Initialize product service
    if (window.ProductService) {
      this.services.product = new window.ProductService();
      await this.services.product.init();
    }
    
    // Initialize cart service
    if (window.CartService) {
      this.services.cart = new window.CartService();
      this.services.cart.init();
    }
    
    // Initialize deals service
    if (window.DealsService) {
      this.services.deals = new window.DealsService();
      await this.services.deals.init();
    }
    
    // Initialize recommendation service
    if (window.RecommendationService) {
      this.services.recommendation = new window.RecommendationService();
    }
    
    console.log('✅ Services initialized');
  }

  /**
   * Initialize UI components
   */
  initializeComponents() {
    console.log('🎨 Initializing UI components...');
    
    // Initialize search component
    const searchInput = document.querySelector('.header__search-input');
    const searchSuggestions = document.querySelector('.header__search-suggestions');
    
    if (searchInput && window.SearchComponent) {
      this.components.search = new window.SearchComponent(
        '.header__search-input',
        '.header__search-suggestions'
      );
    }
    
    // Initialize mobile navigation
    this.initializeMobileNavigation();
    
    // Initialize modals and drawers
    if (window.Modal) {
      this.components.modals = [];
      document.querySelectorAll('[data-modal]').forEach(trigger => {
        const modal = new window.Modal(trigger.getAttribute('data-modal'));
        this.components.modals.push(modal);
      });
    }
    
    // Initialize toast notifications
    if (window.ToastManager) {
      this.components.toast = new window.ToastManager();
    }
    
    // Initialize filters (on shop page)
    if (document.querySelector('.filters') && window.FilterComponent) {
      this.components.filters = new window.FilterComponent();
    }
    
    // Initialize product grid (on shop/home pages)
    if (document.querySelector('.pro-container') && window.ProductGrid) {
      this.components.productGrid = new window.ProductGrid('.pro-container');
    }
    
    console.log('✅ UI components initialized');
  }

  /**
   * Initialize mobile navigation
   */
  initializeMobileNavigation() {
    const menuToggle = document.querySelector('.header__menu-toggle');
    const nav = document.querySelector('.header__nav');
    const navClose = document.querySelector('.header__nav-close');
    const overlay = document.querySelector('.header__overlay');
    
    if (menuToggle && nav) {
      const toggleNav = (open) => {
        menuToggle.classList.toggle('active', open);
        nav.classList.toggle('active', open);
        if (overlay) overlay.classList.toggle('active', open);
        
        // Handle focus management
        if (open) {
          // Focus first nav item
          const firstNavLink = nav.querySelector('.header__nav-link');
          if (firstNavLink) {
            firstNavLink.focus();
          }
        } else {
          // Return focus to toggle button
          menuToggle.focus();
        }
        
        // Update ARIA
        menuToggle.setAttribute('aria-expanded', open.toString());
        
        // Prevent body scroll when nav is open
        document.body.style.overflow = open ? 'hidden' : '';
      };
      
      // Toggle button click
      menuToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = nav.classList.contains('active');
        toggleNav(!isOpen);
      });
      
      // Close button click
      if (navClose) {
        navClose.addEventListener('click', (e) => {
          e.preventDefault();
          toggleNav(false);
        });
      }
      
      // Overlay click
      if (overlay) {
        overlay.addEventListener('click', () => {
          toggleNav(false);
        });
      }
      
      // Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
          toggleNav(false);
        }
      });
      
      // Close nav on link click (mobile)
      nav.querySelectorAll('.header__nav-link').forEach(link => {
        link.addEventListener('click', () => {
          if (window.innerWidth <= 768) {
            toggleNav(false);
          }
        });
      });
    }
  }

  /**
   * Handle routing and page-specific logic
   */
  handleRouting() {
    const path = window.location.pathname;
    const page = this.getCurrentPage(path);
    
    console.log(`📍 Current page: ${page}`);
    
    // Add page class to body
    document.body.className = document.body.className.replace(/page-\w+/g, '');
    document.body.classList.add(`page-${page}`);
    
    // Update active navigation
    this.updateActiveNavigation(page);
    
    // Handle URL parameters
    this.handleURLParameters();
  }

  /**
   * Get current page from path
   */
  getCurrentPage(path) {
    const filename = path.split('/').pop().split('.')[0] || 'index';
    
    const pageMap = {
      'index': 'home',
      'shop': 'shop',
      'sproduct': 'product',
      'cart': 'cart',
      'checkout': 'checkout',
      'about': 'about',
      'blog': 'blog',
      'contact': 'contact',
      'Reward': 'rewards',
      'dashboard': 'dashboard',
      'admin': 'admin'
    };
    
    return pageMap[filename] || filename;
  }

  /**
   * Update active navigation link
   */
  updateActiveNavigation(currentPage) {
    const navLinks = document.querySelectorAll('.header__nav-link');
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      
      const href = link.getAttribute('href');
      if (href) {
        const linkPage = this.getCurrentPage(href);
        if (linkPage === currentPage) {
          link.classList.add('active');
        }
      }
    });
  }

  /**
   * Handle URL parameters (search, filters, etc.)
   */
  handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Handle search parameter
    const searchQuery = urlParams.get('search');
    if (searchQuery && this.components.search) {
      this.components.search.searchInput.value = searchQuery;
    }
    
    // Handle filter parameters
    const category = urlParams.get('category');
    const priceRange = urlParams.get('price');
    const sortBy = urlParams.get('sort');
    
    if (this.components.filters && (category || priceRange || sortBy)) {
      // Apply filters based on URL params
      this.components.filters.applyFromURL({
        category,
        priceRange,
        sortBy
      });
    }
  }

  /**
   * Set up global event listeners
   */
  setupGlobalEventListeners() {
    // Theme change events
    document.addEventListener('themechange', (e) => {
      console.log('Theme changed to:', e.detail.theme);
    });
    
    // Cart update events
    document.addEventListener('cartupdate', (e) => {
      this.updateCartIndicators();
    });
    
    // Search selection events
    document.addEventListener('searchselection', (e) => {
      console.log('Search selection:', e.detail);
    });
    
    // Handle back button
    window.addEventListener('popstate', () => {
      this.handleRouting();
    });
    
    // Handle scroll for header behavior
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    const updateHeaderOnScroll = () => {
      const header = document.querySelector('.header');
      if (!header) return;
      
      const currentScrollY = window.scrollY;
      
      // Add scrolled class for shadow
      header.classList.toggle('scrolled', currentScrollY > 10);
      
      // Hide/show header on scroll (optional)
      if (Math.abs(currentScrollY - lastScrollY) > 10) {
        header.classList.toggle('hidden', 
          currentScrollY > lastScrollY && currentScrollY > 100
        );
      }
      
      lastScrollY = currentScrollY;
      ticking = false;
    };
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateHeaderOnScroll);
        ticking = true;
      }
    });
    
    // Handle resize events
    window.addEventListener('resize', () => {
      // Close mobile nav on resize to desktop
      if (window.innerWidth > 768) {
        const nav = document.querySelector('.header__nav');
        const overlay = document.querySelector('.header__overlay');
        if (nav && nav.classList.contains('active')) {
          nav.classList.remove('active');
          if (overlay) overlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    });
  }

  /**
   * Initialize page-specific functionality
   */
  initializePageSpecific() {
    const page = document.body.classList.contains('page-home') ? 'home' :
                 document.body.classList.contains('page-shop') ? 'shop' :
                 document.body.classList.contains('page-product') ? 'product' :
                 document.body.classList.contains('page-cart') ? 'cart' : null;
    
    switch (page) {
      case 'home':
        this.initializeHomePage();
        break;
      case 'shop':
        this.initializeShopPage();
        break;
      case 'product':
        this.initializeProductPage();
        break;
      case 'cart':
        this.initializeCartPage();
        break;
    }
  }

  /**
   * Initialize home page specific functionality
   */
  initializeHomePage() {
    console.log('🏠 Initializing home page...');
    
    // Initialize hero animations
    this.animateHeroSection();
    
    // Load featured products
    if (this.services.product) {
      this.loadFeaturedProducts();
    }
    
    // Load weekly deals
    if (this.services.deals) {
      this.loadWeeklyDeals();
    }
    
    // Load personalized recommendations
    if (this.services.recommendation) {
      this.loadRecommendations();
    }
  }

  /**
   * Initialize shop page specific functionality
   */
  initializeShopPage() {
    console.log('🛍️ Initializing shop page...');
    
    // Initialize filters and sorting
    // This will be handled by FilterComponent
  }

  /**
   * Initialize product page specific functionality
   */
  initializeProductPage() {
    console.log('📦 Initializing product page...');
    
    // Initialize product gallery
    // Initialize related products
    // This will be handled by ProductDetail component
  }

  /**
   * Initialize cart page specific functionality
   */
  initializeCartPage() {
    console.log('🛒 Initializing cart page...');
    
    // Load cart items
    if (this.services.cart) {
      this.services.cart.render();
    }
  }

  /**
   * Update cart indicators throughout the site
   */
  updateCartIndicators() {
    const cartBadges = document.querySelectorAll('.header__cart-badge');
    const cartCount = this.services.cart ? this.services.cart.getItemCount() : 0;
    
    cartBadges.forEach(badge => {
      badge.textContent = cartCount;
      badge.style.display = cartCount > 0 ? 'flex' : 'none';
    });
  }

  /**
   * Animate hero section on home page
   */
  animateHeroSection() {
    const hero = document.querySelector('#hero');
    if (!hero) return;
    
    // Add entrance animation
    hero.style.opacity = '0';
    hero.style.transform = 'translateY(20px)';
    
    requestAnimationFrame(() => {
      hero.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      hero.style.opacity = '1';
      hero.style.transform = 'translateY(0)';
    });
  }

  /**
   * Load featured products
   */
  async loadFeaturedProducts() {
    try {
      const products = await this.services.product.getFeaturedProducts();
      // This will be handled by ProductGrid component
    } catch (error) {
      console.error('Failed to load featured products:', error);
    }
  }

  /**
   * Load weekly deals
   */
  async loadWeeklyDeals() {
    try {
      const deals = await this.services.deals.getWeeklyDeals();
      // Display deals in UI
    } catch (error) {
      console.error('Failed to load weekly deals:', error);
    }
  }

  /**
   * Load personalized recommendations
   */
  loadRecommendations() {
    try {
      const recommendations = this.services.recommendation.getRecommendations();
      // Display recommendations in UI
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  }

  /**
   * Emit app ready event
   */
  emitAppReadyEvent() {
    const event = new CustomEvent('appready', {
      detail: {
        app: this,
        services: this.services,
        components: this.components
      }
    });
    
    document.dispatchEvent(event);
  }

  /**
   * Get service by name
   */
  getService(name) {
    return this.services[name];
  }

  /**
   * Get component by name
   */
  getComponent(name) {
    return this.components[name];
  }
}

// Initialize the app
const app = new App();

// Make app globally available
window.app = app;

// Export for ES modules
export default App;