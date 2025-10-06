/**
 * Collapsible Panel Element
 * A panel that can be collapsed to a thin bar with an expand button
 * or expanded to show its full content
 */
import { EditorElementProperties, Theme } from '../../types';
export type PanelOrientation = 'horizontal' | 'vertical';
export declare class CollapsiblePanel extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _collapsed;
    private _orientation;
    private _themeCleanup?;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    private handleToggle;
    get theme(): Theme;
    set theme(value: Theme);
    get collapsed(): boolean;
    set collapsed(value: boolean);
    get orientation(): PanelOrientation;
    set orientation(value: PanelOrientation);
    toggle(): void;
    expand(): void;
    collapse(): void;
    applyTheme(theme: Theme): void;
}
//# sourceMappingURL=collapsible-panel.d.ts.map