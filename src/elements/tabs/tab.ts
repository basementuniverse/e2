/**
 * Tab Element
 * Individual tab that can be clicked to show associated content
 */

import { EditorElementProperties, Theme } from '../../types';
import {
  applyEffectiveTheme,
  applyTheme,
  dispatchCustomEvent,
  generateId,
  getShadowRoot,
  notifyThemeChange,
  setupThemeInheritance,
} from '../../utils';

export class Tab extends HTMLElement implements EditorElementProperties {
  private _theme: Theme = 'auto';
  private _active: boolean = false;
  private _closable: boolean = false;
  private _icon: string = '';
  private _label: string = '';
  private _themeCleanup?: () => void;

  static get observedAttributes(): string[] {
    return [
      'theme',
      'disabled',
      'active',
      'closable',
      'icon',
      'label',
      'panel',
    ];
  }

  constructor() {
    super();
    this.setupElement();
    this.setupEventListeners();
  }

  private setupElement(): void {
    const shadowRoot = getShadowRoot(this);

    shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background: var(--tab-bg, #f8f8f8);
          border: 1px solid var(--tab-border, #ddd);
          border-bottom: none;
          cursor: pointer;
          user-select: none;
          font-family: var(--font-family, system-ui, sans-serif);
          font-size: var(--font-size, 14px);
          color: var(--tab-color, #333);
          min-width: 0;
          position: relative;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        :host(:hover) {
          background: var(--tab-bg-hover, #e8e8e8);
        }

        :host([active]) {
          background: var(--tab-bg-active, #ffffff);
          color: var(--tab-color-active, #000);
          border-bottom: 1px solid var(--tab-bg-active, #ffffff);
          z-index: 1;
        }

        :host(.theme-dark) {
          background: var(--tab-bg-dark, #2d2d2d);
          border-color: var(--tab-border-dark, #555);
          color: var(--tab-color-dark, #ccc);
        }

        :host(.theme-dark:hover) {
          background: var(--tab-bg-hover-dark, #3d3d3d);
        }

        :host(.theme-dark[active]) {
          background: var(--tab-bg-active-dark, #1e1e1e);
          color: var(--tab-color-active-dark, #fff);
          border-bottom-color: var(--tab-bg-active-dark, #1e1e1e);
        }

        :host([disabled]) {
          opacity: 0.6;
          cursor: not-allowed;
          pointer-events: none;
        }

        /* Tab position adjustments for container orientation */
        :host-context(e2-tab-container[tab-position="bottom"]) {
          border-top: none;
          border-bottom: 1px solid var(--tab-border, #ddd);
        }

        :host-context(e2-tab-container[tab-position="bottom"][active]) {
          border-top: 1px solid var(--tab-bg-active, #ffffff);
          border-bottom-color: var(--tab-bg-active, #ffffff);
        }

        :host-context(e2-tab-container.theme-dark[tab-position="bottom"]) {
          border-bottom-color: var(--tab-border-dark, #555);
        }

        :host-context(e2-tab-container.theme-dark[tab-position="bottom"][active]) {
          border-top-color: var(--tab-bg-active-dark, #1e1e1e);
          border-bottom-color: var(--tab-bg-active-dark, #1e1e1e);
        }

        :host-context(e2-tab-container[tab-position="left"]),
        :host-context(e2-tab-container[tab-position="right"]) {
          border-bottom: 1px solid var(--tab-border, #ddd);
          border-right: none;
          width: 100%;
        }

        :host-context(e2-tab-container[tab-position="left"][active]) {
          border-right: 1px solid var(--tab-bg-active, #ffffff);
        }

        :host-context(e2-tab-container[tab-position="right"]) {
          border-left: none;
          border-right: 1px solid var(--tab-border, #ddd);
        }

        :host-context(e2-tab-container[tab-position="right"][active]) {
          border-left: 1px solid var(--tab-bg-active, #ffffff);
          border-right-color: var(--tab-bg-active, #ffffff);
        }

        .tab-content {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          flex: 1;
        }

        .tab-icon {
          flex-shrink: 0;
          font-size: 16px;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tab-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          min-width: 0;
        }

        .close-button {
          flex-shrink: 0;
          width: 16px;
          height: 16px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 4px;
          font-size: 12px;
          color: var(--tab-close-color, #666);
          opacity: 0.7;
          transition: opacity 0.2s ease, background-color 0.2s ease;
        }

        .close-button:hover {
          opacity: 1;
          background: var(--tab-close-bg-hover, rgba(0, 0, 0, 0.1));
        }

        :host(.theme-dark) .close-button {
          color: var(--tab-close-color-dark, #aaa);
        }

        :host(.theme-dark) .close-button:hover {
          background: var(--tab-close-bg-hover-dark, rgba(255, 255, 255, 0.1));
        }

        :host(:not([closable])) .close-button {
          display: none;
        }
      </style>

      <div class="tab-content">
        <span class="tab-icon"></span>
        <span class="tab-label"></span>
        <button class="close-button" type="button">&times;</button>
      </div>
    `;
  }

  private setupEventListeners(): void {
    this.addEventListener('click', this.handleClick.bind(this));

    const closeButton = this.shadowRoot?.querySelector(
      '.close-button'
    ) as HTMLButtonElement;
    closeButton?.addEventListener('click', this.handleCloseClick.bind(this));
  }

  private handleClick(event: MouseEvent): void {
    if (this.disabled) return;

    // Don't trigger tab click if close button was clicked
    if ((event.target as HTMLElement).classList.contains('close-button')) {
      return;
    }

    event.stopPropagation();

    dispatchCustomEvent(this, 'tab-click', {
      tabId: this.id,
      tab: this,
      panelId: this.getAttribute('panel') || `${this.id}-panel`,
    });
  }

  private handleCloseClick(event: MouseEvent): void {
    if (this.disabled) return;

    event.stopPropagation();

    dispatchCustomEvent(this, 'tab-close', {
      tabId: this.id,
      tab: this,
      panelId: this.getAttribute('panel') || `${this.id}-panel`,
    });

    // The parent container will handle the removal
  }

  private updateContent(): void {
    const shadowRoot = this.shadowRoot!;
    const iconElement = shadowRoot.querySelector('.tab-icon') as HTMLElement;
    const labelElement = shadowRoot.querySelector('.tab-label') as HTMLElement;

    // Update icon
    if (this._icon) {
      iconElement.textContent = this._icon;
      iconElement.style.display = 'flex';
    } else {
      iconElement.style.display = 'none';
    }

    // Update label
    labelElement.textContent = this._label || this.textContent || '';
  }

  // Public API
  public click(): void {
    if (!this.disabled) {
      this.handleClick(new MouseEvent('click'));
    }
  }

  public close(): void {
    if (!this.disabled && this._closable) {
      this.handleCloseClick(new MouseEvent('click'));
    }
  }

  // Properties
  public get theme(): Theme {
    return this._theme;
  }

  public set theme(value: Theme) {
    this._theme = value;
    this.setAttribute('theme', value);
    this.applyTheme(value);
    // Notify child elements of theme change
    notifyThemeChange(this, value);
  }

  public get active(): boolean {
    return this._active;
  }

  public set active(value: boolean) {
    this._active = value;
    if (value) {
      this.setAttribute('active', '');
    } else {
      this.removeAttribute('active');
    }
  }

  public get closable(): boolean {
    return this._closable;
  }

  public set closable(value: boolean) {
    this._closable = value;
    if (value) {
      this.setAttribute('closable', '');
    } else {
      this.removeAttribute('closable');
    }
  }

  public get icon(): string {
    return this._icon;
  }

  public set icon(value: string) {
    this._icon = value;
    this.setAttribute('icon', value);
    this.updateContent();
  }

  public get label(): string {
    return this._label;
  }

  public set label(value: string) {
    this._label = value;
    this.setAttribute('label', value);
    this.updateContent();
  }

  public get panel(): string | null {
    return this.getAttribute('panel');
  }

  public set panel(value: string | null) {
    if (value) {
      this.setAttribute('panel', value);
    } else {
      this.removeAttribute('panel');
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
        // Clean up existing theme inheritance when explicit theme is set
        if (this._themeCleanup) {
          this._themeCleanup();
          this._themeCleanup = undefined;
        }
        this._theme = (newValue as Theme) || 'auto';
        this.applyTheme(this._theme);
        break;
      case 'active':
        this._active = newValue !== null;
        break;
      case 'closable':
        this._closable = newValue !== null;
        break;
      case 'icon':
        this._icon = newValue || '';
        this.updateContent();
        break;
      case 'label':
        this._label = newValue || '';
        this.updateContent();
        break;
    }
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('tab');
    }

    // Set up theme inheritance if no explicit theme is set
    if (!this.hasAttribute('theme')) {
      applyEffectiveTheme(this);
      this._themeCleanup = setupThemeInheritance(this);
    } else {
      this.applyTheme(this._theme);
    }

    this.updateContent();

    // Handle pending setup from dynamic creation
    if ((this as any)._pendingSetup) {
      const setup = (this as any)._pendingSetup;

      // Set attributes safely now that element is connected
      if (setup.slot) {
        this.setAttribute('slot', setup.slot);
      }
      if (setup.panel) {
        this.setAttribute('panel', setup.panel);
      }
      if (setup.label) {
        this.label = setup.label;
      }
      if (setup.closable) {
        this.closable = setup.closable;
      }
      if (setup.theme) {
        this.applyTheme(setup.theme);
      }

      // Clean up
      delete (this as any)._pendingSetup;
    }

    // Update content when connected
    this.updateContent();
  }

  disconnectedCallback(): void {
    // Clean up theme inheritance listener
    if (this._themeCleanup) {
      this._themeCleanup();
      this._themeCleanup = undefined;
    }
  }
}

// Register the custom element
if (!customElements.get('e2-tab')) {
  customElements.define('e2-tab', Tab);
}
