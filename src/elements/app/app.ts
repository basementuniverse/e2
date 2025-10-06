/**
 * E2 App Element
 * A wrapper element that provides global CSS styles and theming for E2 applications
 */

import { EditorElementProperties, Theme } from '../../types';
import { applyTheme, generateId, notifyThemeChange } from '../../utils';

export class E2App extends HTMLElement implements EditorElementProperties {
  private _theme: Theme = 'auto';
  private _stylesInitialized: boolean = false;

  static get observedAttributes(): string[] {
    return ['theme'];
  }

  constructor() {
    super();
    // Don't set up DOM in constructor - defer to connectedCallback
  }

  private setupElement(): void {
    // Apply styles directly to the document head (not to the element itself)
    // This allows global styles to cascade to child elements without interfering with DOM structure

    // Check if styles are already added to avoid conflicts
    if (!this._stylesInitialized && !document.getElementById('e2-app-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'e2-app-styles';
      styleElement.textContent = `
        /* CSS Reset and Base Styles */
        e2-app, e2-app * {
          box-sizing: border-box;
        }

        e2-app {
          /* Layout */
          --app-width: 100%;
          --app-height: 100vh;
          --app-padding: 0;
          --app-margin: 0;

          /* Typography */
          --font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          --font-size: 14px;
          --line-height: 1.4;
          --font-weight: 400;

          /* Colors - Light Theme */
          --bg-primary: #ffffff;
          --bg-secondary: #f8f9fa;
          --bg-tertiary: #e9ecef;
          --text-primary: #212529;
          --text-secondary: #6c757d;
          --text-muted: #adb5bd;
          --border-color: #dee2e6;
          --border-color-hover: #adb5bd;
          --accent-color: #0d6efd;
          --accent-color-hover: #0b5ed7;
          --success-color: #198754;
          --warning-color: #ffc107;
          --danger-color: #dc3545;

          /* Form Controls */
          --input-bg: #ffffff;
          --input-border: #ced4da;
          --input-border-focus: #86b7fe;
          --input-text: #212529;
          --input-placeholder: #6c757d;
          --input-padding: 6px 12px;
          --input-border-radius: 4px;
          --input-font-size: 14px;

          /* Buttons */
          --button-bg: #f8f9fa;
          --button-bg-hover: #e9ecef;
          --button-border: #ced4da;
          --button-text: #212529;
          --button-padding: 6px 12px;
          --button-border-radius: 4px;

          /* Shadows */
          --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
          --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          --shadow-lg: 0 4px 6px rgba(0, 0, 0, 0.1);

          /* Transitions */
          --transition-fast: 0.15s ease-in-out;
          --transition-normal: 0.3s ease-in-out;

          /* Apply base layout */
          display: block;
          width: var(--app-width);
          height: var(--app-height);
          padding: var(--app-padding);
          margin: var(--app-margin);
          font-family: var(--font-family);
          font-size: var(--font-size);
          line-height: var(--line-height);
          font-weight: var(--font-weight);
          color: var(--text-primary);
          background-color: var(--bg-primary);
          overflow: hidden;
        }

        /* Dark Theme */
        e2-app.theme-dark {
          --bg-primary: #1a1a1a;
          --bg-secondary: #2d2d2d;
          --bg-tertiary: #404040;
          --text-primary: #ffffff;
          --text-secondary: #cccccc;
          --text-muted: #999999;
          --border-color: #404040;
          --border-color-hover: #666666;
          --accent-color: #4dabf7;
          --accent-color-hover: #339af0;
          --success-color: #51cf66;
          --warning-color: #ffd43b;
          --danger-color: #ff6b6b;

          --input-bg: #2d2d2d;
          --input-border: #404040;
          --input-border-focus: #4dabf7;
          --input-text: #ffffff;
          --input-placeholder: #999999;

          --button-bg: #2d2d2d;
          --button-bg-hover: #404040;
          --button-border: #404040;
          --button-text: #ffffff;

          --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.25);
          --shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          --shadow-lg: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        /* Auto Theme - uses system preference */
        e2-app.theme-auto {
          color-scheme: light dark;
        }

        @media (prefers-color-scheme: dark) {
          e2-app.theme-auto {
            --bg-primary: #1a1a1a;
            --bg-secondary: #2d2d2d;
            --bg-tertiary: #404040;
            --text-primary: #ffffff;
            --text-secondary: #cccccc;
            --text-muted: #999999;
            --border-color: #404040;
            --border-color-hover: #666666;
            --accent-color: #4dabf7;
            --accent-color-hover: #339af0;
            --success-color: #51cf66;
            --warning-color: #ffd43b;
            --danger-color: #ff6b6b;

            --input-bg: #2d2d2d;
            --input-border: #404040;
            --input-border-focus: #4dabf7;
            --input-text: #ffffff;
            --input-placeholder: #999999;

            --button-bg: #2d2d2d;
            --button-bg-hover: #404040;
            --button-border: #404040;
            --button-text: #ffffff;

            --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.25);
            --shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            --shadow-lg: 0 4px 6px rgba(0, 0, 0, 0.3);
          }
        }

        /* Typography Styles */
        e2-app h1, e2-app h2, e2-app h3, e2-app h4, e2-app h5, e2-app h6 {
          margin: 0 0 0.5em 0;
          font-weight: 600;
          line-height: 1.2;
          color: var(--text-primary);
        }

        e2-app h1 { font-size: 2rem; }
        e2-app h2 { font-size: 1.5rem; }
        e2-app h3 { font-size: 1.25rem; }
        e2-app h4 { font-size: 1.1rem; }
        e2-app h5 { font-size: 1rem; }
        e2-app h6 { font-size: 0.9rem; }

        e2-app p {
          margin: 0 0 1em 0;
          color: var(--text-primary);
        }

        e2-app small {
          font-size: 0.875em;
          color: var(--text-secondary);
        }

        e2-app strong {
          font-weight: 600;
        }

        e2-app a {
          color: var(--accent-color);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        e2-app a:hover {
          color: var(--accent-color-hover);
          text-decoration: underline;
        }

        /* Form Control Styles */
        e2-app input[type="text"],
        e2-app input[type="email"],
        e2-app input[type="password"],
        e2-app input[type="number"],
        e2-app input[type="search"],
        e2-app input[type="url"],
        e2-app input[type="tel"],
        e2-app input[type="date"],
        e2-app input[type="time"],
        e2-app input[type="datetime-local"],
        e2-app textarea,
        e2-app select {
          display: block;
          width: 100%;
          padding: var(--input-padding);
          font-size: var(--input-font-size);
          font-family: var(--font-family);
          line-height: var(--line-height);
          color: var(--input-text);
          background-color: var(--input-bg);
          background-clip: padding-box;
          border: 1px solid var(--input-border);
          border-radius: var(--input-border-radius);
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }

        e2-app input[type="text"]:focus,
        e2-app input[type="email"]:focus,
        e2-app input[type="password"]:focus,
        e2-app input[type="number"]:focus,
        e2-app input[type="search"]:focus,
        e2-app input[type="url"]:focus,
        e2-app input[type="tel"]:focus,
        e2-app input[type="date"]:focus,
        e2-app input[type="time"]:focus,
        e2-app input[type="datetime-local"]:focus,
        e2-app textarea:focus,
        e2-app select:focus {
          outline: 0;
          border-color: var(--input-border-focus);
          box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
        }

        e2-app input::placeholder,
        e2-app textarea::placeholder {
          color: var(--input-placeholder);
          opacity: 1;
        }

        e2-app input:disabled,
        e2-app textarea:disabled,
        e2-app select:disabled {
          background-color: var(--bg-tertiary);
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Textarea specific */
        e2-app textarea {
          resize: vertical;
          min-height: 80px;
        }

        /* Select specific */
        e2-app select {
          cursor: pointer;
        }

        /* Checkbox and Radio Styles */
        e2-app input[type="checkbox"],
        e2-app input[type="radio"] {
          width: 16px;
          height: 16px;
          margin: 0 8px 0 0;
          vertical-align: middle;
          cursor: pointer;
          accent-color: var(--accent-color);
        }

        e2-app input[type="checkbox"]:disabled,
        e2-app input[type="radio"]:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        /* Range Input */
        e2-app input[type="range"] {
          width: 100%;
          height: 6px;
          background: var(--bg-tertiary);
          border-radius: 3px;
          outline: none;
          cursor: pointer;
          accent-color: var(--accent-color);
        }

        /* File Input */
        e2-app input[type="file"] {
          display: block;
          width: 100%;
          padding: var(--input-padding);
          font-size: var(--input-font-size);
          font-family: var(--font-family);
          color: var(--input-text);
          background-color: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: var(--input-border-radius);
          cursor: pointer;
        }

        /* Button Styles */
        e2-app button,
        e2-app input[type="button"],
        e2-app input[type="submit"],
        e2-app input[type="reset"] {
          display: inline-block;
          padding: var(--button-padding);
          font-size: var(--input-font-size);
          font-family: var(--font-family);
          font-weight: 500;
          line-height: var(--line-height);
          color: var(--button-text);
          text-align: center;
          text-decoration: none;
          vertical-align: middle;
          cursor: pointer;
          background-color: var(--button-bg);
          border: 1px solid var(--button-border);
          border-radius: var(--button-border-radius);
          transition: all var(--transition-fast);
          user-select: none;
        }

        e2-app button:hover,
        e2-app input[type="button"]:hover,
        e2-app input[type="submit"]:hover,
        e2-app input[type="reset"]:hover {
          background-color: var(--button-bg-hover);
          border-color: var(--border-color-hover);
        }

        e2-app button:focus,
        e2-app input[type="button"]:focus,
        e2-app input[type="submit"]:focus,
        e2-app input[type="reset"]:focus {
          outline: 0;
          box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
        }

        e2-app button:disabled,
        e2-app input[type="button"]:disabled,
        e2-app input[type="submit"]:disabled,
        e2-app input[type="reset"]:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          pointer-events: none;
        }

        /* Primary Button Variant */
        e2-app button.primary,
        e2-app input[type="submit"] {
          color: white;
          background-color: var(--accent-color);
          border-color: var(--accent-color);
        }

        e2-app button.primary:hover,
        e2-app input[type="submit"]:hover {
          background-color: var(--accent-color-hover);
          border-color: var(--accent-color-hover);
        }

        /* Label Styles */
        e2-app label {
          display: inline-block;
          margin-bottom: 4px;
          font-weight: 500;
          color: var(--text-primary);
          cursor: pointer;
        }

        /* Fieldset and Legend */
        e2-app fieldset {
          padding: 16px;
          margin: 0 0 16px 0;
          border: 1px solid var(--border-color);
          border-radius: var(--input-border-radius);
        }

        e2-app legend {
          padding: 0 8px;
          font-weight: 600;
          color: var(--text-primary);
        }

        /* Form Groups */
        e2-app .form-group {
          margin-bottom: 16px;
        }

        e2-app .form-group label {
          display: block;
          margin-bottom: 4px;
        }

        /* Utility Classes */
        e2-app .text-muted {
          color: var(--text-muted) !important;
        }

        e2-app .text-primary {
          color: var(--text-primary) !important;
        }

        e2-app .text-secondary {
          color: var(--text-secondary) !important;
        }

        e2-app .bg-primary {
          background-color: var(--bg-primary) !important;
        }

        e2-app .bg-secondary {
          background-color: var(--bg-secondary) !important;
        }

        e2-app .border {
          border: 1px solid var(--border-color) !important;
        }

        e2-app .rounded {
          border-radius: var(--input-border-radius) !important;
        }

        e2-app .shadow {
          box-shadow: var(--shadow) !important;
        }

        e2-app .shadow-sm {
          box-shadow: var(--shadow-sm) !important;
        }

        e2-app .shadow-lg {
          box-shadow: var(--shadow-lg) !important;
        }
      `;

      // Add style element to document head instead of modifying the App element's DOM
      // This prevents interference with child custom element initialization
      document.head.appendChild(styleElement);
      this._stylesInitialized = true;
    }
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('e2-app');
    }

    // Set up element after it's connected to DOM
    this.setupElement();

    this.applyTheme(this._theme);

    // Set up system theme detection for auto mode
    if (this._theme === 'auto') {
      this.setupAutoTheme();
    }

    // Notify child elements about initial theme
    // Use setTimeout to ensure child elements are connected first
    setTimeout(() => {
      notifyThemeChange(this, this._theme);
    }, 0);
  }

