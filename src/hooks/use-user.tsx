
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useToast } from './use-toast';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import app from '@/lib/firebase/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAppData } from './use-app-data';

type Role = 'admin' | 'employee';

interface User {
  uid: string;
  email: string | null;
  role: Role;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  generateAdminCode: () => void;
  redeemAdminCode: (code: string) => boolean;
  adminCode: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const ADMIN_EMAIL = "shahriar.ms1k@gmail.com";
const ADMIN_CODE_STORAGE_KEY = 'stockpilot-admin-code';

export function UserProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { isDbConnected } = useAppData();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminCode, setAdminCode] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const auth = getAuth(app);

  useEffect(() => {
    // If we are not connected to the DB, we are in offline mode.
    // Let's create a mock user to allow offline access.
    if (!isDbConnected) {
        setUser({
            uid: 'offline-admin-user',
            email: 'admin@offline.com',
            role: 'admin',
        });
        setIsLoading(false);
        if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
            router.replace('/dashboard');
        }
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const isUserAdmin = firebaseUser.email === ADMIN_EMAIL;
        let userRole: Role = isUserAdmin ? 'admin' : 'employee';

        // Check session storage for a role override
        const sessionRole = sessionStorage.getItem('user-role') as Role;
        if (sessionRole) {
            userRole = sessionRole;
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: userRole,
        });
        
        if (isUserAdmin) {
            const storedCode = localStorage.getItem(ADMIN_CODE_STORAGE_KEY);
            if(storedCode) {
                setAdminCode(storedCode);
            }
        }
         // If user is on login/signup page, redirect to dashboard
        if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
            router.replace('/dashboard');
        }

      } else {
        setUser(null);
        sessionStorage.removeItem('user-role');
        if (pathname !== '/login' && pathname !== '/signup') {
            router.replace('/login');
        }
      }
      setIsLoading(false);
    });

    return () => {
        if (isDbConnected) {
            unsubscribe();
        }
    };
  }, [auth, router, pathname, isDbConnected]);


  const logout = useCallback(async () => {
    if (!isDbConnected) {
        // In offline mode, "logging out" means we just clear the user state and go to login
        setUser(null);
        router.replace('/login');
        toast({ title: 'Logged Out', description: 'You have been logged out of the offline session.' });
        return;
    }
    await auth.signOut();
  }, [auth, isDbConnected, router, toast]);

  const generateAdminCode = useCallback(() => {
    if (user?.email === ADMIN_EMAIL) {
      const newCode = `ADMIN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      localStorage.setItem(ADMIN_CODE_STORAGE_KEY, newCode);
      setAdminCode(newCode);
       toast({
        title: 'Admin Code Generated',
        description: 'You can now share this persistent code with an employee.',
      });
    }
  }, [user, toast]);

  const redeemAdminCode = useCallback((code: string) => {
    const storedCode = localStorage.getItem(ADMIN_CODE_STORAGE_KEY);
    
    if (!code || code !== storedCode) {
      toast({
        variant: 'destructive',
        title: 'Invalid Code',
        description: 'The code you entered is incorrect or has expired.',
      });
      return false;
    }

    if (user && code === storedCode) {
      const updatedUser = { ...user, role: 'admin' as Role };
      setUser(updatedUser);
      sessionStorage.setItem('user-role', 'admin');
      
      localStorage.removeItem(ADMIN_CODE_STORAGE_KEY); // Invalidate the code after use
      setAdminCode(null);

      toast({
        title: 'Success!',
        description: 'You now have admin privileges for this session.',
      });
      return true;
    }
    
    return false;
  }, [user, toast]);
  
  const value = useMemo(() => ({ user, isLoading, logout, generateAdminCode, redeemAdminCode, adminCode }), [user, isLoading, logout, generateAdminCode, redeemAdminCode, adminCode]);

  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
