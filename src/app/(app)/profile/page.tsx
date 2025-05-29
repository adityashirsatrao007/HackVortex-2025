
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
import { UserCircle, Edit3, Save } from "lucide-react"; 
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
  const isNewUser = searchParams.get('new') === 'true' && !isProfileComplete;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState(''); // Customer specific
  const [skillsInput, setSkillsInput] = useState(''); // Worker specific
  const [hourlyRateInput, setHourlyRateInput] = useState<number | string>(''); // Worker specific
  const [bio, setBio] = useState(''); // Worker specific
  const [avatarUrl, setAvatarUrl] = useState('https://placehold.co/128x128.png'); // Default placeholder

  // Initial data load from currentUser and Mocks
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
      setAvatarUrl(currentUser.photoURL || 'https://placehold.co/128x128.png');

      if (userAppRole === 'worker') {
        const existingWorker = MOCK_WORKERS.find(w => w.email === currentUser.email);
        if (existingWorker) {
          setSkillsInput(existingWorker.skills?.join(', ') || '');
          setHourlyRateInput(existingWorker.hourlyRate?.toString() || '');
          setBio(existingWorker.bio || '');
          // For worker, address can be their primary service area string
          setAddress(existingWorker.location ? `${existingWorker.location.lat}, ${existingWorker.location.lng}` : (existingWorker as any).address || '');
          if(existingWorker.avatarUrl) setAvatarUrl(existingWorker.avatarUrl);
        } else {
          // New worker, fields remain empty or default
          setSkillsInput('');
          setHourlyRateInput('');
          setBio('');
          setAddress('');
        }
      } else if (userAppRole === 'customer') {
        const existingCustomer = MOCK_CUSTOMERS.find(c => c.email === currentUser.email);
        if (existingCustomer) {
          setAddress(existingCustomer.address || '');
           if(existingCustomer.avatarUrl) setAvatarUrl(existingCustomer.avatarUrl);
        } else {
          // New customer
          setAddress('');
        }
      }
    }
  }, [currentUser, userAppRole]);

  const handleSaveChanges = () => {
    if (!currentUser || !userAppRole) return;

    // Update MOCK data (simulating DB save)
    if (userAppRole === 'worker') {
      const workerIdx = MOCK_WORKERS.findIndex(w => w.email === currentUser.email);
      const parsedSkills = skillsInput.split(',').map(s => s.trim() as ServiceCategory).filter(s => SERVICE_CATEGORIES.some(sc => sc.value === s));
      
      // Basic validation for worker fields if it's a new profile submission
      if (isNewUser || !isProfileComplete) {
        if (parsedSkills.length === 0) {
          toast({ variant: "destructive", title: "Missing Information", description: "Please enter at least one valid skill." });
          return;
        }
        if (!bio.trim()) {
          toast({ variant: "destructive", title: "Missing Information", description: "Please provide a bio." });
          return;
        }
         if (!address.trim()) {
          toast({ variant: "destructive", title: "Missing Information", description: "Please provide your primary location/area." });
          return;
        }
      }

      const workerData: Partial<Worker> = {
        name,
        skills: parsedSkills,
        hourlyRate: parseFloat(hourlyRateInput as string) || 0,
        bio,
        // For location, we'll treat the address string as a placeholder for location.
        // In a real app, this would involve geocoding to get lat/lng.
        // For now, let's store it as a simple string in MOCK_WORKERS if it's not already an object.
        // This part is a bit tricky with mock data, we assume 'address' field can be used for location string for now.
      };

      if (workerIdx > -1) {
        MOCK_WORKERS[workerIdx] = { 
            ...MOCK_WORKERS[workerIdx], 
            ...workerData, 
            name, 
            avatarUrl, 
            // If location was an object, keep it, otherwise update with address string as a simple text location
            // This logic is simplified for mock data.
            location: typeof MOCK_WORKERS[workerIdx].location === 'object' ? MOCK_WORKERS[workerIdx].location : { lat:0, lng:0 } // Placeholder for actual geocoded location
        };
        // If address was meant to be textual location, update it on the worker object directly
        // This is a mock data handling strategy.
        (MOCK_WORKERS[workerIdx] as any).address = address; 
      } else {
        MOCK_WORKERS.push({
          id: currentUser.uid,
          email: currentUser.email || '',
          role: 'worker',
          location: { lat: 0, lng: 0 }, // Default/placeholder location for new worker
          isVerified: false, rating: 0, totalJobs: 0,
          ...workerData,
          name,
          avatarUrl,
          address: address, // Storing the address string for new workers
        } as Worker & { address?: string }); // Extend type for mock
      }
    } else if (userAppRole === 'customer') {
      const customerIdx = MOCK_CUSTOMERS.findIndex(c => c.email === currentUser.email);

      if ((isNewUser || !isProfileComplete) && !address.trim()) {
        toast({ variant: "destructive", title: "Missing Information", description: "Please provide your address." });
        return;
      }

      const customerData: Partial<Customer> = { name, address, avatarUrl };
      if (customerIdx > -1) {
        MOCK_CUSTOMERS[customerIdx] = { ...MOCK_CUSTOMERS[customerIdx], ...customerData };
      } else {
        MOCK_CUSTOMERS.push({
          id: currentUser.uid,
          email: currentUser.email || '',
          role: 'customer',
          ...customerData
        } as Customer);
      }
    }
    
    markProfileComplete(); 
    refreshAuthLoading(); 

    toast({
      title: "Profile Updated",
      description: "Your changes have been saved (mock persistence).",
    });

    if (isNewUser || !isProfileComplete) { // Check against AuthContext's isProfileComplete as well
        router.push('/dashboard'); 
    }
  };

  if (!currentUser || !userAppRole) {
    return <p className="text-center py-10">Loading profile...</p>; 
  }

  return (
    <div className="space-y-8">
      {isNewUser && (
        <Alert variant="default" className="bg-primary/10 border-primary/30">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">Welcome to Karigar Kart!</AlertTitle>
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

      <Card className="shadow-lg">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={avatarUrl} alt={name} data-ai-hint="person avatar" />
            <AvatarFallback>{name ? name.substring(0, 2).toUpperCase() : 'KK'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl">{name || "Your Name"}</CardTitle>
            <CardDescription className="capitalize">{userAppRole || "User"}</CardDescription>
            {/* Avatar editing can be complex, placeholder for now */}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => toast({title: "Feature Coming Soon", description: "Avatar editing will be available later."})}>
              <Edit3 className="mr-2 h-3 w-3" /> Edit Profile Picture
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name"/>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" title="Email is managed by your authentication provider if changed here." />
              </div>
              
              {userAppRole === 'customer' && (
                 <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="addressCustomer">Address</Label>
                    <Input id="addressCustomer" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., 123 Main St, Anytown"/>
                </div>
              )}
               {userAppRole === 'worker' && ( 
                 <div className="space-y-1 md:col-span-2">
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
                <h3 className="text-lg font-semibold mb-2">Worker Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <Label htmlFor="skills">Skills (comma-separated, e.g., plumber, electrician)</Label>
                        <Input id="skills" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="plumber, electrician" />
                         <p className="text-xs text-muted-foreground">Available: {SERVICE_CATEGORIES.map(s => s.label).join(', ')}</p>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                        <Input id="hourlyRate" type="number" value={hourlyRateInput} onChange={(e) => setHourlyRateInput(e.target.value)} placeholder="e.g., 250" />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell customers about yourself and your experience (e.g., years of experience, specializations)." className="min-h-[80px]"/>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="availability" checked={(MOCK_WORKERS.find(w=>w.email === currentUser?.email))?.isVerified || false} disabled />
                        <Label htmlFor="availability">Profile Verified (Admin)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="aadhaarVerified" checked={(MOCK_WORKERS.find(w=>w.email === currentUser?.email))?.aadhaarVerified || false} disabled />
                        <Label htmlFor="aadhaarVerified">Aadhaar Verified (Admin)</Label>
                    </div>
                </div>
            </div>
            </>
          )}

          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
            <div className="space-y-2">
                <Button variant="outline" onClick={() => toast({title: "Feature Coming Soon"})}>Change Password</Button>
                <Button variant="destructive" className="ml-2" onClick={() => toast({title: "Feature Coming Soon"})}>Delete Account</Button>
            </div>
          </div>

        </CardContent>
        <CardFooter>
            <div className="flex justify-end w-full">
                <Button onClick={handleSaveChanges} className="bg-primary hover:bg-primary/90">
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}

