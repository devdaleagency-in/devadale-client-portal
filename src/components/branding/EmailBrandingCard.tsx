import { useState } from 'react';
import { Mail, Twitter, Linkedin, Facebook, Instagram, Eye } from 'lucide-react';
import type { EmailBranding } from '../../types/branding';

interface EmailBrandingCardProps {
  email: EmailBranding;
  onChange: (email: Partial<EmailBranding>) => void;
  accentColor: string;
  logoUrl?: string;
}

export default function EmailBrandingCard({
  email,
  onChange,
  accentColor,
  logoUrl,
}: EmailBrandingCardProps) {
  const [showPreview, setShowPreview] = useState(false);

  const socialFields: { key: keyof EmailBranding['socialLinks']; label: string; Icon: typeof Twitter }[] = [
    { key: 'twitter', label: 'Twitter URL', Icon: Twitter },
    { key: 'linkedin', label: 'LinkedIn URL', Icon: Linkedin },
    { key: 'facebook', label: 'Facebook URL', Icon: Facebook },
    { key: 'instagram', label: 'Instagram URL', Icon: Instagram },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Email Branding
          </label>
          <p className="text-[10px] text-slate-400 mt-0.5">Customize sender details and email appearance</p>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          {showPreview ? 'Hide Preview' : 'Preview Email'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400" htmlFor="sender-name">Sender Name</label>
          <input
            id="sender-name"
            type="text"
            value={email.senderName}
            onChange={(e) => onChange({ senderName: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400" htmlFor="sender-email">Sender Email</label>
          <input
            id="sender-email"
            type="email"
            value={email.senderEmail}
            onChange={(e) => onChange({ senderEmail: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400" htmlFor="email-footer">Email Footer</label>
        <textarea
          id="email-footer"
          rows={2}
          value={email.footerText}
          onChange={(e) => onChange({ footerText: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400" htmlFor="email-signature">Email Signature</label>
        <textarea
          id="email-signature"
          rows={3}
          value={email.signature}
          onChange={(e) => onChange({ signature: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none font-mono"
        />
      </div>

      {/* Social Links */}
      <div>
        <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-2">Social Media Links</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {socialFields.map(({ key, label, Icon }) => (
            <div key={key} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="url"
                value={email.socialLinks[key] || ''}
                onChange={(e) => onChange({ socialLinks: { ...email.socialLinks, [key]: e.target.value } })}
                placeholder={label}
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400"
                aria-label={label}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Email Preview */}
      {showPreview && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-semibold text-slate-500">Email Preview</span>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900">
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
              {/* Email header */}
              <div style={{ backgroundColor: accentColor, padding: '20px', borderRadius: '8px 8px 0 0', textAlign: 'center' as const }}>
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" style={{ maxHeight: 40, margin: '0 auto' }} />
                ) : (
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{email.senderName}</span>
                )}
              </div>
              {/* Email body */}
              <div style={{ padding: 24, border: '1px solid #e2e8f0', borderTop: 0, borderRadius: '0 0 8px 8px' }}>
                <p style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>
                  {'Hi {{client_name}},'}
                </p>
                <p style={{ fontSize: 13, color: '#475569', marginBottom: 16 }}>
                  This is a preview of your branded email template. Your logo, colors, and signature will be applied automatically.
                </p>
                <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
                  <a
                    href="#"
                    style={{
                      display: 'inline-block',
                      padding: '10px 24px',
                      backgroundColor: accentColor,
                      color: '#fff',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    View in Portal
                  </a>
                </div>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginTop: 16 }}>
                  <p style={{ fontSize: 11, color: '#94a3b8' }}>{email.footerText}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'pre-wrap' }}>{email.signature}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
