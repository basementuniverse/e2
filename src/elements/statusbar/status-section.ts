/**
 * Status Section Element
 * A container for grouping status items within a status bar
 * Provides left, center, or right positioning and overflow handling
 */

import {
  EditorElementProperties,
  StatusSectionPosition,
  Theme,
} from '../../types';
import {
  applyEffectiveTheme,
  applyTheme,
  generateId,
  getShadowRoot,
  setupThemeInheritance,
} from '../../utils';

export class StatusSection
  extends HTMLElement
  implements EditorElementProperties
{
  private _theme: Theme = 'auto';
  private _position: StatusSectionPosition = 'left';
  private _themeCleanup?: () => void;

  static get observedAttributes(): string[] {
    return ['theme', 'position', 'disabled'];
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
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-family, system-ui, sans-serif);
          font-size: var(--font-size-small, 12px);
          flex-shrink: 0;
        }

        :host([position="left"]) {
          justify-content: flex-start;
        }

        :host([position="center"]) {
          justify-content: center;
          flex: 1 1 auto;
        }

        :host([position="right"]) {
          justify-content: flex-end;
        }

        :host([disabled]) {
          opacity: 0.6;
          pointer-events: none;
        }

        .section-container {
          display: flex;
          align-items: center;
          gap: inherit;
          min-width: 0; /* Allow shrinking */
          overflow: hidden;
        }

        :host([position="center"]) .section-container {
          width: 100%;
          justify-content: center;
        }

        ::slotted(*) {
          flex-shrink: 0;
          white-space: nowrap;
        }

        /* Responsive behavior - hide items on smaller screens */
        @media (max-width: 768px) {
          ::slotted([data-priority="low"]) {
            display: none;
          }
        }

        @media (max-width: 480px) {
          ::slotted([data-priority="medium"]) {
            display: none;
          }
        }
      </style>

      <div class="section-container">
        <slot></slot>
      </div>
    `;
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('status-section');
    }

    // Set position attribute if not already set
    if (!this.hasAttribute('position')) {
      this.position = this._position;
    }

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
          this.theme = newValue as Theme;
        } else if (this.isConnected) {
          // Attribute was removed, switch to inheritance
          applyEffectiveTheme(this);
          this._themeCleanup = setupThemeInheritance(this);
        }
        break;
      case 'position':
        this._position = newValue as StatusSectionPosition;
        break;
    }
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

  get position(): StatusSectionPosition {
    return this._position;
  }

  set position(value: StatusSectionPosition) {
    this._position = value;
    this.setAttribute('position', value);
  }

  applyTheme(theme: Theme): void {
    applyTheme(this, theme);
  }

  /**
   * Add a status item to this section
   * @param item The status item element to add
   * @param priority Optional priority for responsive behavior ('high', 'medium', 'low')
   */
  addItem(item: HTMLElement, priority?: 'high' | 'medium' | 'low'): void {
    if (priority) {
      item.setAttribute('data-priority', priority);
    }
    this.appendChild(item);
  }

  /**
   * Remove a status item from this section
   * @param item The status item element to remove
   */
  removeItem(item: HTMLElement): void {
    if (this.contains(item)) {
      item.remove();
    }
  }

  /**
   * Clear all items from this section
   */
  clear(): void {
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }
  }

  /**
   * Get all items in this section
   */
  getItems(): HTMLElement[] {
    return Array.from(this.children) as HTMLElement[];
  }

  /**
   * Get items by priority level
   * @param priority The priority level to filter by
   */
  getItemsByPriority(priority: 'high' | 'medium' | 'low'): HTMLElement[] {
    return this.getItems().filter(
      item => item.getAttribute('data-priority') === priority
    );
  }
}

// Register the custom element
if (!customElements.get('e2-status-section')) {
  customElements.define('e2-status-section', StatusSection);
}
