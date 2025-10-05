/**
 * Prompt Dialog Element
 * A specialized dialog for text input with validation
 */

import { EditorElementProperties, Theme } from '../../types';
import {
  applyTheme,
  dispatchCustomEvent,
  generateId,
  getShadowRoot,
} from '../../utils';

export class PromptDialogElement
  extends HTMLElement
  implements EditorElementProperties
{
  private _theme: Theme = 'auto';
  private _nativeDialog: HTMLDialogElement | null = null;
  private _resolvePromise: ((value: string | null) => void) | null = null;
  private _rejectPromise: ((reason?: any) => void) | null = null;

  static get observedAttributes(): string[] {
    return [
      'title',
      'message',
      'placeholder',
      'default-value',
      'confirm-text',
      'cancel-text',
      'theme',
      'required',
      'multiline',
      'pattern',
      'min-length',
      'max-length',
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
          --input-bg: #ffffff;
          --input-border: #d0d7de;
          --input-border-focus: #0969da;
          --input-border-error: #d1242f;
          --button-bg: #f8f9fa;
          --button-border: #e0e0e0;
          --button-hover: #e9ecef;
          --button-active: #dee2e6;
          --confirm-bg: #007bff;
          --confirm-hover: #0056b3;
          --confirm-active: #004085;
          --error-color: #d1242f;

          display: block;
        }

        :host(.theme-dark) {
          --dialog-bg: #2d2d2d;
          --dialog-border: #555555;
          --dialog-shadow: rgba(0, 0, 0, 0.5);
          --dialog-backdrop: rgba(0, 0, 0, 0.7);
          --text-color: #ffffff;
          --text-secondary: #cccccc;
          --input-bg: #21262d;
          --input-border: #30363d;
          --input-border-focus: #0969da;
          --input-border-error: #f85149;
          --button-bg: #404040;
          --button-border: #555555;
          --button-hover: #4a4a4a;
          --button-active: #555555;
          --confirm-bg: #0d6efd;
          --confirm-hover: #0b5ed7;
          --confirm-active: #0a58ca;
          --error-color: #f85149;
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
          min-width: 400px;
          max-width: 600px;
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
          margin: 0 0 8px 0;
          color: var(--text-color);
        }

        .dialog-message {
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0 0 16px 0;
        }

        .dialog-message:empty {
          display: none;
        }

        .input-group {
          margin-bottom: 20px;
        }

        .dialog-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--input-border);
          border-radius: 4px;
          background: var(--input-bg);
          color: var(--text-color);
          font-family: inherit;
          font-size: 14px;
          transition: border-color 0.15s ease;
          box-sizing: border-box;
        }

        .dialog-input:focus {
          outline: none;
          border-color: var(--input-border-focus);
          box-shadow: 0 0 0 2px rgba(9, 105, 218, 0.3);
        }

        .dialog-input.error {
          border-color: var(--input-border-error);
        }

        .dialog-input.error:focus {
          box-shadow: 0 0 0 2px rgba(209, 36, 47, 0.3);
        }

        .dialog-textarea {
          min-height: 80px;
          resize: vertical;
          font-family: inherit;
        }

        .error-message {
          color: var(--error-color);
          font-size: 12px;
          margin-top: 4px;
          display: none;
        }

        .error-message.visible {
          display: block;
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

        .dialog-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .confirm-button {
          background: var(--confirm-bg);
          color: white;
          border-color: var(--confirm-bg);
        }

        .confirm-button:hover:not(:disabled) {
          background: var(--confirm-hover);
          border-color: var(--confirm-hover);
        }

        .confirm-button:active:not(:disabled) {
          background: var(--confirm-active);
          border-color: var(--confirm-active);
        }

        :host([hidden]) {
          display: none !important;
        }
      </style>

      <dialog part="dialog">
        <div class="dialog-content" part="content">
          <h3 class="dialog-title" part="title">Input Required</h3>
          <p class="dialog-message" part="message"></p>

          <div class="input-group" part="input-group">
            <input class="dialog-input" part="input" type="text" />
            <div class="error-message" part="error-message"></div>
          </div>

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
    const input = shadowRoot.querySelector('.dialog-input') as HTMLInputElement;

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

    if (input) {
      input.addEventListener('input', this.handleInput.bind(this));
      input.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    // Apply initial theme
    this.applyTheme(this._theme);
    this.updateContent();
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('prompt-dialog');
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
      case 'placeholder':
      case 'default-value':
      case 'confirm-text':
      case 'cancel-text':
      case 'required':
      case 'multiline':
      case 'pattern':
      case 'min-length':
      case 'max-length':
        this.updateContent();
        break;
      case 'theme':
        this._theme = (newValue as Theme) || 'auto';
        this.applyTheme(this._theme);
        break;
    }
  }

  private updateContent(): void {
    const titleElement = this.shadowRoot?.querySelector('.dialog-title');
    const messageElement = this.shadowRoot?.querySelector('.dialog-message');
    const confirmButton = this.shadowRoot?.querySelector('.confirm-button');
    const cancelButton = this.shadowRoot?.querySelector('.cancel-button');
    const inputElement = this.shadowRoot?.querySelector(
      '.dialog-input'
    ) as HTMLInputElement;

    if (titleElement) {
      titleElement.textContent = this.getAttribute('title') || 'Input Required';
    }

    if (messageElement) {
      const message = this.getAttribute('message') || '';
      messageElement.textContent = message;
    }

    if (confirmButton) {
      confirmButton.textContent = this.getAttribute('confirm-text') || 'OK';
    }

    if (cancelButton) {
      cancelButton.textContent = this.getAttribute('cancel-text') || 'Cancel';
    }

    if (inputElement) {
      // Handle multiline
      const multiline = this.hasAttribute('multiline');
      const currentType = inputElement.tagName.toLowerCase();

      if (multiline && currentType === 'input') {
        // Replace input with textarea
        const textarea = document.createElement('textarea');
        textarea.className = 'dialog-input dialog-textarea';
        textarea.setAttribute('part', 'input');
        inputElement.parentNode?.replaceChild(textarea, inputElement);
        this.setupInputElement(textarea);
      } else if (!multiline && currentType === 'textarea') {
        // Replace textarea with input
        const input = document.createElement('input');
        input.className = 'dialog-input';
        input.setAttribute('part', 'input');
        input.type = 'text';
        inputElement.parentNode?.replaceChild(input, inputElement);
        this.setupInputElement(input);
      } else {
        this.setupInputElement(inputElement);
      }
    }
  }

  private setupInputElement(
    element: HTMLInputElement | HTMLTextAreaElement
  ): void {
    const placeholder = this.getAttribute('placeholder') || '';
    const defaultValue = this.getAttribute('default-value') || '';
    const pattern = this.getAttribute('pattern');
    const minLength = this.getAttribute('min-length');
    const maxLength = this.getAttribute('max-length');

    element.placeholder = placeholder;
    element.value = defaultValue;

    if (pattern && element instanceof HTMLInputElement) {
      element.pattern = pattern;
    }

    if (minLength) {
      element.minLength = parseInt(minLength, 10);
    }

    if (maxLength) {
      element.maxLength = parseInt(maxLength, 10);
    }

    // Re-attach event listeners
    element.addEventListener('input', this.handleInput.bind(this));
    element.addEventListener('keydown', (event: Event) =>
      this.handleKeydown(event as KeyboardEvent)
    );
  }

  private handleInput(): void {
    this.validateInput();
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !this.hasAttribute('multiline')
    ) {
      event.preventDefault();
      this.confirm();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancel();
    }
  }

  private validateInput(): boolean {
    const input = this.shadowRoot?.querySelector('.dialog-input') as
      | HTMLInputElement
      | HTMLTextAreaElement;
    const errorMessage = this.shadowRoot?.querySelector('.error-message');
    const confirmButton = this.shadowRoot?.querySelector(
      '.confirm-button'
    ) as HTMLButtonElement;

    if (!input || !errorMessage || !confirmButton) return false;

    let isValid = true;
    let error = '';

    const value = input.value;
    const required = this.hasAttribute('required');
    const pattern = this.getAttribute('pattern');
    const minLength = this.getAttribute('min-length');
    const maxLength = this.getAttribute('max-length');

    // Required validation
    if (required && !value.trim()) {
      isValid = false;
      error = 'This field is required';
    }

    // Pattern validation
    if (isValid && pattern && value && !new RegExp(pattern).test(value)) {
      isValid = false;
      error = 'Invalid format';
    }

    // Length validation
    if (isValid && minLength && value.length < parseInt(minLength, 10)) {
      isValid = false;
      error = `Minimum length is ${minLength} characters`;
    }

    if (isValid && maxLength && value.length > parseInt(maxLength, 10)) {
      isValid = false;
      error = `Maximum length is ${maxLength} characters`;
    }

    // Update UI
    input.classList.toggle('error', !isValid);
    errorMessage.textContent = error;
    errorMessage.classList.toggle('visible', !isValid);
    confirmButton.disabled = !isValid;

    return isValid;
  }

  private handleClose(): void {
    if (this._resolvePromise) {
      this._resolvePromise(null);
      this._resolvePromise = null;
      this._rejectPromise = null;
    }

    dispatchCustomEvent(this, 'prompt-dialog-close', {
      dialogId: this.id,
      dialog: this,
      value: null,
    });
  }

  private handleCancel(event: Event): void {
    const cancelable = dispatchCustomEvent(this, 'prompt-dialog-cancel', {
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
    if (!this.validateInput()) return;

    const input = this.shadowRoot?.querySelector('.dialog-input') as
      | HTMLInputElement
      | HTMLTextAreaElement;
    const value = input?.value || '';

    if (this._resolvePromise) {
      this._resolvePromise(value);
      this._resolvePromise = null;
      this._rejectPromise = null;
    }

    dispatchCustomEvent(this, 'prompt-dialog-confirm', {
      dialogId: this.id,
      dialog: this,
      value,
    });

    this._nativeDialog?.close(value);
  }

  private cancel(): void {
    if (this._resolvePromise) {
      this._resolvePromise(null);
      this._resolvePromise = null;
      this._rejectPromise = null;
    }

    dispatchCustomEvent(this, 'prompt-dialog-cancel', {
      dialogId: this.id,
      dialog: this,
      value: null,
    });

    this._nativeDialog?.close();
  }

  // Public API
  get theme(): Theme {
    return this._theme;
  }

  set theme(value: Theme) {
    this.setAttribute('theme', value);
  }

  get title(): string {
    return this.getAttribute('title') || 'Input Required';
  }

  set title(value: string) {
    this.setAttribute('title', value);
  }

  get message(): string {
    return this.getAttribute('message') || '';
  }

  set message(value: string) {
    this.setAttribute('message', value);
  }

  get placeholder(): string {
    return this.getAttribute('placeholder') || '';
  }

  set placeholder(value: string) {
    this.setAttribute('placeholder', value);
  }

  get defaultValue(): string {
    return this.getAttribute('default-value') || '';
  }

  set defaultValue(value: string) {
    this.setAttribute('default-value', value);
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

  get required(): boolean {
    return this.hasAttribute('required');
  }

  set required(value: boolean) {
    if (value) {
      this.setAttribute('required', '');
    } else {
      this.removeAttribute('required');
    }
  }

  get multiline(): boolean {
    return this.hasAttribute('multiline');
  }

  set multiline(value: boolean) {
    if (value) {
      this.setAttribute('multiline', '');
    } else {
      this.removeAttribute('multiline');
    }
  }

  get value(): string {
    const input = this.shadowRoot?.querySelector('.dialog-input') as
      | HTMLInputElement
      | HTMLTextAreaElement;
    return input?.value || '';
  }

  set value(value: string) {
    const input = this.shadowRoot?.querySelector('.dialog-input') as
      | HTMLInputElement
      | HTMLTextAreaElement;
    if (input) {
      input.value = value;
      this.validateInput();
    }
  }

  get open(): boolean {
    return this._nativeDialog?.open || false;
  }

  /**
   * Show the prompt dialog and return a promise that resolves to the input value or null if cancelled
   */
  public show(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (this._resolvePromise) {
        // Already showing, reject the previous promise
        this._rejectPromise?.(
          new Error('Dialog was replaced by another show() call')
        );
      }

      this._resolvePromise = resolve;
      this._rejectPromise = reject;

      dispatchCustomEvent(this, 'prompt-dialog-show', {
        dialogId: this.id,
        dialog: this,
      });

      this._nativeDialog?.showModal();

      // Focus the input after showing
      setTimeout(() => {
        const input = this.shadowRoot?.querySelector('.dialog-input') as
          | HTMLInputElement
          | HTMLTextAreaElement;
        input?.focus();
        input?.select();
      }, 100);
    });
  }

  public applyTheme(theme: Theme): void {
    this._theme = theme;
    applyTheme(this, theme);
  }
}

// Register the custom element
if (!customElements.get('e2-prompt')) {
  customElements.define('e2-prompt', PromptDialogElement);
}
