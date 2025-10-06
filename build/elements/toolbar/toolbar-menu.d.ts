/**
 * Toolbar Menu Element
 * A dropdown menu button designed to be used within a toolbar
 */
import { EditorElementProperties, Theme } from '../../types';
export declare class ToolbarMenu extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _isOpen;
    private _justOpened;
    private _themeCleanup?;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    private bindEvents;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    private updateContent;
    private updateDisabled;
    private handleButtonClick;
    private handleDocumentClick;
    private handleKeyDown;
    private handleWindowResize;
    private handleItemClick;
    private focusNextItem;
    private focusPreviousItem;
    private activateFocusedItem;
    private adjustPosition;
    get theme(): Theme;
    set theme(value: Theme);
    applyTheme(theme: Theme): void;
    get label(): string;
    set label(value: string);
    get icon(): string;
    set icon(value: string);
    get isOpen(): boolean;
    open(): void;
    close(): void;
    toggle(): void;
}
//# sourceMappingURL=toolbar-menu.d.ts.map