/**
 * Status Section Element
 * A container for grouping status items within a status bar
 * Provides left, center, or right positioning and overflow handling
 */
import { EditorElementProperties, StatusSectionPosition, Theme } from '../../types';
export declare class StatusSection extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _position;
    private _themeCleanup?;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    get theme(): Theme;
    set theme(value: Theme);
    get position(): StatusSectionPosition;
    set position(value: StatusSectionPosition);
    applyTheme(theme: Theme): void;
    /**
     * Add a status item to this section
     * @param item The status item element to add
     * @param priority Optional priority for responsive behavior ('high', 'medium', 'low')
     */
    addItem(item: HTMLElement, priority?: 'high' | 'medium' | 'low'): void;
    /**
     * Remove a status item from this section
     * @param item The status item element to remove
     */
    removeItem(item: HTMLElement): void;
    /**
     * Clear all items from this section
     */
    clear(): void;
    /**
     * Get all items in this section
     */
    getItems(): HTMLElement[];
    /**
     * Get items by priority level
     * @param priority The priority level to filter by
     */
    getItemsByPriority(priority: 'high' | 'medium' | 'low'): HTMLElement[];
}
//# sourceMappingURL=status-section.d.ts.map