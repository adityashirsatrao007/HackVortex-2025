
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
  getState: () => AuthState;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const detectUserRole = (email: string | null): UserRole => {
  if (!email) return 'customer'; 
  if (MOCK_WORKERS.some(worker => worker.email === email)) {
    return 'worker';
  }
  return 'customer';
};

const checkProfileCompletion = (user: FirebaseUser | null, role: UserRole | null): boolean => {
  if (!user || !role) return false;
  // If email is null, profile cannot be considered complete based on mock data email matching.
  if (!user.email) return false; 

  if (role === 'customer') {
    const customerProfile = MOCK_CUSTOMERS.find(c => c.email === user.email);
    return !!(customerProfile && customerProfile.address && customerProfile.address.trim() !== '');
  } else if (role === 'worker') {
    const workerProfile = MOCK_WORKERS.find(w => w.email === user.email);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      if (user) {
        // If the user object from onAuthStateChanged is different from the current one in state,
        // or if userAppRole is not yet set, we determine the role.
        // This helps preserve a role that might have just been set by signup/login.
        let role = userAppRole; 
        if (!currentUser || currentUser.uid !== user.uid || !role) {
          role = detectUserRole(user.email);
        }
        
        setCurrentUser(user); // Set current user from Firebase
        setUserAppRole(role); // Set the role (either persisted or newly detected)
        setIsProfileComplete(checkProfileCompletion(user, role)); // Check completion
      } else {
        setCurrentUser(null);
        setUserAppRole(null);
        setIsProfileComplete(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser, userAppRole]); // Re-run if currentUser state or userAppRole state changes

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      const role = detectUserRole(email); 
      
      setCurrentUser(user); // Explicitly set current user
      setUserAppRole(role); // Explicitly set role
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
      const firebaseUser = userCredential.user;

      if (firebaseUser) {
        await updateProfile(firebaseUser, { displayName: name });

        // Add to MOCK data *before* setting local auth state reliant on this mock data
        if (role === 'customer' && !MOCK_CUSTOMERS.find(c => c.email === email)) {
            MOCK_CUSTOMERS.push({ id: firebaseUser.uid, name, email, role, address: '' } as Customer);
        } else if (role === 'worker' && !MOCK_WORKERS.find(w => w.email === email)) {
            MOCK_WORKERS.push({
                id: firebaseUser.uid, name, email, role, skills: [],
                location: { lat: 0, lng: 0 }, isVerified: false, rating: 0, bio: '', hourlyRate: 0,
                address: '' 
            } as WorkerType & { address?: string });
        }
        
        setCurrentUser(firebaseUser); // Set current user state
        setUserAppRole(role); // Set role state
        setIsProfileComplete(false); // New users always need to complete profile details
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
    if (auth.currentUser) { // Use auth.currentUser for the most definitive source
        const roleToUse = userAppRole || detectUserRole(auth.currentUser.email); 
        setUserAppRole(roleToUse); 
        setIsProfileComplete(checkProfileCompletion(auth.currentUser, roleToUse));
    } else {
        setIsProfileComplete(false); 
    }
  }, [userAppRole]); // Removed currentUser from here to rely on auth.currentUser within

  const refreshAuthLoading = useCallback(() => {
    setLoading(true);
    setTimeout(() => { 
        if (auth.currentUser) {
            const role = userAppRole || detectUserRole(auth.currentUser.email); 
            setUserAppRole(role);
            setIsProfileComplete(checkProfileCompletion(auth.currentUser, role));
        } else {
            setUserAppRole(null);
            setIsProfileComplete(false);
        }
        setLoading(false);
    }, 50);
  }, [userAppRole]); 

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

