/**
 * Notification Container Element
 * A container that manages positioning and lifecycle of notification toasts
 */
import { EditorElementProperties, Theme } from '../../types';
export type NotificationPosition = 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
export type StackDirection = 'up' | 'down';
export declare class NotificationContainerElement extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _observer;
    private _themeCleanup?;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    private setupMutationObserver;
    private manageNotifications;
    private updateNotificationPositions;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
    get theme(): Theme;
    set theme(value: Theme);
    get position(): NotificationPosition;
    set position(value: NotificationPosition);
    get maxNotifications(): number;
    set maxNotifications(value: number);
    get stackDirection(): StackDirection;
    set stackDirection(value: StackDirection);
    get spacing(): 'small' | 'medium' | 'large';
    set spacing(value: 'small' | 'medium' | 'large');
    /**
     * Add a notification to this container
     */
    addNotification(notification: HTMLElement): void;
    /**
     * Remove a notification from this container
     */
    removeNotification(notification: HTMLElement): void;
    /**
     * Clear all notifications from this container
     */
    clear(): void;
    /**
     * Get count of visible notifications
     */
    getNotificationCount(): number;
    applyTheme(theme: Theme): void;
}
//# sourceMappingURL=notification-container.d.ts.map