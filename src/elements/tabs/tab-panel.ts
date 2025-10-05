/**
 * Tab Panel Element
 * Container for tab content that shows/hides based on tab selection
 */

import { EditorElementProperties, Theme } from '../../types';
import { applyTheme, generateId, getShadowRoot } from '../../utils';

export class TabPanel extends HTMLElement implements EditorElementProperties {
  private _theme: Theme = 'auto';
  private _active: boolean = false;

  static get observedAttributes(): string[] {
    return ['theme', 'disabled', 'active'];
  }

  constructor() {
    super();
    this.id = this.id || generateId('tab-panel');
    this.setupElement();
  }

  private setupElement(): void {
    const shadowRoot = getShadowRoot(this);

    shadowRoot.innerHTML = `
      <style>
        :host {
          display: none;
          flex-direction: column;
          width: 100%;
          height: 100%;
          overflow: auto;
          background: var(--tab-panel-bg, #ffffff);
          padding: var(--tab-panel-padding, 16px);
          font-family: var(--font-family, system-ui, sans-serif);
          font-size: var(--font-size, 14px);
          color: var(--tab-panel-color, #333);
          box-sizing: border-box;
        }

        :host([active]) {
          display: flex;
        }

        :host(.theme-dark) {
          background: var(--tab-panel-bg-dark, #1e1e1e);
          color: var(--tab-panel-color-dark, #fff);
        }

        :host([disabled]) {
          opacity: 0.6;
          pointer-events: none;
        }

        /* Scrollbar styling for dark theme */
        :host(.theme-dark) {
          scrollbar-width: thin;
          scrollbar-color: var(--scrollbar-thumb-dark, #555) var(--scrollbar-track-dark, #2d2d2d);
        }

        :host(.theme-dark)::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        :host(.theme-dark)::-webkit-scrollbar-track {
          background: var(--scrollbar-track-dark, #2d2d2d);
        }

        :host(.theme-dark)::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb-dark, #555);
          border-radius: 4px;
        }

        :host(.theme-dark)::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover-dark, #666);
        }

        /* Light theme scrollbar */
        :host(.theme-light) {
          scrollbar-width: thin;
          scrollbar-color: var(--scrollbar-thumb-light, #ccc) var(--scrollbar-track-light, #f0f0f0);
        }

        :host(.theme-light)::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        :host(.theme-light)::-webkit-scrollbar-track {
          background: var(--scrollbar-track-light, #f0f0f0);
        }

        :host(.theme-light)::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb-light, #ccc);
          border-radius: 4px;
        }

        :host(.theme-light)::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover-light, #bbb);
        }

        /* Content styling */
        ::slotted(*) {
          max-width: 100%;
        }

        ::slotted(h1),
        ::slotted(h2),
        ::slotted(h3),
        ::slotted(h4),
        ::slotted(h5),
        ::slotted(h6) {
          margin-top: 0;
          color: inherit;
        }

        ::slotted(p) {
          line-height: 1.5;
          margin-bottom: 1em;
        }

        ::slotted(pre) {
          background: var(--code-bg, #f5f5f5);
          padding: 12px;
          border-radius: 4px;
          overflow-x: auto;
          font-family: var(--font-family-mono, 'Consolas', 'Monaco', monospace);
        }

        :host(.theme-dark) ::slotted(pre) {
          background: var(--code-bg-dark, #0d1117);
        }

        ::slotted(code) {
          background: var(--code-bg, #f5f5f5);
          padding: 2px 4px;
          border-radius: 2px;
          font-family: var(--font-family-mono, 'Consolas', 'Monaco', monospace);
          font-size: 0.9em;
        }

        :host(.theme-dark) ::slotted(code) {
          background: var(--code-bg-dark, #0d1117);
        }

        /* Loading state */
        :host([loading]) {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        :host([loading])::before {
          content: 'Loading...';
          color: var(--tab-panel-loading-color, #666);
        }

        :host(.theme-dark[loading])::before {
          color: var(--tab-panel-loading-color-dark, #aaa);
        }

        /* Empty state */
        :host(:empty:not([loading])) {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        :host(:empty:not([loading]))::before {
          content: attr(data-empty-message);
          color: var(--tab-panel-empty-color, #999);
          font-style: italic;
        }

        :host(.theme-dark:empty:not([loading]))::before {
          color: var(--tab-panel-empty-color-dark, #666);
        }
      </style>

      <slot></slot>
    `;

    this.applyTheme(this._theme);
  }

  // Public API
  public show(): void {
    this.active = true;
  }

  public hide(): void {
    this.active = false;
  }

  public scrollToTop(): void {
    this.scrollTop = 0;
  }

  public scrollToBottom(): void {
    this.scrollTop = this.scrollHeight;
  }

  public scrollToElement(element: Element): void {
    if (this.contains(element)) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  public clearContent(): void {
    this.innerHTML = '';
  }

  public setContent(content: string): void {
    this.innerHTML = content;
  }

  public appendContent(content: string): void {
    this.insertAdjacentHTML('beforeend', content);
  }

  public prependContent(content: string): void {
    this.insertAdjacentHTML('afterbegin', content);
  }

  // Properties
  public get theme(): Theme {
    return this._theme;
  }

  public set theme(value: Theme) {
    this._theme = value;
    this.setAttribute('theme', value);
    this.applyTheme(value);
  }

  public get active(): boolean {
    return this._active;
  }

  public set active(value: boolean) {
    this._active = value;
    if (value) {
      this.setAttribute('active', '');
      this.style.display = 'flex';
    } else {
      this.removeAttribute('active');
      this.style.display = 'none';
    }
  }

  public get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  public set disabled(value: boolean) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  public get loading(): boolean {
    return this.hasAttribute('loading');
  }

  public set loading(value: boolean) {
    if (value) {
      this.setAttribute('loading', '');
    } else {
      this.removeAttribute('loading');
    }
  }

  public get emptyMessage(): string {
    return this.getAttribute('data-empty-message') || 'No content available';
  }

  public set emptyMessage(value: string) {
    this.setAttribute('data-empty-message', value);
  }

  public applyTheme(theme: Theme): void {
    applyTheme(this, theme);
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'theme':
        this._theme = (newValue as Theme) || 'auto';
        this.applyTheme(this._theme);
        break;
      case 'active':
        this._active = newValue !== null;
        if (this._active) {
          this.style.display = 'flex';
        } else {
          this.style.display = 'none';
        }
        break;
    }
  }

  connectedCallback(): void {
    // Handle pending setup from dynamic creation
    if ((this as any)._pendingSetup) {
      const setup = (this as any)._pendingSetup;

      // Set attributes safely now that element is connected
      if (setup.slot) {
        this.setAttribute('slot', setup.slot);
      }
      if (setup.content) {
        this.innerHTML = setup.content;
      }
      if (setup.theme) {
        this.applyTheme(setup.theme);
      }

      // Clean up
      delete (this as any)._pendingSetup;
    }

    // Set initial visibility based on active state
    if (this._active) {
      this.style.display = 'flex';
    } else {
      this.style.display = 'none';
    }

    // Set default empty message if not provided
    if (!this.hasAttribute('data-empty-message')) {
      this.emptyMessage = 'No content available';
    }
  }
}

// Register the custom element
if (!customElements.get('e2-tab-panel')) {
  customElements.define('e2-tab-panel', TabPanel);
}
