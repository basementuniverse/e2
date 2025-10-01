/**
 * Toolbar Separator Element
 * A visual separator for toolbar items
 */

import { Theme } from '../../types';
import { applyTheme, getShadowRoot } from '../../utils';

export class ToolbarSeparator extends HTMLElement {
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
          display: inline-block;
          width: 1px;
          height: 24px;
          background: var(--separator-color, #ccc);
          margin: 0 4px;
          flex-shrink: 0;
        }

        :host(.theme-dark) {
          background: var(--separator-color-dark, #555);
        }
      </style>
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
}

// Register the custom element
if (!customElements.get('e2-toolbar-separator')) {
  customElements.define('e2-toolbar-separator', ToolbarSeparator);
}
