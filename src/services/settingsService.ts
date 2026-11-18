import { SystemSettings } from '../types';

const SETTINGS_STORAGE_KEY = 'uniflow_system_settings';
const SETTINGS_CHANGE_EVENT = 'uniflow:settings-changed';

/**
 * Default fallback settings derived from environment variables
 */
const getDefaultSettings = (): SystemSettings => ({
  cycleIdentifier: 'Academic Session 2025-2026 (Odd Semester)',
  cycleOpen: true,
  minDistanceKm: 150,
  makeSubmissionWebhook:
    import.meta.env.VITE_MAKE_WEBHOOK_URL || 'https://hook.us2.make.com/bj4xbwrtbaq8mxzgp4bp32ihsmtqun9v',
  makeActionWebhook: import.meta.env.VITE_MAKE_ADMIN_ACTION_WEBHOOK || '',
  updatedAt: new Date().toISOString(),
});

/**
 * Loads persisted settings from localStorage with default fallbacks
 */
function loadPersistedSettings(): SystemSettings {
  const defaults = getDefaultSettings();
  if (typeof window === 'undefined' || !window.localStorage) {
    return defaults;
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      cycleIdentifier: parsed.cycleIdentifier || defaults.cycleIdentifier,
      cycleOpen: typeof parsed.cycleOpen === 'boolean' ? parsed.cycleOpen : defaults.cycleOpen,
      minDistanceKm: typeof parsed.minDistanceKm === 'number' ? parsed.minDistanceKm : defaults.minDistanceKm,
      makeSubmissionWebhook: parsed.makeSubmissionWebhook ?? defaults.makeSubmissionWebhook,
      makeActionWebhook: parsed.makeActionWebhook ?? defaults.makeActionWebhook,
      updatedAt: parsed.updatedAt || defaults.updatedAt,
    };
  } catch (err) {
    console.warn('Failed to parse persisted settings, falling back to defaults:', err);
    return defaults;
  }
}

// In-memory cache for fast synchronous access
let cachedSettings: SystemSettings = loadPersistedSettings();

export const settingsService = {
  /**
   * Returns current active system settings
   */
  getSettings(): SystemSettings {
    if (!cachedSettings) {
      cachedSettings = loadPersistedSettings();
    }
    return { ...cachedSettings };
  },

  /**
   * Persists partial or complete settings updates to localStorage
   */
  saveSettings(updates: Partial<SystemSettings>): SystemSettings {
    const current = this.getSettings();
    const merged: SystemSettings = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    cachedSettings = merged;

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
      } catch (err) {
        console.error('Failed to write settings to localStorage:', err);
      }
    }

    // Broadcast change across app
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(SETTINGS_CHANGE_EVENT, {
          detail: merged,
        })
      );
    }

    return { ...merged };
  },

  /**
   * Resets settings back to the default environment configuration
   */
  resetToDefaults(): SystemSettings {
    const defaults = getDefaultSettings();
    cachedSettings = defaults;

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
      } catch (err) {
        console.error('Failed to clear settings from localStorage:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(SETTINGS_CHANGE_EVENT, {
          detail: defaults,
        })
      );
    }

    return { ...defaults };
  },

  /**
   * Get active webhook URL for student submissions
   */
  getSubmissionWebhookUrl(): string {
    const settings = this.getSettings();
    return settings.makeSubmissionWebhook?.trim() || import.meta.env.VITE_MAKE_WEBHOOK_URL || '';
  },

  /**
   * Get active webhook URL for admin decision actions (Approve / Reject / Request Docs)
   */
  getActionWebhookUrl(): string {
    const settings = this.getSettings();
    return settings.makeActionWebhook?.trim() || import.meta.env.VITE_MAKE_ADMIN_ACTION_WEBHOOK || '';
  },

  /**
   * Checks whether student admissions intake is currently open
   */
  isCycleOpen(): boolean {
    return this.getSettings().cycleOpen;
  },

  /**
   * Returns the minimum distance score threshold (in km)
   */
  getMinDistanceKm(): number {
    return this.getSettings().minDistanceKm;
  },

  /**
   * Returns active academic cycle identifier
   */
  getCycleIdentifier(): string {
    return this.getSettings().cycleIdentifier;
  },

  /**
   * Subscribes to settings updates triggered anywhere in the window
   */
  subscribe(callback: (settings: SystemSettings) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<SystemSettings>;
      callback(customEvent.detail || this.getSettings());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(SETTINGS_CHANGE_EVENT, handler);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(SETTINGS_CHANGE_EVENT, handler);
      }
    };
  },

  /**
   * Sends a test ping payload to verify webhook endpoint connectivity
   */
  async testWebhook(
    url: string,
    actionType: 'submission' | 'action' = 'submission'
  ): Promise<{ success: boolean; status?: number; error?: string }> {
    if (!url || url.trim() === '') {
      return { success: false, error: 'Webhook URL cannot be empty.' };
    }

    const testPayload = {
      action: actionType === 'submission' ? 'ping_submission_test' : 'ping_admin_action_test',
      is_test_ping: true,
      sender: 'UniFlow AI Settings Test Workbench',
      timestamp: new Date().toISOString(),
      metadata: {
        environment: 'UniFlow AI Verification Agent',
        cycle: this.getCycleIdentifier(),
      },
    };

    try {
      const res = await fetch(url.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return {
          success: false,
          status: res.status,
          error: `HTTP ${res.status}: ${text || res.statusText || 'Webhook rejected request'}`,
        };
      }

      return {
        success: true,
        status: res.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error:
          err.message ||
          'Failed to reach webhook endpoint. Please verify URL formatting and that your Make.com scenario is turned on.',
      };
    }
  },
};
