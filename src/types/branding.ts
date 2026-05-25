export interface BrandingLogo {
  url: string;
  darkUrl?: string;
  faviconUrl?: string;
}

export interface BrandingColors {
  accent: string;
  accentHover: string;
  accentLight: string;
  accentDark: string;
}

export interface DomainSettings {
  domain: string;
  verified: boolean;
  sslActive: boolean;
  verificationToken?: string;
}

export interface EmailBranding {
  senderName: string;
  senderEmail: string;
  footerText: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
  signature: string;
}

export interface BrandingConfig {
  workspaceId: string;
  workspaceName: string;
  welcomeMessage: string;
  clientPortalEnabled: boolean;
  whiteLabelEnabled: boolean;
  logo: BrandingLogo;
  colors: BrandingColors;
  domain: DomainSettings;
  email: EmailBranding;
  updatedAt: string;
}

export const ACCENT_COLOR_PRESETS = [
  { name: 'Blue', hex: '#3B82F6', hover: '#2563EB', light: '#EFF6FF', dark: '#1D4ED8' },
  { name: 'Indigo', hex: '#6366F1', hover: '#4F46E5', light: '#EEF2FF', dark: '#4338CA' },
  { name: 'Violet', hex: '#8B5CF6', hover: '#7C3AED', light: '#F5F3FF', dark: '#6D28D9' },
  { name: 'Emerald', hex: '#10B981', hover: '#059669', light: '#ECFDF5', dark: '#047857' },
  { name: 'Amber', hex: '#F59E0B', hover: '#D97706', light: '#FFFBEB', dark: '#B45309' },
  { name: 'Rose', hex: '#F43F5E', hover: '#E11D48', light: '#FFF1F2', dark: '#BE123C' },
  { name: 'Cyan', hex: '#06B6D4', hover: '#0891B2', light: '#ECFEFF', dark: '#0E7490' },
  { name: 'Slate', hex: '#64748B', hover: '#475569', light: '#F1F5F9', dark: '#334155' },
];

export function generateBrandingColors(hex: string): BrandingColors {
  return {
    accent: hex,
    accentHover: adjustBrightness(hex, -20),
    accentLight: hexToRgba(hex, 0.1),
    accentDark: adjustBrightness(hex, -40),
  };
}

function adjustBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xFF) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 0xFF;
  const g = (num >> 8) & 0xFF;
  const b = num & 0xFF;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const DEFAULT_BRANDING: BrandingConfig = {
  workspaceId: 'default',
  workspaceName: 'My Agency',
  welcomeMessage: 'Welcome to your dedicated client portal. Track projects, review deliverables, and collaborate with your team.',
  clientPortalEnabled: true,
  whiteLabelEnabled: false,
  logo: {
    url: '',
    darkUrl: '',
    faviconUrl: '',
  },
  colors: generateBrandingColors('#3B82F6'),
  domain: {
    domain: '',
    verified: false,
    sslActive: false,
  },
  email: {
    senderName: 'DevDale Agency',
    senderEmail: 'noreply@devdale.com',
    footerText: '© 2026 DevDale Agency. All rights reserved.',
    socialLinks: {},
    signature: 'Best regards,\nThe DevDale Team',
  },
  updatedAt: new Date().toISOString(),
};
