/**
 * E2 App Element
 * A wrapper element that provides global CSS styles and theming for E2 applications
 */
import { EditorElementProperties, Theme } from '../../types';
export declare class E2App extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _stylesInitialized;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private mediaQueryList?;
    private handleThemeChange;
    private setupAutoTheme;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    get theme(): Theme;
    set theme(value: Theme);
    applyTheme(theme: Theme): void;
    /**
     * Set a custom CSS property value
     */
    setCSSVariable(property: string, value: string): void;
    /**
     * Get a custom CSS property value
     */
    getCSSVariable(property: string): string;
}
//# sourceMappingURL=app.d.ts.map