  disconnectedCallback(): void {
    // Clean up theme listeners if any
    if (this.mediaQueryList) {
      this.mediaQueryList.removeEventListener('change', this.handleThemeChange);
    }
  }

  private mediaQueryList?: MediaQueryList;
  private handleThemeChange = () => {
    if (this._theme === 'auto') {
      this.applyTheme('auto');
      // Notify child elements about system theme change
      notifyThemeChange(this, 'auto');
    }
  };

  private setupAutoTheme(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQueryList.addEventListener('change', this.handleThemeChange);
    }
  }

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'theme':
        this.theme = newValue as Theme;
        break;
    }
  }

  get theme(): Theme {
    return this._theme;
  }

  set theme(value: Theme) {
    const oldTheme = this._theme;
    this._theme = value;
    this.applyTheme(value);

    if (value === 'auto') {
      this.setupAutoTheme();
    } else if (this.mediaQueryList) {
      this.mediaQueryList.removeEventListener('change', this.handleThemeChange);
      this.mediaQueryList = undefined;
    }

    // Notify child elements about theme change
    if (oldTheme !== value) {
      notifyThemeChange(this, value);
    }
  }

  applyTheme(theme: Theme): void {
    applyTheme(this, theme);
  }

  /**
   * Set a custom CSS property value
   */
  setCSSVariable(property: string, value: string): void {
    this.style.setProperty(`--${property}`, value);
  }

  /**
   * Get a custom CSS property value
   */
  getCSSVariable(property: string): string {
    return getComputedStyle(this).getPropertyValue(`--${property}`).trim();
  }
}

// Register the custom element
if (!customElements.get('e2-app')) {
  customElements.define('e2-app', E2App);
}
