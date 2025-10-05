/**
 * Alert Dialog Element
 * A specialized dialog for displaying messages and notifications
 */
import { AlertType, EditorElementProperties, Theme } from '../../types';
export declare class AlertDialogElement extends HTMLElement implements EditorElementProperties {
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
    private getDefaultTitle;
    private getIconForType;
    private handleClose;
    private handleCancel;
    private close;
    get theme(): Theme;
    set theme(value: Theme);
    get title(): string;
    set title(value: string);
    get message(): string;
    set message(value: string);
    get buttonText(): string;
    set buttonText(value: string);
    get type(): AlertType;
    set type(value: AlertType);
    get open(): boolean;
    /**
     * Show the alert dialog and return a promise that resolves when dismissed
     */
    show(): Promise<void>;
    applyTheme(theme: Theme): void;
}
//# sourceMappingURL=alert.d.ts.map