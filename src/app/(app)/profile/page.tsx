
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MOCK_WORKERS, MOCK_CUSTOMERS, SERVICE_CATEGORIES, saveCustomersToLocalStorage, saveWorkersToLocalStorage } from "@/lib/constants";
import type { UserRole, Worker, Customer, ServiceCategory } from "@/lib/types";
import { UserCircle, Edit3, Save, UserSquare2, Briefcase, BadgeCheck, ShieldAlert, Fingerprint } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ProfilePage() {
  const {
    currentUser,
    userAppRole,
    markProfileComplete,
    isProfileComplete: authContextIsProfileComplete,
    selectUserRoleAndInitializeProfile,
    loading: authLoading
  } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const needsRoleSelectionAtPageLoad = useMemo(() => {
    return searchParams.get('roleSelection') === 'true' || (!!currentUser && !userAppRole);
  }, [searchParams, userAppRole, currentUser]);

  const isNewUserCompletionFlowAtPageLoad = useMemo(() => {
    return searchParams.get('new') === 'true' && !!currentUser && !!userAppRole && !authContextIsProfileComplete;
  }, [searchParams, authContextIsProfileComplete, currentUser, userAppRole]);


  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [hourlyRateInput, setHourlyRateInput] = useState<number | string>('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://placehold.co/128x128.png');
  const [aadhaarNumberInput, setAadhaarNumberInput] = useState('');

  const [selectedRoleForUi, setSelectedRoleForUi] = useState<UserRole | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (currentUser) {
      setName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
      setAvatarUrl(currentUser.photoURL || 'https://placehold.co/128x128.png');
      
      const defaultUsername = currentUser.email?.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '') || `user${Date.now().toString().slice(-5)}`;
      setUsername(defaultUsername); // Set a default username initially

      if (userAppRole) {
        setSelectedRoleForUi(userAppRole);
        let userProfile;
        if (userAppRole === 'worker') {
          userProfile = MOCK_WORKERS.find(w => w.id === currentUser.uid);
          if (userProfile) {
            setUsername(userProfile.username || defaultUsername);
            setSkillsInput(userProfile.skills?.join(', ') || '');
            setHourlyRateInput(userProfile.hourlyRate?.toString() || '');
            setBio(userProfile.bio || '');
            setAddress(userProfile.address || '');
            setAadhaarNumberInput(userProfile.aadhaarNumber || '');
            if(userProfile.avatarUrl) setAvatarUrl(userProfile.avatarUrl);
          } else {
            // New worker profile or profile not found in mock, ensure fields are clear
            setSkillsInput('');
            setHourlyRateInput('');
            setBio('');
            setAddress('');
            setAadhaarNumberInput('');
          }
        } else if (userAppRole === 'customer') {
          userProfile = MOCK_CUSTOMERS.find(c => c.id === currentUser.uid);
          if (userProfile) {
            setUsername(userProfile.username || defaultUsername);
            setAddress(userProfile.address || '');
            if(userProfile.avatarUrl) setAvatarUrl(userProfile.avatarUrl);
          } else {
            // New customer profile or profile not found in mock
            setAddress('');
          }
        }
      } else {
         // Role not selected yet
         setSelectedRoleForUi(null);
         // Clear role-specific fields
         setAddress('');
         setSkillsInput('');
         setHourlyRateInput('');
         setBio('');
         setAadhaarNumberInput('');
      }
    }
  }, [currentUser, userAppRole, authLoading]);

  const initialRedirectCheckComplete = React.useRef(false);

  useEffect(() => {
    if (authLoading || !currentUser || initialRedirectCheckComplete.current) return;

    if (authContextIsProfileComplete && (isNewUserCompletionFlowAtPageLoad || needsRoleSelectionAtPageLoad)) {
        router.push('/dashboard');
        initialRedirectCheckComplete.current = true;
    }
  }, [authLoading, currentUser, authContextIsProfileComplete, isNewUserCompletionFlowAtPageLoad, needsRoleSelectionAtPageLoad, router]);


  const handleConfirmRole = async () => {
    if (!selectedRoleForUi || !currentUser) {
      toast({ variant: "destructive", title: "Error", description: "Please select a role." });
      return;
    }
    setIsSaving(true);
    await selectUserRoleAndInitializeProfile(selectedRoleForUi, username); // Pass username
    // After role selection, userAppRole in context updates, which should trigger the main useEffect
    // to load/clear appropriate fields. We don't need to manually clear here.
    setIsSaving(false);
    // No automatic redirect here; user needs to fill details and save.
    // The page will re-render to show appropriate fields.
  };

  const handleSaveChanges = async () => {
    if (!currentUser || !userAppRole) {
      toast({ variant: "destructive", title: "Error", description: "User role not set. Please select a role first if prompted." });
      return;
    }
    setIsSaving(true);

    let profileDataIsValid = true;
    // This validation now primarily applies when completing an initially incomplete profile.
    if (!authContextIsProfileComplete || isNewUserCompletionFlowAtPageLoad || (needsRoleSelectionAtPageLoad && userAppRole)) {
      if (!username.trim() || username.length < 3) {
        toast({ variant: "destructive", title: "Missing Information", description: "Username must be at least 3 characters." });
        profileDataIsValid = false;
      }
      if (userAppRole === 'customer') {
        if (!address.trim()) {
          toast({ variant: "destructive", title: "Missing Information", description: "Please provide your address." });
          profileDataIsValid = false;
        }
      } else if (userAppRole === 'worker') {
        const parsedSkills = skillsInput.split(',').map(s => s.trim() as ServiceCategory).filter(s => SERVICE_CATEGORIES.some(sc => sc.value === s));
        if (parsedSkills.length === 0) {
          toast({ variant: "destructive", title: "Missing Information", description: "Please enter at least one valid skill (e.g., plumber, electrician)." });
          profileDataIsValid = false;
        }
        if (!bio.trim()) {
          toast({ variant: "destructive", title: "Missing Information", description: "Please provide a bio." });
          profileDataIsValid = false;
        }
        if (!address.trim()) {
          toast({ variant: "destructive", title: "Missing Information", description: "Please provide your primary location/area (e.g., Whitefield, Bangalore)." });
          profileDataIsValid = false;
        }
      }
    }

    if (!profileDataIsValid) {
        setIsSaving(false);
        return;
    }

    const usernameLower = username.toLowerCase();
    const isUsernameTakenByOther =
        (MOCK_WORKERS.some(w => w.id !== currentUser.uid && w.username.toLowerCase() === usernameLower)) ||
        (MOCK_CUSTOMERS.some(c => c.id !== currentUser.uid && c.username.toLowerCase() === usernameLower));


    if (isUsernameTakenByOther) {
        toast({ variant: "destructive", title: "Username Taken", description: "This username is already in use. Please choose another." });
        setIsSaving(false);
        return;
    }

    if (userAppRole === 'worker') {
      const workerIdx = MOCK_WORKERS.findIndex(w => w.id === currentUser.uid);
      const parsedSkills = skillsInput.split(',').map(s => s.trim() as ServiceCategory).filter(s => SERVICE_CATEGORIES.some(sc => sc.value === s));
      const workerDataUpdate: Partial<Worker> = {
        name, username, skills: parsedSkills,
        hourlyRate: parseFloat(hourlyRateInput as string) || undefined,
        bio, avatarUrl, address, email: email || currentUser.email || '', // Ensure email is there
        aadhaarNumber: aadhaarNumberInput,
      };
      if (workerIdx > -1) {
        MOCK_WORKERS[workerIdx] = { ...MOCK_WORKERS[workerIdx], ...workerDataUpdate, role: 'worker' };
      } else {
         // This case should ideally be handled by selectUserRoleAndInitializeProfile
        console.warn("Worker profile not found in MOCK_WORKERS during save, should have been initialized.");
        // Fallback to push, though it implies an issue in initialization flow
        MOCK_WORKERS.push({
            id: currentUser.uid,
            location: { lat: 0, lng: 0 },
            isVerified: false, rating: 0, aadhaarVerified: false,
            ...workerDataUpdate,
            role: 'worker'
        } as Worker);
      }
      saveWorkersToLocalStorage();
    } else if (userAppRole === 'customer') {
      const customerIdx = MOCK_CUSTOMERS.findIndex(c => c.id === currentUser.uid);
      const customerDataUpdate: Partial<Customer> = { name, username, address, avatarUrl, email: email || currentUser.email || '' };
      if (customerIdx > -1) {
        MOCK_CUSTOMERS[customerIdx] = { ...MOCK_CUSTOMERS[customerIdx], ...customerDataUpdate, role: 'customer' };
      } else {
        // This case should ideally be handled by selectUserRoleAndInitializeProfile
        console.warn("Customer profile not found in MOCK_CUSTOMERS during save, should have been initialized.");
        MOCK_CUSTOMERS.push({ id: currentUser.uid, ...customerDataUpdate, role: 'customer' } as Customer);
      }
      saveCustomersToLocalStorage();
    }

    markProfileComplete();

    toast({
      title: "Profile Updated",
      description: "Your changes have been saved.",
    });
    setIsSaving(false);
    // Redirect logic is now handled by the useEffect listening to authContextIsProfileComplete
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading profile data...</p>
      </div>
    );
  }

  if (!currentUser) {
     // This case should ideally be handled by AppLayout redirecting to login
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <UserCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">User not found.</p>
            <p className="text-sm text-muted-foreground">You might need to log in.</p>
            <Button asChild variant="link" className="mt-2">
                <Link href="/login">Go to Login</Link>
            </Button>
        </div>
    );
  }


  if (!userAppRole) { // Equivalent to needsRoleSelectionAtPageLoad being effectively true for UI display
    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <Alert variant="default" className="bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary font-semibold">Welcome, {currentUser.displayName || "New User"}!</AlertTitle>
          <AlertDescription>
            To get started, please tell us who you are. This will help us tailor your experience.
            Your username will be: <strong>@{username}</strong>. You can change this on the next step if needed.
          </AlertDescription>
        </Alert>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Select Your Role</CardTitle>
            <CardDescription>Are you looking for services or offering them?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={selectedRoleForUi || ""} onValueChange={(value) => setSelectedRoleForUi(value as UserRole)}>
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-secondary/50 has-[[data-state=checked]]:bg-primary/10 has-[[data-state=checked]]:border-primary">
                <RadioGroupItem value="customer" id="role-customer" />
                <Label htmlFor="role-customer" className="flex-1 cursor-pointer">
                  <span className="font-semibold block">Customer</span>
                  <span className="text-sm text-muted-foreground">I'm looking to hire skilled professionals.</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-secondary/50 has-[[data-state=checked]]:bg-primary/10 has-[[data-state=checked]]:border-primary">
                <RadioGroupItem value="worker" id="role-worker" />
                <Label htmlFor="role-worker" className="flex-1 cursor-pointer">
                   <span className="font-semibold block">Artisan / Worker</span>
                   <span className="text-sm text-muted-foreground">I offer skilled services to customers.</span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter>
            <Button onClick={handleConfirmRole} disabled={!selectedRoleForUi || isSaving} className="w-full">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Role & Continue
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Role is selected, show full profile form
  const showIncompleteProfileAlert = isNewUserCompletionFlowAtPageLoad || (needsRoleSelectionAtPageLoad && userAppRole && !authContextIsProfileComplete);

  return (
    <div className="space-y-8">
      {showIncompleteProfileAlert && (
        <Alert variant="default" className="bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary font-semibold">Complete Your Profile!</AlertTitle>
          <AlertDescription>
            Welcome, {userAppRole === 'worker' ? 'Artisan/Worker' : 'Customer'}! Please fill in the details below and click "Save Changes" to get started.
          </AlertDescription>
        </Alert>
      )}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center">
            <UserCircle className="mr-3 h-8 w-8 text-primary" />
            My Profile
        </h1>
        <p className="text-muted-foreground">
          View and manage your account details. You are logged in as a <span className="capitalize font-medium">{userAppRole}</span>.
        </p>
      </div>

      <Card className="shadow-xl">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4 p-6">
          <Avatar className="h-24 w-24 border-4 border-primary/70 shadow-md">
            <AvatarImage src={avatarUrl} alt={name} data-ai-hint="person avatar"/>
            <AvatarFallback>{name ? name.substring(0, 2).toUpperCase() : 'KK'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl">{name || "Your Name"}</CardTitle>
            <CardDescription className="capitalize text-md">{userAppRole || "User"}</CardDescription>
            {username && (
              <p className="text-sm text-muted-foreground flex items-center mt-1">
                <UserSquare2 className="h-4 w-4 mr-1.5 text-primary/80" />@{username}
              </p>
            )}
            <Button variant="outline" size="sm" className="mt-3" onClick={() => toast({title: "Feature Coming Soon", description: "Avatar editing will be available later."})}>
              <Edit3 className="mr-2 h-3 w-3" /> Edit Profile Picture
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" disabled={isSaving}/>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="username_profile">Username <span className="text-destructive">*</span></Label>
                <Input
                    id="username_profile"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your unique username"
                    disabled={isSaving}
                    required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email_profile">Email Address</Label>
                <Input id="email_profile" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" title="Email is managed by your authentication provider if changed here." disabled={isSaving}/>
              </div>

              {userAppRole === 'customer' && (
                 <div className="space-y-1.5">
                    <Label htmlFor="addressCustomer">Address {(!authContextIsProfileComplete || isNewUserCompletionFlowAtPageLoad) && <span className="text-destructive">*</span>}</Label>
                    <Input id="addressCustomer" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., 123 Main St, Anytown" disabled={isSaving}/>
                </div>
              )}
               {userAppRole === 'worker' && (
                 <div className="space-y-1.5">
                    <Label htmlFor="addressWorker">Primary Location / Area (City/Area) {(!authContextIsProfileComplete || isNewUserCompletionFlowAtPageLoad) && <span className="text-destructive">*</span>}</Label>
                    <Input id="addressWorker" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., Whitefield, Bangalore" disabled={isSaving}/>
                </div>
              )}
            </div>
          </div>

          {userAppRole === 'worker' && (
            <>
            <Separator />
            <div>
                <h3 className="text-lg font-semibold mb-3 border-b pb-2 flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary"/>Worker Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-1.5">
                        <Label htmlFor="skills">Skills (comma-separated) {(!authContextIsProfileComplete || isNewUserCompletionFlowAtPageLoad) && <span className="text-destructive">*</span>}</Label>
                        <Input id="skills" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="plumber, electrician" disabled={isSaving}/>
                         <p className="text-xs text-muted-foreground pt-1">Available: {SERVICE_CATEGORIES.map(s => s.label).join(', ')}</p>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                        <Input id="hourlyRate" type="number" value={hourlyRateInput} onChange={(e) => setHourlyRateInput(e.target.value)} placeholder="e.g., 250" disabled={isSaving}/>
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                        <Label htmlFor="bio">Bio {(!authContextIsProfileComplete || isNewUserCompletionFlowAtPageLoad) && <span className="text-destructive">*</span>}</Label>
                        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell customers about yourself and your experience..." className="min-h-[100px]" disabled={isSaving}/>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="aadhaarNumber" className="flex items-center">
                            <Fingerprint className="mr-1.5 h-4 w-4 text-primary/80" /> Aadhaar Number
                        </Label>
                        <Input
                            id="aadhaarNumber"
                            value={aadhaarNumberInput}
                            onChange={(e) => setAadhaarNumberInput(e.target.value.replace(/\D/g, '').slice(0, 12))}
                            placeholder="Enter 12-digit Aadhaar"
                            maxLength={12}
                            disabled={isSaving}
                        />
                    </div>
                    <div className="flex items-center space-x-2 pt-2 md:pt-7">
                        <Switch id="aadhaarVerified" checked={(MOCK_WORKERS.find(w=>w.id === currentUser?.uid))?.aadhaarVerified || false} disabled />
                        <Label htmlFor="aadhaarVerified" className="flex items-center">
                            {(MOCK_WORKERS.find(w=>w.id === currentUser?.uid))?.aadhaarVerified ?
                                <BadgeCheck className="mr-1.5 h-4 w-4 text-green-600"/> :
                                <ShieldAlert className="mr-1.5 h-4 w-4 text-yellow-500"/>
                            }
                            Aadhaar Verified (Admin)
                        </Label>
                    </div>
                </div>
            </div>
            </>
          )}

          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-3 border-b pb-2">Account Settings</h3>
            <div className="space-y-2">
                <Button variant="outline" onClick={() => toast({title: "Feature Coming Soon"})} disabled={isSaving}>Change Password</Button>
                <Button variant="destructive" className="ml-2" onClick={() => toast({title: "Feature Coming Soon"})} disabled={isSaving}>Delete Account</Button>
            </div>
          </div>

        </CardContent>
        <CardFooter className="p-6">
            <div className="flex justify-end w-full">
                <Button onClick={handleSaveChanges} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow hover:shadow-md">
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                </Button>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
