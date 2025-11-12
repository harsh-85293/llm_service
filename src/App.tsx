import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthForm } from './components/AuthForm';
import { UserPortal } from './components/UserPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { Header } from './components/Header';
import { TicketService } from './services/ticketService';
import { } from 'lucide-react';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { HelpCenter } from './components/HelpCenter';
import { CommunityGuidelines } from './components/CommunityGuidelines';
import { ContactUs } from './components/ContactUs';

function AppContent() {
  const { user, loading, signIn, signUp } = useAuth();
  const [ticketService, setTicketService] = useState<TicketService | null>(null);
  const [page, setPage] = useState<string>('');

  useEffect(() => {
    setTicketService(new TicketService());
  }, []);

  useEffect(() => {
    const updatePage = () => setPage(window.location.hash.replace('#', ''));
    updatePage();
    window.addEventListener('hashchange', updatePage);
    return () => window.removeEventListener('hashchange', updatePage);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (page === 'privacy') return <PrivacyPolicy />;
  if (page === 'terms') return <TermsOfService />;
  if (page === 'help') return <HelpCenter />;
  if (page === 'guidelines') return <CommunityGuidelines />;
  if (page === 'contact') return <ContactUs />;

  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} />;
  }

  if (!ticketService) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header showLogout={true} />
      {user.role === 'admin' || user.role === 'super_admin' ? (
        <AdminDashboard ticketService={ticketService} />
      ) : (
        <UserPortal userId={user.id} userName={user.name} ticketService={ticketService} />
      )}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
