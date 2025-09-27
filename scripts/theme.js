/**
 * Theme Management System
 * Handles light/dark/mixed themes with system preference detection and persistence
 */

class ThemeManager {
  constructor() {
    this.themes = ['light', 'dark', 'mixed'];
    this.currentTheme = 'light';
    this.systemPreference = 'light';
    
    // Bind methods
    this.init = this.init.bind(this);
    this.setTheme = this.setTheme.bind(this);
    this.toggleTheme = this.toggleTheme.bind(this);
    this.detectSystemPreference = this.detectSystemPreference.bind(this);
    this.handleSystemChange = this.handleSystemChange.bind(this);
    
    this.init();
  }

  /**
   * Initialize theme system
   */
  init() {
    // Detect system preference
    this.detectSystemPreference();
    
    // Listen for system preference changes
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      darkModeQuery.addEventListener('change', this.handleSystemChange);
    }
    
    // Load saved theme or use system preference
    const savedTheme = this.getSavedTheme();
    const initialTheme = savedTheme || this.systemPreference;
    
    this.setTheme(initialTheme);
    
    // Set up theme toggle buttons
    this.setupThemeToggles();
    
    console.log('Theme system initialized:', {
      currentTheme: this.currentTheme,
      systemPreference: this.systemPreference,
      savedTheme: savedTheme
    });
  }

  /**
   * Detect system color scheme preference
   */
  detectSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.systemPreference = 'dark';
    } else {
      this.systemPreference = 'light';
    }
  }

  /**
   * Handle system preference changes
   */
  handleSystemChange(e) {
    this.systemPreference = e.matches ? 'dark' : 'light';
    
    // Only apply system preference if user hasn't manually set a theme
    const savedTheme = this.getSavedTheme();
    if (!savedTheme) {
      this.setTheme(this.systemPreference);
    }
  }

  /**
   * Set theme with smooth transition
   */
  setTheme(theme, save = true) {
    if (!this.themes.includes(theme)) {
      console.warn(`Invalid theme: ${theme}. Using 'light' instead.`);
      theme = 'light';
    }

    // Add transition class for smooth theme switching
    document.documentElement.classList.add('theme-transitioning');
    
    // Remove previous theme data attributes
    this.themes.forEach(t => {
      document.documentElement.removeAttribute(`data-theme`);
    });
    
    // Set new theme
    if (theme !== 'light') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    
    this.currentTheme = theme;
    
    // Save theme preference
    if (save) {
      this.saveTheme(theme);
    }
    
    // Update theme toggle buttons
    this.updateThemeToggles();
    
    // Emit theme change event
    this.emitThemeChangeEvent(theme);
    
    // Remove transition class after animation
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 300);
    
    console.log(`Theme changed to: ${theme}`);
  }

  /**
   * Toggle between themes
   */
  toggleTheme() {
    const currentIndex = this.themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    const nextTheme = this.themes[nextIndex];
    
    this.setTheme(nextTheme);
  }

  /**
   * Get next theme in rotation
   */
  getNextTheme() {
    const currentIndex = this.themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    return this.themes[nextIndex];
  }

  /**
   * Save theme preference to localStorage
   */
  saveTheme(theme) {
    try {
      localStorage.setItem('preferred-theme', theme);
    } catch (error) {
      console.warn('Could not save theme preference:', error);
    }
  }

  /**
   * Get saved theme from localStorage
   */
  getSavedTheme() {
    try {
      return localStorage.getItem('preferred-theme');
    } catch (error) {
      console.warn('Could not retrieve saved theme:', error);
      return null;
    }
  }

  /**
   * Set up theme toggle buttons
   */
  setupThemeToggles() {
    const toggleButtons = document.querySelectorAll('[data-theme-toggle]');
    
    toggleButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleTheme();
      });
      
      // Add keyboard support
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleTheme();
        }
      });
    });
  }

  /**
   * Update theme toggle buttons state
   */
  updateThemeToggles() {
    const toggleButtons = document.querySelectorAll('[data-theme-toggle]');
    
    toggleButtons.forEach(button => {
      // Update aria-pressed for accessibility
      button.setAttribute('aria-pressed', 'false');
      
      // Update button text/label
      const nextTheme = this.getNextTheme();
      const themeLabels = {
        light: '☀️ Light',
        dark: '🌙 Dark', 
        mixed: '🎨 Mixed'
      };
      
      const icon = button.querySelector('.theme-icon');
      const label = button.querySelector('.theme-label');
      
      if (icon) {
        const themeIcons = {
          light: '☀️',
          dark: '🌙',
          mixed: '🎨'
        };
        icon.textContent = themeIcons[nextTheme];
      }
      
      if (label) {
        label.textContent = `Switch to ${nextTheme}`;
      }
      
      // Update title attribute
      button.title = `Current: ${this.currentTheme}, Click for ${nextTheme}`;
      
      // Update aria-label for screen readers
      button.setAttribute('aria-label', `Theme switcher. Current theme: ${this.currentTheme}. Click to switch to ${nextTheme} theme.`);
    });
  }

  /**
   * Emit custom theme change event
   */
  emitThemeChangeEvent(theme) {
    const event = new CustomEvent('themechange', {
      detail: {
        theme: theme,
        previousTheme: this.currentTheme !== theme ? this.currentTheme : null
      }
    });
    
    document.dispatchEvent(event);
  }

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Check if theme is dark
   */
  isDark() {
    return this.currentTheme === 'dark';
  }

  /**
   * Check if reduced motion is preferred
   */
  prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Check if high contrast is preferred
   */
  prefersHighContrast() {
    return window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches;
  }
}

// Add theme transition styles
const themeTransitionCSS = `
  .theme-transitioning,
  .theme-transitioning *,
  .theme-transitioning *:before,
  .theme-transitioning *:after {
    transition: background-color 300ms ease-in-out,
                color 300ms ease-in-out,
                border-color 300ms ease-in-out !important;
  }
`;

// Inject theme transition styles
const styleElement = document.createElement('style');
styleElement.textContent = themeTransitionCSS;
document.head.appendChild(styleElement);

// Initialize theme manager when DOM is ready
let themeManager = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
  });
} else {
  themeManager = new ThemeManager();
}

// Export for use in other modules
window.ThemeManager = ThemeManager;
window.themeManager = themeManager;

// Export for ES modules
export default ThemeManager;