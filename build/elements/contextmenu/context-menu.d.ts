/**
 * Context Menu Element
 * A popup menu that appears on right-click or programmatic trigger
 */
import { ComponentContext, EditorElementProperties, Theme } from '../../types';
export declare class ContextMenu extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _visible;
    private _justShown;
    private _themeCleanup?;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    private bindEvents;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    private boundContextMenuHandler;
    private setupTargetListeners;
    private removeTargetListeners;
    private handleContextMenu;
    private handleDocumentClick;
    private handleKeyDown;
    private handleWindowResize;
    private focusNextItem;
    private focusPreviousItem;
    private activateFocusedItem;
    get theme(): Theme;
    set theme(value: Theme);
    get disabled(): boolean;
    set disabled(value: boolean);
    get visible(): boolean;
    get target(): string | null;
    set target(value: string | null);
    show(x: number, y: number, trigger?: HTMLElement, componentContext?: ComponentContext): void;
    hide(): void;
    private adjustPosition;
    applyTheme(theme: Theme): void;
}
//# sourceMappingURL=context-menu.d.ts.map