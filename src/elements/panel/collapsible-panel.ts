/**
 * Collapsible Panel Element
 * A panel that can be collapsed to a thin bar with an expand button
 * or expanded to show its full content
 */

import {
  CollapsiblePanelResizeEndEvent,
  CollapsiblePanelResizeEvent,
  CollapsiblePanelResizeStartEvent,
  EditorElementProperties,
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

export type PanelOrientation = 'horizontal' | 'vertical';

export class CollapsiblePanel
  extends HTMLElement
  implements EditorElementProperties
{
  private _theme: Theme = 'auto';
  private _collapsed: boolean = false;
  private _orientation: PanelOrientation = 'vertical';
  private _themeCleanup?: () => void;

  // Resize properties
  private _resizeLeft: boolean = false;
  private _resizeRight: boolean = false;
  private _resizeTop: boolean = false;
  private _resizeBottom: boolean = false;
  private _minWidth: number = 100;
  private _maxWidth: number = 800;
  private _minHeight: number = 100;
  private _maxHeight: number = 600;

  // Resize state
  private _resizing: boolean = false;
  private _resizeEdge: 'left' | 'right' | 'top' | 'bottom' | null = null;
  private _startPosition: { x: number; y: number } = { x: 0, y: 0 };
  private _startSize: { width: number; height: number } = {
    width: 0,
    height: 0,
  };
  private _storedSize: { width: number; height: number } | null = null;

  static get observedAttributes(): string[] {
    return [
      'theme',
      'disabled',
      'collapsed',
      'orientation',
      'resize-left',
      'resize-right',
      'resize-top',
      'resize-bottom',
      'min-width',
      'max-width',
      'min-height',
      'max-height',
    ];
  }

  constructor() {
    super();
    this.setupElement();
  }

  private setupElement(): void {
    const shadowRoot = getShadowRoot(this);

    shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          background: var(--panel-bg, #ffffff);
          border: 1px solid var(--panel-border, #ccc);
          font-family: var(--font-family, system-ui, sans-serif);
          font-size: var(--font-size, 14px);
        }

        :host(.theme-dark) {
          background: var(--panel-bg-dark, #2d2d2d);
          border-color: var(--panel-border-dark, #555);
          color: var(--text-color-dark, #fff);
        }

        :host([disabled]) {
          opacity: 0.6;
          pointer-events: none;
        }

        /* Vertical orientation (default) */
        :host([orientation="vertical"]) {
          min-height: 200px;
        }

        :host([orientation="vertical"][collapsed]) {
          min-height: 32px;
          height: 32px !important;
          overflow: hidden;
        }

        /* Horizontal orientation */
        :host([orientation="horizontal"]) {
          min-width: 200px;
          display: inline-block;
          vertical-align: top;
        }

        :host([orientation="horizontal"][collapsed]) {
          min-width: 32px;
          width: 32px !important;
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          align-items: center;
          padding: 8px;
          background: var(--panel-header-bg, #f8f8f8);
          border-bottom: 1px solid var(--panel-border, #ccc);
          min-height: 16px;
          cursor: pointer;
          user-select: none;
        }

        :host(.theme-dark) .panel-header {
          background: var(--panel-header-bg-dark, #3a3a3a);
          border-bottom-color: var(--panel-border-dark, #555);
        }

        .panel-header:hover {
          background: var(--panel-header-hover-bg, #e8e8e8);
        }

        :host(.theme-dark) .panel-header:hover {
          background: var(--panel-header-hover-bg-dark, #404040);
        }

        .toggle-button {
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          margin-right: 8px;
          flex-shrink: 0;
        }

        /* Vertical orientation icons */
        :host([orientation="vertical"]) .toggle-button .burger-icon {
          display: none;
        }

        :host([orientation="vertical"]) .toggle-button .close-icon {
          display: block;
        }

        :host([orientation="vertical"][collapsed]) .toggle-button .burger-icon {
          display: block;
        }

        :host([orientation="vertical"][collapsed]) .toggle-button .close-icon {
          display: none;
        }

        /* Horizontal orientation icons */
        :host([orientation="horizontal"]) .toggle-button .burger-icon {
          display: none;
        }

        :host([orientation="horizontal"]) .toggle-button .close-icon {
          display: block;
        }

        :host([orientation="horizontal"][collapsed]) .toggle-button .burger-icon {
          display: block;
        }

        :host([orientation="horizontal"][collapsed]) .toggle-button .close-icon {
          display: none;
        }

        /* Rotate icons for horizontal orientation */
        :host([orientation="horizontal"]) .toggle-button {
          transform: rotate(90deg);
        }

        .panel-title {
          flex-grow: 1;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Hide title when collapsed */
        :host([collapsed]) .panel-title {
          display: none;
        }

        .panel-content {
          padding: var(--panel-padding, 12px);
          overflow: auto;
          box-sizing: border-box;
          height: calc(100% - 32px); /* Account for header height */
        }

        :host([collapsed]) .panel-content {
          display: none;
        }

        /* Content slot styling */
        ::slotted(*) {
          display: block;
        }

        /* Resize handles */
        :host([resize-left]:not([collapsed])) {
          border-left-width: 4px;
          border-left-color: var(--resize-handle-color, #999);
        }

        :host([resize-right]:not([collapsed])) {
          border-right-width: 4px;
          border-right-color: var(--resize-handle-color, #999);
        }

        :host([resize-top]:not([collapsed])) {
          border-top-width: 4px;
          border-top-color: var(--resize-handle-color, #999);
        }

        :host([resize-bottom]:not([collapsed])) {
          border-bottom-width: 4px;
          border-bottom-color: var(--resize-handle-color, #999);
        }

        /* Dark theme resize handles */
        :host(.theme-dark[resize-left]:not([collapsed])) {
          border-left-color: var(--resize-handle-color-dark, #666);
        }

        :host(.theme-dark[resize-right]:not([collapsed])) {
          border-right-color: var(--resize-handle-color-dark, #666);
        }

        :host(.theme-dark[resize-top]:not([collapsed])) {
          border-top-color: var(--resize-handle-color-dark, #666);
        }

        :host(.theme-dark[resize-bottom]:not([collapsed])) {
          border-bottom-color: var(--resize-handle-color-dark, #666);
        }

        /* Resize cursors - will be handled by JavaScript for edge detection */

        /* Disable resize cursors when dragging */
        :host(.resizing) {
          user-select: none;
        }

        :host(.resizing) * {
          user-select: none;
          pointer-events: none;
        }
      </style>

      <div class="panel-header">
        <div class="toggle-button">
          <span class="burger-icon">☰</span>
          <span class="close-icon">✕</span>
        </div>
        <div class="panel-title">
          <slot name="title">Panel</slot>
        </div>
      </div>

      <div class="panel-content">
        <slot></slot>
      </div>
    `;

    // Add click handler for the header
    const header = shadowRoot.querySelector('.panel-header') as HTMLElement;
    header.addEventListener('click', this.handleToggle.bind(this));

    // Add resize event handlers
    this.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('collapsible-panel');
    }

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
    oldValue: string,
    newValue: string
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
      case 'collapsed':
        const wasCollapsed = this._collapsed;
        this._collapsed = newValue !== null;
        this.handleCollapsedChange(wasCollapsed);
        break;
      case 'orientation':
        this._orientation = (newValue as PanelOrientation) || 'vertical';
        break;
      case 'resize-left':
        this._resizeLeft = newValue !== null;
        break;
      case 'resize-right':
        this._resizeRight = newValue !== null;
        break;
      case 'resize-top':
        this._resizeTop = newValue !== null;
        break;
      case 'resize-bottom':
        this._resizeBottom = newValue !== null;
        break;
      case 'min-width':
        this._minWidth = parseFloat(newValue) || 100;
        break;
      case 'max-width':
        this._maxWidth = parseFloat(newValue) || 800;
        break;
      case 'min-height':
        this._minHeight = parseFloat(newValue) || 100;
        break;
      case 'max-height':
        this._maxHeight = parseFloat(newValue) || 600;
        break;
    }
  }

  private handleToggle(): void {
    this.collapsed = !this.collapsed;

    // Dispatch toggle event
    dispatchCustomEvent(this, 'collapsible-panel-toggle', {
      panelId: this.id,
      panel: this,
      collapsed: this.collapsed,
      orientation: this.orientation,
    });
  }

  private handleCollapsedChange(wasCollapsed: boolean): void {
    if (this._collapsed && !wasCollapsed) {
      // Panel is being collapsed - store current size
      this._storedSize = {
        width: this.offsetWidth,
        height: this.offsetHeight,
      };
    } else if (!this._collapsed && wasCollapsed && this._storedSize) {
      // Panel is being expanded - restore stored size
      requestAnimationFrame(() => {
        if (this._storedSize) {
          this.style.width = `${this._storedSize.width}px`;
          this.style.height = `${this._storedSize.height}px`;
        }
      });
    }
  }

  private handleMouseDown(event: MouseEvent): void {
    if (this._collapsed) return;

    const resizeEdge = this.getResizeEdge(event);
    if (!resizeEdge) return;

    event.preventDefault();
    event.stopPropagation();

    this._resizing = true;
    this._resizeEdge = resizeEdge;
    this._startPosition = { x: event.clientX, y: event.clientY };
    this._startSize = {
      width: this.offsetWidth,
      height: this.offsetHeight,
    };

    this.classList.add('resizing');
    document.body.style.cursor = this.getCursorForEdge(resizeEdge);

    // Add global mouse events
    document.addEventListener(
      'mousemove',
      this.handleDocumentMouseMove.bind(this)
    );
    document.addEventListener('mouseup', this.handleDocumentMouseUp.bind(this));

    // Dispatch resize start event
    dispatchCustomEvent<CollapsiblePanelResizeStartEvent['detail']>(
      this,
      'collapsible-panel-resize-start',
      {
        panelId: this.id,
        panel: this,
        startWidth: this._startSize.width,
        startHeight: this._startSize.height,
        edge: resizeEdge,
      }
    );
  }

  private handleMouseMove(event: MouseEvent): void {
    if (this._resizing || this._collapsed) return;

    const resizeEdge = this.getResizeEdge(event);
    if (resizeEdge) {
      this.style.cursor = this.getCursorForEdge(resizeEdge);
    } else {
      this.style.cursor = '';
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    if (!this._resizing) return;
    this.endResize(event);
  }

  private handleMouseLeave(event: MouseEvent): void {
    if (!this._resizing) {
      this.style.cursor = '';
    }
  }

  private handleDocumentMouseMove(event: MouseEvent): void {
    if (!this._resizing || !this._resizeEdge) return;

    event.preventDefault();

    const deltaX = event.clientX - this._startPosition.x;
    const deltaY = event.clientY - this._startPosition.y;

    let newWidth = this._startSize.width;
    let newHeight = this._startSize.height;

    switch (this._resizeEdge) {
      case 'left':
        newWidth = Math.max(
          this._minWidth,
          Math.min(this._maxWidth, this._startSize.width - deltaX)
        );
        break;
      case 'right':
        newWidth = Math.max(
          this._minWidth,
          Math.min(this._maxWidth, this._startSize.width + deltaX)
        );
        break;
      case 'top':
        newHeight = Math.max(
          this._minHeight,
          Math.min(this._maxHeight, this._startSize.height - deltaY)
        );
        break;
      case 'bottom':
        newHeight = Math.max(
          this._minHeight,
          Math.min(this._maxHeight, this._startSize.height + deltaY)
        );
        break;
    }

    // Apply size constraints based on orientation
    if (this._orientation === 'horizontal') {
      // Horizontal panels expand/collapse horizontally, so they can only be resized horizontally (width changes)
      if (this._resizeEdge === 'left' || this._resizeEdge === 'right') {
        this.style.width = `${newWidth}px`;
      }
    } else {
      // Vertical panels expand/collapse vertically, so they can only be resized vertically (height changes)
      if (this._resizeEdge === 'top' || this._resizeEdge === 'bottom') {
        this.style.height = `${newHeight}px`;
      }
    }

    // Dispatch resize event
    dispatchCustomEvent<CollapsiblePanelResizeEvent['detail']>(
      this,
      'collapsible-panel-resize',
      {
        panelId: this.id,
        panel: this,
        width: newWidth,
        height: newHeight,
        edge: this._resizeEdge,
      }
    );
  }

  private handleDocumentMouseUp(event: MouseEvent): void {
    if (!this._resizing) return;
    this.endResize(event);
  }

  private endResize(event: MouseEvent): void {
    if (!this._resizing || !this._resizeEdge) return;

    const finalWidth = this.offsetWidth;
    const finalHeight = this.offsetHeight;
    const edge = this._resizeEdge;

    this._resizing = false;
    this._resizeEdge = null;
    this.classList.remove('resizing');
    document.body.style.cursor = '';

    // Remove global mouse events
    document.removeEventListener(
      'mousemove',
      this.handleDocumentMouseMove.bind(this)
    );
    document.removeEventListener(
      'mouseup',
      this.handleDocumentMouseUp.bind(this)
    );

    // Update stored size
    this._storedSize = { width: finalWidth, height: finalHeight };

    // Dispatch resize end event
    dispatchCustomEvent<CollapsiblePanelResizeEndEvent['detail']>(
      this,
      'collapsible-panel-resize-end',
      {
        panelId: this.id,
        panel: this,
        finalWidth,
        finalHeight,
        edge,
      }
    );
  }

  private getResizeEdge(
    event: MouseEvent
  ): 'left' | 'right' | 'top' | 'bottom' | null {
    const rect = this.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const edgeSize = 4; // Size of resize handle

    // Check each edge if it's enabled and allowed for the orientation
    if (this._orientation === 'vertical') {
      // Vertical panels expand/collapse vertically, so they can only be resized vertically (top/bottom edges)
      if (this._resizeTop && y <= edgeSize) {
        return 'top';
      }
      if (this._resizeBottom && y >= rect.height - edgeSize) {
        return 'bottom';
      }
    } else {
      // Horizontal panels expand/collapse horizontally, so they can only be resized horizontally (left/right edges)
      if (this._resizeLeft && x <= edgeSize) {
        return 'left';
      }
      if (this._resizeRight && x >= rect.width - edgeSize) {
        return 'right';
      }
    }

    return null;
  }

  private getCursorForEdge(edge: 'left' | 'right' | 'top' | 'bottom'): string {
    switch (edge) {
      case 'left':
      case 'right':
        return 'ew-resize';
      case 'top':
      case 'bottom':
        return 'ns-resize';
    }
  }

  // Public API
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

  get collapsed(): boolean {
    return this._collapsed;
  }

  set collapsed(value: boolean) {
    this._collapsed = value;
    if (value) {
      this.setAttribute('collapsed', '');
    } else {
      this.removeAttribute('collapsed');
    }
  }

  get orientation(): PanelOrientation {
    return this._orientation;
  }

  set orientation(value: PanelOrientation) {
    this._orientation = value;
    this.setAttribute('orientation', value);
  }

  toggle(): void {
    this.collapsed = !this.collapsed;
  }

  expand(): void {
    this.collapsed = false;
  }

  collapse(): void {
    this.collapsed = true;
  }

  applyTheme(theme: Theme): void {
    applyTheme(this, theme);
  }

  // Resize API
  get resizeLeft(): boolean {
    return this._resizeLeft;
  }

  set resizeLeft(value: boolean) {
    this._resizeLeft = value;
    this.toggleAttribute('resize-left', value);
  }

  get resizeRight(): boolean {
    return this._resizeRight;
  }

  set resizeRight(value: boolean) {
    this._resizeRight = value;
    this.toggleAttribute('resize-right', value);
  }

  get resizeTop(): boolean {
    return this._resizeTop;
  }

  set resizeTop(value: boolean) {
    this._resizeTop = value;
    this.toggleAttribute('resize-top', value);
  }

  get resizeBottom(): boolean {
    return this._resizeBottom;
  }

  set resizeBottom(value: boolean) {
    this._resizeBottom = value;
    this.toggleAttribute('resize-bottom', value);
  }

  get minWidth(): number {
    return this._minWidth;
  }

  set minWidth(value: number) {
    this._minWidth = value;
    this.setAttribute('min-width', value.toString());
  }

  get maxWidth(): number {
    return this._maxWidth;
  }

  set maxWidth(value: number) {
    this._maxWidth = value;
    this.setAttribute('max-width', value.toString());
  }

  get minHeight(): number {
    return this._minHeight;
  }

  set minHeight(value: number) {
    this._minHeight = value;
    this.setAttribute('min-height', value.toString());
  }

  get maxHeight(): number {
    return this._maxHeight;
  }

  set maxHeight(value: number) {
    this._maxHeight = value;
    this.setAttribute('max-height', value.toString());
  }
}

// Register the custom element
if (!customElements.get('e2-collapsible-panel')) {
  customElements.define('e2-collapsible-panel', CollapsiblePanel);
}
