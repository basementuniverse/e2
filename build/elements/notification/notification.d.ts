/**
 * Notification Element
 * A toast notification component with theming and animation support
 */
import { EditorElementProperties, NotificationType, Theme } from '../../types';
export declare class NotificationElement extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _timeoutId;
    private _visible;
    private _resolvePromise;
    private _rejectPromise;
    private _themeCleanup?;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    private setupEventListeners;
    private handleCloseClick;
    private handleNotificationClick;
    private updateContent;
    private getIconForType;
    private startTimeout;
    private clearTimeout;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
    get theme(): Theme;
    set theme(value: Theme);
    get type(): NotificationType;
    set type(value: NotificationType);
    get title(): string;
    set title(value: string);
    get message(): string;
    set message(value: string);
    get timeout(): number;
    set timeout(value: number);
    get dismissible(): boolean;
    set dismissible(value: boolean);
    get persistent(): boolean;
    set persistent(value: boolean);
    get visible(): boolean;
    /**
     * Show the notification and return a promise that resolves when hidden
     */
    show(): Promise<void>;
    /**
     * Hide the notification with animation
     */
    hide(): void;
    /**
     * Dismiss the notification (hide and remove from DOM if appropriate)
     */
    dismiss(): void;
    applyTheme(theme: Theme): void;
}
//# sourceMappingURL=notification.d.ts.map