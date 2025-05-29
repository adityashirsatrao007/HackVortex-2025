
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
  // GoogleAuthProvider, // Removed
  // signInWithPopup     // Removed
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { UserRole, Customer, Worker as WorkerType } from '@/lib/types';
import { MOCK_WORKERS, MOCK_CUSTOMERS, saveWorkersToLocalStorage, saveCustomersToLocalStorage, saveUserRoleToLocalStorage, loadUserRoleFromLocalStorage } from '@/lib/constants';

interface AuthState {
  currentUser: FirebaseUser | null;
  userAppRole: UserRole | null;
  isProfileComplete: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<UserCredential | void>;
  signup: (email: string, pass: string, name: string, username: string) => Promise<UserCredential | void>;
  // signInWithGoogle: () => Promise<void>; // Removed
  logout: () => Promise<void>;
  markProfileComplete: () => void;
  refreshAuthLoading: () => void;
  getState: () => AuthState;
  selectUserRoleAndInitializeProfile: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const detectUserRoleFromMocks = (email: string | null): UserRole | null => {
  if (!email) return null;
  if (MOCK_WORKERS.some(worker => worker.email === email)) {
    return 'worker';
  }
  if (MOCK_CUSTOMERS.some(customer => customer.email === email)) {
    return 'customer';
  }
  return null; // If not found in mocks, role is initially unknown
};

const checkProfileCompletion = (user: FirebaseUser | null, role: UserRole | null): boolean => {
  if (!user || !role) return false;
  if (!user.email) return false;

  if (role === 'customer') {
    const customerProfile = MOCK_CUSTOMERS.find(c => c.email === user.email || c.id === user.uid);
    return !!(customerProfile && customerProfile.address && customerProfile.address.trim() !== '');
  } else if (role === 'worker') {
    const workerProfile = MOCK_WORKERS.find(w => w.email === user.email || w.id === user.uid);
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
        const persistedRole = loadUserRoleFromLocalStorage(user.uid);
        const roleFromMocks = detectUserRoleFromMocks(user.email);
        
        const roleToUse = persistedRole || roleFromMocks;

        setCurrentUser(user);
        setUserAppRole(roleToUse);
        setIsProfileComplete(checkProfileCompletion(user, roleToUse));
      } else {
        setCurrentUser(null);
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
      const persistedRole = loadUserRoleFromLocalStorage(user.uid);
      const roleFromMocks = detectUserRoleFromMocks(email);
      const roleToUse = persistedRole || roleFromMocks;
      
      setCurrentUser(user);
      setUserAppRole(roleToUse);
      const profileComplete = checkProfileCompletion(user, roleToUse);
      setIsProfileComplete(profileComplete);
      
      toast({ title: "Logged In", description: "Welcome back!" });
      if (!roleToUse) { // If no role, means new user flow or incomplete old user
          router.push('/profile');
      } else if (!profileComplete) {
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

  const signup = async (email: string, pass: string, name: string, username: string) => {
    setLoading(true);
    try {
      const usernameLower = username.toLowerCase();
      const usernameExistsInWorkers = MOCK_WORKERS.some(w => w.username.toLowerCase() === usernameLower);
      const usernameExistsInCustomers = MOCK_CUSTOMERS.some(c => c.username.toLowerCase() === usernameLower);

      if (usernameExistsInWorkers || usernameExistsInCustomers) {
        toast({ variant: "destructive", title: "Signup Failed", description: "Username is already taken. Please choose another." });
        setLoading(false);
        return;
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;

      if (firebaseUser) {
        await updateProfile(firebaseUser, { displayName: name });
        setCurrentUser(firebaseUser);
        setUserAppRole(null); // Role will be set on profile page
        setIsProfileComplete(false); // New users always need to complete profile & select role
      }
      toast({ title: "Signup Successful", description: `Welcome, ${name}! Please complete your profile.` });
      router.push('/profile'); // Redirect to profile to select role & complete details
      return userCredential;
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({ variant: "destructive", title: "Signup Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const selectUserRoleAndInitializeProfile = async (role: UserRole) => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No current user found." });
      return;
    }
    setLoading(true);
    try {
      setUserAppRole(role);
      saveUserRoleToLocalStorage(currentUser.uid, role);

      const baseUserData = {
        id: currentUser.uid,
        name: currentUser.displayName || "New User",
        username: MOCK_CUSTOMERS.find(c => c.id === currentUser.uid)?.username || MOCK_WORKERS.find(w => w.id === currentUser.uid)?.username || currentUser.email?.split('@')[0] || `user${Date.now()}`,
        email: currentUser.email || "",
        role: role,
        avatarUrl: currentUser.photoURL || undefined,
      };

      if (role === 'customer') {
        if (!MOCK_CUSTOMERS.find(c => c.id === currentUser.uid)) {
          MOCK_CUSTOMERS.push({ ...baseUserData, address: '' } as Customer);
          saveCustomersToLocalStorage();
        }
      } else if (role === 'worker') {
        if (!MOCK_WORKERS.find(w => w.id === currentUser.uid)) {
          MOCK_WORKERS.push({
            ...baseUserData,
            skills: [],
            location: { lat: 0, lng: 0 }, // Default location
            isVerified: false,
            rating: 0,
            bio: '',
            hourlyRate: 0,
            address: '',
            aadhaarVerified: false,
          } as WorkerType);
          saveWorkersToLocalStorage();
        }
      }
      // Profile is not yet complete, user still needs to fill details
      setIsProfileComplete(checkProfileCompletion(currentUser, role)); 
      toast({ title: "Role Selected", description: `You are now set as a ${role}. Please complete your details.` });
    } catch (error: any) {
      console.error("Role selection error:", error);
      toast({ variant: "destructive", title: "Role Selection Failed", description: error.message });
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
        const roleToUse = userAppRole || loadUserRoleFromLocalStorage(auth.currentUser.uid) || detectUserRoleFromMocks(auth.currentUser.email);
        setIsProfileComplete(checkProfileCompletion(auth.currentUser, roleToUse));
    } else {
        setIsProfileComplete(false);
    }
  }, [userAppRole]);

  const refreshAuthLoading = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
        if (auth.currentUser) {
            const role = userAppRole || loadUserRoleFromLocalStorage(auth.currentUser.uid) || detectUserRoleFromMocks(auth.currentUser.email);
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
    // signInWithGoogle, // Removed
    logout,
    markProfileComplete,
    refreshAuthLoading,
    getState,
    selectUserRoleAndInitializeProfile,
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
