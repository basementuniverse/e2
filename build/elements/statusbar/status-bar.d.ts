/**
 * Status Bar Element
 * A horizontal status bar typically placed at the bottom of an application
 * Contains left, center, and right sections for different types of status information
 */
import { EditorElementProperties, StatusMessageType, Theme } from '../../types';
export declare class StatusBar extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _temporaryMessageTimeout?;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    connectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    get theme(): Theme;
    set theme(value: Theme);
    applyTheme(theme: Theme): void;
    /**
     * Show a temporary message in the status bar
     * @param message The message to display
     * @param type The type of message (info, success, warning, error)
     * @param duration Duration in milliseconds (default: 3000)
     */
    showMessage(message: string, type?: StatusMessageType, duration?: number): void;
    /**
     * Hide the temporary message
     */
    hideMessage(): void;
    /**
     * Get all status items in a specific section
     * @param section The section to query ('left', 'center', 'right')
     */
    getItemsInSection(section: 'left' | 'center' | 'right'): HTMLElement[];
    /**
     * Clear all items from a specific section
     * @param section The section to clear ('left', 'center', 'right')
     */
    clearSection(section: 'left' | 'center' | 'right'): void;
}
//# sourceMappingURL=status-bar.d.ts.map