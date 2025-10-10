/**
 * Confirm Dialog Element
 * A specialized dialog for yes/no confirmations with promise-based API
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

export class ConfirmDialogElement
  extends HTMLElement
  implements EditorElementProperties
{
  private _theme: Theme = 'auto';
  private _nativeDialog: HTMLDialogElement | null = null;
  private _resolvePromise: ((value: boolean) => void) | null = null;
  private _rejectPromise: ((reason?: any) => void) | null = null;
  private _themeCleanup?: () => void;

  static get observedAttributes(): string[] {
    return [
      'title',
      'message',
      'confirm-text',
      'cancel-text',
      'theme',
      'danger',
    ];
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
          --text-color: #333333;
          --text-secondary: #666666;
          --button-bg: #f8f9fa;
          --button-border: #e0e0e0;
          --button-hover: #e9ecef;
          --button-active: #dee2e6;
          --confirm-bg: #007bff;
          --confirm-hover: #0056b3;
          --confirm-active: #004085;
          --danger-bg: #dc3545;
          --danger-hover: #c82333;
          --danger-active: #bd2130;

          display: block;
        }

        :host(.theme-dark) {
          --dialog-bg: #2d2d2d;
          --dialog-border: #555555;
          --dialog-shadow: rgba(0, 0, 0, 0.5);
          --dialog-backdrop: rgba(0, 0, 0, 0.7);
          --text-color: #ffffff;
          --text-secondary: #cccccc;
          --button-bg: #404040;
          --button-border: #555555;
          --button-hover: #4a4a4a;
          --button-active: #555555;
          --confirm-bg: #0d6efd;
          --confirm-hover: #0b5ed7;
          --confirm-active: #0a58ca;
          --danger-bg: #dc3545;
          --danger-hover: #bb2d3b;
          --danger-active: #b02a37;
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
          min-width: 320px;
          max-width: 500px;
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

        .dialog-content {
          padding: 24px;
        }

        .dialog-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: var(--text-color);
        }

        .dialog-message {
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0 0 24px 0;
        }

        .dialog-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .dialog-button {
          padding: 8px 16px;
          border: 1px solid var(--button-border);
          border-radius: 4px;
          background: var(--button-bg);
          color: var(--text-color);
          font-family: inherit;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s ease;
          min-width: 80px;
        }

        .dialog-button:hover {
          background: var(--button-hover);
        }

        .dialog-button:active {
          background: var(--button-active);
        }

        .dialog-button:focus {
          outline: 2px solid var(--confirm-bg);
          outline-offset: 2px;
        }

        .confirm-button {
          background: var(--confirm-bg);
          color: white;
          border-color: var(--confirm-bg);
        }

        .confirm-button:hover {
          background: var(--confirm-hover);
          border-color: var(--confirm-hover);
        }

        .confirm-button:active {
          background: var(--confirm-active);
          border-color: var(--confirm-active);
        }

        :host([danger]) .confirm-button {
          background: var(--danger-bg);
          border-color: var(--danger-bg);
        }

        :host([danger]) .confirm-button:hover {
          background: var(--danger-hover);
          border-color: var(--danger-hover);
        }

        :host([danger]) .confirm-button:active {
          background: var(--danger-active);
          border-color: var(--danger-active);
        }

        :host([danger]) .confirm-button:focus {
          outline-color: var(--danger-bg);
        }

        :host([hidden]) {
          display: none !important;
        }
      </style>

      <dialog part="dialog">
        <div class="dialog-content" part="content">
          <h3 class="dialog-title" part="title">Confirm</h3>
          <p class="dialog-message" part="message">Are you sure?</p>

          <div class="dialog-buttons" part="buttons">
            <button class="dialog-button cancel-button" part="cancel-button" type="button">
              Cancel
            </button>
            <button class="dialog-button confirm-button" part="confirm-button" type="button">
              OK
            </button>
          </div>
        </div>
      </dialog>
    `;

    this._nativeDialog = shadowRoot.querySelector('dialog');
    const confirmButton = shadowRoot.querySelector('.confirm-button');
    const cancelButton = shadowRoot.querySelector('.cancel-button');

    // Set up event listeners
    if (this._nativeDialog) {
      this._nativeDialog.addEventListener('close', this.handleClose.bind(this));
      this._nativeDialog.addEventListener(
        'cancel',
        this.handleCancel.bind(this)
      );
    }

    if (confirmButton) {
      confirmButton.addEventListener('click', () => this.confirm());
    }

    if (cancelButton) {
      cancelButton.addEventListener('click', () => this.cancel());
    }
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('confirm-dialog');
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
    this.updateContent();
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
      case 'message':
      case 'confirm-text':
      case 'cancel-text':
        this.updateContent();
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
      case 'danger':
        // Styling handled by CSS attribute selector
        break;
    }
  }

  private updateContent(): void {
    const titleElement = this.shadowRoot?.querySelector('.dialog-title');
    const messageElement = this.shadowRoot?.querySelector('.dialog-message');
    const confirmButton = this.shadowRoot?.querySelector('.confirm-button');
    const cancelButton = this.shadowRoot?.querySelector('.cancel-button');

    if (titleElement) {
      titleElement.textContent = this.getAttribute('title') || 'Confirm';
    }

    if (messageElement) {
      messageElement.textContent =
        this.getAttribute('message') || 'Are you sure?';
    }

    if (confirmButton) {
      confirmButton.textContent = this.getAttribute('confirm-text') || 'OK';
    }

    if (cancelButton) {
      cancelButton.textContent = this.getAttribute('cancel-text') || 'Cancel';
    }
  }

  private handleClose(): void {
    // If dialog was closed without explicit confirm/cancel, treat as cancel
    if (this._resolvePromise) {
      this._resolvePromise(false);
      this._resolvePromise = null;
      this._rejectPromise = null;
    }

    dispatchCustomEvent(this, 'confirm-dialog-close', {
      dialogId: this.id,
      dialog: this,
      confirmed: false,
    });
  }

  private handleCancel(event: Event): void {
    const cancelable = dispatchCustomEvent(this, 'confirm-dialog-cancel', {
      dialogId: this.id,
      dialog: this,
    });

    if (!cancelable) {
      event.preventDefault();
    } else {
      this.cancel();
    }
  }

  private confirm(): void {
    if (this._resolvePromise) {
      this._resolvePromise(true);
      this._resolvePromise = null;
      this._rejectPromise = null;
    }

    dispatchCustomEvent(this, 'confirm-dialog-confirm', {
      dialogId: this.id,
      dialog: this,
      confirmed: true,
    });

    this._nativeDialog?.close('confirmed');
  }

  private cancel(): void {
    if (this._resolvePromise) {
      this._resolvePromise(false);
      this._resolvePromise = null;
      this._rejectPromise = null;
    }

    dispatchCustomEvent(this, 'confirm-dialog-cancel', {
      dialogId: this.id,
      dialog: this,
      confirmed: false,
    });

    this._nativeDialog?.close('cancelled');
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
    return this.getAttribute('title') || 'Confirm';
  }

  set title(value: string) {
    this.setAttribute('title', value);
  }

  get message(): string {
    return this.getAttribute('message') || 'Are you sure?';
  }

  set message(value: string) {
    this.setAttribute('message', value);
  }

  get confirmText(): string {
    return this.getAttribute('confirm-text') || 'OK';
  }

  set confirmText(value: string) {
    this.setAttribute('confirm-text', value);
  }

  get cancelText(): string {
    return this.getAttribute('cancel-text') || 'Cancel';
  }

  set cancelText(value: string) {
    this.setAttribute('cancel-text', value);
  }

  get danger(): boolean {
    return this.hasAttribute('danger');
  }

  set danger(value: boolean) {
    if (value) {
      this.setAttribute('danger', '');
    } else {
      this.removeAttribute('danger');
    }
  }

  get open(): boolean {
    return this._nativeDialog?.open || false;
  }

  /**
   * Show the confirmation dialog and return a promise that resolves to true/false
   */
  public show(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this._resolvePromise) {
        // Already showing, reject the previous promise
        this._rejectPromise?.(
          new Error('Dialog was replaced by another show() call')
        );
      }

      this._resolvePromise = resolve;
      this._rejectPromise = reject;

      dispatchCustomEvent(this, 'confirm-dialog-show', {
        dialogId: this.id,
        dialog: this,
      });

      this._nativeDialog?.showModal();
    });
  }

  public applyTheme(theme: Theme): void {
    this._theme = theme;
    applyTheme(this, theme);
  }
}

// Register the custom element
if (!customElements.get('e2-confirm')) {
  customElements.define('e2-confirm', ConfirmDialogElement);
}
