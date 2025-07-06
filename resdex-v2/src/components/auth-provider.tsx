"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Try to get cached user from localStorage to avoid flashing
  const getCachedUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    const cached = localStorage.getItem('cachedUser');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const [user, setUser] = useState<User | null>(getCachedUser());
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) {
          setIsLoading(false);
          return;
        }
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          localStorage.setItem('cachedUser', JSON.stringify(currentSession.user));
        } else {
          localStorage.removeItem('cachedUser');
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        // fail silently
      } finally {
        setIsLoading(false);
      }
    };
    getSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          localStorage.setItem('cachedUser', JSON.stringify(currentSession.user));
        } else {
          localStorage.removeItem('cachedUser');
          setSession(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    );
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}