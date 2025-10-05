/**
 * Tab Container Element
 * A container that manages tabs and their associated panels
 */
import { EditorElementProperties, Theme } from '../../types';
export declare class TabContainer extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _activeTabId;
    private _tabPosition;
    private _closable;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    private setupEventListeners;
    private handleTabClick;
    private handleTabClose;
    private selectTab;
    private removeTab;
    private updateTabsAndPanels;
    selectTabById(tabId: string): void;
    addTab(label: string, content?: string, tabId?: string, panelId?: string): {
        tabId: string;
        panelId: string;
    };
    removeTabById(tabId: string): void;
    get activeTabId(): string | null;
    get tabs(): NodeListOf<HTMLElement>;
    get panels(): NodeListOf<HTMLElement>;
    get theme(): Theme;
    set theme(value: Theme);
    get tabPosition(): 'top' | 'bottom' | 'left' | 'right';
    set tabPosition(value: 'top' | 'bottom' | 'left' | 'right');
    get closable(): boolean;
    set closable(value: boolean);
    get disabled(): boolean;
    set disabled(value: boolean);
    applyTheme(theme: Theme): void;
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
    connectedCallback(): void;
}
//# sourceMappingURL=tab-container.d.ts.map