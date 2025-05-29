
'use client';

import type { User as FirebaseUser, UserCredential } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/lib/types';
import { MOCK_WORKERS, MOCK_CUSTOMERS } from '@/lib/constants'; // For role detection

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userAppRole: UserRole | null; // Added application-specific role
  loading: boolean;
  login: (email: string, pass: string) => Promise<UserCredential | void>;
  signup: (email: string, pass: string, name: string, role: UserRole) => Promise<UserCredential | void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function for mock role detection (replace with backend logic in real app)
const detectUserRole = (email: string | null): UserRole => {
  if (!email) return 'customer'; // Default if no email
  if (MOCK_WORKERS.some(worker => worker.email === email)) {
    return 'worker';
  }
  // if (MOCK_CUSTOMERS.some(customer => customer.email === email)) {
  //   return 'customer';
  // }
  return 'customer'; // Default to customer
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userAppRole, setUserAppRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // For existing sessions, re-detect role based on email (mock logic)
        const role = detectUserRole(user.email);
        setUserAppRole(role);
        // In a real app, you might fetch the role from Firestore here
      } else {
        setUserAppRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const role = detectUserRole(email); // Mock role detection
      setUserAppRole(role);
      toast({ title: "Logged In", description: "Welcome back!" });
      router.push('/dashboard'); 
      return userCredential;
    } catch (error: any) {
      console.error("Login error:", error);
      setUserAppRole(null);
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, pass: string, name: string, role: UserRole) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        // TODO: In a real app, save the 'role' to Firestore with user.uid as document ID
        setUserAppRole(role); // Set role based on signup form
        setCurrentUser(auth.currentUser); 
      }
      toast({ title: "Signup Successful", description: `Welcome, ${name}!` });
      router.push('/dashboard');
      return userCredential;
    } catch (error: any) {
      console.error("Signup error:", error);
      setUserAppRole(null);
      toast({ variant: "destructive", title: "Signup Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUserAppRole(null); // Clear role on logout
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login'); 
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({ variant: "destructive", title: "Logout Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    userAppRole,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
