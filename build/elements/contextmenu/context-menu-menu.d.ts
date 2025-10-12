/**
 * Context Menu Menu Element
 * A menu item that contains a sub-menu that appears on hover
 */
import { EditorElementProperties, Theme } from '../../types';
export declare class ContextMenuMenu extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _subMenuVisible;
    private _subMenu?;
    private _hoverTimeout?;
    private _hideTimeout?;
    private _themeCleanup?;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    private updateContent;
    private updateDisabledState;
    private handleMouseEnter;
    private handleMouseLeave;
    private handleSubMenuMouseEnter;
    private handleSubMenuMouseLeave;
    private handleClick;
    private handleKeyDown;
    private handleFocus;
    private showSubMenu;
    private closeSiblingSubMenus;
    hideSubMenu(): void;
    private positionSubMenu;
    get theme(): Theme;
    set theme(value: Theme);
    get disabled(): boolean;
    set disabled(value: boolean);
    get label(): string;
    set label(value: string);
    get icon(): string;
    set icon(value: string);
    get subMenuVisible(): boolean;
    resetSubMenuState(): void;
    focus(): void;
    applyTheme(theme: Theme): void;
}
//# sourceMappingURL=context-menu-menu.d.ts.map