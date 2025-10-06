/**
 * Split Panel Container Element
 * A container that manages multiple resizable split panels with drag handles
 */

import {
  EditorElementProperties,
  SplitPanelOrientation,
  SplitPanelResizeEndEvent,
  SplitPanelResizeEvent,
  SplitPanelResizeStartEvent,
  Theme,
} from '../../types';
import {
  applyEffectiveTheme,
  applyTheme,
  debounce,
  dispatchCustomEvent,
  generateId,
  getShadowRoot,
  notifyThemeChange,
  setupThemeInheritance,
} from '../../utils';

export class SplitPanelContainer
  extends HTMLElement
  implements EditorElementProperties
{
  private _theme: Theme = 'auto';
  private _orientation: SplitPanelOrientation = 'horizontal';
  private _resizing: boolean = false;
  private _activePanel: HTMLElement | null = null;
  private _startPosition: number = 0;
  private _startSize: number = 0;
  private _nextPanelStartSize: number = 0;
  private _updatingPanelSizes: boolean = false;
  private _themeCleanup?: () => void;

  private debouncedResize = debounce(this.handleResize.bind(this), 16);

  static get observedAttributes(): string[] {
    return ['theme', 'disabled', 'orientation'];
  }

  constructor() {
    super();
    this.setupElement();
    this.bindEvents();
  }

  private setupElement(): void {
    const shadowRoot = getShadowRoot(this);

    shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 200px;
          background: var(--container-bg, #f5f5f5);
          font-family: var(--font-family, system-ui, sans-serif);
          overflow: hidden;
          box-sizing: border-box;
        }

        :host(.theme-dark) {
          background: var(--container-bg-dark, #1e1e1e);
        }

        :host([disabled]) {
          opacity: 0.6;
          pointer-events: none;
        }

        /* Horizontal layout (side by side) */
        :host([orientation="horizontal"]) {
          flex-direction: row;
        }

        /* Vertical layout (stacked) */
        :host([orientation="vertical"]) {
          flex-direction: column;
        }

        /* Panel styling */
        ::slotted(e2-split-panel) {
          flex-shrink: 0;
          overflow: hidden;
          position: relative;
        }

        /* Add spacing for handles and visual separators */
        ::slotted(e2-split-panel:not(:last-child)) {
          border-right: var(--handle-size, 4px) solid var(--handle-bg, #ccc);
        }

        :host([orientation="vertical"]) ::slotted(e2-split-panel:not(:last-child)) {
          border-right: none;
          border-bottom: var(--handle-size, 4px) solid var(--handle-bg, #ccc);
        }

        :host(.theme-dark) ::slotted(e2-split-panel:not(:last-child)) {
          border-right-color: var(--handle-bg-dark, #555);
        }

        :host([orientation="vertical"].theme-dark) ::slotted(e2-split-panel:not(:last-child)) {
          border-bottom-color: var(--handle-bg-dark, #555);
        }

        /* No user selection during drag */
        :host(.dragging) {
          user-select: none;
        }

        :host(.dragging) ::slotted(*) {
          user-select: none;
          pointer-events: none;
        }
      </style>

      <slot></slot>
    `;
  }

  private bindEvents(): void {
    // Handle mouse events for resizing
    this.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.addEventListener('mouseleave', this.handleMouseLeave.bind(this));

    // Handle window resize
    window.addEventListener('resize', this.debouncedResize);

    // Don't listen to slotchange to avoid infinite loops
    // Instead, we'll rely on the initial setup and manual updates
  }

  connectedCallback(): void {
    // Generate ID if not provided
    if (!this.id) {
      this.id = generateId('split-panel-container');
    }

    // Set up theme inheritance if no explicit theme is set
    if (!this.hasAttribute('theme')) {
      applyEffectiveTheme(this);
      this._themeCleanup = setupThemeInheritance(this);
    } else {
      this.applyTheme(this._theme);
    }

    // Initial setup
    setTimeout(() => {
      this.updateHandles();
      this.updatePanelSizes();
    }, 0);
  }

  disconnectedCallback(): void {
    window.removeEventListener('resize', this.debouncedResize);
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
        // Clean up existing theme inheritance when explicit theme is set
        if (this._themeCleanup) {
          this._themeCleanup();
          this._themeCleanup = undefined;
        }
        this._theme = (newValue as Theme) || 'auto';
        this.applyTheme(this._theme);
        break;
      case 'orientation':
        this._orientation = (newValue as SplitPanelOrientation) || 'horizontal';
        this.updateHandles();
        this.updatePanelSizes();
        break;
      case 'disabled':
        this.toggleAttribute('disabled', newValue !== null);
        break;
    }
  }

  private updateHandles(): void {
    // Do nothing - we're using CSS borders as visual handles
    // and mouse event delegation for interaction
  }

  private updatePanelSizes(): void {
    // Prevent infinite recursion
    if (this._updatingPanelSizes) return;
    this._updatingPanelSizes = true;

    try {
      const panels = this.getPanels();
      if (panels.length === 0) return;

      // Calculate total available space
      const containerRect = this.getBoundingClientRect();
      const handleSize = parseInt(
        getComputedStyle(this).getPropertyValue('--handle-size') || '4'
      );
      const totalHandles = panels.length - 1;
      const totalHandleSpace = totalHandles * handleSize;

      const availableSpace =
        this._orientation === 'horizontal'
          ? containerRect.width - totalHandleSpace
          : containerRect.height - totalHandleSpace;

      // Calculate default sizes if not set
      let totalSetSize = 0;
      let unsetPanels = 0;

      panels.forEach(panel => {
        const size = parseFloat(panel.getAttribute('size') || '0');
        if (size > 0) {
          totalSetSize += size;
        } else {
          unsetPanels++;
        }
      });

      const remainingPercentage = Math.max(0, 100 - totalSetSize);
      const defaultSize =
        unsetPanels > 0 ? remainingPercentage / unsetPanels : 0;

      // Apply sizes
      panels.forEach(panel => {
        let size = parseFloat(panel.getAttribute('size') || '0');
        if (size <= 0) {
          size = defaultSize;
          // Only set attribute if it's actually different to avoid recursive calls
          const currentSize = panel.getAttribute('size');
          if (currentSize !== size.toString()) {
            panel.setAttribute('size', size.toString());
          }
        }

        const actualSize = (size / 100) * availableSpace;

        if (this._orientation === 'horizontal') {
          panel.style.width = `${actualSize}px`;
          panel.style.height = '100%';
          panel.style.flexBasis = `${actualSize}px`;
        } else {
          panel.style.height = `${actualSize}px`;
          panel.style.width = '100%';
          panel.style.flexBasis = `${actualSize}px`;
        }
      });
    } finally {
      this._updatingPanelSizes = false;
    }
  }

  private handleMouseDown(event: MouseEvent): void {
    const panels = this.getPanels();
    if (panels.length < 2) return;

    // Find which panel border we're on
    let panelIndex = -1;
    let currentPanel: HTMLElement | null = null;
    let nextPanel: HTMLElement | null = null;

    const handleSize = parseInt(
      getComputedStyle(this).getPropertyValue('--handle-size') || '4'
    );

    for (let i = 0; i < panels.length - 1; i++) {
      const panel = panels[i];
      const rect = panel.getBoundingClientRect();
      const containerRect = this.getBoundingClientRect();

      const relativeX = event.clientX - containerRect.left;
      const relativeY = event.clientY - containerRect.top;

      let onBorder = false;

      if (this._orientation === 'horizontal') {
        // Check if we're on the right border of this panel (border is part of the panel)
        const borderStart = rect.right - containerRect.left - handleSize;
        const borderEnd = rect.right - containerRect.left;
        onBorder = relativeX >= borderStart && relativeX <= borderEnd;
      } else {
        // Check if we're on the bottom border of this panel (border is part of the panel)
        const borderStart = rect.bottom - containerRect.top - handleSize;
        const borderEnd = rect.bottom - containerRect.top;
        onBorder = relativeY >= borderStart && relativeY <= borderEnd;
      }

      if (onBorder) {
        panelIndex = i;
        currentPanel = panels[i];
        nextPanel = panels[i + 1];
        break;
      }
    }

    if (panelIndex === -1 || !currentPanel || !nextPanel) return;

    event.preventDefault();

    this._resizing = true;
    this._activePanel = currentPanel;
    this._startPosition =
      this._orientation === 'horizontal' ? event.clientX : event.clientY;
    this._startSize = parseFloat(currentPanel.getAttribute('size') || '50');
    this._nextPanelStartSize = parseFloat(
      nextPanel.getAttribute('size') || '50'
    );

    this.classList.add('dragging');

    // Update cursor
    this.style.cursor =
      this._orientation === 'horizontal' ? 'col-resize' : 'row-resize';

    // Dispatch resize start event
    dispatchCustomEvent<SplitPanelResizeStartEvent['detail']>(
      this,
      'split-panel-resize-start',
      {
        containerId: this.id,
        container: this,
        panelId: currentPanel.id,
        panel: currentPanel,
        startSize: this._startSize,
      }
    );
  }

  private handleMouseMove(event: MouseEvent): void {
    // Handle dragging if currently resizing
    if (this._resizing && this._activePanel) {
      event.preventDefault();

      const currentPosition =
        this._orientation === 'horizontal' ? event.clientX : event.clientY;
      const delta = currentPosition - this._startPosition;

      const containerRect = this.getBoundingClientRect();
      const containerSize =
        this._orientation === 'horizontal'
          ? containerRect.width
          : containerRect.height;

      const deltaPercentage = (delta / containerSize) * 100;

      const panels = this.getPanels();
      const currentIndex = panels.indexOf(this._activePanel);
      const nextPanel = panels[currentIndex + 1];

      if (!nextPanel) return;

      const newCurrentSize = Math.max(
        parseFloat(this._activePanel.getAttribute('min-size') || '10'),
        Math.min(
          parseFloat(this._activePanel.getAttribute('max-size') || '90'),
          this._startSize + deltaPercentage
        )
      );

      const newNextSize = Math.max(
        parseFloat(nextPanel.getAttribute('min-size') || '10'),
        Math.min(
          parseFloat(nextPanel.getAttribute('max-size') || '90'),
          this._nextPanelStartSize - deltaPercentage
        )
      );

      // Update panel sizes
      this._activePanel.setAttribute('size', newCurrentSize.toString());
      nextPanel.setAttribute('size', newNextSize.toString());

      this.updatePanelSizes();

      // Dispatch resize event
      dispatchCustomEvent<SplitPanelResizeEvent['detail']>(
        this,
        'split-panel-resize',
        {
          containerId: this.id,
          container: this,
          panelId: this._activePanel.id,
          panel: this._activePanel,
          size: newCurrentSize,
          minSize: parseFloat(
            this._activePanel.getAttribute('min-size') || '10'
          ),
          maxSize: parseFloat(
            this._activePanel.getAttribute('max-size') || '90'
          ),
        }
      );
    } else {
      // Handle hover cursor when not dragging
      this.updateHoverCursor(event);
    }
  }

  private updateHoverCursor(event: MouseEvent): void {
    const panels = this.getPanels();
    if (panels.length < 2) {
      this.style.cursor = '';
      return;
    }

    const handleSize = parseInt(
      getComputedStyle(this).getPropertyValue('--handle-size') || '4'
    );

    let overHandle = false;

    for (let i = 0; i < panels.length - 1; i++) {
      const panel = panels[i];
      const rect = panel.getBoundingClientRect();
      const containerRect = this.getBoundingClientRect();

      const relativeX = event.clientX - containerRect.left;
      const relativeY = event.clientY - containerRect.top;

      if (this._orientation === 'horizontal') {
        // Check if we're on the right border of this panel (border is part of the panel)
        const borderStart = rect.right - containerRect.left - handleSize;
        const borderEnd = rect.right - containerRect.left;
        if (relativeX >= borderStart && relativeX <= borderEnd) {
          overHandle = true;
          break;
        }
      } else {
        // Check if we're on the bottom border of this panel (border is part of the panel)
        const borderStart = rect.bottom - containerRect.top - handleSize;
        const borderEnd = rect.bottom - containerRect.top;
        if (relativeY >= borderStart && relativeY <= borderEnd) {
          overHandle = true;
          break;
        }
      }
    }

    // Update cursor based on whether we're over a handle
    if (overHandle) {
      this.style.cursor =
        this._orientation === 'horizontal' ? 'col-resize' : 'row-resize';
    } else {
      this.style.cursor = '';
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    if (!this._resizing) return;

    event.preventDefault();

    const finalSize = this._activePanel
      ? parseFloat(this._activePanel.getAttribute('size') || '50')
      : 0;

    // Dispatch resize end event
    if (this._activePanel) {
      dispatchCustomEvent<SplitPanelResizeEndEvent['detail']>(
        this,
        'split-panel-resize-end',
        {
          containerId: this.id,
          container: this,
          panelId: this._activePanel.id,
          panel: this._activePanel,
          finalSize,
        }
      );
    }

    this._resizing = false;
    this._activePanel = null;
    this.classList.remove('dragging');

    // Update cursor based on current hover position
    this.updateHoverCursor(event);
  }

  private handleMouseLeave(event: MouseEvent): void {
    // End resizing if mouse leaves the container
    if (this._resizing) {
      this.handleMouseUp(event);
    }

    // Reset cursor when leaving the container
    this.style.cursor = '';
  }

  private handleResize(): void {
    this.updatePanelSizes();
  }

  private getPanels(): HTMLElement[] {
    return Array.from(this.querySelectorAll('e2-split-panel'));
  }

  // Public API
  get theme(): Theme {
    return this._theme;
  }

  set theme(value: Theme) {
    this.setAttribute('theme', value);
    // Notify child elements of theme change
    notifyThemeChange(this, value);
  }

  get orientation(): SplitPanelOrientation {
    return this._orientation;
  }

  set orientation(value: SplitPanelOrientation) {
    this.setAttribute('orientation', value);
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value);
  }

  applyTheme(theme: Theme): void {
    applyTheme(this, theme);
  }

  // Method to programmatically resize a panel
  resizePanel(panelId: string, size: number): void {
    const panel = this.querySelector(`#${panelId}`) as HTMLElement;
    if (panel && panel.tagName.toLowerCase() === 'e2-split-panel') {
      panel.setAttribute('size', size.toString());
      this.updatePanelSizes();
    }
  }

  // Method to get panel sizes
  getPanelSizes(): { [panelId: string]: number } {
    const panels = this.getPanels();
    const sizes: { [panelId: string]: number } = {};

    panels.forEach(panel => {
      if (panel.id) {
        sizes[panel.id] = parseFloat(panel.getAttribute('size') || '0');
      }
    });

    return sizes;
  }

  // Method to reset all panels to equal sizes
  resetPanelSizes(): void {
    const panels = this.getPanels();
    const equalSize = 100 / panels.length;

    panels.forEach(panel => {
      panel.setAttribute('size', equalSize.toString());
    });

    this.updatePanelSizes();
  }
}

// Register the element
if (!customElements.get('e2-split-panel-container')) {
  customElements.define('e2-split-panel-container', SplitPanelContainer);
}

export default SplitPanelContainer;
