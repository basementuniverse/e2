/**
 * Utility functions for editor elements
 */
/**
 * Generate a unique ID for elements
 */
export declare function generateId(prefix?: string): string;
/**
 * Dispatch a custom event from an element
 */
export declare function dispatchCustomEvent<T = any>(element: HTMLElement, eventName: string, detail?: T, options?: CustomEventInit): boolean;
/**
 * Add CSS to the document head if it doesn't already exist
 */
export declare function addGlobalCSS(css: string, id?: string): void;
/**
 * Create a template element with the given HTML
 */
export declare function createTemplate(html: string): HTMLTemplateElement;
/**
 * Get or create a shadow root for an element
 */
export declare function getShadowRoot(element: HTMLElement, options?: ShadowRootInit): ShadowRoot;
/**
 * Debounce function to limit how often a function can be called
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Check if an element is visible in the viewport
 */
export declare function isElementVisible(element: HTMLElement): boolean;
/**
 * Find the closest parent e2-app element
 */
export declare function findParentApp(element: HTMLElement): HTMLElement | null;
/**
 * Get the effective theme for an element
 * If the element has an explicit theme attribute, use that
 * Otherwise, inherit from the parent e2-app if available
 * Falls back to 'auto' if no parent app found
 */
export declare function getEffectiveTheme(element: HTMLElement): 'light' | 'dark' | 'auto';
/**
 * Apply theme class to an element
 */
export declare function applyTheme(element: HTMLElement, theme: 'light' | 'dark' | 'auto'): void;
/**
 * Apply effective theme to an element (with inheritance support)
 */
export declare function applyEffectiveTheme(element: HTMLElement): void;
/**
 * Setup theme inheritance for an element
 * This should be called in the element's connectedCallback
 */
export declare function setupThemeInheritance(element: HTMLElement, onThemeChange?: (theme: 'light' | 'dark' | 'auto') => void): () => void;
/**
 * Notify all child elements about theme change
 */
export declare function notifyThemeChange(appElement: HTMLElement, theme: 'light' | 'dark' | 'auto'): void;
/**
 * Initialize theme inheritance for a component
 * This is a helper function that standardizes the theme inheritance pattern
 * Call this in your component's connectedCallback
 */
export declare function initializeThemeInheritance(element: HTMLElement & {
    applyTheme: (theme: 'light' | 'dark' | 'auto') => void;
}, currentTheme: 'light' | 'dark' | 'auto'): (() => void) | undefined;
/**
 * Handle theme changes for a component
 * This is a helper function that standardizes theme change handling
 * Call this in your component's theme setter and attributeChangedCallback
 */
export declare function handleThemeChange(element: HTMLElement & {
    applyTheme: (theme: 'light' | 'dark' | 'auto') => void;
}, newTheme: 'light' | 'dark' | 'auto' | null, themeCleanupRef: {
    current?: () => void;
}): void;
/**
 * Create and show a toast notification programmatically
 */
export interface CreateToastOptions {
    title?: string;
    timeout?: number;
    dismissible?: boolean;
    persistent?: boolean;
    container?: HTMLElement | string;
}
export declare function createToast(type: 'info' | 'success' | 'warning' | 'error', message: string, options?: CreateToastOptions): Promise<void>;
/**
 * Toast API for convenient toast creation
 */
export declare const Toast: {
    /**
     * Show an info toast
     */
    info: (message: string, options?: CreateToastOptions) => Promise<void>;
    /**
     * Show a success toast
     */
    success: (message: string, options?: CreateToastOptions) => Promise<void>;
    /**
     * Show a warning toast
     */
    warning: (message: string, options?: CreateToastOptions) => Promise<void>;
    /**
     * Show an error toast
     */
    error: (message: string, options?: CreateToastOptions) => Promise<void>;
};
//# sourceMappingURL=utils.d.ts.map