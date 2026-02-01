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
    private _throttleTimers;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    private throttleUpdate;
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
    private isSimpleArray;
    private renderArrayField;
    private renderArrayItem;
    private getDefaultArrayItemValue;
    private renderFunctionField;
    private renderInput;
    private formatEnumOption;
    private getInputType;
    private formatLabel;
    private dispatchChangeEvent;
    private validateField;
    private validateFieldByPath;
    private updateInputValue;
    private updateInputValueByPath;
    private updateFieldErrorDisplay;
    private updateFieldErrorDisplayByPath;
    private validateValue;
    private formatValidationError;
    updateValue(key: string, value: any): void;
    updateValueByPath(path: string[], value: any): void;
    getValue(): Record<string, any>;
    setValue(value: Record<string, any>): void;
    setSchema(schema: KeyValueSchema): void;
    validate(): KeyValueValidationResult;
    isValid(): boolean;
    focusField(key: string): void;
    focusFieldByPath(path: string[]): void;
    handleSliderInput(path: string[], value: string, numberId: string): void;
    handleNumberInput(path: string[], value: string, sliderId: string): void;
    callFunction(path: string[]): void;
    addArrayItem(path: string[], defaultValue?: any): void;
    removeArrayItem(path: string[], index: number): void;
    moveArrayItem(path: string[], index: number, direction: 'up' | 'down'): void;
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