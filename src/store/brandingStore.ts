import { create } from 'zustand';
import type { BrandingConfig, BrandingColors, BrandingLogo, EmailBranding, DomainSettings } from '../types/branding';
import { DEFAULT_BRANDING, generateBrandingColors } from '../types/branding';
import { api } from '../utils/api';

interface BrandingStore {
  config: BrandingConfig;
  hasUnsavedChanges: boolean;
  clientPortalLoading: boolean;
  whiteLabelLoading: boolean;
  clientPortalError: string | null;
  whiteLabelError: string | null;
  settingsLoading: boolean;
  settingsError: string | null;
  setWorkspaceName: (name: string) => void;
  setWelcomeMessage: (msg: string) => void;
  setClientPortalEnabled: (enabled: boolean) => void;
  setWhiteLabelEnabled: (enabled: boolean) => void;
  setLogo: (logo: Partial<BrandingLogo>) => void;
  setAccentColor: (hex: string) => void;
  setColors: (colors: BrandingColors) => void;
  setDomain: (domain: Partial<DomainSettings>) => void;
  setEmail: (email: Partial<EmailBranding>) => void;
  resetToDefault: () => void;
  save: () => void;
  load: (workspaceId: string) => void;
  loadFromServer: () => Promise<void>;
  saveClientPortalToServer: (enabled: boolean) => Promise<boolean>;
  saveWhiteLabelToServer: (enabled: boolean) => Promise<boolean>;
}

let lastFetchTime = 0;

export const useBrandingStore = create<BrandingStore>((set, get) => ({
  config: { ...DEFAULT_BRANDING },
  hasUnsavedChanges: false,
  clientPortalLoading: false,
  whiteLabelLoading: false,
  clientPortalError: null,
  whiteLabelError: null,
  settingsLoading: false,
  settingsError: null,

  setWorkspaceName: (name) =>
    set((s) => ({
      config: { ...s.config, workspaceName: name, updatedAt: new Date().toISOString() },
      hasUnsavedChanges: true,
    })),

  setWelcomeMessage: (msg) =>
    set((s) => ({
      config: { ...s.config, welcomeMessage: msg, updatedAt: new Date().toISOString() },
      hasUnsavedChanges: true,
    })),

  setClientPortalEnabled: (enabled) =>
    set((s) => ({
      config: { ...s.config, clientPortalEnabled: enabled, updatedAt: new Date().toISOString() },
      hasUnsavedChanges: true,
      clientPortalError: null,
    })),

  setWhiteLabelEnabled: (enabled) =>
    set((s) => ({
      config: { ...s.config, whiteLabelEnabled: enabled, updatedAt: new Date().toISOString() },
      hasUnsavedChanges: true,
      whiteLabelError: null,
    })),

  setLogo: (logo) =>
    set((s) => ({
      config: { ...s.config, logo: { ...s.config.logo, ...logo }, updatedAt: new Date().toISOString() },
      hasUnsavedChanges: true,
    })),

  setAccentColor: (hex) =>
    set((s) => ({
      config: {
        ...s.config,
        colors: generateBrandingColors(hex),
        updatedAt: new Date().toISOString(),
      },
      hasUnsavedChanges: true,
    })),

  setColors: (colors) =>
    set((s) => ({
      config: { ...s.config, colors, updatedAt: new Date().toISOString() },
      hasUnsavedChanges: true,
    })),

  setDomain: (domain) =>
    set((s) => ({
      config: { ...s.config, domain: { ...s.config.domain, ...domain }, updatedAt: new Date().toISOString() },
      hasUnsavedChanges: true,
    })),

  setEmail: (email) =>
    set((s) => ({
      config: { ...s.config, email: { ...s.config.email, ...email }, updatedAt: new Date().toISOString() },
      hasUnsavedChanges: true,
    })),

  resetToDefault: () =>
    set({ config: { ...DEFAULT_BRANDING, updatedAt: new Date().toISOString() }, hasUnsavedChanges: true }),

  save: () => {
    const { config } = get();
    try {
      localStorage.setItem(`branding_${config.workspaceId}`, JSON.stringify(config));
      set({ hasUnsavedChanges: false });
    } catch (e) {
      console.error('Failed to save branding:', e);
    }
  },

  load: (workspaceId: string) => {
    try {
      const stored = localStorage.getItem(`branding_${workspaceId}`);
      if (stored) {
        const parsed = JSON.parse(stored) as BrandingConfig;
        set({ config: parsed, hasUnsavedChanges: false });
      } else {
        set({ config: { ...DEFAULT_BRANDING, workspaceId }, hasUnsavedChanges: false });
      }
    } catch {
      set({ config: { ...DEFAULT_BRANDING, workspaceId }, hasUnsavedChanges: false });
    }
  },

  loadFromServer: async () => {
    const now = Date.now();
    if (now - lastFetchTime < 30000) return;
    lastFetchTime = now;
    set({ settingsLoading: true, settingsError: null });
    try {
      const settings = await api.getSettings();
      set((s) => ({
        config: {
          ...s.config,
          clientPortalEnabled: settings.clientPortalEnabled,
          whiteLabelEnabled: settings.whiteLabelMode,
          workspaceName: settings.agencyName || s.config.workspaceName,
          welcomeMessage: settings.clientWelcomeMessage || s.config.welcomeMessage,
        },
        settingsLoading: false,
      }));
    } catch (e: any) {
      set({ settingsLoading: false, settingsError: e.message || 'Failed to load settings' });
    }
  },

  saveClientPortalToServer: async (enabled) => {
    set({ clientPortalLoading: true, clientPortalError: null });
    try {
      const result = await api.updateClientPortal(enabled);
      set({
        config: {
          ...get().config,
          clientPortalEnabled: result.clientPortalEnabled,
          whiteLabelEnabled: result.whiteLabelMode,
        },
        clientPortalLoading: false,
      });
      return true;
    } catch (e: any) {
      set({
        clientPortalLoading: false,
        clientPortalError: e.message || 'Failed to update client portal setting',
        config: { ...get().config, clientPortalEnabled: !enabled },
      });
      return false;
    }
  },

  saveWhiteLabelToServer: async (enabled) => {
    set({ whiteLabelLoading: true, whiteLabelError: null });
    try {
      const result = await api.updateWhiteLabel(enabled);
      set({
        config: {
          ...get().config,
          whiteLabelEnabled: result.whiteLabelMode,
          clientPortalEnabled: result.clientPortalEnabled,
        },
        whiteLabelLoading: false,
      });
      return true;
    } catch (e: any) {
      set({
        whiteLabelLoading: false,
        whiteLabelError: e.message || 'Failed to update white label setting',
        config: { ...get().config, whiteLabelEnabled: !enabled },
      });
      return false;
    }
  },
}));
