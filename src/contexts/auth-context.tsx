
'use client';

import type { User as FirebaseUser, UserCredential } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import type { UserRole, Customer, Worker as WorkerType } from '@/lib/types';
import { MOCK_WORKERS, MOCK_CUSTOMERS } from '@/lib/constants'; // For role detection and profile completion check

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userAppRole: UserRole | null;
  isProfileComplete: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<UserCredential | void>;
  signup: (email: string, pass: string, name: string, role: UserRole) => Promise<UserCredential | void>;
  logout: () => Promise<void>;
  markProfileComplete: () => void;
  refreshAuthLoading: () => void; // To re-trigger loading state for profile check
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function for mock role detection
const detectUserRole = (email: string | null): UserRole => {
  if (!email) return 'customer';
  if (MOCK_WORKERS.some(worker => worker.email === email)) {
    return 'worker';
  }
  return 'customer'; 
};

const checkProfileCompletion = (user: FirebaseUser | null, role: UserRole | null): boolean => {
  if (!user || !role) return false;
  if (role === 'customer') {
    const customerProfile = MOCK_CUSTOMERS.find(c => c.email === user.email);
    return !!(customerProfile && customerProfile.address && customerProfile.address.trim() !== '');
  } else if (role === 'worker') {
    const workerProfile = MOCK_WORKERS.find(w => w.email === user.email);
    return !!(workerProfile && workerProfile.skills && workerProfile.skills.length > 0 && workerProfile.bio && workerProfile.bio.trim() !== '');
  }
  return false;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userAppRole, setUserAppRole] = useState<UserRole | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const refreshAuthLoading = useCallback(() => {
    setLoading(true);
     // Re-evaluate profile completion, then set loading to false
     // This timeout is to ensure state updates propagate before dependent effects run
    setTimeout(() => {
        if (auth.currentUser) {
            const role = detectUserRole(auth.currentUser.email);
            setUserAppRole(role);
            setIsProfileComplete(checkProfileCompletion(auth.currentUser, role));
        }
        setLoading(false);
    }, 50);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      setCurrentUser(user);
      if (user) {
        const role = detectUserRole(user.email);
        setUserAppRole(role);
        setIsProfileComplete(checkProfileCompletion(user, role));
      } else {
        setUserAppRole(null);
        setIsProfileComplete(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      const role = detectUserRole(email);
      setUserAppRole(role);
      setIsProfileComplete(checkProfileCompletion(user, role));
      toast({ title: "Logged In", description: "Welcome back!" });
      if (!checkProfileCompletion(user, role)) {
        router.push('/profile?new=true');
      } else {
        router.push('/dashboard');
      }
      return userCredential;
    } catch (error: any) {
      console.error("Login error:", error);
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
        // User is new, so profile is incomplete
        setUserAppRole(role);
        setIsProfileComplete(false); 
        setCurrentUser(auth.currentUser); // Update currentUser state
         // Add to mock constants if not present (for demo persistence)
        if (role === 'customer' && !MOCK_CUSTOMERS.find(c => c.email === email)) {
            MOCK_CUSTOMERS.push({ id: userCredential.user.uid, name, email, role, address: '' });
        } else if (role === 'worker' && !MOCK_WORKERS.find(w => w.email === email)) {
            MOCK_WORKERS.push({ 
                id: userCredential.user.uid, name, email, role, skills: [], 
                location: { lat: 0, lng: 0 }, isVerified: false, rating: 0, bio: '', hourlyRate: 0 
            });
        }
      }
      toast({ title: "Signup Successful", description: `Welcome, ${name}!` });
      router.push('/profile?new=true'); // Redirect to profile to complete it
      return userCredential;
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({ variant: "destructive", title: "Signup Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUserAppRole(null);
      setIsProfileComplete(false);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login'); 
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({ variant: "destructive", title: "Logout Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const markProfileComplete = useCallback(() => {
    setIsProfileComplete(true);
    // Optionally refresh user details from mock constants if they were updated
    if (currentUser) {
        const role = detectUserRole(currentUser.email);
        // This ensures that if MOCK_DATA was updated, the completion check reflects it
        setIsProfileComplete(checkProfileCompletion(currentUser, role));
    }
  }, [currentUser]);

  const value = {
    currentUser,
    userAppRole,
    isProfileComplete,
    loading,
    login,
    signup,
    logout,
    markProfileComplete,
    refreshAuthLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
