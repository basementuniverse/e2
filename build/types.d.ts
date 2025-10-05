/**
 * Common types and interfaces used across editor elements
 */
export interface EditorElementEvent extends CustomEvent {
    target: HTMLElement;
}
export interface EditorElementProperties {
    id?: string;
    disabled?: boolean;
    hidden?: boolean;
}
export interface ToolbarButtonClickEvent extends EditorElementEvent {
    detail: {
        buttonId: string;
        button: HTMLElement;
    };
}
export interface ToolbarMenuShowEvent extends EditorElementEvent {
    detail: {
        menuId: string;
        menu: HTMLElement;
    };
}
export interface ToolbarMenuHideEvent extends EditorElementEvent {
    detail: {
        menuId: string;
        menu: HTMLElement;
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
export type AlertType = 'info' | 'success' | 'warning' | 'error';
export interface DialogEvent extends EditorElementEvent {
    detail: {
        dialogId: string;
        dialog: HTMLElement;
    };
}
export interface DialogShowEvent extends DialogEvent {
    detail: DialogEvent['detail'] & {
        modal?: boolean;
    };
}
export interface DialogCloseEvent extends DialogEvent {
    detail: DialogEvent['detail'] & {
        returnValue?: string;
    };
}
export interface ConfirmDialogEvent extends DialogEvent {
    detail: DialogEvent['detail'] & {
        confirmed: boolean;
    };
}
export interface AlertDialogEvent extends DialogEvent {
    detail: DialogEvent['detail'];
}
export interface PromptDialogEvent extends DialogEvent {
    detail: DialogEvent['detail'] & {
        value: string | null;
    };
}
export interface ContextMenuShowEvent extends EditorElementEvent {
    detail: {
        menuId: string;
        menu: HTMLElement;
        x: number;
        y: number;
        trigger: HTMLElement;
    };
}
export interface ContextMenuHideEvent extends EditorElementEvent {
    detail: {
        menuId: string;
        menu: HTMLElement;
    };
}
export interface ContextMenuItemClickEvent extends EditorElementEvent {
    detail: {
        itemId: string;
        item: HTMLElement;
        menuId: string;
        menu: HTMLElement;
        value?: string;
    };
}
export type Theme = 'light' | 'dark' | 'auto';
export interface ThemeableElement {
    theme: Theme;
    applyTheme(theme: Theme): void;
}
//# sourceMappingURL=types.d.ts.map