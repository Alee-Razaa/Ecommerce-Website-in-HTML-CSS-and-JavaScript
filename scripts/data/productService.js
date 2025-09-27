/**
 * Product Service - Handles product data from multiple sources with caching
 * Supports DummyJSON, Fake Store API, and local fallback
 */

class ProductService {
  constructor() {
    this.products = [];
    this.categories = [];
    this.cache = {
      products: null,
      categories: null,
      lastUpdated: null,
      version: '1.0'
    };
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // API configurations
    this.apis = {
      dummyjson: {
        baseUrl: 'https://dummyjson.com',
        endpoints: {
          products: '/products',
          categories: '/products/categories',
          search: '/products/search'
        }
      },
      fakestore: {
        baseUrl: 'https://fakestoreapi.com',
        endpoints: {
          products: '/products',
          categories: '/products/categories'
        }
      },
      local: {
        baseUrl: './data',
        endpoints: {
          products: '/products.json'
        }
      }
    };
    
    this.currentApi = 'local'; // Start with local, fallback chain: dummyjson -> fakestore -> local
  }

  /**
   * Initialize the product service
   */
  async init() {
    console.log('🛍️ Initializing Product Service...');
    
    try {
      // Try to load from cache first
      await this.loadFromCache();
      
      // If cache is empty or expired, fetch fresh data
      if (!this.isCacheValid()) {
        await this.fetchProducts();
      }
      
      console.log('✅ Product Service initialized', {
        productsCount: this.products.length,
        categoriesCount: this.categories.length,
        source: this.currentApi
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize Product Service:', error);
      // Fallback to empty arrays to prevent crashes
      this.products = [];
      this.categories = [];
    }
  }

  /**
   * Fetch products from available APIs with fallback chain
   */
  async fetchProducts() {
    const apiOrder = ['dummyjson', 'fakestore', 'local'];
    
    for (const apiName of apiOrder) {
      try {
        console.log(`🔄 Trying to fetch products from ${apiName}...`);
        
        const data = await this.fetchFromApi(apiName);
        if (data && data.products && data.products.length > 0) {
          this.products = this.normalizeProducts(data.products, apiName);
          this.categories = data.categories || this.extractCategories(this.products);
          this.currentApi = apiName;
          
          // Cache the successful result
          await this.saveToCache();
          
          console.log(`✅ Successfully loaded ${this.products.length} products from ${apiName}`);
          return;
        }
      } catch (error) {
        console.warn(`⚠️ Failed to fetch from ${apiName}:`, error.message);
        continue;
      }
    }
    
    throw new Error('All API sources failed');
  }

  /**
   * Fetch data from a specific API
   */
  async fetchFromApi(apiName) {
    const api = this.apis[apiName];
    if (!api) throw new Error(`Unknown API: ${apiName}`);
    
    switch (apiName) {
      case 'dummyjson':
        return await this.fetchFromDummyJSON(api);
      case 'fakestore':
        return await this.fetchFromFakeStore(api);
      case 'local':
        return await this.fetchFromLocal(api);
      default:
        throw new Error(`Unsupported API: ${apiName}`);
    }
  }

  /**
   * Fetch from DummyJSON API
   */
  async fetchFromDummyJSON(api) {
    const [productsResponse, categoriesResponse] = await Promise.all([
      fetch(`${api.baseUrl}${api.endpoints.products}?limit=50`),
      fetch(`${api.baseUrl}${api.endpoints.categories}`)
    ]);
    
    if (!productsResponse.ok) throw new Error(`HTTP ${productsResponse.status}`);
    
    const products = await productsResponse.json();
    const categories = categoriesResponse.ok ? await categoriesResponse.json() : [];
    
    return {
      products: products.products || products,
      categories: categories
    };
  }

  /**
   * Fetch from Fake Store API
   */
  async fetchFromFakeStore(api) {
    const [productsResponse, categoriesResponse] = await Promise.all([
      fetch(`${api.baseUrl}${api.endpoints.products}`),
      fetch(`${api.baseUrl}${api.endpoints.categories}`)
    ]);
    
    if (!productsResponse.ok) throw new Error(`HTTP ${productsResponse.status}`);
    
    const products = await productsResponse.json();
    const categories = categoriesResponse.ok ? await categoriesResponse.json() : [];
    
    return { products, categories };
  }

  /**
   * Fetch from local JSON files
   */
  async fetchFromLocal(api) {
    const response = await fetch(`${api.baseUrl}${api.endpoints.products}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    return {
      products: data.products || [],
      categories: data.categories || []
    };
  }

  /**
   * Normalize products from different APIs to a consistent format
   */
  normalizeProducts(products, source) {
    return products.map(product => {
      // Base normalized product structure
      const normalized = {
        id: String(product.id),
        title: product.title || product.name || 'Untitled Product',
        description: product.description || '',
        category: product.category || 'uncategorized',
        brand: product.brand || 'Generic',
        price: Number(product.price) || 0,
        discountPercentage: Number(product.discountPercentage) || 0,
        rating: Number(product.rating?.rate || product.rating) || 0,
        stock: Number(product.stock) || 100,
        thumbnail: product.thumbnail || product.image || product.images?.[0] || '',
        images: product.images || [product.image || product.thumbnail] || [],
        colorOptions: product.colorOptions || ['default'],
        sizeOptions: product.sizeOptions || ['one-size'],
        tags: product.tags || [product.category].filter(Boolean),
        source: source
      };
      
      // API-specific adjustments
      switch (source) {
        case 'fakestore':
          normalized.rating = product.rating?.rate || 0;
          normalized.stock = Math.floor(Math.random() * 100) + 10; // Mock stock
          normalized.discountPercentage = Math.floor(Math.random() * 30); // Mock discount
          break;
          
        case 'dummyjson':
          // DummyJSON usually has good data already
          break;
          
        case 'local':
          // Local data should already be in correct format
          break;
      }
      
      return normalized;
    });
  }

  /**
   * Extract unique categories from products
   */
  extractCategories(products) {
    const categorySet = new Set();
    products.forEach(product => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });
    
    return Array.from(categorySet).map(category => ({
      id: category.toLowerCase().replace(/\s+/g, '-'),
      name: category.charAt(0).toUpperCase() + category.slice(1),
      description: `Products in ${category} category`
    }));
  }

  /**
   * Get all products
   */
  getProducts() {
    return this.products;
  }

  /**
   * Get product by ID
   */
  getProductById(id) {
    return this.products.find(product => product.id === String(id));
  }

  /**
   * Get products by category
   */
  getProductsByCategory(category) {
    const categoryLower = category.toLowerCase();
    return this.products.filter(product => 
      product.category.toLowerCase() === categoryLower
    );
  }

  /**
   * Search products
   */
  searchProducts(query, options = {}) {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    const searchTerm = query.toLowerCase().trim();
    const {
      category,
      minPrice,
      maxPrice,
      minRating,
      limit = 10
    } = options;
    
    let results = this.products.filter(product => {
      // Text search
      const matchesText = (
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
      
      // Category filter
      const matchesCategory = !category || 
        product.category.toLowerCase() === category.toLowerCase();
      
      // Price filter
      const matchesPrice = (!minPrice || product.price >= minPrice) &&
        (!maxPrice || product.price <= maxPrice);
      
      // Rating filter
      const matchesRating = !minRating || product.rating >= minRating;
      
      return matchesText && matchesCategory && matchesPrice && matchesRating;
    });
    
    // Sort by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase() === searchTerm ? 1 : 0;
      const bExact = b.title.toLowerCase() === searchTerm ? 1 : 0;
      
      if (aExact !== bExact) return bExact - aExact;
      
      // Then by title contains query
      const aTitleMatch = a.title.toLowerCase().includes(searchTerm) ? 1 : 0;
      const bTitleMatch = b.title.toLowerCase().includes(searchTerm) ? 1 : 0;
      
      if (aTitleMatch !== bTitleMatch) return bTitleMatch - aTitleMatch;
      
      // Finally by rating
      return b.rating - a.rating;
    });
    
    return results.slice(0, limit);
  }

  /**
   * Get featured products
   */
  getFeaturedProducts(limit = 8) {
    return this.products
      .filter(product => product.rating >= 4.0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  /**
   * Get new arrivals (mock - based on ID for demo)
   */
  getNewArrivals(limit = 8) {
    return this.products
      .sort((a, b) => Number(b.id) - Number(a.id))
      .slice(0, limit);
  }

  /**
   * Get categories
   */
  getCategories() {
    return this.categories;
  }

  /**
   * Filter and sort products
   */
  filterAndSort(filters = {}, sortBy = 'relevance') {
    let filtered = [...this.products];
    
    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(p => 
        p.category.toLowerCase() === filters.category.toLowerCase()
      );
    }
    
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.minPrice);
    }
    
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice);
    }
    
    if (filters.minRating !== undefined) {
      filtered = filtered.filter(p => p.rating >= filters.minRating);
    }
    
    if (filters.colors && filters.colors.length > 0) {
      filtered = filtered.filter(p => 
        p.colorOptions.some(color => filters.colors.includes(color))
      );
    }
    
    if (filters.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter(p => 
        p.sizeOptions.some(size => filters.sizes.includes(size))
      );
    }
    
    if (filters.inStock) {
      filtered = filtered.filter(p => p.stock > 0);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => Number(b.id) - Number(a.id));
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default: // relevance
        // Keep current order or sort by rating
        filtered.sort((a, b) => b.rating - a.rating);
    }
    
    return filtered;
  }

  /**
   * Load products from cache
   */
  async loadFromCache() {
    try {
      const cached = localStorage.getItem('productServiceCache');
      if (cached) {
        this.cache = JSON.parse(cached);
        
        if (this.isCacheValid()) {
          this.products = this.cache.products || [];
          this.categories = this.cache.categories || [];
          console.log('📦 Loaded products from cache');
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load from cache:', error);
      this.cache = { products: null, categories: null, lastUpdated: null };
    }
  }

  /**
   * Save products to cache
   */
  async saveToCache() {
    try {
      this.cache = {
        products: this.products,
        categories: this.categories,
        lastUpdated: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem('productServiceCache', JSON.stringify(this.cache));
      console.log('💾 Saved products to cache');
    } catch (error) {
      console.warn('⚠️ Failed to save to cache:', error);
    }
  }

  /**
   * Check if cache is valid
   */
  isCacheValid() {
    if (!this.cache.lastUpdated || !this.cache.products) {
      return false;
    }
    
    const age = Date.now() - this.cache.lastUpdated;
    return age < this.cacheExpiry;
  }

  /**
   * Clear cache and refresh
   */
  async refreshProducts() {
    localStorage.removeItem('productServiceCache');
    this.cache = { products: null, categories: null, lastUpdated: null };
    await this.fetchProducts();
  }

  /**
   * Get cache info
   */
  getCacheInfo() {
    return {
      isValid: this.isCacheValid(),
      lastUpdated: this.cache.lastUpdated ? new Date(this.cache.lastUpdated) : null,
      productsCount: this.cache.products?.length || 0,
      categoriesCount: this.cache.categories?.length || 0,
      currentApi: this.currentApi
    };
  }
}

// Export for use in other modules
export default ProductService;
window.ProductService = ProductService;