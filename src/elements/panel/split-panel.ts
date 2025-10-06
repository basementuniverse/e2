/**
 * Split Panel Element
 * A single panel within a split panel container that can be resized
 */

import { EditorElementProperties, Theme } from '../../types';
import { applyTheme, generateId, getShadowRoot } from '../../utils';

export class SplitPanel extends HTMLElement implements EditorElementProperties {
  private _theme: Theme = 'auto';
  private _size: number = 50; // percentage
  private _minSize: number = 10; // percentage
  private _maxSize: number = 90; // percentage
  private _resizable: boolean = true;

  static get observedAttributes(): string[] {
    return ['theme', 'disabled', 'size', 'min-size', 'max-size', 'resizable'];
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
          border: 1px solid var(--panel-border, #e0e0e0);
          font-family: var(--font-family, system-ui, sans-serif);
          font-size: var(--font-size, 14px);
          overflow: hidden;
          box-sizing: border-box;
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

        .panel-content {
          width: 100%;
          height: 100%;
          overflow: auto;
          box-sizing: border-box;
          padding: var(--panel-padding, 8px);
        }

        /* Content slot styling */
        ::slotted(*) {
          display: block;
        }
      </style>

      <div class="panel-content">
        <slot></slot>
      </div>
    `;

    // Set up event listeners
    this.addEventListener('resize', this.handleResize.bind(this));
  }

  connectedCallback(): void {
    // Apply initial attribute values
    this.applyTheme(this._theme);

    // Generate ID if not provided
    if (!this.id) {
      this.id = generateId('split-panel');
    }
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
      case 'size':
        this._size = parseFloat(newValue || '50');
        this.updateSize();
        break;
      case 'min-size':
        this._minSize = parseFloat(newValue || '10');
        break;
      case 'max-size':
        this._maxSize = parseFloat(newValue || '90');
        break;
      case 'resizable':
        this._resizable = newValue !== 'false';
        break;
      case 'disabled':
        this.toggleAttribute('disabled', newValue !== null);
        break;
    }
  }

  private handleResize(): void {
    // Handle resize events from the container
    this.updateSize();
  }

  private updateSize(): void {
    // The container will handle the actual sizing via CSS
    // This method can be used for cleanup or notifications
  }

  // Public API
  get theme(): Theme {
    return this._theme;
  }

  set theme(value: Theme) {
    this.setAttribute('theme', value);
  }

  get size(): number {
    return this._size;
  }

  set size(value: number) {
    this.setAttribute('size', value.toString());
  }

  get minSize(): number {
    return this._minSize;
  }

  set minSize(value: number) {
    this.setAttribute('min-size', value.toString());
  }

  get maxSize(): number {
    return this._maxSize;
  }

  set maxSize(value: number) {
    this.setAttribute('max-size', value.toString());
  }

  get resizable(): boolean {
    return this._resizable;
  }

  set resizable(value: boolean) {
    this.setAttribute('resizable', value.toString());
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value);
  }

  applyTheme(theme: Theme): void {
    applyTheme(this, theme);
  }

  // Utility method to get the current computed size
  getCurrentSize(): number {
    const container = this.parentElement;
    if (!container) return this._size;

    const isVertical = container.getAttribute('orientation') === 'vertical';

    if (isVertical) {
      const containerHeight = container.clientHeight;
      const thisHeight = this.clientHeight;
      return (thisHeight / containerHeight) * 100;
    } else {
      const containerWidth = container.clientWidth;
      const thisWidth = this.clientWidth;
      return (thisWidth / containerWidth) * 100;
    }
  }
}

// Register the element
if (!customElements.get('e2-split-panel')) {
  customElements.define('e2-split-panel', SplitPanel);
}

export default SplitPanel;
