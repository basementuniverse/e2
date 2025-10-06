/**
 * Context Menu Element
 * A popup menu that appears on right-click or programmatic trigger
 */

import {
  ContextMenuHideEvent,
  ContextMenuShowEvent,
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

export class ContextMenu
  extends HTMLElement
  implements EditorElementProperties
{
  private _theme: Theme = 'auto';
  private _visible: boolean = false;
  private _justShown: boolean = false;
  private _themeCleanup?: () => void;

  static get observedAttributes(): string[] {
    return ['theme', 'disabled', 'target'];
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
          position: fixed;
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
        }

        :host([visible]) {
          display: block;
        }

        :host([disabled]) {
          opacity: 0.6;
          pointer-events: none;
        }

        /* Light theme */
        :host(.theme-light) {
          background: var(--context-menu-bg-light, #ffffff);
          border-color: var(--context-menu-border-light, #d0d0d0);
          box-shadow: var(--context-menu-shadow-light, 0 2px 8px rgba(0, 0, 0, 0.15));
        }

        /* Dark theme */
        :host(.theme-dark) {
          background: var(--context-menu-bg-dark, #2a2a2a);
          border-color: var(--context-menu-border-dark, #444444);
          box-shadow: var(--context-menu-shadow-dark, 0 2px 8px rgba(0, 0, 0, 0.4));
        }

        /* Auto theme - follows system preference */
        @media (prefers-color-scheme: dark) {
          :host(.theme-auto) {
            background: var(--context-menu-bg-dark, #2a2a2a);
            border-color: var(--context-menu-border-dark, #444444);
            box-shadow: var(--context-menu-shadow-dark, 0 2px 8px rgba(0, 0, 0, 0.4));
          }
        }

        ::slotted(*) {
          display: block;
        }
      </style>
      <slot></slot>
    `;
  }

  private bindEvents(): void {
    // Close menu when clicking outside
    document.addEventListener('click', this.handleDocumentClick.bind(this));

    // Close menu on escape key
    document.addEventListener('keydown', this.handleKeyDown.bind(this));

    // Handle window resize
    window.addEventListener('resize', this.handleWindowResize.bind(this));
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('context-menu');
    }

    // Set up theme inheritance if no explicit theme is set
    if (!this.hasAttribute('theme')) {
      applyEffectiveTheme(this);
      this._themeCleanup = setupThemeInheritance(this);
    } else {
      this.applyTheme(this._theme);
    }

    this.setupTargetListeners();
  }

  disconnectedCallback(): void {
    this.removeTargetListeners();

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
      case 'target':
        this.removeTargetListeners();
        this.setupTargetListeners();
        break;
      case 'disabled':
        if (newValue !== null && this._visible) {
          this.hide();
        }
        break;
    }
  }

  private boundContextMenuHandler = this.handleContextMenu.bind(this);

  private setupTargetListeners(): void {
    const targetSelector = this.getAttribute('target');
    if (!targetSelector) return;

    const targets = document.querySelectorAll(targetSelector);
    targets.forEach(target => {
      target.addEventListener('contextmenu', this.boundContextMenuHandler);
    });
  }

  private removeTargetListeners(): void {
    const targetSelector = this.getAttribute('target');
    if (!targetSelector) return;

    const targets = document.querySelectorAll(targetSelector);
    targets.forEach(target => {
      target.removeEventListener('contextmenu', this.boundContextMenuHandler);
    });
  }

  private handleContextMenu(event: Event): void {
    if (this.disabled) return;

    const mouseEvent = event as MouseEvent;
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();

    const trigger = mouseEvent.currentTarget as HTMLElement;
    this.show(mouseEvent.clientX, mouseEvent.clientY, trigger);
  }

  private handleDocumentClick(event: MouseEvent): void {
    if (!this._visible) return;

    // Ignore the click that just triggered the menu to show
    if (this._justShown) {
      this._justShown = false;
      return;
    }

    const target = event.target as Node;
    if (!this.contains(target) && !this.shadowRoot?.contains(target)) {
      this.hide();
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this._visible) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.hide();
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
    if (this._visible) {
      this.hide();
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
    if (focused && focused.tagName === 'e2-context-menu-ITEM') {
      (focused as any).click();
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
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  get visible(): boolean {
    return this._visible;
  }

  get target(): string | null {
    return this.getAttribute('target');
  }

  set target(value: string | null) {
    if (value) {
      this.setAttribute('target', value);
    } else {
      this.removeAttribute('target');
    }
  }

  show(x: number, y: number, trigger?: HTMLElement): void {
    if (this.disabled) return;

    this._visible = true;
    this.setAttribute('visible', '');

    // Position the menu
    this.style.left = `${x}px`;
    this.style.top = `${y}px`;

    // Ensure menu stays within viewport
    this.adjustPosition();

    // Set the flag to prevent immediate hiding, reset it after a short delay
    this._justShown = true;
    setTimeout(() => {
      this._justShown = false;
    }, 50);

    // Ensure all child items have the correct theme
    this.applyTheme(this._theme);

    // Focus first item
    requestAnimationFrame(() => {
      const firstItem = this.querySelector(
        'e2-context-menu-item:not([disabled])'
      ) as HTMLElement;
      if (firstItem) {
        firstItem.focus();
      }
    });

    // Dispatch show event
    dispatchCustomEvent<ContextMenuShowEvent['detail']>(
      this,
      'context-menu-show',
      {
        menuId: this.id,
        menu: this,
        x,
        y,
        trigger: trigger || this,
      }
    );
  }

  hide(): void {
    if (!this._visible) return;

    this._visible = false;
    this.removeAttribute('visible');

    // Dispatch hide event
    dispatchCustomEvent<ContextMenuHideEvent['detail']>(
      this,
      'context-menu-hide',
      {
        menuId: this.id,
        menu: this,
      }
    );
  }

  private adjustPosition(): void {
    const rect = this.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = parseInt(this.style.left);
    let top = parseInt(this.style.top);

    // Adjust horizontal position
    if (left + rect.width > viewportWidth) {
      left = viewportWidth - rect.width - 10;
    }
    if (left < 10) {
      left = 10;
    }

    // Adjust vertical position
    if (top + rect.height > viewportHeight) {
      top = viewportHeight - rect.height - 10;
    }
    if (top < 10) {
      top = 10;
    }

    this.style.left = `${left}px`;
    this.style.top = `${top}px`;
  }

  applyTheme(theme: Theme): void {
    this._theme = theme;
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
}

// Register the custom element
if (!customElements.get('e2-context-menu')) {
  customElements.define('e2-context-menu', ContextMenu);
}
