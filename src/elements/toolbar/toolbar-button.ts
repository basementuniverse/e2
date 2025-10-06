/**
 * Toolbar Button Element
 * A button designed to be used within a toolbar
 */

import { EditorElementProperties, Theme } from '../../types';
import {
  applyEffectiveTheme,
  applyTheme,
  generateId,
  getShadowRoot,
  setupThemeInheritance,
} from '../../utils';

export class ToolbarButton
  extends HTMLElement
  implements EditorElementProperties
{
  private _theme: Theme = 'auto';
  private _themeCleanup?: () => void;

  static get observedAttributes(): string[] {
    return ['label', 'icon', 'theme', 'disabled', 'active'];
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
          display: inline-block;
        }

        button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 6px 12px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-color, #333);
          font-family: inherit;
          font-size: inherit;
          cursor: pointer;
          border-radius: 3px;
          min-height: 24px;
          transition: all 0.15s ease;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        button:hover {
          background: var(--button-hover-bg, rgba(0, 0, 0, 0.1));
        }

        button:active,
        button.active {
          background: var(--button-active-bg, rgba(0, 0, 0, 0.2));
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        :host(.theme-dark) button {
          color: var(--text-color-dark, #fff);
        }

        :host(.theme-dark) button:hover {
          background: var(--button-hover-bg-dark, rgba(255, 255, 255, 0.1));
        }

        :host(.theme-dark) button:active,
        :host(.theme-dark) button.active {
          background: var(--button-active-bg-dark, rgba(255, 255, 255, 0.2));
        }

        .icon {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        .label {
          white-space: nowrap;
        }
      </style>
      <button>
        <span class="icon" style="display: none;"></span>
        <span class="label"></span>
      </button>
    `;

    const button = shadowRoot.querySelector('button')!;
    button.addEventListener('click', this.handleClick.bind(this));
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('toolbar-button');
    }
    this.updateContent();

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
      case 'label':
      case 'icon':
        this.updateContent();
        break;
      case 'theme':
        // If theme attribute is being set, use explicit theme
        // If theme attribute is being removed, switch to inheritance
        if (newValue) {
          this.theme = newValue as Theme;
        } else if (this.isConnected) {
          // Attribute was removed, switch to inheritance
          applyEffectiveTheme(this);
          this._themeCleanup = setupThemeInheritance(this);
        }
        break;
      case 'disabled':
        this.updateDisabled();
        break;
      case 'active':
        this.updateActive();
        break;
    }
  }

  private updateContent(): void {
    const shadowRoot = this.shadowRoot!;
    const iconSpan = shadowRoot.querySelector('.icon') as HTMLSpanElement;
    const labelSpan = shadowRoot.querySelector('.label') as HTMLSpanElement;

    const icon = this.getAttribute('icon');
    const label = this.getAttribute('label') || '';

    if (icon) {
      iconSpan.textContent = icon;
      iconSpan.style.display = 'inline-block';
    } else {
      iconSpan.style.display = 'none';
    }

    labelSpan.textContent = label;
  }

  private updateDisabled(): void {
    const button = this.shadowRoot!.querySelector('button')!;
    button.disabled = this.hasAttribute('disabled');
  }

  private updateActive(): void {
    const button = this.shadowRoot!.querySelector('button')!;
    button.classList.toggle('active', this.hasAttribute('active'));
  }

  private handleClick(event: Event): void {
    if (this.hasAttribute('disabled')) return;

    const customEvent = new CustomEvent('toolbar-button-click', {
      detail: {
        buttonId: this.id,
        button: this,
      },
      bubbles: true,
      cancelable: true,
    });

    this.dispatchEvent(customEvent);
  }

  get theme(): Theme {
    return this._theme;
  }

  set theme(value: Theme) {
    this._theme = value;

    // Clean up any existing theme inheritance
    if (this._themeCleanup) {
      this._themeCleanup();
      this._themeCleanup = undefined;
    }

    this.applyTheme(value);
  }

  applyTheme(theme: Theme): void {
    applyTheme(this, theme);
  }

  get label(): string {
    return this.getAttribute('label') || '';
  }

  set label(value: string) {
    this.setAttribute('label', value);
  }

  get icon(): string {
    return this.getAttribute('icon') || '';
  }

  set icon(value: string) {
    this.setAttribute('icon', value);
  }

  get active(): boolean {
    return this.hasAttribute('active');
  }

  set active(value: boolean) {
    if (value) {
      this.setAttribute('active', '');
    } else {
      this.removeAttribute('active');
    }
  }
}

// Register the custom element
if (!customElements.get('e2-toolbar-button')) {
  customElements.define('e2-toolbar-button', ToolbarButton);
}
