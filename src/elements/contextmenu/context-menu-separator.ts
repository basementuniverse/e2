/**
 * Context Menu Separator Element
 * A visual separator line between context menu items
 */

import { EditorElementProperties, Theme } from '../../types';
import { applyTheme, getShadowRoot } from '../../utils';

export class ContextMenuSeparator
  extends HTMLElement
  implements EditorElementProperties
{
  private _theme: Theme = 'auto';

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
    this.applyTheme(this._theme);
  }

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'theme':
        this._theme = (newValue as Theme) || 'auto';
        this.applyTheme(this._theme);
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
