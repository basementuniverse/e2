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
  private _throttleTimers: Map<string, number> = new Map();

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
          background: var(--bg-secondary-dark, #252526);
        }

        :host(.theme-dark) .nested-header {
          background: transparent;
          border-bottom-color: var(--border-color-dark, rgba(255, 255, 255, 0.1));
          color: var(--text-primary-dark, #e6edf3);
        }

        :host(.theme-dark) .nested-header:hover {
          background: var(--bg-hover-dark, rgba(255, 255, 255, 0.05));
        }

        :host(.theme-dark) .nested-content {
          background: transparent;
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
          padding: 0;
        }

        .field-row {
          display: flex;
          align-items: flex-start;
          margin: var(--spacing);
          gap: var(--spacing);
        }

        :host([compact]) .field-row {
          margin: calc(var(--spacing) / 2) var(--spacing);
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

        /* Input controls - inherit e2-app styles via CSS custom properties */
        .input-control {
          display: block;
          width: 100%;
          box-sizing: border-box;
          padding: var(--input-padding, 6px 12px);
          font-size: var(--input-font-size, 14px);
          font-family: var(--font-family, system-ui, sans-serif);
          line-height: var(--line-height, 1.4);
          color: var(--input-text, #212529);
          background-color: var(--input-bg, #ffffff);
          background-clip: padding-box;
          border: 1px solid var(--input-border, #ced4da);
          border-radius: var(--input-border-radius, 4px);
          transition: border-color var(--transition-fast, 0.15s ease-in-out), box-shadow var(--transition-fast, 0.15s ease-in-out);
        }

        .input-control:focus {
          outline: 0;
          border-color: var(--input-border-focus, #86b7fe);
          box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
        }

        .input-control::placeholder {
          color: var(--input-placeholder, #6c757d);
          opacity: 1;
        }

        .input-control:disabled {
          background-color: var(--bg-tertiary, #e9ecef);
          opacity: 0.6;
          cursor: not-allowed;
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
          background: var(--bg-tertiary, #e9ecef);
          cursor: pointer;
          accent-color: var(--accent-color, #0d6efd);
        }

        .input-control[type="checkbox"] {
          width: 16px;
          height: 16px;
          margin: 0;
          position: relative;
          top: 0.5em;
          cursor: pointer;
          accent-color: var(--accent-color, #0d6efd);
        }

        .input-control[type="checkbox"]:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .input-control[type="file"] {
          cursor: pointer;
        }

        /* Textarea specific */
        textarea.input-control {
          resize: vertical;
          min-height: 80px;
        }

        /* Select specific */
        select.input-control {
          cursor: pointer;
        }

        .range-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .range-slider-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .range-slider-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .range-slider-track {
          position: relative;
          display: flex;
          align-items: center;
        }

        .range-slider-track input[type="range"] {
          flex: 1;
        }

        .range-markers {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-secondary, #6c757d);
          padding: 0 2px;
        }

        .range-number-input {
          width: 80px;
          flex-shrink: 0;
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
          background: var(--bg-secondary, #f8f9fa);
          overflow: hidden;
        }

        .nested-header {
          background: transparent;
          border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
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
          background: var(--bg-hover, rgba(0, 0, 0, 0.05));
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
          background: transparent;
        }

        .nested-section.expanded .nested-content {
          display: block;
        }

        .empty-state {
          text-align: center;
          color: var(--text-secondary, #6c757d);
          padding: calc(var(--spacing) * 3) var(--spacing);
          font-style: italic;
        }

        .function-button {
          display: inline-block;
          padding: var(--input-padding, 6px 12px);
          font-size: var(--input-font-size, 14px);
          font-family: var(--font-family, system-ui, sans-serif);
          font-weight: 500;
          line-height: var(--line-height, 1.4);
          color: var(--button-text, #ffffff);
          background-color: var(--accent-color, #0d6efd);
          border: 1px solid var(--accent-color, #0d6efd);
          border-radius: var(--input-border-radius, 4px);
          cursor: pointer;
          transition: background-color var(--transition-fast, 0.15s ease-in-out), border-color var(--transition-fast, 0.15s ease-in-out);
          user-select: none;
        }

        .function-button:hover:not(:disabled) {
          background-color: color-mix(in srgb, var(--accent-color, #0d6efd) 85%, black);
          border-color: color-mix(in srgb, var(--accent-color, #0d6efd) 85%, black);
        }

        .function-button:active:not(:disabled) {
          background-color: color-mix(in srgb, var(--accent-color, #0d6efd) 75%, black);
          border-color: color-mix(in srgb, var(--accent-color, #0d6efd) 75%, black);
        }

        .function-button:disabled {
          background-color: var(--bg-tertiary, #e9ecef);
          border-color: var(--bg-tertiary, #e9ecef);
          color: var(--text-secondary, #6c757d);
          cursor: not-allowed;
          opacity: 0.6;
        }

        /* Array editor styles */
        .array-section {
          background: var(--bg-secondary, #f8f9fa);
          overflow: hidden;
        }

        .array-header {
          background: transparent;
          border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
          padding: var(--spacing);
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: center;
          gap: var(--spacing);
          font-weight: 500;
          transition: background-color var(--transition-fast, 0.15s ease-in-out);
        }

        .array-header:hover {
          background: var(--bg-hover, rgba(0, 0, 0, 0.05));
        }

        .array-toggle {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .array-section.expanded .array-toggle {
          transform: rotate(90deg);
        }

        .array-count {
          color: var(--text-secondary, #6c757d);
          font-size: 12px;
          font-weight: normal;
        }

        .array-content {
          padding: var(--spacing);
          display: none;
          background: transparent;
        }

        .array-section.expanded .array-content {
          display: block;
        }

        .array-items {
          display: flex;
          flex-direction: column;
          gap: calc(var(--spacing) / 2);
          margin-bottom: var(--spacing);
        }

        .array-item {
          display: flex;
          align-items: center;
          gap: calc(var(--spacing) / 2);
          background: var(--bg-primary, #ffffff);
          padding: calc(var(--spacing) / 2);
          border-radius: calc(var(--border-radius) / 2);
          border: 1px solid var(--border-color, #dee2e6);
        }

        :host(.theme-dark) .array-section {
          background: var(--bg-secondary-dark, #252526);
        }

        :host(.theme-dark) .array-header {
          border-bottom-color: var(--border-color-dark, #3e3e42);
          color: var(--text-primary-dark, #e6edf3);
        }

        :host(.theme-dark) .array-header:hover {
          background: var(--bg-hover-dark, rgba(255, 255, 255, 0.05));
        }

        :host(.theme-dark) .array-item {
          background: var(--bg-primary-dark, #1e1e1e);
          border-color: var(--border-color-dark, #3e3e42);
        }

        .array-item-index {
          flex: 0 0 30px;
          font-size: 12px;
          color: var(--text-secondary, #6c757d);
          text-align: right;
          font-weight: 500;
        }

        .array-item-input {
          flex: 1;
          min-width: 0;
        }

        .array-item-controls {
          flex: 0 0 auto;
          display: flex;
          gap: 4px;
        }

        .array-item-button {
          width: 28px;
          height: 28px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          background: var(--bg-secondary, #f8f9fa);
          border: 1px solid var(--border-color, #dee2e6);
          border-radius: calc(var(--border-radius) / 2);
          cursor: pointer;
          transition: background-color var(--transition-fast, 0.15s ease-in-out);
          user-select: none;
        }

        .array-item-button:hover:not(:disabled) {
          background: var(--bg-tertiary, #e9ecef);
        }

        .array-item-button:active:not(:disabled) {
          background: var(--bg-hover, #dee2e6);
        }

        .array-item-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .array-item-button.danger:hover:not(:disabled) {
          background: var(--error-color);
          border-color: var(--error-color);
          color: white;
        }

        :host(.theme-dark) .array-item-button {
          background: var(--bg-tertiary-dark, #333333);
          border-color: var(--border-color-dark, #3e3e42);
          color: var(--text-primary-dark, #e6edf3);
        }

        :host(.theme-dark) .array-item-button:hover:not(:disabled) {
          background: var(--bg-hover-dark, #404040);
        }

        .array-add-button {
          width: 100%;
          padding: var(--input-padding, 6px 12px);
          font-size: var(--input-font-size, 14px);
          font-family: var(--font-family, system-ui, sans-serif);
          font-weight: 500;
          line-height: var(--line-height, 1.4);
          color: var(--accent-color, #0d6efd);
          background-color: transparent;
          border: 1px dashed var(--accent-color, #0d6efd);
          border-radius: var(--input-border-radius, 4px);
          cursor: pointer;
          transition: background-color var(--transition-fast, 0.15s ease-in-out), border-color var(--transition-fast, 0.15s ease-in-out);
          user-select: none;
        }

        .array-add-button:hover:not(:disabled) {
          background-color: color-mix(in srgb, var(--accent-color, #0d6efd) 10%, transparent);
          border-style: solid;
        }

        .array-add-button:active:not(:disabled) {
          background-color: color-mix(in srgb, var(--accent-color, #0d6efd) 20%, transparent);
        }

        .array-add-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .array-empty {
          text-align: center;
          color: var(--text-secondary, #6c757d);
          padding: var(--spacing);
          font-style: italic;
          font-size: 13px;
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

  private throttleUpdate(
    key: string,
    callback: () => void,
    delay: number = 16
  ): void {
    const now = Date.now();
    const lastTime = this._throttleTimers.get(key) || 0;

    if (now - lastTime >= delay) {
      this._throttleTimers.set(key, now);
      callback();
    }
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

          // Update the specific input field without full re-render
          self.updateInputValue(key, value);

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

          // Trigger re-render for deletions
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
      fields.push(this.renderField(key, value, fieldSchema, []));
    }

    return fields.join('');
  }

  private renderField(
    key: string,
    value: any,
    schema?: any,
    path: string[] = []
  ): string {
    const isFunction = typeof value === 'function';

    if (isFunction) {
      return this.renderFunctionField(key, value, schema, path);
    }

    const isArray = Array.isArray(value);

    if (isArray) {
      // Check if it's a simple array (only scalar types)
      const isSimpleArray = this.isSimpleArray(value, schema);
      if (isSimpleArray) {
        return this.renderArrayField(key, value, schema, path);
      }
      // Fall through to render as text for complex arrays
    }

    const isNested =
      typeof value === 'object' && value !== null && !Array.isArray(value);

    if (isNested) {
      return this.renderNestedField(key, value, schema, path);
    }

    const label = schema?.title || this.formatLabel(key);
    const description = schema?.description;
    const fullPath = [...path, key];
    const error = this._validationErrors.find(
      e => e.key === key && JSON.stringify(e.path) === JSON.stringify(fullPath)
    );
    const inputType = this.getInputType(value, schema);
    const inputId = `field-${fullPath.join('-')}`;

    return `
      <div class="field-row">
        <label class="field-label" for="${inputId}">${label}</label>
        <div class="field-input">
          ${this.renderInput(inputId, fullPath, value, schema, inputType)}
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
    schema?: any,
    path: string[] = []
  ): string {
    const label = schema?.title || this.formatLabel(key);
    const isExpanded = true; // TODO: Track expansion state
    const expandedClass = isExpanded ? 'expanded' : '';
    const nestedPath = [...path, key];

    return `
      <div class="nested-section ${expandedClass}">
        <div class="nested-header" onclick="this.parentElement.classList.toggle('expanded')">
          <span class="nested-toggle">▶</span>
          <span>${label}</span>
        </div>
        <div class="nested-content">
          ${this.renderNestedFields(value, schema?.properties, nestedPath)}
        </div>
      </div>
    `;
  }

  private renderNestedFields(
    value: Record<string, any>,
    properties?: any,
    path: string[] = []
  ): string {
    const fields: string[] = [];

    for (const [key, val] of Object.entries(value)) {
      const fieldSchema = properties?.[key];
      // For nested fields, we only support scalar types (no further nesting)
      if (typeof val !== 'object' || val === null || Array.isArray(val)) {
        fields.push(this.renderField(key, val, fieldSchema, path));
      }
    }

    return fields.join('');
  }

  private isSimpleArray(value: any[], schema?: any): boolean {
    // Empty arrays are simple
    if (value.length === 0) {
      // Check if schema defines array items
      if (schema?.items) {
        const itemType = schema.items.type;
        // Only support simple types
        return ['string', 'number', 'integer', 'boolean'].includes(itemType);
      }
      // Allow empty arrays without schema
      return true;
    }

    // Check if all items are scalar types (no objects or nested arrays)
    for (const item of value) {
      if (item === null || item === undefined) continue;
      const itemType = typeof item;
      if (itemType === 'object') {
        return false; // Objects and nested arrays not supported
      }
    }

    return true;
  }

  private renderArrayField(
    key: string,
    value: any[],
    schema?: any,
    path: string[] = []
  ): string {
    const label = schema?.title || this.formatLabel(key);
    const isExpanded = true; // TODO: Track expansion state
    const expandedClass = isExpanded ? 'expanded' : '';
    const arrayPath = [...path, key];
    const itemCount = value.length;
    const itemSchema = schema?.items;
    const disabled = this.disabled || this._readonly;

    // Get default value for new items
    const defaultValue = this.getDefaultArrayItemValue(value, itemSchema);
    const pathString = JSON.stringify(arrayPath).replace(/"/g, '&quot;');

    let itemsHtml = '';
    if (value.length === 0) {
      itemsHtml = '<div class="array-empty">No items</div>';
    } else {
      itemsHtml = '<div class="array-items">';
      for (let i = 0; i < value.length; i++) {
        itemsHtml += this.renderArrayItem(
          arrayPath,
          i,
          value[i],
          itemSchema,
          value.length
        );
      }
      itemsHtml += '</div>';
    }

    const description = schema?.description;

    return `
      <div class="array-section ${expandedClass}">
        <div class="array-header" onclick="this.parentElement.classList.toggle('expanded')">
          <span class="array-toggle">▶</span>
          <span>${label}</span>
          <span class="array-count">(${itemCount} ${itemCount === 1 ? 'item' : 'items'})</span>
        </div>
        <div class="array-content">
          ${description ? `<div class="field-description" style="margin-bottom: var(--spacing);">${description}</div>` : ''}
          ${itemsHtml}
          <button
            class="array-add-button"
            ${disabled ? 'disabled' : ''}
            onclick="this.getRootNode().host.addArrayItem(JSON.parse('${pathString}'), ${JSON.stringify(defaultValue).replace(/"/g, '&quot;')})">
            + Add Item
          </button>
        </div>
      </div>
    `;
  }

  private renderArrayItem(
    arrayPath: string[],
    index: number,
    value: any,
    itemSchema?: any,
    totalItems: number = 1
  ): string {
    const itemPath = [...arrayPath, index.toString()];
    const inputType = this.getInputType(value, itemSchema);
    const inputId = `field-${itemPath.join('-')}`;
    const disabled = this.disabled || this._readonly;
    const pathString = JSON.stringify(arrayPath).replace(/"/g, '&quot;');

    const canMoveUp = index > 0;
    const canMoveDown = index < totalItems - 1;

    return `
      <div class="array-item">
        <span class="array-item-index">${index}</span>
        <div class="array-item-input">
          ${this.renderInput(inputId, itemPath, value, itemSchema, inputType)}
        </div>
        <div class="array-item-controls">
          <button
            class="array-item-button"
            title="Move up"
            ${disabled || !canMoveUp ? 'disabled' : ''}
            onclick="this.getRootNode().host.moveArrayItem(JSON.parse('${pathString}'), ${index}, 'up')">
            ↑
          </button>
          <button
            class="array-item-button"
            title="Move down"
            ${disabled || !canMoveDown ? 'disabled' : ''}
            onclick="this.getRootNode().host.moveArrayItem(JSON.parse('${pathString}'), ${index}, 'down')">
            ↓
          </button>
          <button
            class="array-item-button danger"
            title="Remove item"
            ${disabled ? 'disabled' : ''}
            onclick="this.getRootNode().host.removeArrayItem(JSON.parse('${pathString}'), ${index})">
            ×
          </button>
        </div>
      </div>
    `;
  }

  private getDefaultArrayItemValue(array: any[], itemSchema?: any): any {
    // Use schema type if available
    if (itemSchema?.type) {
      switch (itemSchema.type) {
        case 'string':
          return itemSchema.default ?? '';
        case 'number':
        case 'integer':
          return itemSchema.default ?? 0;
        case 'boolean':
          return itemSchema.default ?? false;
      }
    }

    // Infer from existing items
    if (array.length > 0) {
      const lastItem = array[array.length - 1];
      const itemType = typeof lastItem;

      switch (itemType) {
        case 'number':
          return 0;
        case 'boolean':
          return false;
        case 'string':
        default:
          return '';
      }
    }

    // Default to empty string
    return '';
  }

  private renderFunctionField(
    key: string,
    value: Function,
    schema?: any,
    path: string[] = []
  ): string {
    const label = schema?.title || this.formatLabel(key);
    const description = schema?.description;
    const fullPath = [...path, key];
    const disabled = this.disabled || this._readonly;
    const pathString = JSON.stringify(fullPath).replace(/"/g, '&quot;');

    return `
      <div class="field-row">
        <label class="field-label">${label}</label>
        <div class="field-input">
          <button
            class="function-button"
            ${disabled ? 'disabled' : ''}
            onclick="this.getRootNode().host.callFunction(JSON.parse('${pathString}'))">
            ${label}
          </button>
          ${
            description
              ? `<div class="field-description">${description}</div>`
              : ''
          }
        </div>
      </div>
    `;
  }

  private renderInput(
    id: string,
    path: string[],
    value: any,
    schema?: any,
    inputType: string = 'text'
  ): string {
    const disabled = this.disabled || this._readonly;
    const key = path[path.length - 1];
    const hasError = this._validationErrors.some(
      e => e.key === key && JSON.stringify(e.path) === JSON.stringify(path)
    );
    const errorClass = hasError ? ' error' : '';
    const pathString = JSON.stringify(path).replace(/"/g, '&quot;');

    switch (inputType) {
      case 'checkbox':
        return `<input type="checkbox" id="${id}" class="input-control${errorClass}" ${
          value ? 'checked' : ''
        } ${
          disabled ? 'disabled' : ''
        } onchange="this.getRootNode().host.updateValueByPath(JSON.parse('${pathString}'), this.checked)">`;

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
          value ?? ''
        }" ${min} ${max} ${step} ${
          disabled ? 'disabled' : ''
        } oninput="this.getRootNode().host.updateValueByPath(JSON.parse('${pathString}'), this.valueAsNumber)">`;

      case 'range':
        const rangeMin = schema?.minimum !== undefined ? schema.minimum : 0;
        const rangeMax = schema?.maximum !== undefined ? schema.maximum : 100;
        const rangeStep =
          schema?.type === 'integer'
            ? '1'
            : schema?.multipleOf
              ? schema.multipleOf.toString()
              : '0.01';
        const rangeValue =
          value !== undefined && value !== null ? value : rangeMin;
        const sliderId = `${id}-slider`;
        const numberId = `${id}-number`;
        return `
          <div class="range-container">
            <div class="range-slider-row">
              <div class="range-slider-wrapper">
                <div class="range-slider-track">
                  <input
                    type="range"
                    id="${sliderId}"
                    class="input-control${errorClass}"
                    value="${rangeValue}"
                    min="${rangeMin}"
                    max="${rangeMax}"
                    step="${rangeStep}"
                    ${disabled ? 'disabled' : ''}
                    oninput="this.getRootNode().host.handleSliderInput(JSON.parse('${pathString}'), this.value, '${numberId}')">
                </div>
                <div class="range-markers">
                  <span>${rangeMin}</span>
                  <span>${rangeMax}</span>
                </div>
              </div>
              <input
                type="number"
                id="${numberId}"
                class="input-control range-number-input${errorClass}"
                value="${rangeValue}"
                min="${rangeMin}"
                max="${rangeMax}"
                step="${rangeStep}"
                ${disabled ? 'disabled' : ''}
                oninput="this.getRootNode().host.handleNumberInput(JSON.parse('${pathString}'), this.value, '${sliderId}')">
            </div>
          </div>
        `;

      case 'color':
        const colorValue = value || '#000000';
        return `<input type="color" id="${id}" class="input-control${errorClass}" value="${colorValue}" ${
          disabled ? 'disabled' : ''
        } onchange="this.getRootNode().host.updateValueByPath(JSON.parse('${pathString}'), this.value)">`;

      case 'date':
        return `<input type="date" id="${id}" class="input-control${errorClass}" value="${
          value || ''
        }" ${
          disabled ? 'disabled' : ''
        } onchange="this.getRootNode().host.updateValueByPath(JSON.parse('${pathString}'), this.value)">`;

      case 'time':
        return `<input type="time" id="${id}" class="input-control${errorClass}" value="${
          value || ''
        }" ${
          disabled ? 'disabled' : ''
        } onchange="this.getRootNode().host.updateValueByPath(JSON.parse('${pathString}'), this.value)">`;

      case 'datetime-local':
        return `<input type="datetime-local" id="${id}" class="input-control${errorClass}" value="${
          value || ''
        }" ${
          disabled ? 'disabled' : ''
        } onchange="this.getRootNode().host.updateValueByPath(JSON.parse('${pathString}'), this.value)">`;

      case 'email':
        const emailPattern = schema?.pattern || '';
        return `<input type="email" id="${id}" class="input-control${errorClass}" value="${
          value || ''
        }" ${emailPattern ? `pattern="${emailPattern}"` : ''} ${
          disabled ? 'disabled' : ''
        } oninput="this.getRootNode().host.updateValueByPath(JSON.parse('${pathString}'), this.value)">`;

      case 'url':
        return `<input type="url" id="${id}" class="input-control${errorClass}" value="${
          value || ''
        }" ${
          disabled ? 'disabled' : ''
        } oninput="this.getRootNode().host.updateValueByPath(JSON.parse('${pathString}'), this.value)">`;

      case 'tel':
        const telPattern = schema?.pattern || '';
        return `<input type="tel" id="${id}" class="input-control${errorClass}" value="${
          value || ''
        }" ${telPattern ? `pattern="${telPattern}"` : ''} ${
          disabled ? 'disabled' : ''
        } oninput="this.getRootNode().host.updateValueByPath(JSON.parse('${pathString}'), this.value)">`;

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
        } onchange="this.getRootNode().host.updateValueByPath(JSON.parse('${pathString}'), this.value)">${options}</select>`;

      case 'textarea':
        const rows = schema?.maxLength && schema.maxLength > 100 ? '4' : '2';
        const maxLength = schema?.maxLength
          ? `maxlength="${schema.maxLength}"`
          : '';
        return `<textarea id="${id}" class="input-control${errorClass}" rows="${rows}" ${maxLength} ${
          disabled ? 'disabled' : ''
        } oninput="this.getRootNode().host.updateValueByPath(JSON.parse('${pathString}'), this.value)">${
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
          return this.renderInput(id, path, value, schema, 'textarea');
        }

        return `<input type="text" id="${id}" class="input-control${errorClass}" value="${
          value ?? ''
        }" ${pattern} ${maxLengthAttr} ${minLength} ${
          disabled ? 'disabled' : ''
        } oninput="this.getRootNode().host.updateValueByPath(JSON.parse('${pathString}'), this.value)">`;
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
      // Use slider when both min and max are defined
      if (schema.minimum !== undefined && schema.maximum !== undefined) {
        return 'range';
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
          return 'range';
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
    this.validateFieldByPath([key]);
  }

  private validateFieldByPath(path: string[]): void {
    const key = path[path.length - 1];

    // Remove existing errors for this field path
    this._validationErrors = this._validationErrors.filter(
      e => !(e.key === key && JSON.stringify(e.path) === JSON.stringify(path))
    );

    // Get the value from the correct path
    let value: any = this._value;
    for (const pathPart of path) {
      if (value && typeof value === 'object') {
        value = value[pathPart];
      } else {
        value = undefined;
        break;
      }
    }

    // Navigate through the schema following the full path
    let fieldSchema: any = this._schema;
    for (let i = 0; i < path.length && fieldSchema; i++) {
      if (fieldSchema.properties) {
        fieldSchema = fieldSchema.properties[path[i]];
      } else {
        fieldSchema = undefined;
        break;
      }
    }

    if (!fieldSchema) return;

    // Basic validation based on schema
    const errors = this.validateValue(key, value, fieldSchema, path);
    this._validationErrors.push(...errors);

    // Update error display for this specific field
    this.updateFieldErrorDisplayByPath(path);

    // Dispatch validation event
    dispatchCustomEvent(this, 'keyvalue-validation', {
      isValid: this._validationErrors.length === 0,
      errors: this._validationErrors,
    });
  }

  private updateInputValue(key: string, value: any): void {
    this.updateInputValueByPath([key], value);
  }

  private updateInputValueByPath(path: string[], value: any): void {
    const fieldId = `field-${path.join('-')}`;
    const input = this.shadowRoot?.querySelector(`#${fieldId}`) as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement;

    if (!input) return;

    // Update the input value only if it's different from the current value
    // This prevents cursor position issues and unnecessary updates
    if (input.type === 'checkbox') {
      const checkbox = input as HTMLInputElement;
      checkbox.checked = Boolean(value);
    } else if (input.type === 'range') {
      const range = input as HTMLInputElement;
      const stringValue = String(
        value !== undefined && value !== null ? value : 0
      );
      range.value = stringValue;

      // Also update the corresponding number input
      const numberId = input.id.replace('-slider', '-number');
      const numberInput = this.shadowRoot?.querySelector(
        `#${numberId}`
      ) as HTMLInputElement;
      if (numberInput) {
        numberInput.value = stringValue;
      }
    } else if (input.type === 'number' && input.id.includes('-number')) {
      // Handle number input that's part of a range control
      const numberInput = input as HTMLInputElement;
      const stringValue = String(
        value !== undefined && value !== null ? value : 0
      );
      numberInput.value = stringValue;

      // Also update the corresponding slider
      const sliderId = input.id.replace('-number', '-slider');
      const sliderInput = this.shadowRoot?.querySelector(
        `#${sliderId}`
      ) as HTMLInputElement;
      if (sliderInput) {
        sliderInput.value = stringValue;
      }
    } else {
      // For text inputs, select, and textarea elements
      const stringValue =
        value === null || value === undefined ? '' : String(value);
      if (input.value !== stringValue) {
        input.value = stringValue;
      }
    }
  }

  private updateFieldErrorDisplay(key: string): void {
    this.updateFieldErrorDisplayByPath([key]);
  }

  private updateFieldErrorDisplayByPath(path: string[]): void {
    const key = path[path.length - 1];
    const fieldId = `field-${path.join('-')}`;

    // Update input error state
    const input = this.shadowRoot?.querySelector(`#${fieldId}`) as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement;

    if (input) {
      const hasError = this._validationErrors.some(
        e => e.key === key && JSON.stringify(e.path) === JSON.stringify(path)
      );
      if (hasError) {
        input.classList.add('error');
      } else {
        input.classList.remove('error');
      }
    }

    // Update error message display
    const fieldRow = this.shadowRoot
      ?.querySelector(`label[for="${fieldId}"]`)
      ?.closest('.field-row');
    if (!fieldRow) return;

    const fieldInputContainer = fieldRow.querySelector('.field-input');
    if (!fieldInputContainer) return;

    // Remove existing error message
    const existingError = fieldInputContainer.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }

    // Add new error message if there's an error
    const error = this._validationErrors.find(
      e => e.key === key && JSON.stringify(e.path) === JSON.stringify(path)
    );
    if (error) {
      const errorElement = document.createElement('div');
      errorElement.className = 'field-error';
      errorElement.textContent = error.message;
      fieldInputContainer.appendChild(errorElement);
    }
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

  public updateValueByPath(path: string[], value: any): void {
    if (path.length === 1) {
      // Top-level property
      this._valueProxy[path[0]] = value;
    } else {
      // Nested property or array item - navigate to the correct nested object/array
      let target = this._value;
      for (let i = 0; i < path.length - 1; i++) {
        const pathPart = path[i];

        // Check if this is an array index (numeric string)
        const isArrayIndex = /^\d+$/.test(pathPart);

        if (isArrayIndex) {
          // Navigating through an array
          const index = parseInt(pathPart, 10);
          if (Array.isArray(target) && index >= 0 && index < target.length) {
            target = target[index];
          } else {
            return; // Invalid array index
          }
        } else {
          // Navigating through an object
          if (!target[pathPart] || typeof target[pathPart] !== 'object') {
            target[pathPart] = {};
          }
          target = target[pathPart];
        }
      }

      const finalKey = path[path.length - 1];

      // Check if final key is an array index
      const isFinalArrayIndex = /^\d+$/.test(finalKey);

      if (isFinalArrayIndex) {
        // Setting an array item
        const index = parseInt(finalKey, 10);
        if (Array.isArray(target) && index >= 0 && index < target.length) {
          const oldValue = target[index];
          target[index] = value;

          // Dispatch change event
          this.dispatchChangeEvent(finalKey, oldValue, value, path);

          // Update the specific input field without full re-render
          this.updateInputValueByPath(path, value);

          // Validate the array item
          this.validateFieldByPath(path);
        }
      } else {
        // Setting an object property
        const oldValue = target[finalKey];
        target[finalKey] = value;

        // Dispatch change event
        this.dispatchChangeEvent(finalKey, oldValue, value, path);

        // Update the specific input field without full re-render
        this.updateInputValueByPath(path, value);

        // Validate after change
        this.validateFieldByPath(path);
      }
    }
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
        const key = propertyPath[propertyPath.length - 1] || 'root'; // Use the last part as the key
        const fieldSchema = this._schema.properties?.[propertyPath[0]];

        const message = this.formatValidationError(error, fieldSchema);

        this._validationErrors.push({
          key,
          path: propertyPath,
          message,
        });
      }
    }

    // Update field error displays for all fields with validation errors
    for (const error of this._validationErrors) {
      this.updateFieldErrorDisplayByPath(error.path);
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
    this.focusFieldByPath([key]);
  }

  public focusFieldByPath(path: string[]): void {
    const fieldId = `field-${path.join('-')}`;
    const input = this.shadowRoot?.querySelector(
      `#${fieldId}`
    ) as HTMLInputElement;
    input?.focus();
  }

  public handleSliderInput(
    path: string[],
    value: string,
    numberId: string
  ): void {
    const numValue = parseFloat(value);
    const pathKey = path.join('.');

    // Update the number input immediately (no throttle for visual feedback)
    const numberInput = this.shadowRoot?.querySelector(
      `#${numberId}`
    ) as HTMLInputElement;
    if (numberInput) {
      numberInput.value = value;
    }

    // Throttle the actual value update and validation
    this.throttleUpdate(
      `slider-${pathKey}`,
      () => {
        this.updateValueByPath(path, numValue);
      },
      16 // ~60fps
    );
  }

  public handleNumberInput(
    path: string[],
    value: string,
    sliderId: string
  ): void {
    const numValue = parseFloat(value);

    // Update the slider immediately
    const sliderInput = this.shadowRoot?.querySelector(
      `#${sliderId}`
    ) as HTMLInputElement;
    if (sliderInput) {
      sliderInput.value = value;
    }

    // Update the value
    if (!isNaN(numValue)) {
      this.updateValueByPath(path, numValue);
    }
  }

  public callFunction(path: string[]): void {
    let target = this._value;
    for (let i = 0; i < path.length - 1; i++) {
      if (target && typeof target === 'object') {
        target = target[path[i]];
      } else {
        return;
      }
    }

    const key = path[path.length - 1];
    const func = target[key];

    if (typeof func === 'function') {
      // Call the function with the value object as context
      const result = func.call(this._value);

      // Re-render to reflect any changes the function made to the object
      this.render();

      // Re-validate in case the function changed values that need validation
      if (this._schema) {
        this.validate();
      }

      // Dispatch an event with the function call details
      dispatchCustomEvent(this, 'keyvalue-function-call', {
        key,
        path,
        result,
      });
    }
  }

  // Array manipulation methods
  public addArrayItem(path: string[], defaultValue: any = ''): void {
    if (this.disabled || this._readonly) return;

    // Navigate to the array
    let target = this._value;
    for (const pathPart of path) {
      if (target && typeof target === 'object') {
        target = target[pathPart];
      } else {
        return;
      }
    }

    // Ensure target is an array
    if (!Array.isArray(target)) return;

    const oldArray = [...target];

    // Add new item
    target.push(defaultValue);

    // Dispatch change event
    const key = path[path.length - 1];
    this.dispatchChangeEvent(key, oldArray, target, path);

    // Re-render the array section
    this.render();

    // Validate the array
    this.validateFieldByPath(path);
  }

  public removeArrayItem(path: string[], index: number): void {
    if (this.disabled || this._readonly) return;

    // Navigate to the array
    let target = this._value;
    for (const pathPart of path) {
      if (target && typeof target === 'object') {
        target = target[pathPart];
      } else {
        return;
      }
    }

    // Ensure target is an array and index is valid
    if (!Array.isArray(target) || index < 0 || index >= target.length) return;

    const oldArray = [...target];

    // Remove item
    target.splice(index, 1);

    // Dispatch change event
    const key = path[path.length - 1];
    this.dispatchChangeEvent(key, oldArray, target, path);

    // Re-render the array section
    this.render();

    // Validate the array
    this.validateFieldByPath(path);
  }

  public moveArrayItem(
    path: string[],
    index: number,
    direction: 'up' | 'down'
  ): void {
    if (this.disabled || this._readonly) return;

    // Navigate to the array
    let target = this._value;
    for (const pathPart of path) {
      if (target && typeof target === 'object') {
        target = target[pathPart];
      } else {
        return;
      }
    }

    // Ensure target is an array and index is valid
    if (!Array.isArray(target) || index < 0 || index >= target.length) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;

    // Check bounds
    if (newIndex < 0 || newIndex >= target.length) return;

    const oldArray = [...target];

    // Swap items
    const temp = target[index];
    target[index] = target[newIndex];
    target[newIndex] = temp;

    // Dispatch change event
    const key = path[path.length - 1];
    this.dispatchChangeEvent(key, oldArray, target, path);

    // Re-render the array section
    this.render();

    // Validate the array
    this.validateFieldByPath(path);
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
