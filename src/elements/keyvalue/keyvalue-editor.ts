/**
 * KeyValue Editor Element
 * A form-like component for editing key-value pairs with schema support
 * Supports nested objects using collapsible sections
 */

import { Validator } from 'jsonschema';
import {
  EditorElementProperties,
  KeyValueEditorContext,
  KeyValueSchema,
  KeyValueValidationError,
  KeyValueValidationResult,
  Theme,
} from '../../types';
import {
  applyEffectiveTheme,
  applyTheme,
  dispatchCustomEvent,
  generateId,
  getShadowRoot,
  setupThemeInheritance,
} from '../../utils';

export class KeyValueEditorElement
  extends HTMLElement
  implements EditorElementProperties
{
  private _theme: Theme = 'auto';
  private _themeCleanup?: () => void;
  private _value: Record<string, any> = {};
  private _valueProxy: Record<string, any> = {};
  private _schema: KeyValueSchema | null = null;
  private _readonly: boolean = false;
  private _compact: boolean = false;
  private _headerTitle: string | null = null;
  private _validationErrors: KeyValueValidationError[] = [];
  private _validator: Validator = new Validator();

  static get observedAttributes(): string[] {
    return ['theme', 'disabled', 'readonly', 'compact', 'header-title'];
  }

  constructor() {
    super();
    this.setupElement();
    // Initialize header title from attribute
    this._headerTitle = this.getAttribute('header-title');
  }

  private setupElement(): void {
    const shadowRoot = getShadowRoot(this);

    shadowRoot.innerHTML = `
      <style>
        :host {
          --spacing: 12px;
          --border-radius: 6px;
          --error-color: var(--danger-color, #dc3545);
          --success-color: var(--success-color, #198754);
          --warning-color: var(--warning-color, #ffc107);

          display: block;
          font-family: var(--font-family, system-ui, sans-serif);
          font-size: var(--font-size, 14px);
          color: var(--text-primary, #212529);
        }

        :host(.theme-dark) {
          --error-color: var(--danger-color, #f85149);
          --success-color: var(--success-color, #51cf66);
          --warning-color: var(--warning-color, #ffd43b);
          color: var(--text-primary, #e6edf3);
        }

        :host(.theme-dark) .keyvalue-container {
          background: var(--bg-primary-dark, #1e1e1e);
          border-color: var(--border-color-dark, #3e3e42);
        }

        :host(.theme-dark) .keyvalue-header {
          background: var(--bg-secondary-dark, #252526);
          border-bottom-color: var(--border-color-dark, #3e3e42);
          color: var(--text-secondary-dark, #cccccc);
        }

        :host(.theme-dark) .field-label {
          color: var(--text-primary-dark, #e6edf3);
        }

        :host(.theme-dark) .range-value {
          color: var(--text-secondary-dark, #cccccc);
        }

        :host(.theme-dark) .field-description {
          color: var(--text-secondary-dark, #cccccc);
        }

        :host(.theme-dark) .nested-section {
          border-color: var(--border-color-dark, #3e3e42);
        }

        :host(.theme-dark) .nested-header {
          background: var(--bg-secondary-dark, #252526);
          border-bottom-color: var(--border-color-dark, #3e3e42);
          color: var(--text-primary-dark, #e6edf3);
        }

        :host(.theme-dark) .nested-header:hover {
          background: var(--bg-tertiary-dark, #2d2d30);
        }

        :host(.theme-dark) .nested-content {
          background: var(--bg-primary-dark, #1e1e1e);
        }

        :host(.theme-dark) .empty-state {
          color: var(--text-secondary-dark, #cccccc);
        }

        :host([disabled]) {
          opacity: 0.6;
          pointer-events: none;
        }

        .keyvalue-container {
          background: var(--bg-primary, #ffffff);
          border: 1px solid var(--border-color, #dee2e6);
          border-radius: var(--border-radius);
          overflow: hidden;
        }

        .keyvalue-header {
          background: var(--bg-secondary, #f8f9fa);
          border-bottom: 1px solid var(--border-color, #dee2e6);
          padding: var(--spacing);
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary, #6c757d);
        }

        .keyvalue-content {
          padding: var(--spacing);
        }

        .field-row {
          display: flex;
          align-items: flex-start;
          margin-bottom: var(--spacing);
          gap: var(--spacing);
        }

        .field-row:last-child {
          margin-bottom: 0;
        }

        :host([compact]) .field-row {
          margin-bottom: calc(var(--spacing) / 2);
        }

        .field-label {
          flex: 0 0 30%;
          font-weight: 500;
          color: var(--text-primary, #212529);
          padding: 8px 0;
          line-height: 1.4;
          cursor: pointer;
        }

        :host([compact]) .field-label {
          padding: 4px 0;
        }

        .field-input {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        /* Input controls will inherit styles from e2-app */
        .input-control {
          width: 100%;
        }

        .input-control.error {
          border-color: var(--error-color) !important;
        }

        .input-control.error:focus {
          border-color: var(--error-color) !important;
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--error-color) 25%, transparent) !important;
        }

        /* Special styling for specific input types */
        .input-control[type="color"] {
          width: 60px;
          height: 38px;
          padding: 4px;
          cursor: pointer;
        }

        .input-control[type="range"] {
          height: auto;
          padding: 0;
        }

        .input-control[type="checkbox"] {
          width: 1em;
          height: 1em;
          padding: 0;
          margin: 0;
          cursor: pointer;
        }

        .range-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .range-value {
          min-width: 60px;
          font-size: 12px;
          color: var(--text-secondary, #6c757d);
          text-align: right;
        }

        .field-error {
          color: var(--error-color);
          font-size: 12px;
          margin-top: 2px;
          font-weight: 500;
        }

        .field-description {
          color: var(--text-secondary, #6c757d);
          font-size: 12px;
          margin-top: 2px;
          line-height: 1.3;
        }

        .nested-section {
          border: 1px solid var(--border-color, #dee2e6);
          border-radius: var(--border-radius);
          margin-bottom: var(--spacing);
          overflow: hidden;
        }

        .nested-header {
          background: var(--bg-secondary, #f8f9fa);
          border-bottom: 1px solid var(--border-color, #dee2e6);
          padding: var(--spacing);
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: center;
          gap: var(--spacing);
          font-weight: 500;
          transition: background-color var(--transition-fast, 0.15s ease-in-out);
        }

        .nested-header:hover {
          background: var(--bg-tertiary, #e9ecef);
        }

        .nested-toggle {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .nested-section.expanded .nested-toggle {
          transform: rotate(90deg);
        }

        .nested-content {
          padding: var(--spacing);
          display: none;
        }

        .nested-section.expanded .nested-content {
          display: block;
        }

        .empty-state {
          text-align: center;
          color: var(--text-secondary, #6c757d);
          padding: calc(var(--spacing) * 2);
          font-style: italic;
        }
      </style>

      <div class="keyvalue-container">
        <div class="keyvalue-header">Properties</div>
        <div class="keyvalue-content">
          <div class="empty-state">No properties to display</div>
        </div>
      </div>
    `;
  }

  private setupValueProxy(): void {
    const self = this;

    this._valueProxy = new Proxy(this._value, {
      set(
        target: Record<string, any>,
        key: string | symbol,
        value: any
      ): boolean {
        if (typeof key === 'string') {
          const oldValue = target[key];
          target[key] = value;

          // Dispatch change event
          self.dispatchChangeEvent(key, oldValue, value, [key]);

          // Trigger re-render
          self.render();

          // Validate after change
          self.validateField(key);
        }
        return true;
      },

      deleteProperty(
        target: Record<string, any>,
        key: string | symbol
      ): boolean {
        if (typeof key === 'string' && key in target) {
          const oldValue = target[key];
          delete target[key];

          // Dispatch change event
          self.dispatchChangeEvent(key, oldValue, undefined, [key]);

          // Trigger re-render
          self.render();
        }
        return true;
      },
    });
  }

  private setupEventListeners(): void {
    const content = this.shadowRoot?.querySelector('.keyvalue-content');
    if (!content) return;

    content.addEventListener('contextmenu', this.handleContextMenu.bind(this));
  }

  private handleContextMenu(event: Event): void {
    const mouseEvent = event as MouseEvent;
    const target = mouseEvent.target as HTMLElement;

    // Find the field row that was right-clicked
    const fieldRow = target.closest('.field-row') as HTMLElement;
    let key: string | null = null;
    let value: any = null;
    let path: string[] = [];
    let fieldType: string | null = null;

    if (fieldRow) {
      // Extract the key from the input element or label
      const input = fieldRow.querySelector(
        'input, select, textarea'
      ) as HTMLInputElement;
      const label = fieldRow.querySelector('.field-label') as HTMLElement;

      if (input && input.id.startsWith('field-')) {
        // Extract key from input ID (format: field-keyname)
        key = input.id.replace('field-', '');

        // Get the current value
        value = this._value[key];

        // Determine field type
        fieldType = input.type || input.tagName.toLowerCase();

        // For now, we'll use a simple path (just the key)
        // In the future, this could be enhanced to support nested paths
        path = [key];
      } else if (label) {
        // Try to extract key from label's for attribute
        const forAttr = label.getAttribute('for');
        if (forAttr && forAttr.startsWith('field-')) {
          key = forAttr.replace('field-', '');
          value = this._value[key];
          fieldType = 'unknown';
          path = [key];
        }
      }
    }

    // Add component context to the event
    const componentContext: KeyValueEditorContext = {
      componentType: 'keyvalue-editor',
      componentId: this.id || generateId(),
      component: this,
      key,
      value,
      path,
      fieldType,
    };

    // Add the context to the event
    (mouseEvent as any).componentContext = componentContext;
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('keyvalue-editor');
    }

    this.setupValueProxy();
    this.setupEventListeners();
    this.render();

    // Set up theme inheritance if no explicit theme is set
    if (!this.hasAttribute('theme')) {
      applyEffectiveTheme(this);
      this._themeCleanup = setupThemeInheritance(this);
    } else {
      this.applyTheme(this._theme);
    }
  }

  disconnectedCallback(): void {
    // Clean up theme inheritance listener
    if (this._themeCleanup) {
      this._themeCleanup();
      this._themeCleanup = undefined;
    }
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'theme':
        // If theme attribute is being set, use explicit theme
        // If theme attribute is being removed, switch to inheritance
        if (newValue) {
          this.theme = newValue as Theme;
        } else if (this.isConnected) {
          // Attribute was removed, switch to inheritance
          applyEffectiveTheme(this);
          this._themeCleanup = setupThemeInheritance(this);
        }
        break;
      case 'readonly':
        this._readonly = newValue !== null;
        this.render();
        break;
      case 'compact':
        this._compact = newValue !== null;
        break;
      case 'header-title':
        this._headerTitle = newValue;
        this.render();
        break;
    }
  }

  applyTheme(theme: Theme): void {
    applyTheme(this, theme);
  }

  private render(): void {
    const shadowRoot = this.shadowRoot!;
    const container = shadowRoot.querySelector('.keyvalue-container')!;
    const content = shadowRoot.querySelector('.keyvalue-content')!;

    // Update header visibility and content
    const header = shadowRoot.querySelector('.keyvalue-header') as HTMLElement;
    if (this._headerTitle !== null) {
      // Show header with title (use "Properties" as default if empty string)
      const headerText =
        this._headerTitle === '' ? 'Properties' : this._headerTitle;
      header.textContent = headerText;
      header.style.display = 'block';
    } else {
      // Hide header
      header.style.display = 'none';
    }

    if (Object.keys(this._value).length === 0) {
      content.innerHTML =
        '<div class="empty-state">No properties to display</div>';
      return;
    }

    content.innerHTML = this.renderFields();
  }

  private renderFields(): string {
    const fields: string[] = [];

    for (const [key, value] of Object.entries(this._value)) {
      const fieldSchema = this._schema?.properties?.[key];
      fields.push(this.renderField(key, value, fieldSchema));
    }

    return fields.join('');
  }

  private renderField(key: string, value: any, schema?: any): string {
    const isNested =
      typeof value === 'object' && value !== null && !Array.isArray(value);

    if (isNested) {
      return this.renderNestedField(key, value, schema);
    }

    const label = schema?.title || this.formatLabel(key);
    const description = schema?.description;
    const error = this._validationErrors.find(e => e.key === key);
    const inputType = this.getInputType(value, schema);
    const inputId = `field-${key}`;

    return `
      <div class="field-row">
        <label class="field-label" for="${inputId}">${label}</label>
        <div class="field-input">
          ${this.renderInput(inputId, key, value, schema, inputType)}
          ${
            description
              ? `<div class="field-description">${description}</div>`
              : ''
          }
          ${error ? `<div class="field-error">${error.message}</div>` : ''}
        </div>
      </div>
    `;
  }

  private renderNestedField(
    key: string,
    value: Record<string, any>,
    schema?: any
  ): string {
    const label = schema?.title || this.formatLabel(key);
    const isExpanded = true; // TODO: Track expansion state
    const expandedClass = isExpanded ? 'expanded' : '';

    return `
      <div class="nested-section ${expandedClass}">
        <div class="nested-header" onclick="this.parentElement.classList.toggle('expanded')">
          <span class="nested-toggle">▶</span>
          <span>${label}</span>
        </div>
        <div class="nested-content">
          ${this.renderNestedFields(value, schema?.properties)}
        </div>
      </div>
    `;
  }

  private renderNestedFields(
    value: Record<string, any>,
    properties?: any
  ): string {
    const fields: string[] = [];

    for (const [key, val] of Object.entries(value)) {
      const fieldSchema = properties?.[key];
      // For nested fields, we only support scalar types (no further nesting)
      if (typeof val !== 'object' || val === null || Array.isArray(val)) {
        fields.push(this.renderField(key, val, fieldSchema));
      }
    }

    return fields.join('');
  }

  private renderInput(
    id: string,
    key: string,
    value: any,
    schema?: any,
    inputType: string = 'text'
  ): string {
    const disabled = this.disabled || this._readonly;
    const hasError = this._validationErrors.some(e => e.key === key);
    const errorClass = hasError ? ' error' : '';

    switch (inputType) {
      case 'checkbox':
        return `<input type="checkbox" id="${id}" class="input-control${errorClass}" ${
          value ? 'checked' : ''
        } ${
          disabled ? 'disabled' : ''
        } onchange="this.getRootNode().host.updateValue('${key}', this.checked)">`;

      case 'number':
        const min =
          schema?.minimum !== undefined ? `min="${schema.minimum}"` : '';
        const max =
          schema?.maximum !== undefined ? `max="${schema.maximum}"` : '';
        const step =
          schema?.type === 'integer'
            ? 'step="1"'
            : schema?.multipleOf
            ? `step="${schema.multipleOf}"`
            : '';
        return `<input type="number" id="${id}" class="input-control${errorClass}" value="${
          value || ''
        }" ${min} ${max} ${step} ${
          disabled ? 'disabled' : ''
        } oninput="this.getRootNode().host.updateValue('${key}', this.valueAsNumber)">`;

      case 'range':
        const rangeMin = schema?.minimum !== undefined ? schema.minimum : 0;
        const rangeMax = schema?.maximum !== undefined ? schema.maximum : 100;
        const rangeStep =
          schema?.type === 'integer'
            ? '1'
            : schema?.multipleOf
            ? schema.multipleOf.toString()
            : '1';
        return `
          <div class="range-container">
            <input type="range" id="${id}" class="input-control${errorClass}" value="${
          value || rangeMin
        }" min="${rangeMin}" max="${rangeMax}" step="${rangeStep}" ${
          disabled ? 'disabled' : ''
        } oninput="this.getRootNode().host.updateValue('${key}', parseFloat(this.value)); this.nextElementSibling.textContent = this.value">
            <span class="range-value">${value || rangeMin}</span>
          </div>
        `;

      case 'color':
        const colorValue = value || '#000000';
        return `<input type="color" id="${id}" class="input-control${errorClass}" value="${colorValue}" ${
          disabled ? 'disabled' : ''
        } onchange="this.getRootNode().host.updateValue('${key}', this.value)">`;

      case 'date':
        return `<input type="date" id="${id}" class="input-control${errorClass}" value="${
          value || ''
        }" ${
          disabled ? 'disabled' : ''
        } onchange="this.getRootNode().host.updateValue('${key}', this.value)">`;

      case 'time':
        return `<input type="time" id="${id}" class="input-control${errorClass}" value="${
          value || ''
        }" ${
          disabled ? 'disabled' : ''
        } onchange="this.getRootNode().host.updateValue('${key}', this.value)">`;

      case 'datetime-local':
        return `<input type="datetime-local" id="${id}" class="input-control${errorClass}" value="${
          value || ''
        }" ${
          disabled ? 'disabled' : ''
        } onchange="this.getRootNode().host.updateValue('${key}', this.value)">`;

      case 'email':
        const emailPattern = schema?.pattern || '';
        return `<input type="email" id="${id}" class="input-control${errorClass}" value="${
          value || ''
        }" ${emailPattern ? `pattern="${emailPattern}"` : ''} ${
          disabled ? 'disabled' : ''
        } oninput="this.getRootNode().host.updateValue('${key}', this.value)">`;

      case 'url':
        return `<input type="url" id="${id}" class="input-control${errorClass}" value="${
          value || ''
        }" ${
          disabled ? 'disabled' : ''
        } oninput="this.getRootNode().host.updateValue('${key}', this.value)">`;

      case 'tel':
        const telPattern = schema?.pattern || '';
        return `<input type="tel" id="${id}" class="input-control${errorClass}" value="${
          value || ''
        }" ${telPattern ? `pattern="${telPattern}"` : ''} ${
          disabled ? 'disabled' : ''
        } oninput="this.getRootNode().host.updateValue('${key}', this.value)">`;

      case 'select':
        const options =
          schema?.enum
            ?.map(
              (option: any) =>
                `<option value="${option}" ${
                  option === value ? 'selected' : ''
                }>${this.formatEnumOption(option)}</option>`
            )
            .join('') || '';
        return `<select id="${id}" class="input-control${errorClass}" ${
          disabled ? 'disabled' : ''
        } onchange="this.getRootNode().host.updateValue('${key}', this.value)">${options}</select>`;

      case 'textarea':
        const rows = schema?.maxLength && schema.maxLength > 100 ? '4' : '2';
        const maxLength = schema?.maxLength
          ? `maxlength="${schema.maxLength}"`
          : '';
        return `<textarea id="${id}" class="input-control${errorClass}" rows="${rows}" ${maxLength} ${
          disabled ? 'disabled' : ''
        } oninput="this.getRootNode().host.updateValue('${key}', this.value)">${
          value || ''
        }</textarea>`;

      default: // text and other types
        const pattern = schema?.pattern ? `pattern="${schema.pattern}"` : '';
        const maxLengthAttr = schema?.maxLength
          ? `maxlength="${schema.maxLength}"`
          : '';
        const minLength = schema?.minLength
          ? `minlength="${schema.minLength}"`
          : '';

        // Use textarea for long text
        if (schema?.maxLength && schema.maxLength > 100) {
          return this.renderInput(id, key, value, schema, 'textarea');
        }

        return `<input type="text" id="${id}" class="input-control${errorClass}" value="${
          value || ''
        }" ${pattern} ${maxLengthAttr} ${minLength} ${
          disabled ? 'disabled' : ''
        } oninput="this.getRootNode().host.updateValue('${key}', this.value)">`;
    }
  }

  private formatEnumOption(option: any): string {
    if (typeof option === 'string') {
      // Convert camelCase and snake_case to readable text
      return option
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    }
    return String(option);
  }

  private getInputType(value: any, schema?: any): string {
    // Check for enum first (dropdown)
    if (schema?.enum && Array.isArray(schema.enum)) {
      return 'select';
    }

    // Check schema format hints
    if (schema?.format) {
      switch (schema.format) {
        case 'email':
          return 'email';
        case 'uri':
        case 'url':
          return 'url';
        case 'date':
          return 'date';
        case 'time':
          return 'time';
        case 'date-time':
          return 'datetime-local';
        case 'color':
          return 'color';
        case 'tel':
        case 'telephone':
          return 'tel';
      }
    }

    // Check for range/slider based on min/max constraints
    if (schema?.type === 'number' || schema?.type === 'integer') {
      if (schema.minimum !== undefined && schema.maximum !== undefined) {
        // Use slider for bounded numbers, especially for smaller ranges
        const range = schema.maximum - schema.minimum;
        if (range <= 100 && schema.type === 'integer') {
          return 'range';
        }
      }
      return 'number';
    }

    // Type-based detection
    switch (typeof value) {
      case 'boolean':
        return 'checkbox';
      case 'number':
        // Check if we should use range based on schema
        if (schema?.minimum !== undefined && schema?.maximum !== undefined) {
          const range = schema.maximum - schema.minimum;
          if (range <= 100 && Number.isInteger(value)) {
            return 'range';
          }
        }
        return 'number';
      default:
        // Pattern-based detection for strings
        if (typeof value === 'string') {
          if (value.includes('@') && value.includes('.')) {
            return 'email';
          }
          if (value.startsWith('http') || value.startsWith('www.')) {
            return 'url';
          }
          if (value.match(/^#[0-9a-fA-F]{6}$/)) {
            return 'color';
          }
          if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return 'date';
          }
          if (value.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
            return 'time';
          }
          if (value.match(/^\+?\d{10,}$/)) {
            return 'tel';
          }
        }
        return 'text';
    }
  }

  private formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private dispatchChangeEvent(
    key: string,
    oldValue: any,
    newValue: any,
    path: string[]
  ): void {
    dispatchCustomEvent(this, 'keyvalue-change', {
      key,
      oldValue,
      newValue,
      path,
      isValid: this.isValid(),
    });
  }

  private validateField(key: string): void {
    // Remove existing errors for this field
    this._validationErrors = this._validationErrors.filter(e => e.key !== key);

    const value = this._value[key];
    const schema = this._schema?.properties?.[key];

    if (!schema) return;

    // Basic validation based on schema
    const errors = this.validateValue(key, value, schema, [key]);
    this._validationErrors.push(...errors);

    // Dispatch validation event
    dispatchCustomEvent(this, 'keyvalue-validation', {
      isValid: this._validationErrors.length === 0,
      errors: this._validationErrors,
    });
  }

  private validateValue(
    key: string,
    value: any,
    schema: any,
    path: string[]
  ): KeyValueValidationError[] {
    const errors: KeyValueValidationError[] = [];

    // Use jsonschema library for comprehensive validation
    if (this._schema) {
      // Create a temporary object with just this field for validation
      const tempObject = { [key]: value };
      const tempSchema = {
        type: 'object',
        properties: { [key]: schema },
        required: this._schema.required?.includes(key) ? [key] : [],
      };

      const result = this._validator.validate(tempObject, tempSchema);

      if (!result.valid) {
        for (const error of result.errors) {
          // Parse jsonschema error messages into user-friendly format
          let message = this.formatValidationError(error, schema);

          errors.push({
            key,
            path,
            message,
          });
        }
      }
    }

    return errors;
  }

  private formatValidationError(error: any, schema: any): string {
    const { name, message, argument } = error;

    switch (name) {
      case 'required':
        return 'This field is required';

      case 'type':
        const expectedType = argument;
        switch (expectedType) {
          case 'string':
            return 'Must be text';
          case 'number':
            return 'Must be a number';
          case 'integer':
            return 'Must be a whole number';
          case 'boolean':
            return 'Must be true or false';
          default:
            return `Must be a ${expectedType}`;
        }

      case 'minimum':
        return `Must be at least ${argument}`;

      case 'maximum':
        return `Must be no more than ${argument}`;

      case 'minLength':
        return `Must be at least ${argument} characters long`;

      case 'maxLength':
        return `Must be no more than ${argument} characters long`;

      case 'pattern':
        // Try to provide better messages for common patterns
        if (schema?.format) {
          switch (schema.format) {
            case 'email':
              return 'Must be a valid email address';
            case 'uri':
            case 'url':
              return 'Must be a valid URL';
            case 'date':
              return 'Must be a valid date (YYYY-MM-DD)';
            case 'time':
              return 'Must be a valid time (HH:MM)';
            case 'color':
              return 'Must be a valid color (e.g., #FF0000)';
            default:
              return 'Does not match the required format';
          }
        }
        return 'Does not match the required pattern';

      case 'enum':
        const validValues = schema?.enum?.join(', ') || 'valid values';
        return `Must be one of: ${validValues}`;

      case 'multipleOf':
        return `Must be a multiple of ${argument}`;

      default:
        // Fallback to the original error message, cleaned up
        return (
          message
            .replace(/^instance\.?\w*\.?/, '')
            .replace(/^\./, '')
            .trim() || 'Invalid value'
        );
    }
  }

  // Public API methods
  public updateValue(key: string, value: any): void {
    this._valueProxy[key] = value;
  }

  public getValue(): Record<string, any> {
    return { ...this._value };
  }

  public setValue(value: Record<string, any>): void {
    this._value = { ...value };
    this.setupValueProxy();
    this.render();
    this.validate();
  }

  public setSchema(schema: KeyValueSchema): void {
    this._schema = schema;
    this.render();
    this.validate();
  }

  public validate(): KeyValueValidationResult {
    this._validationErrors = [];

    if (!this._schema) {
      return { isValid: true, errors: [] };
    }

    // Use jsonschema to validate the entire object
    const result = this._validator.validate(this._value, this._schema);

    if (!result.valid) {
      for (const error of result.errors) {
        // Extract the property name from the error path
        const propertyPath = error.property.replace('instance.', '').split('.');
        const key = propertyPath[0] || 'root';
        const fieldSchema = this._schema.properties?.[key];

        const message = this.formatValidationError(error, fieldSchema);

        this._validationErrors.push({
          key,
          path: propertyPath,
          message,
        });
      }
    }

    const validationResult = {
      isValid: this._validationErrors.length === 0,
      errors: this._validationErrors,
    };

    dispatchCustomEvent(this, 'keyvalue-validation', validationResult);
    return validationResult;
  }

  public isValid(): boolean {
    return this._validationErrors.length === 0;
  }

  public focusField(key: string): void {
    const input = this.shadowRoot?.querySelector(
      `#field-${key}`
    ) as HTMLInputElement;
    input?.focus();
  }

  // Properties
  get theme(): Theme {
    return this._theme;
  }

  set theme(value: Theme) {
    this._theme = value;

    // Clean up any existing theme inheritance
    if (this._themeCleanup) {
      this._themeCleanup();
      this._themeCleanup = undefined;
    }

    this.applyTheme(value);
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  get readonly(): boolean {
    return this._readonly;
  }

  set readonly(value: boolean) {
    this._readonly = value;
    if (value) {
      this.setAttribute('readonly', '');
    } else {
      this.removeAttribute('readonly');
    }
  }

  get compact(): boolean {
    return this._compact;
  }

  set compact(value: boolean) {
    this._compact = value;
    if (value) {
      this.setAttribute('compact', '');
    } else {
      this.removeAttribute('compact');
    }
  }

  get value(): Record<string, any> {
    return this.getValue();
  }

  set value(value: Record<string, any>) {
    this.setValue(value);
  }

  get schema(): KeyValueSchema | null {
    return this._schema;
  }

  set schema(value: KeyValueSchema | null) {
    if (value) {
      this.setSchema(value);
    } else {
      this._schema = null;
      this.render();
    }
  }

  get headerTitle(): string | null {
    return this._headerTitle;
  }

  set headerTitle(value: string | null) {
    this._headerTitle = value;
    if (value !== null) {
      this.setAttribute('header-title', value);
    } else {
      this.removeAttribute('header-title');
    }
  }
}

// Register the custom element
if (!customElements.get('e2-keyvalue-editor')) {
  customElements.define('e2-keyvalue-editor', KeyValueEditorElement);
}
