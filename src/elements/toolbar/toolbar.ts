/**
 * Toolbar Element
 * A horizontal container for toolbar buttons and other controls
 */

import { EditorElementProperties, Theme } from '../../types';
import { applyTheme, generateId, getShadowRoot } from '../../utils';

export class Toolbar extends HTMLElement implements EditorElementProperties {
  private _theme: Theme = 'auto';

  static get observedAttributes(): string[] {
    return ['theme', 'disabled'];
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
          padding: 4px;
          background: var(--toolbar-bg, #f0f0f0);
          border-bottom: 1px solid var(--toolbar-border, #ccc);
          gap: 2px;
          font-family: var(--font-family, system-ui, sans-serif);
          font-size: var(--font-size, 14px);
        }

        :host(.theme-dark) {
          background: var(--toolbar-bg-dark, #2d2d2d);
          border-bottom-color: var(--toolbar-border-dark, #555);
          color: var(--text-color-dark, #fff);
        }

        :host([disabled]) {
          opacity: 0.6;
          pointer-events: none;
        }

        ::slotted(*) {
          flex-shrink: 0;
        }
      </style>
      <slot></slot>
    `;
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('toolbar');
    }
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
        this.theme = newValue as Theme;
        break;
    }
  }

  get theme(): Theme {
    return this._theme;
  }

  set theme(value: Theme) {
    this._theme = value;
    this.applyTheme(value);
  }

  applyTheme(theme: Theme): void {
    applyTheme(this, theme);
  }

  /**
   * Close all toolbar menus except the specified one
   * @param exceptMenu The menu to keep open (optional)
   */
  closeAllMenus(exceptMenu?: HTMLElement): void {
    const toolbarMenus = this.querySelectorAll('e2-toolbar-menu');
    toolbarMenus.forEach(menu => {
      if (menu !== exceptMenu && typeof (menu as any).close === 'function') {
        (menu as any).close();
      }
    });
  }
}

// Register the custom element
if (!customElements.get('e2-toolbar')) {
  customElements.define('e2-toolbar', Toolbar);
}
