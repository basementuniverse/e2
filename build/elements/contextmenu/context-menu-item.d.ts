/**
 * Context Menu Item Element
 * A clickable item within a context menu
 */
import { EditorElementProperties, Theme } from '../../types';
export declare class ContextMenuItem extends HTMLElement implements EditorElementProperties {
    private _theme;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    connectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    private updateContent;
    private updateDisabledState;
    private handleClick;
    private handleKeyDown;
    private handleFocus;
    get theme(): Theme;
    set theme(value: Theme);
    get disabled(): boolean;
    set disabled(value: boolean);
    get label(): string;
    set label(value: string);
    get icon(): string;
    set icon(value: string);
    get value(): string;
    set value(value: string);
    get shortcut(): string;
    set shortcut(value: string);
    click(): void;
    focus(): void;
    applyTheme(theme: Theme): void;
}
//# sourceMappingURL=context-menu-item.d.ts.map