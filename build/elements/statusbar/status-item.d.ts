/**
 * Status Item Element
 * A flexible status bar item that can display text, progress indicators, tools, and other status information
 * Supports different types: text, progress, tool, message, indicator
 */
import { EditorElementProperties, StatusItemType, Theme } from '../../types';
export declare class StatusItem extends HTMLElement implements EditorElementProperties {
    private _theme;
    private _type;
    private _value;
    private _label;
    private _clickable;
    static get observedAttributes(): string[];
    constructor();
    private setupElement;
    connectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
    private handleClick;
    private updateDisplay;
    private updateProgressDisplay;
    get theme(): Theme;
    set theme(value: Theme);
    get type(): StatusItemType;
    set type(value: StatusItemType);
    get value(): string | number;
    set value(newValue: string | number);
    get label(): string;
    set label(value: string);
    get clickable(): boolean;
    set clickable(value: boolean);
    applyTheme(theme: Theme): void;
    /**
     * Update the progress value (for progress type items)
     * @param progress Progress value between 0 and 1
     */
    setProgress(progress: number): void;
    /**
     * Set an icon for the status item
     * @param icon Unicode emoji or symbol
     */
    setIcon(icon: string): void;
}
//# sourceMappingURL=status-item.d.ts.map