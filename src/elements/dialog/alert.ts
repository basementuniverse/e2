/**
 * Alert Dialog Element
 * A specialized dialog for displaying messages and notifications
 */

import { AlertType, EditorElementProperties, Theme } from '../../types';
import {
  applyEffectiveTheme,
  applyTheme,
  dispatchCustomEvent,
  generateId,
  getShadowRoot,
  setupThemeInheritance,
} from '../../utils';

export class AlertDialogElement
  extends HTMLElement
  implements EditorElementProperties
{
  private _theme: Theme = 'auto';
  private _nativeDialog: HTMLDialogElement | null = null;
  private _resolvePromise: ((value: void) => void) | null = null;
  private _rejectPromise: ((reason?: any) => void) | null = null;
  private _themeCleanup?: () => void;

  static get observedAttributes(): string[] {
    return ['title', 'message', 'button-text', 'theme', 'type'];
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
          --button-bg: #007bff;
          --button-hover: #0056b3;
          --button-active: #004085;
          --icon-info: #17a2b8;
          --icon-success: #28a745;
          --icon-warning: #ffc107;
          --icon-error: #dc3545;

          display: block;
        }

        :host(.theme-dark) {
          --dialog-bg: #2d2d2d;
          --dialog-border: #555555;
          --dialog-shadow: rgba(0, 0, 0, 0.5);
          --dialog-backdrop: rgba(0, 0, 0, 0.7);
          --text-color: #ffffff;
          --text-secondary: #cccccc;
          --button-bg: #0d6efd;
          --button-hover: #0b5ed7;
          --button-active: #0a58ca;
          --icon-info: #0dcaf0;
          --icon-success: #198754;
          --icon-warning: #fd7e14;
          --icon-error: #dc3545;
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

        .dialog-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .dialog-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-top: 2px;
        }

        .dialog-icon.type-info {
          color: var(--icon-info);
        }

        .dialog-icon.type-success {
          color: var(--icon-success);
        }

        .dialog-icon.type-warning {
          color: var(--icon-warning);
        }

        .dialog-icon.type-error {
          color: var(--icon-error);
        }

        .dialog-text {
          flex: 1;
        }

        .dialog-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: var(--text-color);
        }

        .dialog-message {
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
          white-space: pre-wrap;
        }

        .dialog-buttons {
          display: flex;
          justify-content: center;
          margin-top: 24px;
        }

        .dialog-button {
          padding: 10px 24px;
          border: none;
          border-radius: 4px;
          background: var(--button-bg);
          color: white;
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          min-width: 100px;
        }

        .dialog-button:hover {
          background: var(--button-hover);
        }

        .dialog-button:active {
          background: var(--button-active);
        }

        .dialog-button:focus {
          outline: 2px solid var(--button-bg);
          outline-offset: 2px;
        }

        :host([hidden]) {
          display: none !important;
        }
      </style>

      <dialog part="dialog">
        <div class="dialog-content" part="content">
          <div class="dialog-header" part="header">
            <div class="dialog-icon type-info" part="icon">ℹ️</div>
            <div class="dialog-text" part="text">
              <h3 class="dialog-title" part="title">Information</h3>
              <p class="dialog-message" part="message">This is an alert message.</p>
            </div>
          </div>

          <div class="dialog-buttons" part="buttons">
            <button class="dialog-button" part="button" type="button">
              OK
            </button>
          </div>
        </div>
      </dialog>
    `;

    this._nativeDialog = shadowRoot.querySelector('dialog');
    const button = shadowRoot.querySelector('.dialog-button');

    // Set up event listeners
    if (this._nativeDialog) {
      this._nativeDialog.addEventListener('close', this.handleClose.bind(this));
      this._nativeDialog.addEventListener(
        'cancel',
        this.handleCancel.bind(this)
      );
    }

    if (button) {
      button.addEventListener('click', () => this.close());
    }

    // Apply initial theme
    this.applyTheme(this._theme);
    this.updateContent();
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('alert-dialog');
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
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'title':
      case 'message':
      case 'button-text':
      case 'type':
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
    }
  }

  private updateContent(): void {
    const titleElement = this.shadowRoot?.querySelector('.dialog-title');
    const messageElement = this.shadowRoot?.querySelector('.dialog-message');
    const buttonElement = this.shadowRoot?.querySelector('.dialog-button');
    const iconElement = this.shadowRoot?.querySelector('.dialog-icon');

    if (titleElement) {
      titleElement.textContent =
        this.getAttribute('title') || this.getDefaultTitle();
    }

    if (messageElement) {
      messageElement.textContent =
        this.getAttribute('message') || 'This is an alert message.';
    }

    if (buttonElement) {
      buttonElement.textContent = this.getAttribute('button-text') || 'OK';
    }

    if (iconElement) {
      const type = this.getAttribute('type') || 'info';
      iconElement.className = `dialog-icon type-${type}`;
      iconElement.textContent = this.getIconForType(type);
    }
  }

  private getDefaultTitle(): string {
    const type = this.getAttribute('type') || 'info';
    switch (type) {
      case 'success':
        return 'Success';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      default:
        return 'Information';
    }
  }

  private getIconForType(type: string): string {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  }

  private handleClose(): void {
    if (this._resolvePromise) {
      this._resolvePromise();
      this._resolvePromise = null;
      this._rejectPromise = null;
    }

    dispatchCustomEvent(this, 'alert-dialog-close', {
      dialogId: this.id,
      dialog: this,
    });
  }

  private handleCancel(event: Event): void {
    const cancelable = dispatchCustomEvent(this, 'alert-dialog-cancel', {
      dialogId: this.id,
      dialog: this,
    });

    if (!cancelable) {
      event.preventDefault();
    } else {
      this.close();
    }
  }

  private close(): void {
    if (this._resolvePromise) {
      this._resolvePromise();
      this._resolvePromise = null;
      this._rejectPromise = null;
    }

    dispatchCustomEvent(this, 'alert-dialog-dismiss', {
      dialogId: this.id,
      dialog: this,
    });

    this._nativeDialog?.close();
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
    return this.getAttribute('title') || this.getDefaultTitle();
  }

  set title(value: string) {
    this.setAttribute('title', value);
  }

  get message(): string {
    return this.getAttribute('message') || 'This is an alert message.';
  }

  set message(value: string) {
    this.setAttribute('message', value);
  }

  get buttonText(): string {
    return this.getAttribute('button-text') || 'OK';
  }

  set buttonText(value: string) {
    this.setAttribute('button-text', value);
  }

  get type(): AlertType {
    return (this.getAttribute('type') || 'info') as AlertType;
  }

  set type(value: AlertType) {
    this.setAttribute('type', value);
  }

  get open(): boolean {
    return this._nativeDialog?.open || false;
  }

  /**
   * Show the alert dialog and return a promise that resolves when dismissed
   */
  public show(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this._resolvePromise) {
        // Already showing, reject the previous promise
        this._rejectPromise?.(
          new Error('Dialog was replaced by another show() call')
        );
      }

      this._resolvePromise = resolve;
      this._rejectPromise = reject;

      dispatchCustomEvent(this, 'alert-dialog-show', {
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
if (!customElements.get('e2-alert')) {
  customElements.define('e2-alert', AlertDialogElement);
}
