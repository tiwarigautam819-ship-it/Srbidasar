import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FloatingWhatsApp: React.FC = () => {
  const { settings } = useApp();

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!settings.whatsappUrl) return;

    let targetUrl = settings.whatsappUrl.trim();
    // Normalize format if user entered only phone number
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      const cleanNumber = targetUrl.replace(/[^0-9]/g, '');
      targetUrl = `https://wa.me/${cleanNumber}`;
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <aside aria-label="WhatsApp Contact" className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-30 pointer-events-auto">
      <a
        href={settings.whatsappUrl || 'https://wa.me/'}
        onClick={handleWhatsAppClick}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xl shadow-emerald-950/50 hover:shadow-[#25D366]/40 transition-all duration-300 hover:scale-110 active:scale-95 whatsapp-pulse ring-2 ring-white/30"
      >
        {/* SVG WhatsApp Official Icon */}
        <svg
          viewBox="0 0 24 24"
          width="30"
          height="30"
          fill="currentColor"
          className="transition-transform group-hover:scale-105"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.04 7.42C8.87 7.42 8.6 7.49 8.36 7.74C8.12 8 7.45 8.63 7.45 9.93C7.45 11.23 8.4 12.48 8.53 12.65C8.66 12.83 10.36 15.45 12.97 16.57C13.59 16.84 14.07 17 14.45 17.12C15.07 17.32 15.63 17.29 16.08 17.22C16.58 17.15 17.62 16.59 17.84 15.97C18.06 15.35 18.06 14.82 18 14.71C17.94 14.6 17.78 14.54 17.53 14.42C17.28 14.29 16.07 13.69 15.84 13.61C15.62 13.52 15.45 13.48 15.29 13.73C15.12 13.97 14.64 14.54 14.5 14.71C14.35 14.87 14.21 14.89 13.96 14.77C13.71 14.64 12.91 14.38 11.96 13.53C11.22 12.87 10.72 12.06 10.58 11.81C10.43 11.56 10.56 11.43 10.69 11.3C10.8 11.19 10.94 11.01 11.06 10.86C11.19 10.72 11.23 10.61 11.31 10.45C11.39 10.28 11.35 10.14 11.29 10.02C11.23 9.89 10.74 8.68 10.53 8.18C10.33 7.7 10.12 7.76 9.96 7.75C9.82 7.75 9.65 7.74 9.48 7.74C9.31 7.74 9.04 7.42 9.04 7.42Z" />
        </svg>

        {/* Hover label for desktop */}
        <span className="hidden md:block absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs font-semibold whitespace-nowrap shadow-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Chat on WhatsApp
        </span>
      </a>
    </aside>
  );
};
