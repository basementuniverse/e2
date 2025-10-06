/**
 * Notification Container Element
 * A container that manages positioning and lifecycle of notification toasts
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

export type NotificationPosition =
  | 'top-left'
  | 'top-right'
  | 'top-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom-center';

export type StackDirection = 'up' | 'down';

export class NotificationContainerElement
  extends HTMLElement
  implements EditorElementProperties
{
  private _theme: Theme = 'auto';
  private _observer: MutationObserver | null = null;
  private _themeCleanup?: () => void;

  static get observedAttributes(): string[] {
    return [
      'position',
      'max-notifications',
      'stack-direction',
      'spacing',
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
          --container-spacing: 16px;
          --notification-gap: 8px;

          position: fixed;
          z-index: 10000;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          gap: var(--notification-gap);
          max-width: calc(100vw - 40px);
          max-height: calc(100vh - 40px);
          overflow: hidden;
        }

        /* Position variants */
        :host([position="top-left"]) {
          top: var(--container-spacing);
          left: var(--container-spacing);
          align-items: flex-start;
        }

        :host([position="top-right"]) {
          top: var(--container-spacing);
          right: var(--container-spacing);
          align-items: flex-end;
        }

        :host([position="top-center"]) {
          top: var(--container-spacing);
          left: 50%;
          transform: translateX(-50%);
          align-items: center;
        }

        :host([position="bottom-left"]) {
          bottom: var(--container-spacing);
          left: var(--container-spacing);
          align-items: flex-start;
          flex-direction: column-reverse;
        }

        :host([position="bottom-right"]) {
          bottom: var(--container-spacing);
          right: var(--container-spacing);
          align-items: flex-end;
          flex-direction: column-reverse;
        }

        :host([position="bottom-center"]) {
          bottom: var(--container-spacing);
          left: 50%;
          transform: translateX(-50%);
          align-items: center;
          flex-direction: column-reverse;
        }

        /* Stack direction overrides */
        :host([stack-direction="up"]) {
          flex-direction: column-reverse;
        }

        :host([stack-direction="down"]) {
          flex-direction: column;
        }

        /* Spacing control */
        :host([spacing="small"]) {
          --notification-gap: 4px;
        }

        :host([spacing="medium"]) {
          --notification-gap: 8px;
        }

        :host([spacing="large"]) {
          --notification-gap: 16px;
        }

        ::slotted(e2-notification) {
          pointer-events: auto;
          position: static !important;
          transform: none !important;
          margin: 0;
        }

        /* Animation for notifications */
        ::slotted(e2-notification:not(.visible)) {
          opacity: 0;
          transform: scale(0.9);
          transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        ::slotted(e2-notification.visible) {
          opacity: 1;
          transform: scale(1);
        }

        /* Stacking animations for top positions */
        :host([position^="top"]) ::slotted(e2-notification) {
          animation: slideInFromTop 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        /* Stacking animations for bottom positions */
        :host([position^="bottom"]) ::slotted(e2-notification) {
          animation: slideInFromBottom 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          :host {
            --container-spacing: 12px;
            max-width: calc(100vw - 24px);
          }

          ::slotted(e2-notification) {
            min-width: 280px;
            max-width: calc(100vw - 24px);
          }
        }
      </style>

      <slot></slot>
    `;

    this.setupMutationObserver();
  }

  private setupMutationObserver(): void {
    this._observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          this.manageNotifications();
          this.updateNotificationPositions();
        }
      });
    });

    this._observer.observe(this, {
      childList: true,
      subtree: false,
    });
  }

  private manageNotifications(): void {
    const notifications = this.querySelectorAll('e2-notification');
    const maxNotifications = this.maxNotifications;

    if (maxNotifications > 0 && notifications.length > maxNotifications) {
      // Remove oldest notifications that exceed the limit
      const excess = notifications.length - maxNotifications;
      for (let i = 0; i < excess; i++) {
        const notification = notifications[i] as any;
        if (typeof notification.dismiss === 'function') {
          notification.dismiss();
        } else {
          notification.remove();
        }
      }
    }

    // Dispatch container update event
    dispatchCustomEvent(this, 'notification-container-update', {
      containerId: this.id,
      container: this,
      position: this.position,
      count: notifications.length,
    });
  }

  private updateNotificationPositions(): void {
    const notifications = this.querySelectorAll('e2-notification');

    notifications.forEach((notification, index) => {
      // Apply theme to notification if it matches container theme
      if (
        this._theme !== 'auto' &&
        typeof (notification as any).applyTheme === 'function'
      ) {
        (notification as any).theme = this._theme;
      }

      // Apply z-index to ensure proper stacking
      (notification as HTMLElement).style.zIndex = (
        10000 +
        notifications.length -
        index
      ).toString();
    });
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('notification-container');
    }

    // Set up theme inheritance if no explicit theme is set
    if (!this.hasAttribute('theme')) {
      applyEffectiveTheme(this);
      this._themeCleanup = setupThemeInheritance(this);
    } else {
      this.applyTheme(this._theme);
    }

    this.updateNotificationPositions();
  }

  disconnectedCallback(): void {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }

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
      case 'position':
      case 'stack-direction':
      case 'spacing':
        // Handled by CSS attribute selectors
        break;
      case 'max-notifications':
        this.manageNotifications();
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
        this.updateNotificationPositions();
        break;
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

  get position(): NotificationPosition {
    return (
      (this.getAttribute('position') as NotificationPosition) || 'top-right'
    );
  }

  set position(value: NotificationPosition) {
    this.setAttribute('position', value);
  }

  get maxNotifications(): number {
    return parseInt(this.getAttribute('max-notifications') || '5', 10);
  }

  set maxNotifications(value: number) {
    this.setAttribute('max-notifications', value.toString());
  }

  get stackDirection(): StackDirection {
    return (this.getAttribute('stack-direction') as StackDirection) || 'down';
  }

  set stackDirection(value: StackDirection) {
    this.setAttribute('stack-direction', value);
  }

  get spacing(): 'small' | 'medium' | 'large' {
    return (
      (this.getAttribute('spacing') as 'small' | 'medium' | 'large') || 'medium'
    );
  }

  set spacing(value: 'small' | 'medium' | 'large') {
    this.setAttribute('spacing', value);
  }

  /**
   * Add a notification to this container
   */
  public addNotification(notification: HTMLElement): void {
    this.appendChild(notification);
  }

  /**
   * Remove a notification from this container
   */
  public removeNotification(notification: HTMLElement): void {
    if (this.contains(notification)) {
      this.removeChild(notification);
    }
  }

  /**
   * Clear all notifications from this container
   */
  public clear(): void {
    const notifications = this.querySelectorAll('e2-notification');
    notifications.forEach(notification => {
      const notificationElement = notification as any;
      if (typeof notificationElement.dismiss === 'function') {
        notificationElement.dismiss();
      } else {
        notification.remove();
      }
    });
  }

  /**
   * Get count of visible notifications
   */
  public getNotificationCount(): number {
    return this.querySelectorAll('e2-notification').length;
  }

  public applyTheme(theme: Theme): void {
    this._theme = theme;
    applyTheme(this, theme);
    this.updateNotificationPositions();
  }
}

// Register the custom element
if (!customElements.get('e2-notification-container')) {
  customElements.define(
    'e2-notification-container',
    NotificationContainerElement
  );
}
