
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
  const { currentUser, userAppRole, markProfileComplete, refreshAuthLoading } = useAuth(); 
  const { toast } = useToast(); 
  const searchParams = useSearchParams();
  const router = useRouter();
  const isNewUser = searchParams.get('new') === 'true';

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
          setAddress(existingWorker.location ? `${existingWorker.location.lat}, ${existingWorker.location.lng}` : ''); // Or a more user-friendly address
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
      const workerData: Partial<Worker> = {
        name,
        // email, // Email update usually handled by Firebase Auth methods separately
        skills: skillsInput.split(',').map(s => s.trim() as ServiceCategory).filter(s => s),
        hourlyRate: parseFloat(hourlyRateInput as string) || 0,
        bio,
        // For location, simple address string. Geocoding would be needed for lat/lng
        // For now, we'll just store the address string as a location preview or part of bio for simplicity
      };
      if (workerIdx > -1) {
        MOCK_WORKERS[workerIdx] = { ...MOCK_WORKERS[workerIdx], ...workerData, name, avatarUrl };
      } else {
        // This case should ideally be handled at signup, but as a fallback:
        MOCK_WORKERS.push({
          id: currentUser.uid,
          email: currentUser.email || '',
          role: 'worker',
          location: { lat: 0, lng: 0 }, // Default location
          isVerified: false, rating: 0, totalJobs: 0,
          ...workerData,
          name,
          avatarUrl,
        } as Worker);
      }
    } else if (userAppRole === 'customer') {
      const customerIdx = MOCK_CUSTOMERS.findIndex(c => c.email === currentUser.email);
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
    
    markProfileComplete(); // Notify AuthContext
    refreshAuthLoading(); // Re-trigger loading in AuthContext to re-evaluate profile completion

    toast({
      title: "Profile Updated",
      description: "Your changes have been saved (mock persistence).",
    });

    if (isNewUser) {
        router.push('/dashboard'); // Navigate to dashboard after initial profile setup
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
            <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl">{name || "Your Name"}</CardTitle>
            <CardDescription className="capitalize">{userAppRole}</CardDescription>
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
                <Input id="email" type="email" value={email} readOnly className="bg-muted/30 cursor-not-allowed" title="Email is managed by your authentication provider." />
              </div>
              
              {userAppRole === 'customer' && (
                 <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., 123 Main St, Anytown"/>
                </div>
              )}
               {userAppRole === 'worker' && ( 
                 <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="addressWorker">Primary Location (City/Area)</Label>
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
                        <Label htmlFor="skills">Skills (comma-separated)</Label>
                        <Input id="skills" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="e.g., plumber, electrician" />
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
                        <Switch id="availability" checked={(MOCK_WORKERS.find(w=>w.email === currentUser.email))?.isVerified || false} disabled />
                        <Label htmlFor="availability">Profile Verified (Admin)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="aadhaarVerified" checked={(MOCK_WORKERS.find(w=>w.email === currentUser.email))?.aadhaarVerified || false} disabled />
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
