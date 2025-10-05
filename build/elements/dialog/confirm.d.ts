/**
 * Confirm Dialog Element
 * A specialized dialog for yes/no confirmations with promise-based API
 */
import { EditorElementProperties, Theme } from '../../types';
export declare class ConfirmDialogElement extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _nativeDialog;
    private _resolvePromise;
    private _rejectPromise;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    connectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
    private updateContent;
    private handleClose;
    private handleCancel;
    private confirm;
    private cancel;
    get theme(): Theme;
    set theme(value: Theme);
    get title(): string;
    set title(value: string);
    get message(): string;
    set message(value: string);
    get confirmText(): string;
    set confirmText(value: string);
    get cancelText(): string;
    set cancelText(value: string);
    get danger(): boolean;
    set danger(value: boolean);
    get open(): boolean;
    /**
     * Show the confirmation dialog and return a promise that resolves to true/false
     */
    show(): Promise<boolean>;
    applyTheme(theme: Theme): void;
}
//# sourceMappingURL=confirm.d.ts.map