import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { services, type Session, type SignUpData } from '@/services';

type Status = 'loading' | 'signed-in' | 'signed-out';

interface AuthContextValue {
  status: Status;
  session: Session | null;
  signInWithGoogle: () => Promise<Session>;
  signUp: (data: SignUpData) => Promise<Session>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let alive = true;
    services.auth.getSession().then((s) => {
      if (!alive) return;
      setSession(s);
      setStatus(s ? 'signed-in' : 'signed-out');
    });
    return () => {
      alive = false;
    };
  }, []);

  const signedIn = useCallback((s: Session) => {
    setSession(s);
    setStatus('signed-in');
    return s;
  }, []);

  const signInWithGoogle = useCallback(
    async () => signedIn(await services.auth.signInWithGoogle()),
    [signedIn],
  );

  const signUp = useCallback(
    async (data: SignUpData) => signedIn(await services.auth.signUp(data)),
    [signedIn],
  );

  const signOut = useCallback(async () => {
    await services.auth.signOut();
    setSession(null);
    setStatus('signed-out');
  }, []);

  const value = useMemo(
    () => ({ status, session, signInWithGoogle, signUp, signOut }),
    [status, session, signInWithGoogle, signUp, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return ctx;
}
