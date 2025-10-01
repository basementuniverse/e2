/**
 * Toolbar Element
 * A horizontal container for toolbar buttons and other controls
 */
import { EditorElementProperties, Theme } from '../../types';
export declare class Toolbar extends HTMLElement implements EditorElementProperties {
    private _theme;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    connectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    get theme(): Theme;
    set theme(value: Theme);
    applyTheme(theme: Theme): void;
}
//# sourceMappingURL=toolbar.d.ts.map