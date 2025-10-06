/**
 * Toolbar Button Element
 * A button designed to be used within a toolbar
 */
import { EditorElementProperties, Theme } from '../../types';
export declare class ToolbarButton extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _themeCleanup?;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    private updateContent;
    private updateDisabled;
    private updateActive;
    private handleClick;
    get theme(): Theme;
    set theme(value: Theme);
    applyTheme(theme: Theme): void;
    get label(): string;
    set label(value: string);
    get icon(): string;
    set icon(value: string);
    get active(): boolean;
    set active(value: boolean);
}
//# sourceMappingURL=toolbar-button.d.ts.map