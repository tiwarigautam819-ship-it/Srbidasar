import React, { useState } from 'react';
import { 
  PhoneCall, 
  Mail, 
  MessageCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  MapPin, 
  Clock, 
  Sparkles 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ContactSection: React.FC = () => {
  const { settings } = useApp();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');

  const cleanWhatsAppUrl = () => {
    let url = settings.whatsappUrl ? settings.whatsappUrl.trim() : '';
    if (!url) return 'https://wa.me/';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://wa.me/${url.replace(/[^0-9]/g, '')}`;
    }
    return url;
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    if (settings.contactEmail) {
      navigator.clipboard.writeText(settings.contactEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleCopyWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(cleanWhatsAppUrl());
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2000);
  };

  const handleDirectWhatsAppMsg = (e: React.FormEvent) => {
    e.preventDefault();
    const baseUrl = cleanWhatsAppUrl();
    const text = encodeURIComponent(
      `Hello SR Bidasar!\n\nName: ${inquiryName || 'Music Fan'}\nMessage: ${inquiryMessage}`
    );
    const target = baseUrl.includes('?') ? `${baseUrl}&text=${text}` : `${baseUrl}?text=${text}`;
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <PhoneCall className="w-3.5 h-3.5" />
          <span>DIRECT CONTACT & BOOKINGS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Get in Touch
        </h1>
        <p className="text-sm text-slate-300 max-w-lg mx-auto">
          Need a custom remix, event DJ set, music collaboration, or have a song request? Reach out directly via WhatsApp or Email.
        </p>
      </div>

      {/* Main Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* WhatsApp Card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0e1f16] via-[#0d1716] to-[#0a0f12] border border-emerald-500/30 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] shadow-lg shadow-emerald-950/40">
                <MessageCircle className="w-7 h-7" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Fastest Reply
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>WhatsApp</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Chat directly with SR Bidasar for live updates, tracks, and bookings.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-300 truncate pr-2">
                {settings.whatsappUrl || 'Configured in Admin'}
              </span>
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                title="Copy WhatsApp link"
              >
                {copiedWhatsApp ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <a
            href={cleanWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] font-bold text-slate-950 text-sm shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>Open in WhatsApp</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Email Card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#161426] via-[#10101c] to-[#0a0b12] border border-amber-500/30 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/40">
                <Mail className="w-7 h-7" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Official Inquiries
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Email</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                For official collaborations, music distribution, and feedback.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
              <span className="text-xs font-mono text-amber-300 truncate pr-2">
                {settings.contactEmail || 'Configured in Admin'}
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                title="Copy Email address"
              >
                {copiedEmail ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <a
            href={`mailto:${settings.contactEmail || 'tiwarigautam819@gmail.com'}`}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 font-bold text-white text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>Send Email</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>

      {/* Quick WhatsApp Message Helper Box */}
      <div className="rounded-3xl bg-slate-900/70 border border-white/10 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">Send Direct Quick Note</h3>
        </div>
        <p className="text-xs text-slate-400">
          Type your message below and click to instantly open WhatsApp with your text pre-composed:
        </p>

        <form onSubmit={handleDirectWhatsAppMsg} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
              <input
                type="text"
                value={inquiryName}
                onChange={(e) => setInquiryName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Message</label>
              <input
                type="text"
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                placeholder="I love your track / want to collaborate..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Open WhatsApp with Message</span>
          </button>
        </form>
      </div>

    </div>
  );
};
