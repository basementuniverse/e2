/**
 * Utility functions for editor elements
 */

/**
 * Generate a unique ID for elements
 */
export function generateId(prefix = 'element'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Dispatch a custom event from an element
 */
export function dispatchCustomEvent<T = any>(
  element: HTMLElement,
  eventName: string,
  detail?: T,
  options: CustomEventInit = {}
): boolean {
  const event = new CustomEvent(eventName, {
    detail,
    bubbles: true,
    cancelable: true,
    ...options,
  });

  return element.dispatchEvent(event);
}

/**
 * Add CSS to the document head if it doesn't already exist
 */
export function addGlobalCSS(css: string, id?: string): void {
  if (id && document.getElementById(id)) {
    return; // CSS already added
  }

  const style = document.createElement('style');
  if (id) {
    style.id = id;
  }
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Create a template element with the given HTML
 */
export function createTemplate(html: string): HTMLTemplateElement {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template;
}

/**
 * Get or create a shadow root for an element
 */
export function getShadowRoot(
  element: HTMLElement,
  options: ShadowRootInit = { mode: 'open' }
): ShadowRoot {
  return element.shadowRoot || element.attachShadow(options);
}

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  };
}

/**
 * Check if an element is visible in the viewport
 */
export function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Find the closest parent e2-app element
 */
