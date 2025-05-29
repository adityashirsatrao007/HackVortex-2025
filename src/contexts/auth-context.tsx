
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
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { UserRole, Customer, Worker as WorkerType } from '@/lib/types';
import { MOCK_WORKERS, MOCK_CUSTOMERS, saveWorkersToLocalStorage, saveCustomersToLocalStorage, saveUserRoleToLocalStorage, loadUserRoleFromLocalStorage, detectUserRoleFromMocks, checkProfileCompletion } from '@/lib/constants';

interface AuthState {
  currentUser: FirebaseUser | null;
  userAppRole: UserRole | null;
  isProfileComplete: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<UserCredential | void>;
  signup: (email: string, pass: string, name: string, username: string) => Promise<UserCredential | void>;
  logout: () => Promise<void>;
  markProfileComplete: () => void;
  selectUserRoleAndInitializeProfile: (role: UserRole) => Promise<void>;
  // Removed getState as it's better to rely on context values directly
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        setCurrentUser(user);
        const persistedRole = loadUserRoleFromLocalStorage(user.uid);
        const roleFromMocks = detectUserRoleFromMocks(user.email); 
        const finalRole = persistedRole || roleFromMocks;

        setUserAppRole(finalRole);
        setIsProfileComplete(checkProfileCompletion(user, finalRole));
      } else {
        setCurrentUser(null);
        setUserAppRole(null);
        setIsProfileComplete(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []); // Empty dependency array is correct here.

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle setting states and redirecting
      toast({ title: "Logged In", description: "Welcome back!" });
      // The redirect logic is now primarily handled by AppLayout based on states set by onAuthStateChanged
      return userCredential;
    } catch (error: any) {
      console.error("Login error:", error);
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
    } finally {
        // setLoading(false) will be called by onAuthStateChanged listener
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
        // User role will be null, profile incomplete. onAuthStateChanged will handle setting currentUser.
        setCurrentUser(firebaseUser); 
        setUserAppRole(null);      
        setIsProfileComplete(false); 
        // Persist the newly created user with an empty profile structure (role selected on profile page)
        // No need to add to MOCK_ arrays here YET; selectUserRoleAndInitializeProfile will do it.
      }
      toast({ title: "Signup Successful", description: `Welcome, ${name}! Please select your role and complete your profile.` });
      router.push('/profile?roleSelection=true'); 
      return userCredential;
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({ variant: "destructive", title: "Signup Failed", description: error.message });
    } finally {
      // setLoading(false) will be called by onAuthStateChanged listener
    }
  };

  const selectUserRoleAndInitializeProfile = async (role: UserRole) => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No current user found." });
      return;
    }
    
    setUserAppRole(role); 
    saveUserRoleToLocalStorage(currentUser.uid, role);

    const baseUserData = {
      id: currentUser.uid,
      name: currentUser.displayName || "New User",
      username: MOCK_CUSTOMERS.find(c => c.id === currentUser.uid)?.username || MOCK_WORKERS.find(w => w.id === currentUser.uid)?.username || currentUser.email?.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '') || `user${Date.now()}`,
      email: currentUser.email || "",
      role: role,
      avatarUrl: currentUser.photoURL || undefined,
    };

    let userExists = false;
    if (role === 'customer') {
      const existingIdx = MOCK_CUSTOMERS.findIndex(c => c.id === currentUser.uid);
      if (existingIdx === -1) {
        MOCK_CUSTOMERS.push({ ...baseUserData, address: '' } as Customer);
      } else {
        // If user already exists, ensure their role is updated if it was somehow different
        MOCK_CUSTOMERS[existingIdx] = { ...MOCK_CUSTOMERS[existingIdx], ...baseUserData, role: 'customer' };
        userExists = true;
      }
      saveCustomersToLocalStorage();
    } else if (role === 'worker') {
      const existingIdx = MOCK_WORKERS.findIndex(w => w.id === currentUser.uid);
      if (existingIdx === -1) {
        MOCK_WORKERS.push({
          ...baseUserData,
          skills: [],
          location: { lat: 0, lng: 0 }, 
          isVerified: false,
          rating: 0,
          bio: '',
          hourlyRate: 0,
          address: '', // Ensure address is initialized for workers too
          aadhaarVerified: false,
        } as WorkerType);
      } else {
        MOCK_WORKERS[existingIdx] = { ...MOCK_WORKERS[existingIdx], ...baseUserData, role: 'worker' };
        userExists = true;
      }
      saveWorkersToLocalStorage();
    }
    
    setIsProfileComplete(checkProfileCompletion(currentUser, role)); 
    toast({ title: "Role Selected", description: `You are now set as a ${role}. Please complete your details.` });
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle resetting states
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login');
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({ variant: "destructive", title: "Logout Failed", description: error.message });
      setLoading(false);
    }
  };

  const markProfileComplete = useCallback(() => {
    if (auth.currentUser) {
        const currentRole = userAppRole; 
        if (currentRole) {
             setIsProfileComplete(checkProfileCompletion(auth.currentUser, currentRole));
        } else {
            setIsProfileComplete(false);
        }
    } else {
        setIsProfileComplete(false);
    }
  }, [userAppRole]);


  const value = {
    currentUser,
    userAppRole,
    isProfileComplete,
    loading,
    login,
    signup,
    logout,
    markProfileComplete,
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
