/**
 * Tab Panel Element
 * Container for tab content that shows/hides based on tab selection
 */
import { EditorElementProperties, Theme } from '../../types';
export declare class TabPanel extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _active;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    show(): void;
    hide(): void;
    scrollToTop(): void;
    scrollToBottom(): void;
    scrollToElement(element: Element): void;
    clearContent(): void;
    setContent(content: string): void;
    appendContent(content: string): void;
    prependContent(content: string): void;
    get theme(): Theme;
    set theme(value: Theme);
    get active(): boolean;
    set active(value: boolean);
    get disabled(): boolean;
    set disabled(value: boolean);
    get loading(): boolean;
    set loading(value: boolean);
    get emptyMessage(): string;
    set emptyMessage(value: string);
    applyTheme(theme: Theme): void;
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
    connectedCallback(): void;
}
//# sourceMappingURL=tab-panel.d.ts.map