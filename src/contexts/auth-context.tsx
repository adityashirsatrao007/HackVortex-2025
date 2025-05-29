
'use client';

import type { User as FirebaseUser, UserCredential } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider, // Added
  signInWithPopup     // Added
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { UserRole, Customer, Worker as WorkerType } from '@/lib/types';
import { MOCK_WORKERS, MOCK_CUSTOMERS, saveWorkersToLocalStorage, saveCustomersToLocalStorage } from '@/lib/constants';

interface AuthState {
  currentUser: FirebaseUser | null;
  userAppRole: UserRole | null;
  isProfileComplete: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<UserCredential | void>;
  signup: (email: string, pass: string, name: string, username: string, role: UserRole) => Promise<UserCredential | void>;
  signInWithGoogle: () => Promise<void>; // Added
  logout: () => Promise<void>;
  markProfileComplete: () => void;
  refreshAuthLoading: () => void;
  getState: () => AuthState;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const detectUserRole = (email: string | null): UserRole => {
  if (!email) return 'customer'; // Default to customer if email is somehow null
  if (MOCK_WORKERS.some(worker => worker.email === email)) {
    return 'worker';
  }
  // Check customers as well, although the default path leads here if not a worker
  if (MOCK_CUSTOMERS.some(customer => customer.email === email)) {
    return 'customer';
  }
  return 'customer'; // Default if not found in workers or customers (e.g. brand new user not yet in mocks)
};

const checkProfileCompletion = (user: FirebaseUser | null, role: UserRole | null): boolean => {
  if (!user || !role) return false;
  if (!user.email) return false; // Explicitly return false if user.email is null

  if (role === 'customer') {
    const customerProfile = MOCK_CUSTOMERS.find(c => c.email === user.email);
    return !!(customerProfile && customerProfile.address && customerProfile.address.trim() !== '');
  } else if (role === 'worker') {
    const workerProfile = MOCK_WORKERS.find(w => w.email === user.email);
    return !!(workerProfile &&
               workerProfile.address && workerProfile.address.trim() !== '' &&
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
        let role = userAppRole; 
        // Prioritize role if already set by signup/login for THIS user
        if (currentUser && currentUser.uid === user.uid && role) {
           // Role already set, trust it
        } else {
          role = detectUserRole(user.email);
        }
        
        setCurrentUser(user);
        setUserAppRole(role);
        setIsProfileComplete(checkProfileCompletion(user, role));
      } else {
        setCurrentUser(null);
        setUserAppRole(null);
        setIsProfileComplete(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []); // currentUser and userAppRole removed from deps to prevent re-runs that might overwrite just-set roles

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      const role = detectUserRole(email);
      
      setCurrentUser(user); // Update currentUser state
      setUserAppRole(role); // Update role state
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

  const signup = async (email: string, pass: string, name: string, username: string, role: UserRole) => {
    setLoading(true);
    try {
      const usernameLower = username.toLowerCase();
      const usernameExists = MOCK_WORKERS.some(w => w.username.toLowerCase() === usernameLower) ||
                             MOCK_CUSTOMERS.some(c => c.username.toLowerCase() === usernameLower);
      if (usernameExists) {
        toast({ variant: "destructive", title: "Signup Failed", description: "Username is already taken. Please choose another." });
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;

      if (firebaseUser) {
        await updateProfile(firebaseUser, { displayName: name });
        // Add to mock arrays BEFORE setting userAppRole to help onAuthStateChanged
        if (role === 'customer') {
            if (!MOCK_CUSTOMERS.find(c => c.email === email)) {
                MOCK_CUSTOMERS.push({ 
                  id: firebaseUser.uid, name, username, email, role, address: '', avatarUrl: firebaseUser.photoURL || undefined 
                } as Customer);
                saveCustomersToLocalStorage();
            }
        } else if (role === 'worker') {
            if (!MOCK_WORKERS.find(w => w.email === email)) {
                MOCK_WORKERS.push({
                    id: firebaseUser.uid, name, username, email, role, skills: [],
                    location: { lat: 0, lng: 0 }, isVerified: false, rating: 0, bio: '', hourlyRate: 0,
                    address: '', aadhaarVerified: false, avatarUrl: firebaseUser.photoURL || undefined,
                } as WorkerType);
                saveWorkersToLocalStorage();
            }
        }
        
        setCurrentUser(firebaseUser); // Update currentUser state
        setUserAppRole(role);          // Update role state
        setIsProfileComplete(false);   // New users always need to complete profile
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

  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user && user.email) {
        let role: UserRole | null = null;
        let profileComplete = false;
        
        const existingWorker = MOCK_WORKERS.find(w => w.email === user.email);
        if (existingWorker) {
          role = 'worker';
        } else {
          const existingCustomer = MOCK_CUSTOMERS.find(c => c.email === user.email);
          if (existingCustomer) {
            role = 'customer';
          }
        }

        if (role) { // User exists in our mock data
          profileComplete = checkProfileCompletion(user, role);
        } else { // New user via Google
          role = 'customer'; // Default to customer for new Google sign-ins
          const newCustomer: Customer = {
            id: user.uid,
            name: user.displayName || 'Google User',
            username: user.email.split('@')[0] || `user${Date.now()}`, // Basic username
            email: user.email,
            role: 'customer',
            address: '', // Requires completion
            avatarUrl: user.photoURL || undefined,
          };
          MOCK_CUSTOMERS.push(newCustomer);
          saveCustomersToLocalStorage();
          profileComplete = false; // New user, profile needs completion
        }
        
        setCurrentUser(user);
        setUserAppRole(role);
        setIsProfileComplete(profileComplete);

        toast({ title: "Signed In with Google", description: `Welcome, ${user.displayName || 'User'}!` });
        if (!profileComplete) {
          router.push('/profile?new=true');
        } else {
          router.push('/dashboard');
        }
      } else {
        throw new Error("Google sign-in did not return user email.");
      }
    } catch (error: any) {
      console.error("Google Sign-in error:", error);
      toast({ variant: "destructive", title: "Google Sign-in Failed", description: error.message });
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
    if (auth.currentUser) {
        const roleToUse = userAppRole || detectUserRole(auth.currentUser.email);
        setIsProfileComplete(checkProfileCompletion(auth.currentUser, roleToUse));
    } else {
        setIsProfileComplete(false);
    }
  }, [userAppRole]);

  const refreshAuthLoading = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
        if (auth.currentUser) {
            const role = userAppRole || detectUserRole(auth.currentUser.email);
            setUserAppRole(role); // ensure role is set
            setIsProfileComplete(checkProfileCompletion(auth.currentUser, role));
        } else {
            setUserAppRole(null);
            setIsProfileComplete(false);
        }
        setLoading(false);
    }, 50); // Short delay to allow other updates to potentially settle
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
    signInWithGoogle, // Added
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
