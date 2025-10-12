/**
 * Context Menu Menu Element
 * A menu item that contains a sub-menu that appears on hover
 */

import {
  ContextMenuMenuHideEvent,
  ContextMenuMenuShowEvent,
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

export class ContextMenuMenu
  extends HTMLElement
  implements EditorElementProperties
{
  private _theme: Theme = 'auto';
  private _subMenuVisible: boolean = false;
  private _subMenu?: HTMLElement;
  private _hoverTimeout?: number;
  private _hideTimeout?: number;
  private _themeCleanup?: () => void;

  static get observedAttributes(): string[] {
    return ['label', 'icon', 'theme', 'disabled'];
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
          position: relative;
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

        .arrow {
          color: var(--context-menu-item-shortcut-color, #666);
          font-size: 0.85em;
          margin-left: 12px;
          flex-shrink: 0;
          width: 12px;
          height: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .submenu {
          position: fixed;
          z-index: 10000;
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

        .submenu.visible {
          display: block;
        }

        /* Light theme */
        :host(.theme-light) .item {
          color: var(--context-menu-item-color-light, #333);
        }

        :host(.theme-light) .item:hover,
        :host(.theme-light) .item:focus {
          background: var(--context-menu-item-hover-bg-light, rgba(0, 0, 0, 0.1));
        }

        :host(.theme-light) .arrow {
          color: var(--context-menu-item-shortcut-color-light, #666);
        }

        :host(.theme-light) .submenu {
          background: var(--context-menu-bg-light, #ffffff);
          border-color: var(--context-menu-border-light, #d0d0d0);
          box-shadow: var(--context-menu-shadow-light, 0 2px 8px rgba(0, 0, 0, 0.15));
        }

        /* Dark theme */
        :host(.theme-dark) .item {
          color: var(--context-menu-item-color-dark, #fff);
        }

        :host(.theme-dark) .item:hover,
        :host(.theme-dark) .item:focus {
          background: var(--context-menu-item-hover-bg-dark, rgba(255, 255, 255, 0.1));
        }

        :host(.theme-dark) .arrow {
          color: var(--context-menu-item-shortcut-color-dark, #aaa);
        }

        :host(.theme-dark) .submenu {
          background: var(--context-menu-bg-dark, #2a2a2a);
          border-color: var(--context-menu-border-dark, #444444);
          box-shadow: var(--context-menu-shadow-dark, 0 2px 8px rgba(0, 0, 0, 0.4));
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

          :host(.theme-auto) .arrow {
            color: var(--context-menu-item-shortcut-color-dark, #aaa);
          }

          :host(.theme-auto) .submenu {
            background: var(--context-menu-bg-dark, #2a2a2a);
            border-color: var(--context-menu-border-dark, #444444);
            box-shadow: var(--context-menu-shadow-dark, 0 2px 8px rgba(0, 0, 0, 0.4));
          }
        }
      </style>
      <button class="item" type="button">
        <span class="icon"></span>
        <div class="content">
          <span class="label"></span>
          <span class="arrow">▶</span>
        </div>
      </button>
      <div class="submenu">
        <slot></slot>
      </div>
    `;

    const button = shadowRoot.querySelector('.item')!;
    button.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    button.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    button.addEventListener('click', this.handleClick.bind(this));
    button.addEventListener('keydown', (event: Event) =>
      this.handleKeyDown(event as KeyboardEvent)
    );

    const submenu = shadowRoot.querySelector('.submenu')!;
    submenu.addEventListener(
      'mouseenter',
      this.handleSubMenuMouseEnter.bind(this)
    );
    submenu.addEventListener(
      'mouseleave',
      this.handleSubMenuMouseLeave.bind(this)
    );
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('context-menu-menu');
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

    // Store reference to submenu
    this._subMenu = this.shadowRoot?.querySelector('.submenu') as HTMLElement;
  }

  disconnectedCallback(): void {
    // Clear any pending timeouts
    if (this._hoverTimeout) {
      clearTimeout(this._hoverTimeout);
    }
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
    }

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
        this.updateContent();
        break;
      case 'disabled':
        this.updateDisabledState();
        if (newValue !== null && this._subMenuVisible) {
          this.hideSubMenu();
        }
        break;
    }
  }

  private updateContent(): void {
    if (!this.shadowRoot) return;

    const iconElement = this.shadowRoot.querySelector('.icon') as HTMLElement;
    const labelElement = this.shadowRoot.querySelector('.label') as HTMLElement;

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
  }

  private updateDisabledState(): void {
    if (!this.shadowRoot) return;

    const button = this.shadowRoot.querySelector('.item') as HTMLButtonElement;
    button.disabled = this.disabled;
  }

  private handleMouseEnter(): void {
    if (this.disabled) return;

    // Clear any pending hide timeout
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = undefined;
    }

    // Clear any existing hover timeout first
    if (this._hoverTimeout) {
      clearTimeout(this._hoverTimeout);
      this._hoverTimeout = undefined;
    }

    // Show submenu after a short delay
    this._hoverTimeout = window.setTimeout(() => {
      this.showSubMenu();
    }, 300);
  }

  private handleMouseLeave(): void {
    if (this.disabled) return;

    // Clear the hover timeout
    if (this._hoverTimeout) {
      clearTimeout(this._hoverTimeout);
      this._hoverTimeout = undefined;
    }

    // Hide submenu after a short delay (unless mouse enters submenu)
    this._hideTimeout = window.setTimeout(() => {
      this.hideSubMenu();
    }, 300);
  }

  private handleSubMenuMouseEnter(): void {
    // Clear any pending hide timeout when mouse enters submenu
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = undefined;
    }
  }

  private handleSubMenuMouseLeave(): void {
    // Clear any existing hide timeout first
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = undefined;
    }

    // Hide submenu when mouse leaves submenu
    this._hideTimeout = window.setTimeout(() => {
      this.hideSubMenu();
    }, 300);
  }

  private handleClick(event: Event): void {
    if (this.disabled) return;

    event.stopPropagation();

    // Clear any pending timeouts
    if (this._hoverTimeout) {
      clearTimeout(this._hoverTimeout);
      this._hoverTimeout = undefined;
    }
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = undefined;
    }

    // Toggle submenu visibility on click
    if (this._subMenuVisible) {
      this.hideSubMenu();
    } else {
      this.showSubMenu();
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.disabled) return;

    // Let the parent context menu handle most navigation keys
    if (['ArrowDown', 'ArrowUp', 'Escape'].includes(event.key)) {
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      this.showSubMenu();

      // Focus first item in submenu
      requestAnimationFrame(() => {
        const firstItem = this._subMenu?.querySelector(
          'e2-context-menu-item:not([disabled]), e2-context-menu-menu:not([disabled])'
        ) as HTMLElement;
        if (firstItem) {
          firstItem.focus();
        }
      });
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      event.stopPropagation();
      this.hideSubMenu();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleClick(event);
    }
  }

  private handleFocus(): void {
    if (!this.shadowRoot) return;

    const button = this.shadowRoot.querySelector('.item') as HTMLButtonElement;
    button.focus();
  }

  private showSubMenu(): void {
    if (!this._subMenu || this.disabled || this._subMenuVisible) return;

    // Close sibling sub-menus first
    this.closeSiblingSubMenus();

    this._subMenuVisible = true;
    // Reset display style in case it was set to 'none' during reset
    this._subMenu.style.display = '';
    this._subMenu.classList.add('visible');

    // Position the submenu
    this.positionSubMenu();

    // Apply theme to child items
    this.applyTheme(this._theme);

    // Find the parent context menu
    const parentMenu = this.closest('e2-context-menu');

    // Dispatch show event
    dispatchCustomEvent<ContextMenuMenuShowEvent['detail']>(
      this,
      'context-menu-menu-show',
      {
        menuId: parentMenu?.id || '',
        menu: parentMenu as HTMLElement,
        subMenuId: this.id,
        subMenu: this,
        x: parseInt(this._subMenu.style.left) || 0,
        y: parseInt(this._subMenu.style.top) || 0,
        trigger: this,
      }
    );
  }

  private closeSiblingSubMenus(): void {
    // Find the root context menu to get all sub-menus
    const rootContextMenu = this.closest('e2-context-menu');
    if (!rootContextMenu) return;

    // Get all sub-menus in the entire context menu tree
    const allSubMenus = rootContextMenu.querySelectorAll(
      'e2-context-menu-menu'
    );

    allSubMenus.forEach(subMenu => {
      // Skip ourselves
      if (subMenu === this) return;

      // Don't close child sub-menus of this sub-menu (they should remain open)
      if (this.contains(subMenu)) return;

      // Don't close parent sub-menus of this sub-menu (they should remain open)
      if (subMenu.contains(this)) return;

      // Close all other sub-menus (siblings and unrelated sub-menus)
      if (typeof (subMenu as any).hideSubMenu === 'function') {
        (subMenu as any).hideSubMenu();
      }
    });
  }

  hideSubMenu(): void {
    if (!this._subMenu) return;

    // Check if it was actually visible before hiding
    const wasVisible = this._subMenuVisible;

    // Always reset state and remove class, even if we think it's not visible
    this._subMenuVisible = false;
    this._subMenu.classList.remove('visible');
    // Clear any inline display style that might override the CSS class
    this._subMenu.style.display = '';

    // Clear any pending timeouts
    if (this._hoverTimeout) {
      clearTimeout(this._hoverTimeout);
      this._hoverTimeout = undefined;
    }
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = undefined;
    }

    // Hide any nested sub-menus recursively
    const nestedSubMenus = this.querySelectorAll('e2-context-menu-menu');
    nestedSubMenus.forEach(nestedSubMenu => {
      if (typeof (nestedSubMenu as any).hideSubMenu === 'function') {
        (nestedSubMenu as any).hideSubMenu();
      }
    });

    // Find the parent context menu
    const parentMenu = this.closest('e2-context-menu');

    // Only dispatch hide event if the submenu was actually visible
    if (wasVisible) {
      dispatchCustomEvent<ContextMenuMenuHideEvent['detail']>(
        this,
        'context-menu-menu-hide',
        {
          menuId: parentMenu?.id || '',
          menu: parentMenu as HTMLElement,
          subMenuId: this.id,
          subMenu: this,
        }
      );
    }
  }

  private positionSubMenu(): void {
    if (!this._subMenu) return;

    const itemRect = this.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get submenu dimensions (temporarily show it to measure)
    const originalDisplay = this._subMenu.style.display;
    this._subMenu.style.visibility = 'hidden';
    this._subMenu.style.display = 'block';
    const submenuRect = this._subMenu.getBoundingClientRect();
    this._subMenu.style.visibility = '';
    // Restore original display value instead of leaving it as 'block'
    this._subMenu.style.display = originalDisplay;

    // Calculate initial position (to the right of the item)
    let left = itemRect.right;
    let top = itemRect.top;

    // Check if submenu would go off the right edge
    if (left + submenuRect.width > viewportWidth) {
      // Position to the left of the item instead
      left = itemRect.left - submenuRect.width;
    }

    // Ensure submenu doesn't go off the left edge
    if (left < 10) {
      left = 10;
    }

    // Check if submenu would go off the bottom edge
    if (top + submenuRect.height > viewportHeight) {
      top = viewportHeight - submenuRect.height - 10;
    }

    // Ensure submenu doesn't go off the top edge
    if (top < 10) {
      top = 10;
    }

    this._subMenu.style.left = `${left}px`;
    this._subMenu.style.top = `${top}px`;
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

  get subMenuVisible(): boolean {
    return this._subMenuVisible;
  }

  // Force reset the sub-menu state - used when context menu is hidden
  resetSubMenuState(): void {
    this._subMenuVisible = false;
    if (this._subMenu) {
      this._subMenu.classList.remove('visible');
      // Force hide the submenu element to ensure it's not displayed
      this._subMenu.style.display = 'none';
      // Clear any positioning styles that might cause it to reappear
      this._subMenu.style.left = '';
      this._subMenu.style.top = '';
    }

    // Clear any pending timeouts
    if (this._hoverTimeout) {
      clearTimeout(this._hoverTimeout);
      this._hoverTimeout = undefined;
    }
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = undefined;
    }

    // Reset nested sub-menus recursively
    const nestedSubMenus = this.querySelectorAll('e2-context-menu-menu');
    nestedSubMenus.forEach(nestedSubMenu => {
      if (typeof (nestedSubMenu as any).resetSubMenuState === 'function') {
        (nestedSubMenu as any).resetSubMenuState();
      }
    });
  }

  focus(): void {
    super.focus();
    this.handleFocus();
  }

  applyTheme(theme: Theme): void {
    this._theme = theme;
    applyTheme(this, theme);

    // Apply theme to all child context menu items, separators, and sub-menus
    const childItems = this.querySelectorAll(
      'e2-context-menu-item, e2-context-menu-separator, e2-context-menu-menu'
    );
    childItems.forEach(child => {
      if (typeof (child as any).applyTheme === 'function') {
        (child as any).applyTheme(theme);
      }
    });
  }
}

// Register the custom element
if (!customElements.get('e2-context-menu-menu')) {
  customElements.define('e2-context-menu-menu', ContextMenuMenu);
}
