/**
 * Status Bar Element
 * A horizontal status bar typically placed at the bottom of an application
 * Contains left, center, and right sections for different types of status information
 */

import {
  EditorElementProperties,
  StatusMessageEvent,
  StatusMessageType,
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

export class StatusBar extends HTMLElement implements EditorElementProperties {
  private _theme: Theme = 'auto';
  private _temporaryMessageTimeout?: number;
  private _themeCleanup?: () => void;

  static get observedAttributes(): string[] {
    return ['theme', 'disabled'];
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
          display: flex;
          align-items: center;
          padding: 4px 8px;
          background: var(--statusbar-bg, #f8f8f8);
          border-top: 1px solid var(--statusbar-border, #e0e0e0);
          font-family: var(--font-family, system-ui, sans-serif);
          font-size: var(--font-size-small, 12px);
          min-height: 24px;
          position: relative;
          overflow: hidden;
        }

        :host(.theme-dark) {
          background: var(--statusbar-bg-dark, #252526);
          border-top-color: var(--statusbar-border-dark, #3e3e42);
          color: var(--text-color-dark, #cccccc);
        }

        :host([disabled]) {
          opacity: 0.6;
          pointer-events: none;
        }

        .status-container {
          display: flex;
          align-items: center;
          width: 100%;
          gap: 8px;
        }

        .status-section {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-section.left {
          flex: 0 0 auto;
          justify-content: flex-start;
        }

        .status-section.center {
          flex: 1 1 auto;
          justify-content: center;
        }

        .status-section.right {
          flex: 0 0 auto;
          justify-content: flex-end;
        }

        .temporary-message {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          padding: 4px 8px;
          background: var(--statusbar-message-bg, var(--statusbar-bg, #f8f8f8));
          z-index: 10;
          opacity: 0;
          transform: translateY(100%);
          transition: all 0.2s ease-in-out;
        }

        .temporary-message.show {
          opacity: 1;
          transform: translateY(0);
        }

        .temporary-message.info {
          background: var(--statusbar-info-bg, #e3f2fd);
          color: var(--statusbar-info-text, #1565c0);
        }

        .temporary-message.success {
          background: var(--statusbar-success-bg, #e8f5e8);
          color: var(--statusbar-success-text, #2e7d32);
        }

        .temporary-message.warning {
          background: var(--statusbar-warning-bg, #fff3e0);
          color: var(--statusbar-warning-text, #f57c00);
        }

        .temporary-message.error {
          background: var(--statusbar-error-bg, #ffebee);
          color: var(--statusbar-error-text, #c62828);
        }

        :host(.theme-dark) .temporary-message.info {
          background: var(--statusbar-info-bg-dark, #1e3a8a);
          color: var(--statusbar-info-text-dark, #93c5fd);
        }

        :host(.theme-dark) .temporary-message.success {
          background: var(--statusbar-success-bg-dark, #166534);
          color: var(--statusbar-success-text-dark, #86efac);
        }

        :host(.theme-dark) .temporary-message.warning {
          background: var(--statusbar-warning-bg-dark, #92400e);
          color: var(--statusbar-warning-text-dark, #fcd34d);
        }

        :host(.theme-dark) .temporary-message.error {
          background: var(--statusbar-error-bg-dark, #991b1b);
          color: var(--statusbar-error-text-dark, #fca5a5);
        }
      </style>

      <div class="status-container">
        <div class="status-section left">
          <slot name="left"></slot>
        </div>
        <div class="status-section center">
          <slot name="center"></slot>
        </div>
        <div class="status-section right">
          <slot name="right"></slot>
        </div>
      </div>

      <div class="temporary-message" id="temporary-message">
        <span id="message-text"></span>
      </div>
    `;
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('status-bar');
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

    // Clear any temporary message timeout
    if (this._temporaryMessageTimeout) {
      window.clearTimeout(this._temporaryMessageTimeout);
      this._temporaryMessageTimeout = undefined;
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
    }
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

  applyTheme(theme: Theme): void {
    applyTheme(this, theme);
  }

  /**
   * Show a temporary message in the status bar
   * @param message The message to display
   * @param type The type of message (info, success, warning, error)
   * @param duration Duration in milliseconds (default: 3000)
   */
  showMessage(
    message: string,
    type: StatusMessageType = 'info',
    duration: number = 3000
  ): void {
    const shadowRoot = this.shadowRoot!;
    const messageEl = shadowRoot.getElementById('temporary-message')!;
    const textEl = shadowRoot.getElementById('message-text')!;

    // Clear any existing timeout
    if (this._temporaryMessageTimeout) {
      clearTimeout(this._temporaryMessageTimeout);
    }

    // Set message content and type
    textEl.textContent = message;
    messageEl.className = `temporary-message ${type}`;

    // Show message with animation
    requestAnimationFrame(() => {
      messageEl.classList.add('show');
    });

    // Dispatch event
    dispatchCustomEvent<StatusMessageEvent['detail']>(this, 'status-message', {
      message,
      type,
      duration,
      temporary: true,
    });

    // Auto-hide after duration
    if (duration > 0) {
      this._temporaryMessageTimeout = window.setTimeout(() => {
        this.hideMessage();
      }, duration);
    }
  }

  /**
   * Hide the temporary message
   */
  hideMessage(): void {
    const shadowRoot = this.shadowRoot!;
    const messageEl = shadowRoot.getElementById('temporary-message')!;

    messageEl.classList.remove('show');

    if (this._temporaryMessageTimeout) {
      clearTimeout(this._temporaryMessageTimeout);
      this._temporaryMessageTimeout = undefined;
    }
  }

  /**
   * Get all status items in a specific section
   * @param section The section to query ('left', 'center', 'right')
   */
  getItemsInSection(section: 'left' | 'center' | 'right'): HTMLElement[] {
    const slot = this.querySelector(`[slot="${section}"]`);
    if (!slot) return [];

    return Array.from(slot.children) as HTMLElement[];
  }

  /**
   * Clear all items from a specific section
   * @param section The section to clear ('left', 'center', 'right')
   */
  clearSection(section: 'left' | 'center' | 'right'): void {
    const items = this.getItemsInSection(section);
    items.forEach(item => item.remove());
  }
}

// Register the custom element
if (!customElements.get('e2-status-bar')) {
  customElements.define('e2-status-bar', StatusBar);
}
