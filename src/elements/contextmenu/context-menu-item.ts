/**
 * Context Menu Item Element
 * A clickable item within a context menu
 */

import {
  ContextMenuItemClickEvent,
  EditorElementProperties,
  Theme,
} from '../../types';
import {
  applyEffectiveTheme,
  applyTheme,
  dispatchCustomEvent,
  generateId,
  getShadowRoot,
  setupThemeInheritance,
} from '../../utils';

export class ContextMenuItem
  extends HTMLElement
  implements EditorElementProperties
{
  private _theme: Theme = 'auto';
  private _themeCleanup?: () => void;

  static get observedAttributes(): string[] {
    return ['label', 'icon', 'theme', 'disabled', 'value', 'shortcut'];
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
        }

        .item {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          cursor: pointer;
          color: var(--context-menu-item-color, #333);
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          font-family: inherit;
          font-size: inherit;
          line-height: 1.4;
          transition: background-color 0.15s ease;
          outline: none;
        }

        .item:hover,
        .item:focus {
          background: var(--context-menu-item-hover-bg, rgba(0, 0, 0, 0.1));
        }

        .item:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .item:disabled:hover {
          background: transparent;
        }

        .icon {
          width: 16px;
          height: 16px;
          margin-right: 8px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon:empty {
          margin-right: 0;
          width: 0;
        }

        .content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-width: 0;
        }

        .label {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .shortcut {
          color: var(--context-menu-item-shortcut-color, #666);
          font-size: 0.85em;
          margin-left: 12px;
          flex-shrink: 0;
        }

        /* Light theme */
        :host(.theme-light) .item {
          color: var(--context-menu-item-color-light, #333);
        }

        :host(.theme-light) .item:hover,
        :host(.theme-light) .item:focus {
          background: var(--context-menu-item-hover-bg-light, rgba(0, 0, 0, 0.1));
        }

        :host(.theme-light) .shortcut {
          color: var(--context-menu-item-shortcut-color-light, #666);
        }

        /* Dark theme */
        :host(.theme-dark) .item {
          color: var(--context-menu-item-color-dark, #fff);
        }

        :host(.theme-dark) .item:hover,
        :host(.theme-dark) .item:focus {
          background: var(--context-menu-item-hover-bg-dark, rgba(255, 255, 255, 0.1));
        }

        :host(.theme-dark) .shortcut {
          color: var(--context-menu-item-shortcut-color-dark, #aaa);
        }

        /* Auto theme - follows system preference */
        @media (prefers-color-scheme: dark) {
          :host(.theme-auto) .item {
            color: var(--context-menu-item-color-dark, #fff);
          }

          :host(.theme-auto) .item:hover,
          :host(.theme-auto) .item:focus {
            background: var(--context-menu-item-hover-bg-dark, rgba(255, 255, 255, 0.1));
          }

          :host(.theme-auto) .shortcut {
            color: var(--context-menu-item-shortcut-color-dark, #aaa);
          }
        }
      </style>
      <button class="item" type="button">
        <span class="icon"></span>
        <div class="content">
          <span class="label"></span>
          <span class="shortcut"></span>
        </div>
      </button>
    `;

    const button = shadowRoot.querySelector('.item')!;
    button.addEventListener('click', this.handleClick.bind(this));
    button.addEventListener('keydown', (event: Event) =>
      this.handleKeyDown(event as KeyboardEvent)
    );
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('context-menu-item');
    }

    // Set up theme inheritance if no explicit theme is set
    if (!this.hasAttribute('theme')) {
      applyEffectiveTheme(this);
      this._themeCleanup = setupThemeInheritance(this);
    } else {
      this.applyTheme(this._theme);
    }

    // Make the element focusable
    this.tabIndex = 0;
    this.addEventListener('focus', this.handleFocus.bind(this));

    this.updateContent();
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
      case 'label':
      case 'icon':
      case 'shortcut':
        this.updateContent();
        break;
      case 'disabled':
        this.updateDisabledState();
        break;
    }
  }

  private updateContent(): void {
    if (!this.shadowRoot) return;

    const iconElement = this.shadowRoot.querySelector('.icon') as HTMLElement;
    const labelElement = this.shadowRoot.querySelector('.label') as HTMLElement;
    const shortcutElement = this.shadowRoot.querySelector(
      '.shortcut'
    ) as HTMLElement;

    // Update icon
    const icon = this.getAttribute('icon');
    if (icon) {
      iconElement.textContent = icon;
      iconElement.style.display = 'flex';
    } else {
      iconElement.textContent = '';
      iconElement.style.display = 'none';
    }

    // Update label
    const label = this.getAttribute('label') || this.textContent?.trim() || '';
    labelElement.textContent = label;

    // Update shortcut
    const shortcut = this.getAttribute('shortcut');
    if (shortcut) {
      shortcutElement.textContent = shortcut;
      shortcutElement.style.display = 'block';
    } else {
      shortcutElement.textContent = '';
      shortcutElement.style.display = 'none';
    }
  }

  private updateDisabledState(): void {
    if (!this.shadowRoot) return;

    const button = this.shadowRoot.querySelector('.item') as HTMLButtonElement;
    button.disabled = this.disabled;
  }

  private handleClick(event: Event): void {
    if (this.disabled) return;

    event.stopPropagation();

    // Find the parent context menu
    const contextMenu = this.closest('e2-context-menu');

    // Dispatch item click event
    dispatchCustomEvent<ContextMenuItemClickEvent['detail']>(
      this,
      'context-menu-item-click',
      {
        itemId: this.id,
        item: this,
        menuId: contextMenu?.id || '',
        menu: contextMenu as HTMLElement,
        value: this.value,
      }
    );

    // Hide the context menu
    if (contextMenu && typeof (contextMenu as any).hide === 'function') {
      (contextMenu as any).hide();
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.disabled) return;

    // Let the parent context menu handle navigation keys
    if (['ArrowDown', 'ArrowUp', 'Escape'].includes(event.key)) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleClick(event);
    }
  }

  private handleFocus(): void {
    if (!this.shadowRoot) return;

    const button = this.shadowRoot.querySelector('.item') as HTMLButtonElement;
    button.focus();
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
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
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
    if (value) {
      this.setAttribute('icon', value);
    } else {
      this.removeAttribute('icon');
    }
  }

  get value(): string {
    return this.getAttribute('value') || this.label;
  }

  set value(value: string) {
    this.setAttribute('value', value);
  }

  get shortcut(): string {
    return this.getAttribute('shortcut') || '';
  }

  set shortcut(value: string) {
    if (value) {
      this.setAttribute('shortcut', value);
    } else {
      this.removeAttribute('shortcut');
    }
  }

  click(): void {
    if (!this.disabled) {
      this.handleClick(new Event('click'));
    }
  }

  focus(): void {
    super.focus();
    this.handleFocus();
  }

  applyTheme(theme: Theme): void {
    this._theme = theme;
    applyTheme(this, theme);
  }
}

// Register the custom element
if (!customElements.get('e2-context-menu-item')) {
  customElements.define('e2-context-menu-item', ContextMenuItem);
}
