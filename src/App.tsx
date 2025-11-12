import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthForm } from './components/AuthForm';
import { UserPortal } from './components/UserPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { Header } from './components/Header';
import { TicketService } from './services/ticketService';
import { LogOut, Shield } from 'lucide-react';

function AppContent() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [ticketService, setTicketService] = useState<TicketService | null>(null);

  useEffect(() => {
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY || 'your_openai_api_key_here';

    if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
      setTicketService(new TicketService(openaiKey));
    }
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

  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} />;
  }

  if (!ticketService) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center bg-yellow-100 p-4 rounded-full mb-4">
              <Shield className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Configuration Required</h2>
            <p className="text-gray-600 mb-6">
              Please add your OpenAI API key to the .env file to enable AI-powered features.
            </p>
            <code className="block bg-gray-100 p-3 rounded text-sm text-left mb-6">
              VITE_OPENAI_API_KEY=your_key_here
            </code>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
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
