/**
 * Dialog Element
 * A wrapper around the native <dialog> element with theming and enhanced functionality
 */

import { EditorElementProperties, Theme } from '../../types';
import {
  applyEffectiveTheme,
  applyTheme,
  dispatchCustomEvent,
  generateId,
  getShadowRoot,
  setupThemeInheritance,
} from '../../utils';

export class DialogElement
  extends HTMLElement
  implements EditorElementProperties
{
  private _theme: Theme = 'auto';
  private _nativeDialog: HTMLDialogElement | null = null;
  private _themeCleanup?: () => void;

  static get observedAttributes(): string[] {
    return ['title', 'theme', 'modal', 'closable', 'width', 'height'];
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
          --dialog-bg: #ffffff;
          --dialog-border: #e0e0e0;
          --dialog-shadow: rgba(0, 0, 0, 0.25);
          --dialog-backdrop: rgba(0, 0, 0, 0.5);
          --dialog-header-bg: #f8f9fa;
          --dialog-header-border: #e0e0e0;
          --text-color: #333333;
          --close-button-hover: #f0f0f0;
          --close-button-active: #e0e0e0;

          display: block;
        }

        :host(.theme-dark) {
          --dialog-bg: #2d2d2d;
          --dialog-border: #555555;
          --dialog-shadow: rgba(0, 0, 0, 0.5);
          --dialog-backdrop: rgba(0, 0, 0, 0.7);
          --dialog-header-bg: #404040;
          --dialog-header-border: #555555;
          --text-color: #ffffff;
          --close-button-hover: #404040;
          --close-button-active: #555555;
        }

        dialog {
          border: 1px solid var(--dialog-border);
          border-radius: 8px;
          padding: 0;
          background: var(--dialog-bg);
          color: var(--text-color);
          font-family: var(--font-family, system-ui, sans-serif);
          font-size: var(--font-size, 14px);
          box-shadow: 0 8px 24px var(--dialog-shadow);
          min-width: 300px;
          max-width: calc(100vw - 32px);
          max-height: calc(100vh - 32px);
          overflow: hidden;
          animation: dialog-fade-in 0.2s ease-out;
        }

        dialog::backdrop {
          background: var(--dialog-backdrop);
          animation: backdrop-fade-in 0.2s ease-out;
        }

        @keyframes dialog-fade-in {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes backdrop-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .dialog-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: var(--dialog-header-bg);
          border-bottom: 1px solid var(--dialog-header-border);
          min-height: 24px;
        }

        .dialog-title {
          font-weight: 600;
          font-size: 16px;
          margin: 0;
        }

        .close-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          color: var(--text-color);
          font-size: 18px;
          transition: background-color 0.15s ease;
        }

        .close-button:hover {
          background: var(--close-button-hover);
        }

        .close-button:active {
          background: var(--close-button-active);
        }

        .close-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .dialog-content {
          padding: 20px;
          overflow-y: auto;
        }

        .dialog-footer {
          padding: 16px 20px;
          border-top: 1px solid var(--dialog-header-border);
          background: var(--dialog-header-bg);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .dialog-footer:empty {
          display: none;
        }

        :host([hidden]) {
          display: none !important;
        }
      </style>

      <dialog part="dialog">
        <div class="dialog-header" part="header">
          <h3 class="dialog-title" part="title"></h3>
          <button class="close-button" part="close-button" type="button" aria-label="Close dialog">
            ×
          </button>
        </div>

        <div class="dialog-content" part="content">
          <slot></slot>
        </div>

        <div class="dialog-footer" part="footer">
          <slot name="footer"></slot>
        </div>
      </dialog>
    `;

    this._nativeDialog = shadowRoot.querySelector('dialog');
    const closeButton = shadowRoot.querySelector('.close-button');

    // Set up event listeners
    if (this._nativeDialog) {
      this._nativeDialog.addEventListener('close', this.handleClose.bind(this));
      this._nativeDialog.addEventListener(
        'cancel',
        this.handleCancel.bind(this)
      );
    }

    if (closeButton) {
      closeButton.addEventListener('click', () => this.close());
    }
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('dialog');
    }

    // Set up theme inheritance if no explicit theme is set
    if (!this.hasAttribute('theme')) {
      applyEffectiveTheme(this);
      this._themeCleanup = setupThemeInheritance(this);
    } else {
      this.applyTheme(this._theme);
    }

    // Apply initial theme
    this.applyTheme(this._theme);
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
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'title':
        this.updateTitle();
        break;
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
      case 'modal':
        // Modal state affects how dialog opens
        break;
      case 'closable':
        this.updateClosable();
        break;
      case 'width':
        this.updateSize();
        break;
      case 'height':
        this.updateSize();
        break;
    }
  }

  private updateTitle(): void {
    const titleElement = this.shadowRoot?.querySelector('.dialog-title');
    if (titleElement) {
      titleElement.textContent = this.getAttribute('title') || '';
    }
  }

  private updateClosable(): void {
    const closeButton = this.shadowRoot?.querySelector(
      '.close-button'
    ) as HTMLButtonElement;
    if (closeButton) {
      const closable = this.getAttribute('closable') !== 'false';
      closeButton.disabled = !closable;
      closeButton.style.display = closable ? 'flex' : 'none';
    }
  }

  private updateSize(): void {
    if (this._nativeDialog) {
      const width = this.getAttribute('width');
      const height = this.getAttribute('height');

      if (width) {
        this._nativeDialog.style.width =
          width.includes('px') || width.includes('%') || width.includes('em')
            ? width
            : `${width}px`;
      }

      if (height) {
        this._nativeDialog.style.height =
          height.includes('px') || height.includes('%') || height.includes('em')
            ? height
            : `${height}px`;
      }
    }
  }

  private handleClose(): void {
    dispatchCustomEvent(this, 'dialog-close', {
      dialogId: this.id,
      dialog: this,
      returnValue: this._nativeDialog?.returnValue,
    });
  }

  private handleCancel(event: Event): void {
    const cancelable = dispatchCustomEvent(this, 'dialog-cancel', {
      dialogId: this.id,
      dialog: this,
    });

    if (!cancelable) {
      event.preventDefault();
    }
  }

  // Public API
  get theme(): Theme {
    return this._theme;
  }

  set theme(value: Theme) {
    this.setAttribute('theme', value);

    // Clean up any existing theme inheritance
    if (this._themeCleanup) {
      this._themeCleanup();
      this._themeCleanup = undefined;
    }
  }

  get title(): string {
    return this.getAttribute('title') || '';
  }

  set title(value: string) {
    this.setAttribute('title', value);
  }

  get modal(): boolean {
    return this.hasAttribute('modal');
  }

  set modal(value: boolean) {
    if (value) {
      this.setAttribute('modal', '');
    } else {
      this.removeAttribute('modal');
    }
  }

  get closable(): boolean {
    return this.getAttribute('closable') !== 'false';
  }

  set closable(value: boolean) {
    this.setAttribute('closable', value.toString());
  }

  get open(): boolean {
    return this._nativeDialog?.open || false;
  }

  get returnValue(): string {
    return this._nativeDialog?.returnValue || '';
  }

  set returnValue(value: string) {
    if (this._nativeDialog) {
      this._nativeDialog.returnValue = value;
    }
  }

  public show(): void {
    if (!this._nativeDialog) return;

    dispatchCustomEvent(this, 'dialog-show', {
      dialogId: this.id,
      dialog: this,
    });

    this._nativeDialog.show();
  }

  public showModal(): void {
    if (!this._nativeDialog) return;

    dispatchCustomEvent(this, 'dialog-show', {
      dialogId: this.id,
      dialog: this,
      modal: true,
    });

    this._nativeDialog.showModal();
  }

  public close(returnValue?: string): void {
    if (!this._nativeDialog) return;

    if (returnValue !== undefined) {
      this._nativeDialog.returnValue = returnValue;
    }

    this._nativeDialog.close();
  }

  public applyTheme(theme: Theme): void {
    this._theme = theme;
    applyTheme(this, theme);
  }
}

// Register the custom element
if (!customElements.get('e2-dialog')) {
  customElements.define('e2-dialog', DialogElement);
}
