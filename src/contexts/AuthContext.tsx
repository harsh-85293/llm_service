import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';

export interface User {
  _id: string;
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
  created_at: string;
  last_login: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const data = await api.getMe();
        const userData = data.user;
        setUser({
          ...userData,
          id: userData._id,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
      api.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await api.signIn(email, password);
      const userData = data.user;
      setUser({
        ...userData,
        id: userData._id,
      });
      return { error: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { error: message };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const data = await api.signUp(email, password, name);
      const userData = data.user;
      setUser({
        ...userData,
        id: userData._id,
      });
      return { error: null };
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { error: message };
    }
  };

  const signOut = async () => {
    try {
      await api.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
