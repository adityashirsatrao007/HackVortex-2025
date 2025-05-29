
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
import { useRouter } from 'next/navigation';
import type { UserRole, Customer, Worker as WorkerType } from '@/lib/types';
import { MOCK_WORKERS, MOCK_CUSTOMERS } from '@/lib/constants'; 

interface AuthState {
  currentUser: FirebaseUser | null;
  userAppRole: UserRole | null;
  isProfileComplete: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<UserCredential | void>;
  signup: (email: string, pass: string, name: string, role: UserRole) => Promise<UserCredential | void>;
  logout: () => Promise<void>;
  markProfileComplete: () => void;
  refreshAuthLoading: () => void; 
  // Allow direct state access for specific scenarios like profile save redirect
  getState: () => AuthState;
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
    // For workers, check string address, skills, and bio
    return !!(workerProfile &&
               (workerProfile as any).address && (workerProfile as any).address.trim() !== '' &&
               workerProfile.skills && workerProfile.skills.length > 0 &&
               workerProfile.bio && workerProfile.bio.trim() !== '');
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

  const updateAuthState = useCallback((user: FirebaseUser | null) => {
    setCurrentUser(user);
    if (user) {
      // Prioritize existing userAppRole if it was just set by login/signup
      const roleToUse = userAppRole && currentUser?.uid === user.uid ? userAppRole : detectUserRole(user.email);
      setUserAppRole(roleToUse);
      setIsProfileComplete(checkProfileCompletion(user, roleToUse));
    } else {
      setUserAppRole(null);
      setIsProfileComplete(false);
    }
    setLoading(false);
  }, [currentUser, userAppRole]); // Added dependencies


  const refreshAuthLoading = useCallback(() => {
    setLoading(true);
    setTimeout(() => { // Simulate async nature of checking profile
        if (auth.currentUser) {
            const role = userAppRole || detectUserRole(auth.currentUser.email); // Use existing role if available
            setUserAppRole(role);
            setIsProfileComplete(checkProfileCompletion(auth.currentUser, role));
        } else {
            setUserAppRole(null);
            setIsProfileComplete(false);
        }
        setLoading(false);
    }, 50);
  }, [userAppRole]); // Added userAppRole to dependencies

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      updateAuthState(user);
    });
    return () => unsubscribe();
  }, [updateAuthState]); // Use updateAuthState as dependency

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      const role = detectUserRole(email); 
      setUserAppRole(role); 
      setCurrentUser(user); 
      const profileComplete = checkProfileCompletion(user, role);
      setIsProfileComplete(profileComplete);
      
      toast({ title: "Logged In", description: "Welcome back!" });
      if (!profileComplete) {
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

        if (role === 'customer' && !MOCK_CUSTOMERS.find(c => c.email === email)) {
            MOCK_CUSTOMERS.push({ id: userCredential.user.uid, name, email, role, address: '' } as Customer);
        } else if (role === 'worker' && !MOCK_WORKERS.find(w => w.email === email)) {
            MOCK_WORKERS.push({
                id: userCredential.user.uid, name, email, role, skills: [],
                location: { lat: 0, lng: 0 }, isVerified: false, rating: 0, bio: '', hourlyRate: 0,
                address: '' // Ensure string address is initialized empty for workers for profile completion check
            } as WorkerType & { address?: string });
        }
        
        setUserAppRole(role); 
        setIsProfileComplete(false); 
        setCurrentUser(userCredential.user); 
      }
      toast({ title: "Signup Successful", description: `Welcome, ${name}!` });
      router.push('/profile?new=true'); 
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
      setCurrentUser(null);
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
    if (currentUser) {
        const roleToUse = userAppRole || detectUserRole(currentUser.email); 
        if (roleToUse) { 
             setUserAppRole(roleToUse); // Ensure role is set
             setIsProfileComplete(checkProfileCompletion(currentUser, roleToUse));
        } else {
            setIsProfileComplete(false); 
        }
    } else {
        setIsProfileComplete(false); 
    }
  }, [currentUser, userAppRole]);

  const getState = useCallback((): AuthState => ({
    currentUser,
    userAppRole,
    isProfileComplete,
    loading
  }), [currentUser, userAppRole, isProfileComplete, loading]);


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
    getState,
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
