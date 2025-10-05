/**
 * Prompt Dialog Element
 * A specialized dialog for text input with validation
 */
import { EditorElementProperties, Theme } from '../../types';
export declare class PromptDialogElement extends HTMLElement implements EditorElementProperties {
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
    private setupInputElement;
    private handleInput;
    private handleKeydown;
    private validateInput;
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
    get placeholder(): string;
    set placeholder(value: string);
    get defaultValue(): string;
    set defaultValue(value: string);
    get confirmText(): string;
    set confirmText(value: string);
    get cancelText(): string;
    set cancelText(value: string);
    get required(): boolean;
    set required(value: boolean);
    get multiline(): boolean;
    set multiline(value: boolean);
    get value(): string;
    set value(value: string);
    get open(): boolean;
    /**
     * Show the prompt dialog and return a promise that resolves to the input value or null if cancelled
     */
    show(): Promise<string | null>;
    applyTheme(theme: Theme): void;
}
//# sourceMappingURL=prompt.d.ts.map