export function findParentApp(element: HTMLElement): HTMLElement | null {
  let current = element.parentElement;
  while (current) {
    if (current.tagName.toLowerCase() === 'e2-app') {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

/**
 * Get the effective theme for an element
 * If the element has an explicit theme attribute, use that
 * Otherwise, inherit from the parent e2-app if available
 * Falls back to 'auto' if no parent app found
 */
export function getEffectiveTheme(
  element: HTMLElement
): 'light' | 'dark' | 'auto' {
  // Check if element has explicit theme attribute
  const explicitTheme = element.getAttribute('theme');
  if (explicitTheme && ['light', 'dark', 'auto'].includes(explicitTheme)) {
    return explicitTheme as 'light' | 'dark' | 'auto';
  }

  // Look for parent app theme
  const parentApp = findParentApp(element);
  if (parentApp) {
    const parentTheme = parentApp.getAttribute('theme');
    if (parentTheme && ['light', 'dark', 'auto'].includes(parentTheme)) {
      return parentTheme as 'light' | 'dark' | 'auto';
    }
  }

  // Default fallback
  return 'auto';
}

/**
 * Apply theme class to an element
 */
export function applyTheme(
  element: HTMLElement,
  theme: 'light' | 'dark' | 'auto'
): void {
  element.classList.remove('theme-light', 'theme-dark', 'theme-auto');
  element.classList.add(`theme-${theme}`);
}

/**
 * Apply effective theme to an element (with inheritance support)
 */
export function applyEffectiveTheme(element: HTMLElement): void {
  const effectiveTheme = getEffectiveTheme(element);
  applyTheme(element, effectiveTheme);
}

/**
 * Setup theme inheritance for an element
 * This should be called in the element's connectedCallback
 */
export function setupThemeInheritance(
  element: HTMLElement,
  onThemeChange?: (theme: 'light' | 'dark' | 'auto') => void
): () => void {
  const handleAppThemeChange = (event: CustomEvent) => {
    // Only respond if this element doesn't have its own theme attribute
    if (!element.hasAttribute('theme')) {
      const newTheme = event.detail.theme;
      applyTheme(element, newTheme);

      // Call custom handler if provided
      if (onThemeChange) {
        onThemeChange(newTheme);
      }
    }
  };

  // Listen for theme changes from parent app
  document.addEventListener(
    'e2-app-theme-change',
    handleAppThemeChange as EventListener
  );

  // Return cleanup function
  return () => {
    document.removeEventListener(
      'e2-app-theme-change',
      handleAppThemeChange as EventListener
    );
  };
}

/**
 * Notify all child elements about theme change
 */
export function notifyThemeChange(
  appElement: HTMLElement,
  theme: 'light' | 'dark' | 'auto'
): void {
  // Dispatch a custom event that bubbles up
  const event = new CustomEvent('e2-app-theme-change', {
    detail: {
      theme,
      appElement,
    },
    bubbles: true,
    cancelable: false,
  });

  // Dispatch from the app element so it can be captured by child elements
  appElement.dispatchEvent(event);

  // Also dispatch globally for elements that might not be in the DOM tree yet
  document.dispatchEvent(event);
}

/**
 * Initialize theme inheritance for a component
 * This is a helper function that standardizes the theme inheritance pattern
 * Call this in your component's connectedCallback
 */
export function initializeThemeInheritance(
  element: HTMLElement & {
    applyTheme: (theme: 'light' | 'dark' | 'auto') => void;
  },
  currentTheme: 'light' | 'dark' | 'auto'
): (() => void) | undefined {
  // Set up theme inheritance if no explicit theme is set
  if (!element.hasAttribute('theme')) {
    applyEffectiveTheme(element);
    return setupThemeInheritance(element);
  } else {
    element.applyTheme(currentTheme);
    return undefined;
  }
}

/**
 * Handle theme changes for a component
 * This is a helper function that standardizes theme change handling
 * Call this in your component's theme setter and attributeChangedCallback
 */
export function handleThemeChange(
  element: HTMLElement & {
    applyTheme: (theme: 'light' | 'dark' | 'auto') => void;
  },
  newTheme: 'light' | 'dark' | 'auto' | null,
  themeCleanupRef: { current?: () => void }
): void {
  // Clean up any existing theme inheritance first
  if (themeCleanupRef.current) {
    themeCleanupRef.current();
    themeCleanupRef.current = undefined;
  }

  if (newTheme) {
    // Explicit theme set
    element.applyTheme(newTheme);
  } else if (element.isConnected) {
    // Theme attribute removed, switch to inheritance
    applyEffectiveTheme(element);
    themeCleanupRef.current = setupThemeInheritance(element);
  }
}

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

export function createToast(
  type: 'info' | 'success' | 'warning' | 'error',
  message: string,
  options: CreateToastOptions = {}
): Promise<void> {
  // Create the notification element
  const notification = document.createElement('e2-notification') as any;
  notification.type = type;
  notification.message = message;

  if (options.title) {
    notification.title = options.title;
  }

  if (options.timeout !== undefined) {
    notification.timeout = options.timeout;
  }

  if (options.dismissible !== undefined) {
    notification.dismissible = options.dismissible;
  }

  if (options.persistent !== undefined) {
    notification.persistent = options.persistent;
  }

  // Find or create container
  let container: HTMLElement;

  if (options.container) {
    if (typeof options.container === 'string') {
      const found = document.querySelector(options.container);
      if (found) {
        container = found as HTMLElement;
      } else {
        container = document.body;
      }
    } else {
      container = options.container;
    }
  } else {
    // Look for existing notification container
    const existingContainer = document.querySelector(
      'e2-notification-container'
    );
    if (existingContainer) {
      container = existingContainer as HTMLElement;
    } else {
      // Create default container
      const defaultContainer = document.createElement(
        'e2-notification-container'
      ) as any;
      defaultContainer.position = 'top-right';
      document.body.appendChild(defaultContainer);
      container = defaultContainer;
    }
  }

  // Add notification to container
  container.appendChild(notification);

  // Show the notification and clean up when done
  return notification.show().then(() => {
    // Remove from DOM after hiding animation completes
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  });
}

/**
 * Toast API for convenient toast creation
 */
export const Toast = {
  /**
   * Show an info toast
   */
  info: (message: string, options?: CreateToastOptions): Promise<void> =>
    createToast('info', message, options),

  /**
   * Show a success toast
   */
  success: (message: string, options?: CreateToastOptions): Promise<void> =>
    createToast('success', message, options),

  /**
   * Show a warning toast
   */
  warning: (message: string, options?: CreateToastOptions): Promise<void> =>
    createToast('warning', message, options),

  /**
   * Show an error toast
   */
  error: (message: string, options?: CreateToastOptions): Promise<void> =>
    createToast('error', message, options),
};
