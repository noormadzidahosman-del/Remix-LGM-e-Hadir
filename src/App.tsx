import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DirectoryPage } from './pages/DirectoryPage';
import { CreateMeetingPage } from './pages/CreateMeetingPage';
import { MeetingDetailsPage } from './pages/MeetingDetailsPage';
import { RsvpPage } from './pages/RsvpPage';
import { RsvpDemoModal } from './components/RsvpDemoModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { isAuthenticated, logout, resetDatabase } from './services/api';

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Parse path on initial load & popstate (supporting deep links e.g. /rsvp/:token)
  const parseCurrentUrl = () => {
    const path = window.location.pathname;

    // Public RSVP link /rsvp/:token
    if (path.startsWith('/rsvp/')) {
      const token = path.replace('/rsvp/', '').trim();
      setCurrentView('rsvp');
      setViewParam(token);
      return;
    }

    if (path === '/directory') {
      setCurrentView('directory');
      return;
    }

    if (path === '/meetings/new') {
      setCurrentView('meetings/new');
      return;
    }

    if (path.startsWith('/meetings/')) {
      const id = path.replace('/meetings/', '').trim();
      if (id) {
        setCurrentView('meetings/details');
        setViewParam(id);
        return;
      }
    }

    if (path === '/login') {
      setCurrentView('login');
      return;
    }

    // Default dashboard
    setCurrentView('dashboard');
  };

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    parseCurrentUrl();

    const handlePopState = () => {
      setAuthenticated(isAuthenticated());
      parseCurrentUrl();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (view: string, param?: string) => {
    setCurrentView(view);
    setViewParam(param);

    // Update browser URL history without reloading
    let newPath = '/';
    if (view === 'dashboard') newPath = '/dashboard';
    else if (view === 'directory') newPath = '/directory';
    else if (view === 'meetings/new') newPath = '/meetings/new';
    else if (view === 'meetings/details' && param) newPath = `/meetings/${param}`;
    else if (view === 'rsvp' && param) newPath = `/rsvp/${param}`;
    else if (view === 'login') newPath = '/login';

    if (view === 'rsvp-demo') {
      setIsDemoModalOpen(true);
      return;
    }

    try {
      window.history.pushState({}, '', newPath);
    } catch (e) {
      // ignore
    }
  };

  const handleNotify = (
    type: 'success' | 'error' | 'info',
    message: string,
    title?: string
  ) => {
    const newToast: ToastMessage = {
      id: 'toast-' + Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
    };
    setToasts(prev => [...prev, newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    navigateTo('login');
    handleNotify('info', 'Anda telah log keluar dari sesi pentadbiran.');
  };

  const handleResetData = async () => {
    if (
      window.confirm(
        'Adakah anda pasti ingin menetapkan semula pangkalan data kepada data sampel asal LGM?'
      )
    ) {
      await resetDatabase();
      handleNotify('success', 'Pangkalan data telah berjaya ditetapkan semula ke data sampel asal.');
      // Reload current view
      if (currentView === 'meetings/details' && viewParam) {
        navigateTo('dashboard');
      }
    }
  };

  // --- SCENARIO 1: PUBLIC RSVP ROUTE (/rsvp/:token) ---
  // FR-004: Tiada log masuk diperlukan untuk halaman penerima jemputan
  if (currentView === 'rsvp' && viewParam) {
    return (
      <main className="min-h-screen bg-slate-50">
        <RsvpPage
          token={viewParam}
          onNavigateHome={() => navigateTo('dashboard')}
          onNotify={handleNotify}
        />
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </main>
    );
  }

  // --- SCENARIO 2: SECRETARIAT NOT LOGGED IN ---
  // FR-001: Pengguna tidak boleh melihat senarai mesyuarat atau direktori tanpa memasukkan kod sah
  if (!authenticated) {
    return (
      <main className="min-h-screen bg-slate-900">
        <LoginPage
          onSuccess={() => {
            setAuthenticated(true);
            navigateTo('dashboard');
            handleNotify('success', 'Selamat kembali ke Urus Setia LGM e-Hadir.');
          }}
          onPreviewRsvp={() => setIsDemoModalOpen(true)}
        />
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

        {/* Demo Picker Modal */}
        <RsvpDemoModal
          isOpen={isDemoModalOpen}
          onClose={() => setIsDemoModalOpen(false)}
          onSelectToken={token => navigateTo('rsvp', token)}
        />
      </main>
    );
  }

  // --- SCENARIO 3: SECRETARIAT AUTHENTICATED PORTAL ---
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900">
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        onLogout={handleLogout}
        onResetData={handleResetData}
      />

      <main className="flex-1 pb-16">
        {currentView === 'dashboard' && (
          <DashboardPage onNavigate={navigateTo} onNotify={handleNotify} />
        )}

        {currentView === 'directory' && <DirectoryPage onNotify={handleNotify} />}

        {currentView === 'meetings/new' && (
          <CreateMeetingPage
            onSuccess={meetingId => navigateTo('meetings/details', meetingId)}
            onCancel={() => navigateTo('dashboard')}
            onNotify={handleNotify}
          />
        )}

        {currentView === 'meetings/details' && viewParam && (
          <MeetingDetailsPage
            meetingId={viewParam}
            onBack={() => navigateTo('dashboard')}
            onOpenRsvp={token => navigateTo('rsvp', token)}
            onNotify={handleNotify}
          />
        )}
      </main>

      {/* Global Quick Test Modal */}
      <RsvpDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelectToken={token => navigateTo('rsvp', token)}
      />

      {/* Global Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Corporate Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-950">Lembaga Getah Malaysia (LGM)</span>
            <span>&bull;</span>
            <span>Sistem LGM e-Hadir v1.0</span>
          </div>
          <div className="text-slate-400">
            Hak Cipta Terpelihara &copy; 2026 Lembaga Getah Malaysia
          </div>
        </div>
      </footer>
    </div>
  );
}
