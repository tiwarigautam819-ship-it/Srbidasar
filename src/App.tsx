import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { VideoSection } from './components/VideoSection';
import { RatingSection } from './components/RatingSection';
import { ContactSection } from './components/ContactSection';
import { LinksSection } from './components/LinksSection';
import { RemixSuggestionModal } from './components/RemixSuggestionModal';
import { CommentsModal } from './components/CommentsModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { VideoItem } from './types';
import { ShieldCheck, Lock } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const { isAdmin } = useAuth();

  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [selectedVideoForComments, setSelectedVideoForComments] = useState<VideoItem | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const handleOpenComments = (video: VideoItem) => {
    setSelectedVideoForComments(video);
    setIsCommentsOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      
      {/* Top sticky Navbar */}
      <Navbar onOpenAdminLogin={() => setIsAdminLoginOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {activeTab === 'videos' && (
          <VideoSection onOpenComments={handleOpenComments} />
        )}

        {activeTab === 'rating' && (
          <RatingSection />
        )}

        {activeTab === 'contact' && (
          <ContactSection />
        )}

        {activeTab === 'links' && (
          <LinksSection />
        )}

        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminDashboard />
          ) : (
            <div className="py-16 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">Administrator Access Required</h2>
              <p className="text-xs text-slate-400">
                You must sign in with an authorized Firebase administrator account to access management tools.
              </p>
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-transform active:scale-95"
              >
                Sign In to Admin Panel
              </button>
            </div>
          )
        )}
      </main>

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp />

      {/* Mobile-first Bottom Navigation Bar */}
      <BottomNav />

      {/* Modals */}
      <RemixSuggestionModal />

      <CommentsModal
        video={selectedVideoForComments}
        isOpen={isCommentsOpen}
        onClose={() => {
          setIsCommentsOpen(false);
          setSelectedVideoForComments(null);
        }}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
      />

      {/* Global Footer with Required Copyright */}
      <Footer onOpenAdminLogin={() => setIsAdminLoginOpen(true)} />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </AuthProvider>
  );
}
