/**
 * Notification Element
 * A toast notification component with theming and animation support
 */

import { EditorElementProperties, NotificationType, Theme } from '../../types';
import {
  applyTheme,
  dispatchCustomEvent,
  generateId,
  getShadowRoot,
} from '../../utils';

export class NotificationElement
  extends HTMLElement
  implements EditorElementProperties
{
  private _theme: Theme = 'auto';
  private _timeoutId: number | null = null;
  private _visible: boolean = false;
  private _resolvePromise: (() => void) | null = null;
  private _rejectPromise: ((reason?: any) => void) | null = null;

  static get observedAttributes(): string[] {
    return [
      'type',
      'title',
      'message',
      'timeout',
      'dismissible',
      'persistent',
      'theme',
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
          --notification-bg: #ffffff;
          --notification-border: #e0e0e0;
          --notification-shadow: rgba(0, 0, 0, 0.1);
          --notification-text: #333333;
          --notification-title: #1a1a1a;
          --notification-close-hover: #f0f0f0;
          --notification-close-active: #e0e0e0;
          --notification-icon-info: #3b82f6;
          --notification-icon-success: #10b981;
          --notification-icon-warning: #f59e0b;
          --notification-icon-error: #ef4444;

          display: block;
          position: fixed;
          z-index: 10000;
          font-family: var(--font-family, system-ui, sans-serif);
          font-size: var(--font-size, 14px);

          /* Default positioning - can be overridden by container */
          top: 20px;
          right: 20px;

          /* Animation states */
          opacity: 0;
          transform: translateX(100%);
          transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
          pointer-events: none;
        }

        :host(.visible) {
          opacity: 1;
          transform: translateX(0);
          pointer-events: auto;
        }

        :host(.theme-dark) {
          --notification-bg: #374151;
          --notification-border: #4b5563;
          --notification-text: #e5e7eb;
          --notification-title: #f9fafb;
          --notification-close-hover: #4b5563;
          --notification-close-active: #6b7280;
        }

        .notification {
          background: var(--notification-bg);
          border: 1px solid var(--notification-border);
          border-radius: 8px;
          box-shadow: 0 4px 12px var(--notification-shadow);
          padding: 16px;
          min-width: 320px;
          max-width: 480px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          position: relative;
        }

        .notification-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          margin-top: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .notification-icon.type-info {
          color: var(--notification-icon-info);
        }

        .notification-icon.type-success {
          color: var(--notification-icon-success);
        }

        .notification-icon.type-warning {
          color: var(--notification-icon-warning);
        }

        .notification-icon.type-error {
          color: var(--notification-icon-error);
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          color: var(--notification-title);
          font-weight: 600;
          margin: 0 0 4px 0;
          font-size: 14px;
          line-height: 1.4;
        }

        .notification-message {
          color: var(--notification-text);
          margin: 0;
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .notification-close {
          flex-shrink: 0;
          background: none;
          border: none;
          color: var(--notification-text);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          line-height: 1;
          margin-top: -2px;
          margin-right: -2px;
        }

        .notification-close:hover {
          background: var(--notification-close-hover);
        }

        .notification-close:active {
          background: var(--notification-close-active);
        }

        .notification-close:focus {
          outline: 2px solid var(--notification-icon-info);
          outline-offset: 1px;
        }

        :host([dismissible="false"]) .notification-close {
          display: none;
        }

        /* Progress bar for timed notifications */
        .notification-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: var(--notification-icon-info);
          border-radius: 0 0 8px 8px;
          transition: width linear;
          opacity: 0.6;
        }

        :host([type="success"]) .notification-progress {
          background: var(--notification-icon-success);
        }

        :host([type="warning"]) .notification-progress {
          background: var(--notification-icon-warning);
        }

        :host([type="error"]) .notification-progress {
          background: var(--notification-icon-error);
        }

        :host([timeout="0"]) .notification-progress,
        :host([persistent]) .notification-progress {
          display: none;
        }
      </style>

      <div class="notification" part="notification">
        <div class="notification-icon" part="icon"></div>
        <div class="notification-content" part="content">
          <div class="notification-title" part="title"></div>
          <div class="notification-message" part="message"></div>
        </div>
        <button class="notification-close" part="close-button" type="button" aria-label="Close notification">
          ×
        </button>
        <div class="notification-progress" part="progress"></div>
      </div>
    `;

    this.setupEventListeners();
    this.updateContent();
  }

  private setupEventListeners(): void {
    const closeButton = this.shadowRoot?.querySelector('.notification-close');
    const notification = this.shadowRoot?.querySelector('.notification');

    if (closeButton) {
      closeButton.addEventListener('click', this.handleCloseClick.bind(this));
    }

    if (notification) {
      notification.addEventListener(
        'click',
        this.handleNotificationClick.bind(this)
      );
    }
  }

  private handleCloseClick(event: Event): void {
    event.stopPropagation();
    this.dismiss();
  }

  private handleNotificationClick(): void {
    dispatchCustomEvent(this, 'notification-click', {
      notificationId: this.id,
      notification: this,
      type: this.type,
    });
  }

  private updateContent(): void {
    const shadowRoot = this.shadowRoot;
    if (!shadowRoot) return;

    const iconElement = shadowRoot.querySelector('.notification-icon');
    const titleElement = shadowRoot.querySelector('.notification-title');
    const messageElement = shadowRoot.querySelector('.notification-message');

    if (iconElement) {
      iconElement.className = `notification-icon type-${this.type}`;
      iconElement.textContent = this.getIconForType(this.type);
    }

    if (titleElement) {
      const title = this.title;
      if (title) {
        titleElement.textContent = title;
        (titleElement as HTMLElement).style.display = 'block';
      } else {
        (titleElement as HTMLElement).style.display = 'none';
      }
    }

    if (messageElement) {
      messageElement.textContent = this.message;
    }
  }

  private getIconForType(type: NotificationType): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      case 'info':
      default:
        return 'ℹ';
    }
  }

  private startTimeout(): void {
    this.clearTimeout();

    const timeout = this.timeout;
    if (timeout <= 0 || this.persistent) return;

    const progressBar = this.shadowRoot?.querySelector(
      '.notification-progress'
    ) as HTMLElement;
    if (progressBar) {
      progressBar.style.width = '100%';
      progressBar.style.transitionDuration = `${timeout}ms`;

      // Animate progress bar
      requestAnimationFrame(() => {
        progressBar.style.width = '0%';
      });
    }

    this._timeoutId = window.setTimeout(() => {
      this.hide();
    }, timeout);
  }

  private clearTimeout(): void {
    if (this._timeoutId !== null) {
      window.clearTimeout(this._timeoutId);
      this._timeoutId = null;
    }
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('notification');
    }
    this.applyTheme(this._theme);
  }

  disconnectedCallback(): void {
    this.clearTimeout();
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'type':
      case 'title':
      case 'message':
        this.updateContent();
        break;
      case 'theme':
        this._theme = (newValue as Theme) || 'auto';
        this.applyTheme(this._theme);
        break;
      case 'timeout':
      case 'persistent':
        if (this._visible) {
          this.startTimeout();
        }
        break;
    }
  }

  // Public API
  get theme(): Theme {
    return this._theme;
  }

  set theme(value: Theme) {
    this.setAttribute('theme', value);
  }

  get type(): NotificationType {
    return (this.getAttribute('type') as NotificationType) || 'info';
  }

  set type(value: NotificationType) {
    this.setAttribute('type', value);
  }

  get title(): string {
    return this.getAttribute('title') || '';
  }

  set title(value: string) {
    this.setAttribute('title', value);
  }

  get message(): string {
    return this.getAttribute('message') || 'This is a notification message.';
  }

  set message(value: string) {
    this.setAttribute('message', value);
  }

  get timeout(): number {
    return parseInt(this.getAttribute('timeout') || '5000', 10);
  }

  set timeout(value: number) {
    this.setAttribute('timeout', value.toString());
  }

  get dismissible(): boolean {
    return this.getAttribute('dismissible') !== 'false';
  }

  set dismissible(value: boolean) {
    this.setAttribute('dismissible', value.toString());
  }

  get persistent(): boolean {
    return this.hasAttribute('persistent');
  }

  set persistent(value: boolean) {
    if (value) {
      this.setAttribute('persistent', '');
    } else {
      this.removeAttribute('persistent');
    }
  }

  get visible(): boolean {
    return this._visible;
  }

  /**
   * Show the notification and return a promise that resolves when hidden
   */
  public show(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this._resolvePromise) {
        // Already showing, reject the previous promise
        this._rejectPromise?.(
          new Error('Notification was replaced by another show() call')
        );
      }

      this._resolvePromise = resolve;
      this._rejectPromise = reject;

      this._visible = true;
      this.classList.add('visible');

      dispatchCustomEvent(this, 'notification-show', {
        notificationId: this.id,
        notification: this,
        type: this.type,
      });

      this.startTimeout();
    });
  }

  /**
   * Hide the notification with animation
   */
  public hide(): void {
    if (!this._visible) return;

    this._visible = false;
    this.classList.remove('visible');
    this.clearTimeout();

    dispatchCustomEvent(this, 'notification-hide', {
      notificationId: this.id,
      notification: this,
      type: this.type,
    });

    // Resolve the promise after animation completes
    setTimeout(() => {
      if (this._resolvePromise) {
        this._resolvePromise();
        this._resolvePromise = null;
        this._rejectPromise = null;
      }
    }, 300); // Match CSS transition duration
  }

  /**
   * Dismiss the notification (hide and remove from DOM if appropriate)
   */
  public dismiss(): void {
    dispatchCustomEvent(this, 'notification-dismiss', {
      notificationId: this.id,
      notification: this,
      type: this.type,
    });

    this.hide();
  }

  public applyTheme(theme: Theme): void {
    this._theme = theme;
    applyTheme(this, theme);
  }
}

// Register the custom element
if (!customElements.get('e2-notification')) {
  customElements.define('e2-notification', NotificationElement);
}
