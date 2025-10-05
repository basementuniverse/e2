/**
 * Context Menu Separator Element
 * A visual separator line between context menu items
 */
import { EditorElementProperties, Theme } from '../../types';
export declare class ContextMenuSeparator extends HTMLElement implements EditorElementProperties {
    private _theme;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    connectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    get theme(): Theme;
    set theme(value: Theme);
    get disabled(): boolean;
    set disabled(_value: boolean);
    applyTheme(theme: Theme): void;
}
//# sourceMappingURL=context-menu-separator.d.ts.map