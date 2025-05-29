
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
  getState: () => AuthState;
  selectUserRoleAndInitializeProfile: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userAppRole, setUserAppRole] = useState<UserRole | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [loading, setLoading] = useState(true); // Start with loading true
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(true); // Set loading true at the start of any auth state change
      if (user) {
        setCurrentUser(user);
        const persistedRole = loadUserRoleFromLocalStorage(user.uid);
        const roleFromMocks = detectUserRoleFromMocks(user.email);
        const finalRole = persistedRole || roleFromMocks; // This can be null for a brand new user

        setUserAppRole(finalRole);
        setIsProfileComplete(checkProfileCompletion(user, finalRole));
      } else {
        setCurrentUser(null);
        setUserAppRole(null);
        setIsProfileComplete(false);
      }
      setLoading(false); // Set loading false after all processing
    });
    return () => unsubscribe();
  }, []); // Empty dependency array is correct here

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      const persistedRole = loadUserRoleFromLocalStorage(user.uid);
      const roleFromMocks = detectUserRoleFromMocks(email);
      const roleToUse = persistedRole || roleFromMocks;
      
      setCurrentUser(user); // This will trigger onAuthStateChanged or its effects
      setUserAppRole(roleToUse);
      const profileComplete = checkProfileCompletion(user, roleToUse);
      setIsProfileComplete(profileComplete);
      
      toast({ title: "Logged In", description: "Welcome back!" });
      if (!roleToUse) {
          router.push('/profile?roleSelection=true');
      } else if (!profileComplete) {
        router.push('/profile?new=true');
      } else {
        router.push('/dashboard');
      }
      return userCredential;
    } catch (error: any) {
      console.error("Login error:", error);
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
      setLoading(false); // Ensure loading is false on error
    } 
    // setLoading(false) is called by onAuthStateChanged after setCurrentUser
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
        // No need to add to MOCK_ arrays here; that happens in selectUserRoleAndInitializeProfile.
        setCurrentUser(firebaseUser); // Triggers onAuthStateChanged
        setUserAppRole(null);      // Explicitly set role to null for new signup
        setIsProfileComplete(false); // New users always need to complete profile
      }
      toast({ title: "Signup Successful", description: `Welcome, ${name}! Please select your role and complete your profile.` });
      router.push('/profile?roleSelection=true'); 
      return userCredential;
    } catch (error: any)      { // Fixed missing brace
      console.error("Signup error:", error);
      toast({ variant: "destructive", title: "Signup Failed", description: error.message });
      setLoading(false); // Ensure loading is false on error
    }
    // setLoading(false) is called by onAuthStateChanged after setCurrentUser
  };

  const selectUserRoleAndInitializeProfile = async (role: UserRole) => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "No current user found." });
      return;
    }
    // This function does not manage global loading state; it's an update to an existing session.
    try {
      setUserAppRole(role); // This will trigger re-renders in components listening to userAppRole
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
            address: '',
            aadhaarVerified: false,
          } as WorkerType);
        } else {
          MOCK_WORKERS[existingIdx] = { ...MOCK_WORKERS[existingIdx], ...baseUserData, role: 'worker' };
          userExists = true;
        }
        saveWorkersToLocalStorage();
      }
      
      // Profile is not yet complete just by selecting a role; user needs to fill details.
      // checkProfileCompletion will be false here unless they had a pre-existing complete profile for that role.
      setIsProfileComplete(checkProfileCompletion(currentUser, role)); 
      toast({ title: "Role Selected", description: `You are now set as a ${role}. Please complete your details.` });
    } catch (error: any) {
      console.error("Role selection error:", error);
      toast({ variant: "destructive", title: "Role Selection Failed", description: error.message });
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle setting currentUser, userAppRole, isProfileComplete to null/false
      // and setLoading to false.
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login');
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({ variant: "destructive", title: "Logout Failed", description: error.message });
      setLoading(false); // Ensure loading is false on error
    }
  };

  const markProfileComplete = useCallback(() => {
    // This function re-evaluates profile completeness. It does not manage global loading.
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


  const getState = (): AuthState => ({
    currentUser,
    userAppRole,
    isProfileComplete,
    loading
  });


  const value = {
    currentUser,
    userAppRole,
    isProfileComplete,
    loading,
    login,
    signup,
    logout,
    markProfileComplete,
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
