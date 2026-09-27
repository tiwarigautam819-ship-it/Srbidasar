import React, { useState } from 'react';
import { 
  PhoneCall, 
  MessageCircle, 
  Mail, 
  Save, 
  Check, 
  AlertCircle, 
  Loader2, 
  ExternalLink 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ContactTab: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const [whatsappUrl, setWhatsappUrl] = useState(settings.whatsappUrl || '');
  const [contactEmail, setContactEmail] = useState(settings.contactEmail || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappUrl.trim()) {
      setError('Please provide a WhatsApp URL or phone number.');
      return;
    }
    if (!contactEmail.trim()) {
      setError('Please provide a contact email.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateSettings({
        whatsappUrl: whatsappUrl.trim(),
        contactEmail: contactEmail.trim(),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err: any) {
      console.error('Error saving contact settings:', err);
      setError(err?.message || 'Failed to update contact settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-amber-400" />
            <span>Contact & WhatsApp Configuration</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage public WhatsApp buttons, floating chat widget, and email addresses
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>Contact settings successfully updated in Firestore!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-5">
        
        {/* WhatsApp URL field */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>WhatsApp Link</span>
            <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={whatsappUrl}
              onChange={(e) => setWhatsappUrl(e.target.value)}
              placeholder="https://wa.me/919876543210"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-amber-400 transition-colors"
              required
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Format: <code className="text-emerald-400">https://wa.me/919876543210</code> (include country code without + or spaces).
            This updates both the Contact section and the Floating WhatsApp button immediately.
          </p>
        </div>

        {/* Email field */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-amber-400" />
            <span>Contact Email</span>
            <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="tiwarigautam819@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-amber-400 transition-colors"
              required
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Clicking this on the public website opens the user's default email app.
          </p>
        </div>

        {/* Submit */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 font-bold text-white text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Firestore...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>SAVE CONTACT SETTINGS</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
