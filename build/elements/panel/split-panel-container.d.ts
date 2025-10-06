/**
 * Split Panel Container Element
 * A container that manages multiple resizable split panels with drag handles
 */
import { EditorElementProperties, SplitPanelOrientation, Theme } from '../../types';
export declare class SplitPanelContainer extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _orientation;
    private _resizing;
    private _activePanel;
    private _startPosition;
    private _startSize;
    private _nextPanelStartSize;
    private _updatingPanelSizes;
    private _themeCleanup?;
    private debouncedResize;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    private bindEvents;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
    private updateHandles;
    private updatePanelSizes;
    private handleMouseDown;
    private handleMouseMove;
    private updateHoverCursor;
    private handleMouseUp;
    private handleMouseLeave;
    private handleResize;
    private getPanels;
    get theme(): Theme;
    set theme(value: Theme);
    get orientation(): SplitPanelOrientation;
    set orientation(value: SplitPanelOrientation);
    get disabled(): boolean;
    set disabled(value: boolean);
    applyTheme(theme: Theme): void;
    resizePanel(panelId: string, size: number): void;
    getPanelSizes(): {
        [panelId: string]: number;
    };
    resetPanelSizes(): void;
}
export default SplitPanelContainer;
//# sourceMappingURL=split-panel-container.d.ts.map