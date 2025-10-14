/**
 * KeyValue Editor Element
 * A form-like component for editing key-value pairs with schema support
 * Supports nested objects using collapsible sections
 */
import { EditorElementProperties, KeyValueSchema, KeyValueValidationResult, Theme } from '../../types';
export declare class KeyValueEditorElement extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _themeCleanup?;
    private _value;
    private _valueProxy;
    private _schema;
    private _readonly;
    private _compact;
    private _headerTitle;
    private _validationErrors;
    private _validator;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    private setupValueProxy;
    private setupEventListeners;
    private handleContextMenu;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
    applyTheme(theme: Theme): void;
    private render;
    private renderFields;
    private renderField;
    private renderNestedField;
    private renderNestedFields;
    private renderInput;
    private formatEnumOption;
    private getInputType;
    private formatLabel;
    private dispatchChangeEvent;
    private validateField;
    private updateInputValue;
    private updateFieldErrorDisplay;
    private validateValue;
    private formatValidationError;
    updateValue(key: string, value: any): void;
    getValue(): Record<string, any>;
    setValue(value: Record<string, any>): void;
    setSchema(schema: KeyValueSchema): void;
    validate(): KeyValueValidationResult;
    isValid(): boolean;
    focusField(key: string): void;
    get theme(): Theme;
    set theme(value: Theme);
    get disabled(): boolean;
    set disabled(value: boolean);
    get readonly(): boolean;
    set readonly(value: boolean);
    get compact(): boolean;
    set compact(value: boolean);
    get value(): Record<string, any>;
    set value(value: Record<string, any>);
    get schema(): KeyValueSchema | null;
    set schema(value: KeyValueSchema | null);
    get headerTitle(): string | null;
    set headerTitle(value: string | null);
}
//# sourceMappingURL=keyvalue-editor.d.ts.map