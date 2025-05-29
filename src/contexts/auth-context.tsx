
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
  if (!email) return 'customer'; // Default to customer if email is somehow null
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
    return !!(workerProfile &&
               workerProfile.skills && workerProfile.skills.length > 0 &&
               workerProfile.bio && workerProfile.bio.trim() !== '' &&
               (workerProfile as any).address && (workerProfile as any).address.trim() !== '');
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
      const previousUser = currentUser; // Capture previous currentUser state
      const previousUserAppRole = userAppRole; // Capture previous userAppRole state
      setCurrentUser(user);

      if (user) {
        // If this 'user' is the same as the 'currentUser' we might have just set in signup/login,
        // and userAppRole was also just set, prioritize that for a moment to avoid race condition with detectUserRole.
        // This is a heuristic for new signups/logins.
        if (user.uid === previousUser?.uid && previousUserAppRole) {
          setUserAppRole(previousUserAppRole);
          setIsProfileComplete(checkProfileCompletion(user, previousUserAppRole));
        } else if (user.email) { // Ensure email exists before detection
          const detectedRole = detectUserRole(user.email);
          setUserAppRole(detectedRole);
          setIsProfileComplete(checkProfileCompletion(user, detectedRole));
        } else {
          // Fallback if user.email is null, though unlikely for email/password auth
          setUserAppRole('customer'); 
          setIsProfileComplete(checkProfileCompletion(user, 'customer'));
        }
      } else {
        setUserAppRole(null);
        setIsProfileComplete(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // currentUser and userAppRole intentionally not in deps to avoid loops, onAuthStateChanged handles updates.

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      const role = detectUserRole(email); // Detect role based on email
      setUserAppRole(role); // Set role first
      setCurrentUser(user); // Then set user (this might trigger onAuthStateChanged)
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

        // Update mock arrays first to ensure detectUserRole in onAuthStateChanged can see it
        if (role === 'customer' && !MOCK_CUSTOMERS.find(c => c.email === email)) {
            MOCK_CUSTOMERS.push({ id: userCredential.user.uid, name, email, role, address: '' } as Customer);
        } else if (role === 'worker' && !MOCK_WORKERS.find(w => w.email === email)) {
            MOCK_WORKERS.push({
                id: userCredential.user.uid, name, email, role, skills: [],
                location: { lat: 0, lng: 0 }, isVerified: false, rating: 0, bio: '', hourlyRate: 0,
                address: ''
            } as WorkerType & { address?: string });
        }
        
        // Set states for the new user directly
        setUserAppRole(role); // Role from the signup form
        setIsProfileComplete(false); // New user, profile is not complete
        setCurrentUser(userCredential.user); // This will trigger onAuthStateChanged,
                                            // which should ideally confirm or use the role just set if possible.
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
             setUserAppRole(roleToUse); 
             setIsProfileComplete(checkProfileCompletion(currentUser, roleToUse));
        } else {
            setIsProfileComplete(false); 
        }
    } else {
        setIsProfileComplete(false); 
    }
  }, [currentUser, userAppRole]);


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

