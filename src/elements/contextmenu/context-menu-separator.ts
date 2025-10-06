/**
 * Context Menu Separator Element
 * A visual separator line between context menu items
 */

import { EditorElementProperties, Theme } from '../../types';
import {
  applyEffectiveTheme,
  applyTheme,
  getShadowRoot,
  setupThemeInheritance,
} from '../../utils';

export class ContextMenuSeparator
  extends HTMLElement
  implements EditorElementProperties
{
  private _theme: Theme = 'auto';
  private _themeCleanup?: () => void;

  static get observedAttributes(): string[] {
    return ['theme'];
  }

  constructor() {
    super();
    this.setupElement();
  }

  private setupElement(): void {
    const shadowRoot = getShadowRoot(this);

    shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 4px 0;
        }

        .separator {
          height: 1px;
          background: var(--context-menu-separator-color, #e0e0e0);
          margin: 0 8px;
        }

        /* Light theme */
        :host(.theme-light) .separator {
          background: var(--context-menu-separator-color-light, #e0e0e0);
        }

        /* Dark theme */
        :host(.theme-dark) .separator {
          background: var(--context-menu-separator-color-dark, #555);
        }

        /* Auto theme - follows system preference */
        @media (prefers-color-scheme: dark) {
          :host(.theme-auto) .separator {
            background: var(--context-menu-separator-color-dark, #555);
          }
        }
      </style>
      <div class="separator"></div>
    `;
  }

  connectedCallback(): void {
    // Set up theme inheritance if no explicit theme is set
    if (!this.hasAttribute('theme')) {
      applyEffectiveTheme(this);
      this._themeCleanup = setupThemeInheritance(this);
    } else {
      this.applyTheme(this._theme);
    }
  }

  disconnectedCallback(): void {
    // Clean up theme inheritance listener
    if (this._themeCleanup) {
      this._themeCleanup();
      this._themeCleanup = undefined;
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
        // If theme attribute is being set, use explicit theme
        // If theme attribute is being removed, switch to inheritance
        if (newValue) {
          this._theme = newValue as Theme;
          // Clean up any existing theme inheritance
          if (this._themeCleanup) {
            this._themeCleanup();
            this._themeCleanup = undefined;
          }
          this.applyTheme(this._theme);
        } else if (this.isConnected) {
          // Attribute was removed, switch to inheritance
          this._theme = 'auto';
          applyEffectiveTheme(this);
          this._themeCleanup = setupThemeInheritance(this);
        }
        break;
    }
  }

  // Public API
  get theme(): Theme {
    return this._theme;
  }

  set theme(value: Theme) {
    this._theme = value;
    this.setAttribute('theme', value);

    // Clean up any existing theme inheritance
    if (this._themeCleanup) {
      this._themeCleanup();
      this._themeCleanup = undefined;
    }
  }

  get disabled(): boolean {
    return false; // Separators cannot be disabled
  }

  set disabled(_value: boolean) {
    // Separators cannot be disabled
  }

  applyTheme(theme: Theme): void {
    this._theme = theme;
    applyTheme(this, theme);
  }
}

// Register the custom element
if (!customElements.get('e2-context-menu-separator')) {
  customElements.define('e2-context-menu-separator', ContextMenuSeparator);
}
