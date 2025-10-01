/**
 * Common types and interfaces used across editor elements
 */
export interface EditorElementEvent extends CustomEvent {
    target: HTMLElement;
}
export interface ToolbarButtonClickEvent extends EditorElementEvent {
    detail: {
        buttonId: string;
        button: HTMLElement;
    };
}
export interface MenuItemClickEvent extends EditorElementEvent {
    detail: {
        itemId: string;
        item: HTMLElement;
        value?: any;
    };
}
export interface ListItemSelectEvent extends EditorElementEvent {
    detail: {
        itemId: string;
        item: HTMLElement;
        selected: boolean;
        value?: any;
    };
}
export interface TreeItemExpandEvent extends EditorElementEvent {
    detail: {
        itemId: string;
        item: HTMLElement;
        expanded: boolean;
    };
}
export interface PanelToggleEvent extends EditorElementEvent {
    detail: {
        panelId: string;
        panel: HTMLElement;
        collapsed: boolean;
    };
}
export interface CollapsiblePanelToggleEvent extends EditorElementEvent {
    detail: {
        panelId: string;
        panel: HTMLElement;
        collapsed: boolean;
        orientation: 'horizontal' | 'vertical';
    };
}
export interface EditorElementProperties {
    id?: string;
    disabled?: boolean;
    hidden?: boolean;
}
export type Theme = 'light' | 'dark' | 'auto';
export interface ThemeableElement {
    theme: Theme;
    applyTheme(theme: Theme): void;
}
//# sourceMappingURL=types.d.ts.map