/**
 * Toolbar Separator Element
 * A visual separator for toolbar items
 */
import { Theme } from '../../types';
export declare class ToolbarSeparator extends HTMLElement {
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
//# sourceMappingURL=toolbar-separator.d.ts.map