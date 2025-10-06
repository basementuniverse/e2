/**
 * Tab Element
 * Individual tab that can be clicked to show associated content
 */
import { EditorElementProperties, Theme } from '../../types';
export declare class Tab extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _active;
    private _closable;
    private _icon;
    private _label;
    private _themeCleanup?;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    private setupEventListeners;
    private handleClick;
    private handleCloseClick;
    private updateContent;
    click(): void;
    close(): void;
    get theme(): Theme;
    set theme(value: Theme);
    get active(): boolean;
    set active(value: boolean);
    get closable(): boolean;
    set closable(value: boolean);
    get icon(): string;
    set icon(value: string);
    get label(): string;
    set label(value: string);
    get panel(): string | null;
    set panel(value: string | null);
    get disabled(): boolean;
    set disabled(value: boolean);
    applyTheme(theme: Theme): void;
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
}
//# sourceMappingURL=tab.d.ts.map