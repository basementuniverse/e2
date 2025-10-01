/**
 * Collapsible Panel Element
 * A panel that can be collapsed to a thin bar with an expand button
 * or expanded to show its full content
 */

import { EditorElementProperties, Theme } from '../../types';
import {
  applyTheme,
  dispatchCustomEvent,
  generateId,
  getShadowRoot,
} from '../../utils';

export type PanelOrientation = 'horizontal' | 'vertical';

export class CollapsiblePanel
  extends HTMLElement
  implements EditorElementProperties
{
  private _theme: Theme = 'auto';
  private _collapsed: boolean = false;
  private _orientation: PanelOrientation = 'vertical';

  static get observedAttributes(): string[] {
    return ['theme', 'disabled', 'collapsed', 'orientation'];
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
          background: var(--panel-bg, #ffffff);
          border: 1px solid var(--panel-border, #ccc);
          font-family: var(--font-family, system-ui, sans-serif);
          font-size: var(--font-size, 14px);
          transition: all 0.3s ease;
        }

        :host(.theme-dark) {
          background: var(--panel-bg-dark, #2d2d2d);
          border-color: var(--panel-border-dark, #555);
          color: var(--text-color-dark, #fff);
        }

        :host([disabled]) {
          opacity: 0.6;
          pointer-events: none;
        }

        /* Vertical orientation (default) */
        :host([orientation="vertical"]) {
          min-height: 200px;
        }

        :host([orientation="vertical"][collapsed]) {
          min-height: 32px;
          height: 32px;
          overflow: hidden;
        }

        /* Horizontal orientation */
        :host([orientation="horizontal"]) {
          min-width: 200px;
          display: inline-block;
          vertical-align: top;
        }

        :host([orientation="horizontal"][collapsed]) {
          min-width: 32px;
          width: 32px;
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          align-items: center;
          padding: 8px;
          background: var(--panel-header-bg, #f8f8f8);
          border-bottom: 1px solid var(--panel-border, #ccc);
          min-height: 16px;
          cursor: pointer;
          user-select: none;
        }

        :host(.theme-dark) .panel-header {
          background: var(--panel-header-bg-dark, #3a3a3a);
          border-bottom-color: var(--panel-border-dark, #555);
        }

        .panel-header:hover {
          background: var(--panel-header-hover-bg, #e8e8e8);
        }

        :host(.theme-dark) .panel-header:hover {
          background: var(--panel-header-hover-bg-dark, #404040);
        }

        .toggle-button {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          margin-right: 8px;
          flex-shrink: 0;
        }

        /* Vertical orientation icons */
        :host([orientation="vertical"]) .toggle-button .burger-icon {
          display: none;
        }

        :host([orientation="vertical"]) .toggle-button .close-icon {
          display: block;
        }

        :host([orientation="vertical"][collapsed]) .toggle-button .burger-icon {
          display: block;
        }

        :host([orientation="vertical"][collapsed]) .toggle-button .close-icon {
          display: none;
        }

        /* Horizontal orientation icons */
        :host([orientation="horizontal"]) .toggle-button .burger-icon {
          display: none;
        }

        :host([orientation="horizontal"]) .toggle-button .close-icon {
          display: block;
        }

        :host([orientation="horizontal"][collapsed]) .toggle-button .burger-icon {
          display: block;
        }

        :host([orientation="horizontal"][collapsed]) .toggle-button .close-icon {
          display: none;
        }

        /* Rotate icons for horizontal orientation */
        :host([orientation="horizontal"]) .toggle-button {
          transform: rotate(90deg);
        }

        .panel-title {
          flex-grow: 1;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Hide title when collapsed */
        :host([collapsed]) .panel-title {
          display: none;
        }

        .panel-content {
          padding: 12px;
          overflow: auto;
        }

        :host([collapsed]) .panel-content {
          display: none;
        }

        /* Content slot styling */
        ::slotted(*) {
          display: block;
        }
      </style>

      <div class="panel-header">
        <div class="toggle-button">
          <span class="burger-icon">☰</span>
          <span class="close-icon">✕</span>
        </div>
        <div class="panel-title">
          <slot name="title">Panel</slot>
        </div>
      </div>

      <div class="panel-content">
        <slot></slot>
      </div>
    `;

    // Add click handler for the header
    const header = shadowRoot.querySelector('.panel-header') as HTMLElement;
    header.addEventListener('click', this.handleToggle.bind(this));
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('collapsible-panel');
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
      case 'collapsed':
        this._collapsed = newValue !== null;
        break;
      case 'orientation':
        this._orientation = (newValue as PanelOrientation) || 'vertical';
        break;
    }
  }

  private handleToggle(): void {
    this.collapsed = !this.collapsed;

    // Dispatch toggle event
    dispatchCustomEvent(this, 'collapsible-panel-toggle', {
      panelId: this.id,
      panel: this,
      collapsed: this.collapsed,
      orientation: this.orientation,
    });
  }

  // Public API
  get theme(): Theme {
    return this._theme;
  }

  set theme(value: Theme) {
    this._theme = value;
    this.applyTheme(value);
  }

  get collapsed(): boolean {
    return this._collapsed;
  }

  set collapsed(value: boolean) {
    this._collapsed = value;
    if (value) {
      this.setAttribute('collapsed', '');
    } else {
      this.removeAttribute('collapsed');
    }
  }

  get orientation(): PanelOrientation {
    return this._orientation;
  }

  set orientation(value: PanelOrientation) {
    this._orientation = value;
    this.setAttribute('orientation', value);
  }

  toggle(): void {
    this.collapsed = !this.collapsed;
  }

  expand(): void {
    this.collapsed = false;
  }

  collapse(): void {
    this.collapsed = true;
  }

  applyTheme(theme: Theme): void {
    applyTheme(this, theme);
  }
}

// Register the custom element
if (!customElements.get('e2-collapsible-panel')) {
  customElements.define('e2-collapsible-panel', CollapsiblePanel);
}
