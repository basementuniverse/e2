/**
 * Status Item Element
 * A flexible status bar item that can display text, progress indicators, tools, and other status information
 * Supports different types: text, progress, tool, message, indicator
 */

import {
  EditorElementProperties,
  StatusItemClickEvent,
  StatusItemType,
  StatusItemUpdateEvent,
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

export class StatusItem extends HTMLElement implements EditorElementProperties {
  private _theme: Theme = 'auto';
  private _type: StatusItemType = 'text';
  private _value: string | number = '';
  private _label: string = '';
  private _clickable: boolean = false;
  private _themeCleanup?: () => void;

  static get observedAttributes(): string[] {
    return ['theme', 'type', 'value', 'label', 'clickable', 'disabled'];
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
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          font-family: var(--font-family, system-ui, sans-serif);
          font-size: var(--font-size-small, 12px);
          color: var(--text-color, #333);
          white-space: nowrap;
          border-radius: 2px;
          transition: background-color 0.1s ease;
        }

        :host(.theme-dark) {
          color: var(--text-color-dark, #cccccc);
        }

        :host([clickable]) {
          cursor: pointer;
          padding: 2px 8px;
        }

        :host([clickable]:hover) {
          background: var(--status-item-hover-bg, rgba(0, 0, 0, 0.05));
        }

        :host(.theme-dark[clickable]:hover) {
          background: var(--status-item-hover-bg-dark, rgba(255, 255, 255, 0.1));
        }

        :host([clickable]:active) {
          background: var(--status-item-active-bg, rgba(0, 0, 0, 0.1));
        }

        :host(.theme-dark[clickable]:active) {
          background: var(--status-item-active-bg-dark, rgba(255, 255, 255, 0.15));
        }

        :host([disabled]) {
          opacity: 0.6;
          pointer-events: none;
        }

        .content {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .icon {
          font-size: 10px;
          width: 12px;
          text-align: center;
          flex-shrink: 0;
        }

        .label {
          flex-shrink: 0;
        }

        .value {
          font-weight: 500;
          flex-shrink: 0;
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .progress-bar {
          width: 60px;
          height: 8px;
          background: var(--progress-bg, #e0e0e0);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        :host(.theme-dark) .progress-bar {
          background: var(--progress-bg-dark, #3e3e42);
        }

        .progress-fill {
          height: 100%;
          background: var(--progress-fill, #007acc);
          border-radius: 4px;
          transition: width 0.2s ease;
          min-width: 2px;
        }

        :host(.theme-dark) .progress-fill {
          background: var(--progress-fill-dark, #0e7afe);
        }

        .progress-text {
          font-size: 10px;
          min-width: 30px;
          text-align: right;
        }

        /* Type-specific styles */
        :host([type="tool"]) {
          background: var(--tool-item-bg, rgba(0, 120, 204, 0.1));
          color: var(--tool-item-color, #007acc);
          border: 1px solid var(--tool-item-border, rgba(0, 120, 204, 0.2));
        }

        :host(.theme-dark[type="tool"]) {
          background: var(--tool-item-bg-dark, rgba(14, 122, 254, 0.15));
          color: var(--tool-item-color-dark, #0e7afe);
          border-color: var(--tool-item-border-dark, rgba(14, 122, 254, 0.3));
        }

        :host([type="message"]) {
          font-style: italic;
          opacity: 0.8;
        }

        :host([type="indicator"]) .icon {
          color: var(--indicator-color, #28a745);
        }

        :host(.theme-dark[type="indicator"]) .icon {
          color: var(--indicator-color-dark, #40d865);
        }
      </style>

      <div class="content">
        <span class="icon" id="icon"></span>
        <span class="label" id="label"></span>
        <div class="progress-container" id="progress-container" style="display: none;">
          <div class="progress-bar">
            <div class="progress-fill" id="progress-fill"></div>
          </div>
          <span class="progress-text" id="progress-text"></span>
        </div>
        <span class="value" id="value"></span>
      </div>
    `;

    // Add click handler
    this.addEventListener('click', this.handleClick.bind(this));
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('status-item');
    }

    // Set up theme inheritance if no explicit theme is set
    if (!this.hasAttribute('theme')) {
      applyEffectiveTheme(this);
      this._themeCleanup = setupThemeInheritance(this);
    } else {
      this.applyTheme(this._theme);
    }

    this.updateDisplay();
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
      case 'type':
        this._type = newValue as StatusItemType;
        this.updateDisplay();
        break;
      case 'value':
        this._value = newValue;
        this.updateDisplay();
        break;
      case 'label':
        this._label = newValue;
        this.updateDisplay();
        break;
      case 'clickable':
        this._clickable = newValue !== null;
        break;
    }
  }

  private handleClick(event: Event): void {
    if (!this._clickable || this.hasAttribute('disabled')) return;

    dispatchCustomEvent<StatusItemClickEvent['detail']>(
      this,
      'status-item-click',
      {
        itemId: this.id,
        item: this,
        itemType: this._type,
        value: this._value,
      }
    );
  }

  private updateDisplay(): void {
    if (!this.shadowRoot) return;

    const iconEl = this.shadowRoot.getElementById('icon')!;
    const labelEl = this.shadowRoot.getElementById('label')!;
    const valueEl = this.shadowRoot.getElementById('value')!;
    const progressContainer =
      this.shadowRoot.getElementById('progress-container')!;
    const progressFill = this.shadowRoot.getElementById('progress-fill')!;
    const progressText = this.shadowRoot.getElementById('progress-text')!;

    // Set label
    labelEl.textContent = this._label;
    labelEl.style.display = this._label ? 'inline' : 'none';

    // Handle different types
    switch (this._type) {
      case 'progress':
        this.updateProgressDisplay(
          progressContainer,
          progressFill,
          progressText
        );
        valueEl.style.display = 'none';
        iconEl.style.display = 'none';
        break;

      case 'tool':
        iconEl.textContent = '🔧';
        iconEl.style.display = 'inline';
        valueEl.textContent = String(this._value);
        valueEl.style.display = this._value ? 'inline' : 'none';
        progressContainer.style.display = 'none';
        break;

      case 'indicator':
        iconEl.textContent = '●';
        iconEl.style.display = 'inline';
        valueEl.textContent = String(this._value);
        valueEl.style.display = this._value ? 'inline' : 'none';
        progressContainer.style.display = 'none';
        break;

      case 'message':
        iconEl.textContent = 'ℹ';
        iconEl.style.display = 'inline';
        valueEl.textContent = String(this._value);
        valueEl.style.display = this._value ? 'inline' : 'none';
        progressContainer.style.display = 'none';
        break;

      case 'text':
      default:
        iconEl.style.display = 'none';
        valueEl.textContent = String(this._value);
        valueEl.style.display = this._value ? 'inline' : 'none';
        progressContainer.style.display = 'none';
        break;
    }
  }

  private updateProgressDisplay(
    container: HTMLElement,
    fill: HTMLElement,
    text: HTMLElement
  ): void {
    container.style.display = 'flex';

    const numValue =
      typeof this._value === 'number'
        ? this._value
        : parseFloat(String(this._value)) || 0;
    const percentage = Math.max(0, Math.min(100, numValue * 100));

    fill.style.width = `${percentage}%`;
    text.textContent = `${Math.round(percentage)}%`;
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

  get type(): StatusItemType {
    return this._type;
  }

  set type(value: StatusItemType) {
    this._type = value;
    this.setAttribute('type', value);
  }

  get value(): string | number {
    return this._value;
  }

  set value(newValue: string | number) {
    const oldValue = this._value;
    this._value = newValue;
    this.setAttribute('value', String(newValue));

    // Dispatch update event
    dispatchCustomEvent<StatusItemUpdateEvent['detail']>(
      this,
      'status-item-update',
      {
        itemId: this.id,
        item: this,
        oldValue,
        newValue,
      }
    );
  }

  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
    this.setAttribute('label', value);
  }

  get clickable(): boolean {
    return this._clickable;
  }

  set clickable(value: boolean) {
    this._clickable = value;
    if (value) {
      this.setAttribute('clickable', '');
    } else {
      this.removeAttribute('clickable');
    }
  }

  applyTheme(theme: Theme): void {
    applyTheme(this, theme);
  }

  /**
   * Update the progress value (for progress type items)
   * @param progress Progress value between 0 and 1
   */
  setProgress(progress: number): void {
    if (this._type === 'progress') {
      this.value = Math.max(0, Math.min(1, progress));
    }
  }

  /**
   * Set an icon for the status item
   * @param icon Unicode emoji or symbol
   */
  setIcon(icon: string): void {
    if (this.shadowRoot) {
      const iconEl = this.shadowRoot.getElementById('icon')!;
      iconEl.textContent = icon;
      iconEl.style.display = 'inline';
    }
  }
}

// Register the custom element
if (!customElements.get('e2-status-item')) {
  customElements.define('e2-status-item', StatusItem);
}
