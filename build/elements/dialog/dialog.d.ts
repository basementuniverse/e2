/**
 * Dialog Element
 * A wrapper around the native <dialog> element with theming and enhanced functionality
 */
import { EditorElementProperties, Theme } from '../../types';
export declare class DialogElement extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _nativeDialog;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    connectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
    private updateTitle;
    private updateClosable;
    private updateSize;
    private handleClose;
    private handleCancel;
    get theme(): Theme;
    set theme(value: Theme);
    get title(): string;
    set title(value: string);
    get modal(): boolean;
    set modal(value: boolean);
    get closable(): boolean;
    set closable(value: boolean);
    get open(): boolean;
    get returnValue(): string;
    set returnValue(value: string);
    show(): void;
    showModal(): void;
    close(returnValue?: string): void;
    applyTheme(theme: Theme): void;
}
//# sourceMappingURL=dialog.d.ts.map