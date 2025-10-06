/**
 * Tab Container Element
 * A container that manages tabs and their associated panels
 */

import {
  EditorElementProperties,
  TabCloseEvent,
  TabContainerChangeEvent,
  TabSelectEvent,
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

export class TabContainer
  extends HTMLElement
  implements EditorElementProperties
{
  private _theme: Theme = 'auto';
  private _activeTabId: string | null = null;
  private _tabPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';
  private _closable: boolean = false;
  private _themeCleanup?: () => void;

  static get observedAttributes(): string[] {
    return ['theme', 'disabled', 'active-tab', 'tab-position', 'closable'];
  }

  constructor() {
    super();
    this.setupElement();
    this.setupEventListeners();
  }

  private setupElement(): void {
    const shadowRoot = getShadowRoot(this);

    shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          background: var(--tab-container-bg, #ffffff);
          border: 1px solid var(--tab-container-border, #ccc);
          border-radius: var(--tab-container-border-radius, 4px);
          overflow: hidden;
          font-family: var(--font-family, system-ui, sans-serif);
          font-size: var(--font-size, 14px);
        }

        :host(.theme-dark) {
          background: var(--tab-container-bg-dark, #1e1e1e);
          border-color: var(--tab-container-border-dark, #555);
          color: var(--text-color-dark, #fff);
        }

        :host([disabled]) {
          opacity: 0.6;
          pointer-events: none;
        }

        /* Tab position variations */
        :host([tab-position="top"]) {
          flex-direction: column;
        }

        :host([tab-position="bottom"]) {
          flex-direction: column-reverse;
        }

        :host([tab-position="left"]) {
          flex-direction: row;
        }

        :host([tab-position="right"]) {
          flex-direction: row-reverse;
        }

        .tab-list {
          display: flex;
          background: var(--tab-list-bg, #f8f8f8);
          border-bottom: 1px solid var(--tab-list-border, #ddd);
          overflow-x: auto;
          flex-shrink: 0;
        }

        :host(.theme-dark) .tab-list {
          background: var(--tab-list-bg-dark, #2d2d2d);
          border-bottom-color: var(--tab-list-border-dark, #555);
        }

        :host([tab-position="bottom"]) .tab-list {
          border-bottom: none;
          border-top: 1px solid var(--tab-list-border, #ddd);
        }

        :host(.theme-dark[tab-position="bottom"]) .tab-list {
          border-top-color: var(--tab-list-border-dark, #555);
        }

        :host([tab-position="left"]) .tab-list,
        :host([tab-position="right"]) .tab-list {
          flex-direction: column;
          border-bottom: none;
          border-right: 1px solid var(--tab-list-border, #ddd);
          overflow-x: visible;
          overflow-y: auto;
        }

        :host([tab-position="right"]) .tab-list {
          border-right: none;
          border-left: 1px solid var(--tab-list-border, #ddd);
        }

        :host(.theme-dark[tab-position="left"]) .tab-list {
          border-right-color: var(--tab-list-border-dark, #555);
        }

        :host(.theme-dark[tab-position="right"]) .tab-list {
          border-left-color: var(--tab-list-border-dark, #555);
        }

        .panel-container {
          flex: 1;
          overflow: hidden;
          position: relative;
        }

        ::slotted(e2-tab) {
          flex-shrink: 0;
        }

        ::slotted(e2-tab-panel) {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
        }

        ::slotted(e2-tab-panel[active]) {
          display: flex !important;
        }
      </style>

      <div class="tab-list">
        <slot name="tabs"></slot>
      </div>
      <div class="panel-container">
        <slot name="panels"></slot>
      </div>
    `;
  }

  private setupEventListeners(): void {
    // Listen for tab clicks
    this.addEventListener(
      'tab-click',
      this.handleTabClick.bind(this) as EventListener
    );
    this.addEventListener(
      'tab-close',
      this.handleTabClose.bind(this) as EventListener
    );

    // Listen for slotchange to manage initial state
    const shadowRoot = this.shadowRoot!;
    const tabSlot = shadowRoot.querySelector(
      'slot[name="tabs"]'
    ) as HTMLSlotElement;
    const panelSlot = shadowRoot.querySelector(
      'slot[name="panels"]'
    ) as HTMLSlotElement;

    tabSlot?.addEventListener('slotchange', () => {
      this.updateTabsAndPanels();
    });

    panelSlot?.addEventListener('slotchange', () => {
      this.updateTabsAndPanels();
    });
  }

  private handleTabClick(event: Event): void {
    event.stopPropagation();
    const tabElement = event.target as HTMLElement;
    const tabId = tabElement.id;
    const panelId = tabElement.getAttribute('panel') || `${tabId}-panel`;

    this.selectTab(tabId, panelId);
  }

  private handleTabClose(event: Event): void {
    event.stopPropagation();

    // Find the actual tab element (event might come from close button inside tab)
    let tabElement = event.target as HTMLElement;

    // If the event came from inside a tab, find the parent tab element
    if (!tabElement.matches('e2-tab')) {
      tabElement = tabElement.closest('e2-tab') as HTMLElement;
    }

    if (!tabElement) {
      return;
    }

    const tabId = tabElement.id;
    const panelId = tabElement.getAttribute('panel') || `${tabId}-panel`;

    // Check if this tab is already being removed to prevent recursion
    if (tabElement.hasAttribute('data-removing')) {
      return;
    }

    // Mark as being removed to prevent recursive calls
    tabElement.setAttribute('data-removing', 'true');

    // Dispatch close event to external listeners (without bubbling to avoid recursion)
    const closeEvent = dispatchCustomEvent<TabCloseEvent['detail']>(
      this,
      'tab-close',
      {
        tabId,
        tab: tabElement,
        panelId,
        panel: this.querySelector(
          `e2-tab-panel[id="${panelId}"]`
        ) as HTMLElement,
        containerId: this.id,
        container: this,
      },
      { bubbles: false } // Prevent bubbling to avoid recursion
    );

    // Defer the removal to break any potential event loops
    if (closeEvent) {
      setTimeout(() => {
        this.removeTab(tabId);
      }, 0);
    }
  }

  private selectTab(tabId: string, panelId: string): void {
    const tabElement = this.querySelector(
      `e2-tab[id="${tabId}"]`
    ) as HTMLElement;
    const panelElement = this.querySelector(
      `e2-tab-panel[id="${panelId}"]`
    ) as HTMLElement;

    if (!tabElement || !panelElement) {
      return;
    }

    const previousTabId = this._activeTabId;

    // Deactivate all tabs and panels
    this.querySelectorAll('e2-tab').forEach(tab => {
      if ((tab as any).active !== undefined) {
        (tab as any).active = false;
      } else {
        tab.removeAttribute('active');
      }
    });
    this.querySelectorAll('e2-tab-panel').forEach(panel => {
      if ((panel as any).active !== undefined) {
        (panel as any).active = false;
      } else {
        panel.removeAttribute('active');
        (panel as HTMLElement).style.display = 'none';
      }
    });

    // Activate the selected tab and panel
    if ((tabElement as any).active !== undefined) {
      (tabElement as any).active = true;
    } else {
      tabElement.setAttribute('active', '');
    }

    if ((panelElement as any).active !== undefined) {
      (panelElement as any).active = true;
    } else {
      panelElement.setAttribute('active', '');
      panelElement.style.display = 'flex';
    }

    this._activeTabId = tabId;
    this.setAttribute('active-tab', tabId);

    // Dispatch select event
    dispatchCustomEvent<TabSelectEvent['detail']>(this, 'tab-select', {
      tabId,
      tab: tabElement,
      panelId,
      panel: panelElement,
      containerId: this.id,
      container: this,
      previousTabId: previousTabId || undefined,
    });

    // Dispatch container change event
    dispatchCustomEvent<TabContainerChangeEvent['detail']>(
      this,
      'tab-container-change',
      {
        containerId: this.id,
        container: this,
        activeTabId: tabId,
        activePanelId: panelId,
      }
    );
  }

  private removeTab(tabId: string): void {
    const tabElement = this.querySelector(
      `e2-tab[id="${tabId}"]`
    ) as HTMLElement;
    const panelId = tabElement?.getAttribute('panel') || `${tabId}-panel`;
    const panelElement = this.querySelector(
      `e2-tab-panel[id="${panelId}"]`
    ) as HTMLElement;

    // Remove elements
    tabElement?.remove();
    panelElement?.remove();

    // If this was the active tab, select another
    if (this._activeTabId === tabId) {
      const remainingTabs = this.querySelectorAll('e2-tab');
      if (remainingTabs.length > 0) {
        const nextTab = remainingTabs[0] as HTMLElement;
        const nextPanelId =
          nextTab.getAttribute('panel') || `${nextTab.id}-panel`;
        this.selectTab(nextTab.id, nextPanelId);
      } else {
        this._activeTabId = null;
        this.removeAttribute('active-tab');
      }
    }
  }

  private updateTabsAndPanels(): void {
    // Auto-assign panels to tabs and vice versa
    const tabs = this.querySelectorAll('e2-tab');
    const panels = this.querySelectorAll('e2-tab-panel');

    tabs.forEach((tab, index) => {
      const tabElement = tab as HTMLElement;

      // Only set ID if it's not already set and the element doesn't have attributes being processed
      if (!tabElement.id && !tabElement.hasAttribute('id')) {
        try {
          tabElement.id = generateId('tab');
        } catch (e) {
          // If setting ID fails, skip this tab for now
          console.warn('Failed to set tab ID, skipping:', e);
          return;
        }
      }

      // Set closable attribute if container is closable, but avoid if element is being processed
      if (this._closable && !tabElement.hasAttribute('closable')) {
        try {
          tabElement.setAttribute('closable', '');
        } catch (e) {
          // If setting attribute fails, the element might still be initializing
          console.warn('Failed to set closable attribute, skipping:', e);
        }
      }

      // Apply current theme
      if ((tabElement as any).applyTheme) {
        try {
          (tabElement as any).applyTheme(this._theme);
        } catch (e) {
          console.warn('Failed to apply theme to tab:', e);
        }
      }

      // Link to panel
      if (!tabElement.getAttribute('panel')) {
        const correspondingPanel = panels[index] as HTMLElement;
        if (correspondingPanel) {
          if (
            !correspondingPanel.id &&
            !correspondingPanel.hasAttribute('id')
          ) {
            try {
              correspondingPanel.id = `${tabElement.id}-panel`;
            } catch (e) {
              console.warn('Failed to set panel ID:', e);
              return;
            }
          }
          try {
            tabElement.setAttribute('panel', correspondingPanel.id);
          } catch (e) {
            console.warn('Failed to link tab to panel:', e);
          }
        }
      }
    });

    // Determine which tab should be active initially
    let activeTabElement: HTMLElement | null = null;
    let activePanelId: string | null = null;

    // Priority 1: Check if container has active-tab attribute
    if (this.hasAttribute('active-tab')) {
      const activeTabId = this.getAttribute('active-tab');
      activeTabElement = this.querySelector(
        `e2-tab[id="${activeTabId}"]`
      ) as HTMLElement;
    }

    // Priority 2: Check if any tab has active attribute
    if (!activeTabElement) {
      activeTabElement = this.querySelector('e2-tab[active]') as HTMLElement;
    }

    // Priority 3: Use first tab as fallback
    if (!activeTabElement && tabs.length > 0) {
      activeTabElement = tabs[0] as HTMLElement;
    }

    // Set the active panel ID based on the determined active tab
    if (activeTabElement) {
      activePanelId =
        activeTabElement.getAttribute('panel') ||
        `${activeTabElement.id}-panel`;
    }

    panels.forEach(panel => {
      const panelElement = panel as HTMLElement;

      // Only set ID if it's not already set and the element is ready
      if (!panelElement.id && !panelElement.hasAttribute('id')) {
        try {
          panelElement.id = generateId('tab-panel');
        } catch (e) {
          console.warn('Failed to set panel ID:', e);
          return;
        }
      }

      // Apply current theme
      if ((panelElement as any).applyTheme) {
        try {
          (panelElement as any).applyTheme(this._theme);
        } catch (e) {
          console.warn('Failed to apply theme to panel:', e);
        }
      }

      // Hide all panels except the one that should be active
      if (panelElement.id === activePanelId) {
        // This will be the initially active panel - ensure it's visible
        if ((panelElement as any).active !== undefined) {
          try {
            (panelElement as any).active = true;
          } catch (e) {
            console.warn('Failed to set panel active property:', e);
          }
        } else {
          try {
            panelElement.setAttribute('active', '');
            panelElement.style.display = 'flex';
          } catch (e) {
            console.warn('Failed to set panel active state:', e);
          }
        }
      } else {
        if ((panelElement as any).active !== undefined) {
          try {
            (panelElement as any).active = false;
          } catch (e) {
            console.warn('Failed to set panel inactive property:', e);
          }
        } else {
          try {
            panelElement.style.display = 'none';
          } catch (e) {
            console.warn('Failed to hide panel:', e);
          }
        }
      }
    });

    // Select the determined active tab if none is currently selected
    if (!this._activeTabId && activeTabElement) {
      const panelId =
        activeTabElement.getAttribute('panel') ||
        `${activeTabElement.id}-panel`;
      setTimeout(() => {
        if (activeTabElement) {
          this.selectTab(activeTabElement.id, panelId);
        }
      }, 100);
    }
  }

  // Public API
  public selectTabById(tabId: string): void {
    const tabElement = this.querySelector(
      `e2-tab[id="${tabId}"]`
    ) as HTMLElement;
    if (tabElement) {
      const panelId = tabElement.getAttribute('panel') || `${tabId}-panel`;
      this.selectTab(tabId, panelId);
    }
  }

  public addTab(
    label: string,
    content: string = '',
    tabId?: string,
    panelId?: string
  ): { tabId: string; panelId: string } {
    const finalTabId = tabId || generateId('tab');
    const finalPanelId = panelId || `${finalTabId}-panel`;

    // Create tab element using customElements workaround
    const TabConstructor = window.customElements.get('e2-tab') as any;
    const tab = new TabConstructor();
    tab.id = finalTabId;

    // Create panel element using customElements workaround
    const TabPanelConstructor = window.customElements.get(
      'e2-tab-panel'
    ) as any;
    const panel = new TabPanelConstructor();
    panel.id = finalPanelId;

    // Set up initial data that will be applied in connectedCallback
    (tab as any)._pendingSetup = {
      slot: 'tabs',
      panel: finalPanelId,
      label: label,
      closable: this._closable,
      theme: this._theme,
    };

    (panel as any)._pendingSetup = {
      slot: 'panels',
      content: content,
      theme: this._theme,
    };

    // Add to DOM - this will trigger connectedCallback
    this.appendChild(tab);
    this.appendChild(panel);

    return { tabId: finalTabId, panelId: finalPanelId };
  }

  public removeTabById(tabId: string): void {
    this.removeTab(tabId);
  }

  public get activeTabId(): string | null {
    return this._activeTabId;
  }

  public get tabs(): NodeListOf<HTMLElement> {
    return this.querySelectorAll('e2-tab');
  }

  public get panels(): NodeListOf<HTMLElement> {
    return this.querySelectorAll('e2-tab-panel');
  }

  // Attribute handling
  public get theme(): Theme {
    return this._theme;
  }

  public set theme(value: Theme) {
    this._theme = value;
    this.setAttribute('theme', value);

    // Clean up any existing theme inheritance
    if (this._themeCleanup) {
      this._themeCleanup();
      this._themeCleanup = undefined;
    }

    this.applyTheme(value);
  }

  public get tabPosition(): 'top' | 'bottom' | 'left' | 'right' {
    return this._tabPosition;
  }

  public set tabPosition(value: 'top' | 'bottom' | 'left' | 'right') {
    this._tabPosition = value;
    this.setAttribute('tab-position', value);
  }

  public get closable(): boolean {
    return this._closable;
  }

  public set closable(value: boolean) {
    this._closable = value;
    if (value) {
      this.setAttribute('closable', '');
    } else {
      this.removeAttribute('closable');
    }

    // Update existing tabs
    this.querySelectorAll('e2-tab').forEach(tab => {
      if (value) {
        tab.setAttribute('closable', '');
      } else {
        tab.removeAttribute('closable');
      }
    });
  }

  public get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  public set disabled(value: boolean) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  public applyTheme(theme: Theme): void {
    applyTheme(this, theme);

    // Also apply theme to all child tabs and panels
    this.querySelectorAll('e2-tab').forEach((tab: any) => {
      if (tab.applyTheme) {
        tab.applyTheme(theme);
      }
    });

    this.querySelectorAll('e2-tab-panel').forEach((panel: any) => {
      if (panel.applyTheme) {
        panel.applyTheme(theme);
      }
    });
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
          this._theme = newValue as Theme;
          // Clean up any existing theme inheritance
          if (this._themeCleanup) {
            this._themeCleanup();
            this._themeCleanup = undefined;
          }
          this.applyTheme(this._theme);
        } else if (this.isConnected) {
          // Attribute was removed, switch to inheritance
          this._theme = 'auto';
          applyEffectiveTheme(this);
          this._themeCleanup = setupThemeInheritance(this);
        }
        break;
      case 'active-tab':
        if (newValue && newValue !== this._activeTabId) {
          this.selectTabById(newValue);
        }
        break;
      case 'tab-position':
        this._tabPosition = (newValue as any) || 'top';
        break;
      case 'closable':
        this._closable = newValue !== null;
        break;
    }
  }

  connectedCallback(): void {
    if (!this.id) {
      this.id = generateId('tab-container');
    }

    // Set up theme inheritance if no explicit theme is set
    if (!this.hasAttribute('theme')) {
      applyEffectiveTheme(this);
      this._themeCleanup = setupThemeInheritance(this);
    } else {
      this.applyTheme(this._theme);
    }

    this.updateTabsAndPanels();

    // Defer initialization until the next frame to avoid conflicts with custom element initialization
    // Use requestAnimationFrame instead of setTimeout for better timing
    // requestAnimationFrame(() => {
    //   // Wait one more frame to ensure all child custom elements are fully initialized
    //   requestAnimationFrame(() => {
    //     this.updateTabsAndPanels();

    //     // If still no active tab after initialization, try once more
    //     if (!this._activeTabId) {
    //       requestAnimationFrame(() => {
    //         this.updateTabsAndPanels();
    //       });
    //     }
    //   });
    // });
  }

  disconnectedCallback(): void {
    // Clean up theme inheritance listener
    if (this._themeCleanup) {
      this._themeCleanup();
      this._themeCleanup = undefined;
    }
  }
}

// Register the custom element
if (!customElements.get('e2-tab-container')) {
  customElements.define('e2-tab-container', TabContainer);
}
