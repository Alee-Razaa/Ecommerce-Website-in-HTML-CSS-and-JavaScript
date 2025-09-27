/**
 * Search Component with Autocomplete/Autosuggest functionality
 * Implements ARIA combobox pattern for accessibility
 */

class SearchComponent {
  constructor(searchInputSelector, suggestionsSelector, options = {}) {
    this.searchInput = document.querySelector(searchInputSelector);
    this.suggestionsContainer = document.querySelector(suggestionsSelector);
    
    if (!this.searchInput) {
      console.warn('Search input not found:', searchInputSelector);
      return;
    }
    
    // Configuration
    this.options = {
      minLength: 2,
      maxSuggestions: 8,
      debounceDelay: 300,
      highlightMatches: true,
      showCategories: true,
      ...options
    };
    
    // State
    this.suggestions = [];
    this.currentSuggestionIndex = -1;
    this.isOpen = false;
    this.searchTimeout = null;
    
    // Bind methods
    this.handleInput = this.handleInput.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.selectSuggestion = this.selectSuggestion.bind(this);
    this.closeSuggestions = this.closeSuggestions.bind(this);
    
    this.init();
  }

  /**
   * Initialize search component
   */
  init() {
    if (!this.searchInput) return;
    
    // Set up ARIA attributes
    this.setupAccessibility();
    
    // Add event listeners
    this.searchInput.addEventListener('input', this.handleInput);
    this.searchInput.addEventListener('keydown', this.handleKeyDown);
    this.searchInput.addEventListener('focus', this.handleFocus);
    this.searchInput.addEventListener('blur', this.handleBlur);
    
    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.searchInput.contains(e.target) && 
          !this.suggestionsContainer?.contains(e.target)) {
        this.closeSuggestions();
      }
    });
    
    console.log('Search component initialized');
  }

  /**
   * Set up accessibility attributes
   */
  setupAccessibility() {
    const inputId = this.searchInput.id || 'search-input';
    const suggestionsId = inputId + '-suggestions';
    
    // Set up search input ARIA attributes
    this.searchInput.setAttribute('role', 'combobox');
    this.searchInput.setAttribute('aria-autocomplete', 'list');
    this.searchInput.setAttribute('aria-expanded', 'false');
    this.searchInput.setAttribute('aria-haspopup', 'listbox');
    
    if (this.suggestionsContainer) {
      this.suggestionsContainer.id = suggestionsId;
      this.suggestionsContainer.setAttribute('role', 'listbox');
      this.suggestionsContainer.setAttribute('aria-labelledby', inputId);
      this.searchInput.setAttribute('aria-owns', suggestionsId);
    }
  }

  /**
   * Handle input changes with debouncing
   */
  handleInput(e) {
    const query = e.target.value.trim();
    
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    // Debounce search
    this.searchTimeout = setTimeout(() => {
      if (query.length >= this.options.minLength) {
        this.performSearch(query);
      } else {
        this.closeSuggestions();
      }
    }, this.options.debounceDelay);
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyDown(e) {
    if (!this.isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.navigateSuggestions(1);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        this.navigateSuggestions(-1);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (this.currentSuggestionIndex >= 0) {
          this.selectSuggestion(this.suggestions[this.currentSuggestionIndex]);
        } else {
          this.performSearch(this.searchInput.value.trim());
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        this.closeSuggestions();
        break;
        
      case 'Tab':
        // Allow natural tab behavior, but close suggestions
        this.closeSuggestions();
        break;
    }
  }

  /**
   * Handle focus event
   */
  handleFocus(e) {
    const query = e.target.value.trim();
    if (query.length >= this.options.minLength && this.suggestions.length > 0) {
      this.openSuggestions();
    }
  }

  /**
   * Handle blur event (with delay to allow for suggestion clicks)
   */
  handleBlur(e) {
    // Delay closing to allow suggestion clicks
    setTimeout(() => {
      if (!this.suggestionsContainer?.contains(document.activeElement)) {
        this.closeSuggestions();
      }
    }, 150);
  }

  /**
   * Perform search and get suggestions
   */
  async performSearch(query) {
    try {
      // Get suggestions from multiple sources
      const suggestions = await this.getSuggestions(query);
      
      if (suggestions && suggestions.length > 0) {
        this.suggestions = suggestions.slice(0, this.options.maxSuggestions);
        this.renderSuggestions(query);
        this.openSuggestions();
      } else {
        this.closeSuggestions();
      }
    } catch (error) {
      console.error('Search error:', error);
      this.closeSuggestions();
    }
  }

  /**
   * Get search suggestions from various sources
   */
  async getSuggestions(query) {
    const suggestions = [];
    const lowerQuery = query.toLowerCase();
    
    try {
      // Get product suggestions (if ProductService is available)
      if (window.productService) {
        const products = await window.productService.searchProducts(query);
        products.forEach(product => {
          suggestions.push({
            type: 'product',
            title: product.title,
            category: product.category,
            id: product.id,
            image: product.thumbnail
          });
        });
      }
      
      // Get category suggestions
      const categories = this.getCategorySuggestions(query);
      categories.forEach(category => {
        suggestions.push({
          type: 'category',
          title: category,
          category: 'Category'
        });
      });
      
      // Get popular search suggestions
      const popularSearches = this.getPopularSearches(query);
      popularSearches.forEach(search => {
        suggestions.push({
          type: 'search',
          title: search,
          category: 'Popular'
        });
      });
      
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
    
    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.title.toLowerCase() === suggestion.title.toLowerCase())
    );
    
    return uniqueSuggestions;
  }

  /**
   * Get category suggestions
   */
  getCategorySuggestions(query) {
    const categories = [
      'T-Shirts', 'Shirts', 'Pants', 'Dresses', 'Shoes', 'Accessories',
      'Electronics', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Jewelry'
    ];
    
    return categories.filter(category => 
      category.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Get popular search suggestions
   */
  getPopularSearches(query) {
    const popular = [
      'summer collection', 'winter sale', 'new arrivals', 'trending now',
      'best sellers', 'discount items', 'casual wear', 'formal wear'
    ];
    
    return popular.filter(search => 
      search.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Render suggestions in the DOM
   */
  renderSuggestions(query) {
    if (!this.suggestionsContainer) {
      this.createSuggestionsContainer();
    }
    
    const suggestionsHTML = this.suggestions.map((suggestion, index) => {
      const highlightedTitle = this.options.highlightMatches 
        ? this.highlightMatch(suggestion.title, query)
        : suggestion.title;
      
      const icon = this.getSuggestionIcon(suggestion.type);
      
      return `
        <div class="header__search-suggestion" 
             role="option" 
             data-index="${index}"
             aria-selected="false">
          <span class="header__search-suggestion-icon">${icon}</span>
          <span class="header__search-suggestion-text">${highlightedTitle}</span>
          ${this.options.showCategories ? `<span class="header__search-suggestion-category">${suggestion.category}</span>` : ''}
        </div>
      `;
    }).join('');
    
    this.suggestionsContainer.innerHTML = suggestionsHTML;
    
    // Add click listeners to suggestions
    this.suggestionsContainer.querySelectorAll('.header__search-suggestion').forEach((element, index) => {
      element.addEventListener('click', () => {
        this.selectSuggestion(this.suggestions[index]);
      });
    });
    
    // Reset current index
    this.currentSuggestionIndex = -1;
  }

  /**
   * Create suggestions container if it doesn't exist
   */
  createSuggestionsContainer() {
    if (this.suggestionsContainer) return;
    
    this.suggestionsContainer = document.createElement('div');
    this.suggestionsContainer.className = 'header__search-suggestions';
    this.suggestionsContainer.setAttribute('role', 'listbox');
    
    // Insert after search input
    const searchContainer = this.searchInput.closest('.header__search');
    if (searchContainer) {
      searchContainer.appendChild(this.suggestionsContainer);
    } else {
      this.searchInput.parentNode.appendChild(this.suggestionsContainer);
    }
  }

  /**
   * Get icon for suggestion type
   */
  getSuggestionIcon(type) {
    const icons = {
      product: '🛍️',
      category: '📂',
      search: '🔍'
    };
    return icons[type] || '🔍';
  }

  /**
   * Highlight matching text in suggestions
   */
  highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Navigate through suggestions with arrow keys
   */
  navigateSuggestions(direction) {
    const maxIndex = this.suggestions.length - 1;
    
    // Update current index
    this.currentSuggestionIndex += direction;
    
    // Handle boundaries
    if (this.currentSuggestionIndex > maxIndex) {
      this.currentSuggestionIndex = -1; // Back to input
    } else if (this.currentSuggestionIndex < -1) {
      this.currentSuggestionIndex = maxIndex; // Go to last suggestion
    }
    
    // Update visual selection
    this.updateSuggestionSelection();
    
    // Update ARIA activedescendant
    if (this.currentSuggestionIndex >= 0) {
      const activeElement = this.suggestionsContainer.children[this.currentSuggestionIndex];
      this.searchInput.setAttribute('aria-activedescendant', activeElement.id || `suggestion-${this.currentSuggestionIndex}`);
    } else {
      this.searchInput.removeAttribute('aria-activedescendant');
    }
    
    // Announce for screen readers
    this.announceForScreenReaders();
  }

  /**
   * Update visual selection of suggestions
   */
  updateSuggestionSelection() {
    if (!this.suggestionsContainer) return;
    
    // Remove previous selection
    this.suggestionsContainer.querySelectorAll('.header__search-suggestion').forEach((element, index) => {
      element.classList.remove('highlighted');
      element.setAttribute('aria-selected', 'false');
    });
    
    // Add current selection
    if (this.currentSuggestionIndex >= 0) {
      const currentElement = this.suggestionsContainer.children[this.currentSuggestionIndex];
      if (currentElement) {
        currentElement.classList.add('highlighted');
        currentElement.setAttribute('aria-selected', 'true');
        currentElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  /**
   * Select a suggestion
   */
  selectSuggestion(suggestion) {
    if (!suggestion) return;
    
    // Update search input
    this.searchInput.value = suggestion.title;
    
    // Close suggestions
    this.closeSuggestions();
    
    // Emit selection event
    const event = new CustomEvent('searchselection', {
      detail: {
        suggestion: suggestion,
        query: suggestion.title
      }
    });
    
    this.searchInput.dispatchEvent(event);
    
    // Navigate based on suggestion type
    this.handleSuggestionNavigation(suggestion);
  }

  /**
   * Handle navigation based on suggestion type
   */
  handleSuggestionNavigation(suggestion) {
    switch (suggestion.type) {
      case 'product':
        // Navigate to product detail page
        window.location.href = `sproduct.html?id=${suggestion.id}`;
        break;
        
      case 'category':
        // Navigate to category page
        window.location.href = `shop.html?category=${encodeURIComponent(suggestion.title)}`;
        break;
        
      case 'search':
      default:
        // Perform search
        window.location.href = `shop.html?search=${encodeURIComponent(suggestion.title)}`;
        break;
    }
  }

  /**
   * Open suggestions dropdown
   */
  openSuggestions() {
    if (!this.suggestionsContainer || this.isOpen) return;
    
    this.isOpen = true;
    this.suggestionsContainer.classList.add('active');
    this.searchInput.setAttribute('aria-expanded', 'true');
    
    // Announce for screen readers
    this.announceForScreenReaders();
  }

  /**
   * Close suggestions dropdown
   */
  closeSuggestions() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.currentSuggestionIndex = -1;
    
    if (this.suggestionsContainer) {
      this.suggestionsContainer.classList.remove('active');
    }
    
    this.searchInput.setAttribute('aria-expanded', 'false');
    this.searchInput.removeAttribute('aria-activedescendant');
  }

  /**
   * Announce search results for screen readers
   */
  announceForScreenReaders() {
    if (!this.isOpen || this.suggestions.length === 0) return;
    
    const announcement = `${this.suggestions.length} search suggestions available. Use arrow keys to navigate.`;
    
    // Create or update screen reader announcement
    let announcer = document.getElementById('search-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'search-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
    }
    
    announcer.textContent = announcement;
  }

  /**
   * Clear search and close suggestions
   */
  clear() {
    this.searchInput.value = '';
    this.closeSuggestions();
  }

  /**
   * Destroy the search component
   */
  destroy() {
    if (this.searchInput) {
      this.searchInput.removeEventListener('input', this.handleInput);
      this.searchInput.removeEventListener('keydown', this.handleKeyDown);
      this.searchInput.removeEventListener('focus', this.handleFocus);
      this.searchInput.removeEventListener('blur', this.handleBlur);
    }
    
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    // Remove announcer
    const announcer = document.getElementById('search-announcer');
    if (announcer) {
      announcer.remove();
    }
  }
}

// Export for use in other modules
export default SearchComponent;
window.SearchComponent = SearchComponent;