
'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MOCK_WORKERS, MOCK_CUSTOMERS, SERVICE_CATEGORIES } from "@/lib/constants";
import type { User, Worker, Customer, ServiceCategory } from "@/lib/types";
import { UserCircle, Edit3, Save, UserSquare2 } from "lucide-react"; 
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast"; 
import { useAuth } from '@/hooks/use-auth'; 
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { currentUser, userAppRole, markProfileComplete, refreshAuthLoading, isProfileComplete } = useAuth(); 
  const { toast } = useToast(); 
  const searchParams = useSearchParams();
  const router = useRouter();
  const isNewUserFlow = searchParams.get('new') === 'true' && !isProfileComplete;

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [hourlyRateInput, setHourlyRateInput] = useState<number | string>('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://placehold.co/128x128.png');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
      setAvatarUrl(currentUser.photoURL || 'https://placehold.co/128x128.png');

      if (userAppRole === 'worker') {
        const existingWorker = MOCK_WORKERS.find(w => w.email === currentUser.email);
        if (existingWorker) {
          setUsername(existingWorker.username || '');
          setSkillsInput(existingWorker.skills?.join(', ') || '');
          setHourlyRateInput(existingWorker.hourlyRate?.toString() || '');
          setBio(existingWorker.bio || '');
          setAddress((existingWorker as any).address || '');
          if(existingWorker.avatarUrl) setAvatarUrl(existingWorker.avatarUrl);
        } else {
          // New worker, some fields may have been set by signup context
          const tempWorker = MOCK_WORKERS.find(w => w.id === currentUser.uid);
          setUsername(tempWorker?.username || '');
          setSkillsInput('');
          setHourlyRateInput('');
          setBio('');
          setAddress('');
        }
      } else if (userAppRole === 'customer') {
        const existingCustomer = MOCK_CUSTOMERS.find(c => c.email === currentUser.email);
        if (existingCustomer) {
          setUsername(existingCustomer.username || '');
          setAddress(existingCustomer.address || '');
          if(existingCustomer.avatarUrl) setAvatarUrl(existingCustomer.avatarUrl);
        } else {
          // New customer
          const tempCustomer = MOCK_CUSTOMERS.find(c => c.id === currentUser.uid);
          setUsername(tempCustomer?.username || '');
          setAddress('');
        }
      }
    }
  }, [currentUser, userAppRole]);

  const handleSaveChanges = () => {
    if (!currentUser || !userAppRole) return;

    if (isNewUserFlow || !isProfileComplete) {
      if (userAppRole === 'customer') {
        if (!address.trim()) {
          toast({ variant: "destructive", title: "Missing Information", description: "Please provide your address." });
          return;
        }
      } else if (userAppRole === 'worker') {
        const parsedSkills = skillsInput.split(',').map(s => s.trim() as ServiceCategory).filter(s => SERVICE_CATEGORIES.some(sc => sc.value === s));
        if (parsedSkills.length === 0) {
          toast({ variant: "destructive", title: "Missing Information", description: "Please enter at least one valid skill (e.g., plumber, electrician)." });
          return;
        }
        if (!bio.trim()) {
          toast({ variant: "destructive", title: "Missing Information", description: "Please provide a bio." });
          return;
        }
        if (!address.trim()) {
          toast({ variant: "destructive", title: "Missing Information", description: "Please provide your primary location/area (e.g., Whitefield, Bangalore)." });
          return;
        }
      }
    }

    if (userAppRole === 'worker') {
      const workerIdx = MOCK_WORKERS.findIndex(w => w.email === currentUser.email);
      const parsedSkills = skillsInput.split(',').map(s => s.trim() as ServiceCategory).filter(s => SERVICE_CATEGORIES.some(sc => sc.value === s));
      
      const workerData: Partial<Worker> = {
        name,
        username, // Ensure username is part of the update, though it's read-only here after signup
        skills: parsedSkills,
        hourlyRate: parseFloat(hourlyRateInput as string) || 0,
        bio,
        avatarUrl,
      };

      if (workerIdx > -1) {
        MOCK_WORKERS[workerIdx] = { 
            ...MOCK_WORKERS[workerIdx], 
            ...workerData,
            location: MOCK_WORKERS[workerIdx].location || { lat: 0, lng: 0 },
        };
        (MOCK_WORKERS[workerIdx] as any).address = address;
      } else {
        // This case should ideally be handled by signup, but as a fallback:
        MOCK_WORKERS.push({
          id: currentUser.uid,
          email: currentUser.email || '',
          role: 'worker',
          location: { lat: 0, lng: 0 }, 
          isVerified: false, rating: 0, totalJobs: 0,
          aadhaarVerified: false,
          ...workerData,
          username: username || currentUser.uid, // fallback for username
          address: address,
        } as Worker & { address?: string }); 
      }
    } else if (userAppRole === 'customer') {
      const customerIdx = MOCK_CUSTOMERS.findIndex(c => c.email === currentUser.email);
      const customerData: Partial<Customer> = { name, username, address, avatarUrl };
      if (customerIdx > -1) {
        MOCK_CUSTOMERS[customerIdx] = { ...MOCK_CUSTOMERS[customerIdx], ...customerData };
      } else {
        MOCK_CUSTOMERS.push({
          id: currentUser.uid,
          email: currentUser.email || '',
          role: 'customer',
          username: username || currentUser.uid, // fallback for username
          ...customerData
        } as Customer);
      }
    }
    
    const wasProfileIncomplete = !isProfileComplete;
    markProfileComplete(); 
    refreshAuthLoading(); 

    toast({
      title: "Profile Updated",
      description: "Your changes have been saved (mock persistence).",
    });

    if (wasProfileIncomplete) {
        setTimeout(() => {
            const updatedIsProfileComplete = (useAuth.getState && useAuth.getState().isProfileComplete) || 
                                             (userAppRole === 'customer' ? !!address.trim() : 
                                              !!(skillsInput.split(',').map(s => s.trim()).filter(Boolean).length > 0 && bio.trim() && address.trim()));
            if (updatedIsProfileComplete) {
                router.push('/dashboard');
            }
        }, 100);
    }
  };

  if (!currentUser || !userAppRole) {
    return <p className="text-center py-10">Loading profile...</p>; 
  }

  return (
    <div className="space-y-8">
      {isNewUserFlow && (
        <Alert variant="default" className="bg-primary/10 border-primary/30 dark:bg-primary/20 dark:border-primary/40">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary font-semibold">Welcome to Karigar Kart!</AlertTitle>
          <AlertDescription>
            Please complete your profile to get started. Fill in the details below and click "Save Changes".
          </AlertDescription>
        </Alert>
      )}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center">
            <UserCircle className="mr-3 h-8 w-8 text-primary" />
            My Profile
        </h1>
        <p className="text-muted-foreground">
          View and manage your account details. You are logged in as a {userAppRole}.
        </p>
      </div>

      <Card className="shadow-xl">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4 p-6">
          <Avatar className="h-24 w-24 border-4 border-primary/70 shadow-md">
            <AvatarImage src={avatarUrl} alt={name} data-ai-hint="person avatar" />
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
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name"/>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="username_display">Username (Read-only)</Label>
                <Input id="username_display" value={username} readOnly className="bg-muted/30 cursor-not-allowed" title="Username cannot be changed after signup."/>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" title="Email is managed by your authentication provider if changed here." />
              </div>
              
              {userAppRole === 'customer' && (
                 <div className="space-y-1.5">
                    <Label htmlFor="addressCustomer">Address</Label>
                    <Input id="addressCustomer" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., 123 Main St, Anytown"/>
                </div>
              )}
               {userAppRole === 'worker' && ( 
                 <div className="space-y-1.5">
                    <Label htmlFor="addressWorker">Primary Location / Area (City/Area)</Label>
                    <Input id="addressWorker" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., Whitefield, Bangalore (This helps customers find you)" />
                </div>
              )}
            </div>
          </div>

          {userAppRole === 'worker' && (
            <>
            <Separator />
            <div>
                <h3 className="text-lg font-semibold mb-3 border-b pb-2">Worker Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-1.5">
                        <Label htmlFor="skills">Skills (comma-separated)</Label>
                        <Input id="skills" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="plumber, electrician" />
                         <p className="text-xs text-muted-foreground pt-1">Available: {SERVICE_CATEGORIES.map(s => s.label).join(', ')}</p>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                        <Input id="hourlyRate" type="number" value={hourlyRateInput} onChange={(e) => setHourlyRateInput(e.target.value)} placeholder="e.g., 250" />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell customers about yourself and your experience (e.g., years of experience, specializations)." className="min-h-[100px]"/>
                    </div>
                     <div className="flex items-center space-x-2 pt-2">
                        <Switch id="availability" checked={(MOCK_WORKERS.find(w=>w.email === currentUser?.email))?.isVerified || false} disabled />
                        <Label htmlFor="availability">Profile Verified (Admin)</Label>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                        <Switch id="aadhaarVerified" checked={(MOCK_WORKERS.find(w=>w.email === currentUser?.email))?.aadhaarVerified || false} disabled />
                        <Label htmlFor="aadhaarVerified">Aadhaar Verified (Admin)</Label>
                    </div>
                </div>
            </div>
            </>
          )}

          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-3 border-b pb-2">Account Settings</h3>
            <div className="space-y-2">
                <Button variant="outline" onClick={() => toast({title: "Feature Coming Soon"})}>Change Password</Button>
                <Button variant="destructive" className="ml-2" onClick={() => toast({title: "Feature Coming Soon"})}>Delete Account</Button>
            </div>
          </div>

        </CardContent>
        <CardFooter className="p-6">
            <div className="flex justify-end w-full">
                <Button onClick={handleSaveChanges} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow hover:shadow-md">
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
