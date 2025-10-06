/**
 * Toolbar Menu Element
 * A dropdown menu button designed to be used within a toolbar
 */

import { EditorElementProperties, Theme } from '../../types';
import {
  applyEffectiveTheme,
  applyTheme,
  generateId,
  getShadowRoot,
  setupThemeInheritance,
} from '../../utils';

export class ToolbarMenu
  extends HTMLElement
  implements EditorElementProperties
{
  private _theme: Theme = 'auto';
  private _isOpen: boolean = false;
  private _justOpened: boolean = false;
  private _themeCleanup?: () => void;

  static get observedAttributes(): string[] {
    return ['label', 'icon', 'theme', 'disabled'];
  }

  constructor() {
    super();
    this.setupElement();
    this.bindEvents();
  }

  private setupElement(): void {
    const shadowRoot = getShadowRoot(this);

    shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          position: relative;
        }

        .button {
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

        .button:hover {
          background: var(--button-hover-bg, rgba(0, 0, 0, 0.1));
        }

        .button:active,
        .button.open {
          background: var(--button-active-bg, rgba(0, 0, 0, 0.2));
        }

        .button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        :host(.theme-dark) .button {
          color: var(--text-color-dark, #fff);
        }

        :host(.theme-dark) .button:hover {
          background: var(--button-hover-bg-dark, rgba(255, 255, 255, 0.1));
        }

        :host(.theme-dark) .button:active,
        :host(.theme-dark) .button.open {
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

        .dropdown-arrow {
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 4px solid currentColor;
          margin-left: 4px;
          flex-shrink: 0;
        }

        .dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 9999;
          display: none;
          min-width: 180px;
          background: var(--context-menu-bg, #ffffff);
          border: 1px solid var(--context-menu-border, #d0d0d0);
          border-radius: 4px;
          box-shadow: var(--context-menu-shadow, 0 2px 8px rgba(0, 0, 0, 0.15));
          padding: 4px 0;
          font-family: inherit;
          font-size: 14px;
          margin-top: 2px;
        }

        .dropdown.open {
          display: block;
        }

        :host(.theme-light) .dropdown {
          background: var(--context-menu-bg-light, #ffffff);
          border-color: var(--context-menu-border-light, #d0d0d0);
          box-shadow: var(--context-menu-shadow-light, 0 2px 8px rgba(0, 0, 0, 0.15));
        }

        :host(.theme-dark) .dropdown {
          background: var(--context-menu-bg-dark, #2a2a2a);
          border-color: var(--context-menu-border-dark, #444444);
          box-shadow: var(--context-menu-shadow-dark, 0 2px 8px rgba(0, 0, 0, 0.4));
        }

        @media (prefers-color-scheme: dark) {
          :host(.theme-auto) .dropdown {
            background: var(--context-menu-bg-dark, #2a2a2a);
            border-color: var(--context-menu-border-dark, #444444);
            box-shadow: var(--context-menu-shadow-dark, 0 2px 8px rgba(0, 0, 0, 0.4));
          }
        }

        ::slotted(*) {
          display: block;
        }
      </style>
      <button class="button">
        <span class="icon" style="display: none;"></span>
        <span class="label"></span>
        <div class="dropdown-arrow"></div>
      </button>
      <div class="dropdown">
        <slot></slot>
      </div>
    `;

    const button = shadowRoot.querySelector('.button')!;
    button.addEventListener('click', this.handleButtonClick.bind(this));
  }

  private bindEvents(): void {
    // Close menu when clicking outside
    document.addEventListener('click', this.handleDocumentClick.bind(this));

    // Close menu on escape key
    document.addEventListener('keydown', this.handleKeyDown.bind(this));

    // Handle window resize
    window.addEventListener('resize', this.handleWindowResize.bind(this));

    // Listen for item clicks to close menu
    this.addEventListener('click', this.handleItemClick.bind(this));
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('toolbar-menu');
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
    const button = this.shadowRoot!.querySelector(
      '.button'
    )! as HTMLButtonElement;
    button.disabled = this.hasAttribute('disabled');

    if (this.hasAttribute('disabled') && this._isOpen) {
      this.close();
    }
  }

  private handleButtonClick(event: Event): void {
    if (this.hasAttribute('disabled')) return;

    event.stopPropagation();

    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private handleDocumentClick(event: MouseEvent): void {
    if (!this._isOpen) return;

    // Ignore the click that just opened the menu
    if (this._justOpened) {
      this._justOpened = false;
      return;
    }

    const target = event.target as Node;
    if (!this.contains(target) && !this.shadowRoot?.contains(target)) {
      this.close();
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this._isOpen) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextItem();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousItem();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.activateFocusedItem();
        break;
    }
  }

  private handleWindowResize(): void {
    if (this._isOpen) {
      this.close();
    }
  }

  private handleItemClick(event: Event): void {
    // Close menu when any item is clicked
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'E2-CONTEXT-MENU-ITEM' ||
      target.closest('e2-context-menu-item')
    ) {
      // Small delay to allow the item click event to be processed first
      setTimeout(() => this.close(), 0);
    }
  }

  private focusNextItem(): void {
    const items = this.querySelectorAll('e2-context-menu-item:not([disabled])');
    const currentIndex = Array.from(items).findIndex(
      item => item === document.activeElement || item.shadowRoot?.activeElement
    );

    const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    (items[nextIndex] as HTMLElement).focus();
  }

  private focusPreviousItem(): void {
    const items = this.querySelectorAll('e2-context-menu-item:not([disabled])');
    const currentIndex = Array.from(items).findIndex(
      item => item === document.activeElement || item.shadowRoot?.activeElement
    );

    const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    (items[prevIndex] as HTMLElement).focus();
  }

  private activateFocusedItem(): void {
    const focused = document.activeElement;
    if (focused && focused.tagName === 'E2-CONTEXT-MENU-ITEM') {
      (focused as any).click();
    }
  }

  private adjustPosition(): void {
    const dropdown = this.shadowRoot!.querySelector('.dropdown') as HTMLElement;
    const rect = this.getBoundingClientRect();
    const dropdownRect = dropdown.getBoundingClientRect();

    // Check if dropdown would go off the right edge of the viewport
    if (rect.left + dropdownRect.width > window.innerWidth) {
      dropdown.style.left = 'auto';
      dropdown.style.right = '0';
    } else {
      dropdown.style.left = '0';
      dropdown.style.right = 'auto';
    }

    // Check if dropdown would go off the bottom edge of the viewport
    if (rect.bottom + dropdownRect.height > window.innerHeight) {
      dropdown.style.top = 'auto';
      dropdown.style.bottom = '100%';
      dropdown.style.marginTop = '0';
      dropdown.style.marginBottom = '2px';
    } else {
      dropdown.style.top = '100%';
      dropdown.style.bottom = 'auto';
      dropdown.style.marginTop = '2px';
      dropdown.style.marginBottom = '0';
    }
  }

  // Public API
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

    // Apply theme to all child context menu items and separators
    const childItems = this.querySelectorAll(
      'e2-context-menu-item, e2-context-menu-separator'
    );
    childItems.forEach(child => {
      if (typeof (child as any).applyTheme === 'function') {
        (child as any).applyTheme(theme);
      }
    });
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

  get isOpen(): boolean {
    return this._isOpen;
  }

  open(): void {
    if (this.hasAttribute('disabled') || this._isOpen) return;

    // Close other toolbar menus in the same toolbar
    const parentToolbar = this.closest('e2-toolbar');
    if (
      parentToolbar &&
      typeof (parentToolbar as any).closeAllMenus === 'function'
    ) {
      (parentToolbar as any).closeAllMenus(this);
    }

    this._isOpen = true;
    const button = this.shadowRoot!.querySelector('.button')!;
    const dropdown = this.shadowRoot!.querySelector('.dropdown')!;

    button.classList.add('open');
    dropdown.classList.add('open');

    // Adjust position to stay within viewport
    this.adjustPosition();

    // Set the flag to prevent immediate closing
    this._justOpened = true;

    // Ensure all child items have the correct theme
    this.applyTheme(this._theme);

    // Dispatch show event
    const showEvent = new CustomEvent('toolbar-menu-show', {
      detail: {
        menuId: this.id,
        menu: this,
      },
      bubbles: true,
      cancelable: true,
    });

    this.dispatchEvent(showEvent);
  }

  close(): void {
    if (!this._isOpen) return;

    this._isOpen = false;
    const button = this.shadowRoot!.querySelector('.button')!;
    const dropdown = this.shadowRoot!.querySelector('.dropdown')!;

    button.classList.remove('open');
    dropdown.classList.remove('open');

    // Dispatch hide event
    const hideEvent = new CustomEvent('toolbar-menu-hide', {
      detail: {
        menuId: this.id,
        menu: this,
      },
      bubbles: true,
      cancelable: true,
    });

    this.dispatchEvent(hideEvent);
  }

  toggle(): void {
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}

// Register the custom element
if (!customElements.get('e2-toolbar-menu')) {
  customElements.define('e2-toolbar-menu', ToolbarMenu);
}
