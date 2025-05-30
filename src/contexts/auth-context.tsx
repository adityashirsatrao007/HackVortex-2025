
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
import { useRouter } from 'next/navigation'; // Import useRouter
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
  selectUserRoleAndInitializeProfile: (role: UserRole, usernameFromProfileInput: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userAppRole, setUserAppRole] = useState<UserRole | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(true); 
      try {
        if (user) {
          setCurrentUser(user);
          const persistedRole = loadUserRoleFromLocalStorage(user.uid);
          // If userAppRole is already set (e.g., by selectUserRoleAndInitializeProfile), don't immediately override with detection.
          // Detection is more for initial load or if persistedRole is null.
          const roleToSet = userAppRole && currentUser?.uid === user.uid ? userAppRole : (persistedRole || detectUserRoleFromMocks(user.email));
          
          setUserAppRole(roleToSet);
          setIsProfileComplete(checkProfileCompletion(user, roleToSet));
        } else {
          setCurrentUser(null);
          setUserAppRole(null);
          setIsProfileComplete(false);
        }
      } catch (e) {
        console.error("KarigarKart: Critical Error during onAuthStateChanged processing:", e);
        setCurrentUser(null);
        setUserAppRole(null);
        setIsProfileComplete(false);
      } finally {
        setLoading(false); 
      }
    });
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // currentUser and userAppRole removed to avoid re-triggering loops; focus on Firebase auth changes.

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will process user details and set loading to false.
      // For better UX, navigate immediately. AppLayout will handle profile completion checks.
      router.push('/dashboard'); 
      toast({ title: "Logged In", description: "Welcome back!" });
      return userCredential;
    } catch (error: any) {
      console.error("Login error:", error);
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
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
        
        // Set basic state for immediate UI update
        setCurrentUser(firebaseUser); 
        setUserAppRole(null); // Role will be selected on profile page
        setIsProfileComplete(false); // Profile is incomplete until role and details are filled
        
        // No direct mock data modification here, will be handled by selectUserRoleAndInitializeProfile
      }
      toast({ title: "Signup Successful", description: `Welcome, ${name}! Please select your role and complete your profile.` });
      router.push('/profile?roleSelection=true');
      // onAuthStateChanged will also fire and set loading to false.
      return userCredential;
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({ variant: "destructive", title: "Signup Failed", description: error.message });
      setLoading(false); 
    }
  };

  const selectUserRoleAndInitializeProfile = async (role: UserRole, usernameFromProfileInput: string) => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No current user found." });
      return;
    }
    
    setUserAppRole(role); 
    saveUserRoleToLocalStorage(currentUser.uid, role);

    const finalUsername = usernameFromProfileInput || currentUser.email?.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '') || `user${Date.now().toString().slice(-5)}`;

    const baseUserData = {
      id: currentUser.uid,
      name: currentUser.displayName || "New User",
      username: finalUsername,
      email: currentUser.email || "",
      role: role,
      avatarUrl: currentUser.photoURL || undefined,
    };

    let userExistsInMocks = false;
    if (role === 'customer') {
      const existingIdx = MOCK_CUSTOMERS.findIndex(c => c.id === currentUser.uid);
      if (existingIdx === -1) {
        MOCK_CUSTOMERS.push({ ...baseUserData, address: '' } as Customer);
      } else {
        MOCK_CUSTOMERS[existingIdx] = { ...MOCK_CUSTOMERS[existingIdx], ...baseUserData, username: finalUsername, role: 'customer' };
        userExistsInMocks = true;
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
          address: '',
          aadhaarVerified: false,
          aadhaarNumber: '',
        } as WorkerType);
      } else {
        MOCK_WORKERS[existingIdx] = { ...MOCK_WORKERS[existingIdx], ...baseUserData, username: finalUsername, role: 'worker' };
        userExistsInMocks = true;
      }
      saveWorkersToLocalStorage();
    }
    
    // Profile is still incomplete after role selection; user needs to fill details
    setIsProfileComplete(false); 
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle resetting states and then setting setLoading(false)
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login');
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({ variant: "destructive", title: "Logout Failed", description: error.message });
      setLoading(false); 
    }
  };

  const markProfileComplete = useCallback(() => {
    if (auth.currentUser && userAppRole) { 
        setIsProfileComplete(checkProfileCompletion(auth.currentUser, userAppRole));
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
