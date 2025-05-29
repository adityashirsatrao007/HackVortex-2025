
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

export default function ProfilePage() {
  const { currentUser, userAppRole } = useAuth(); 
  const { toast } = useToast(); 

  // State for the user profile data being displayed/edited
  const [profileData, setProfileData] = useState<Partial<User>>({});
  
  // Form field states, derived from profileData
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // Email is from currentUser, but can be part of form
  const [address, setAddress] = useState(''); // Customer specific
  const [skillsInput, setSkillsInput] = useState(''); // Worker specific
  const [hourlyRateInput, setHourlyRateInput] = useState<number | string>(''); // Worker specific
  const [bio, setBio] = useState(''); // Worker specific

  useEffect(() => {
    if (currentUser) {
      let baseProfile: Partial<User> = {
        id: currentUser.uid,
        name: currentUser.displayName || '',
        email: currentUser.email || '',
        role: userAppRole || 'customer', // Default to customer if role not yet set
      };

      if (userAppRole === 'worker') {
        // For a real app, fetch worker details from Firestore using currentUser.uid
        // For mock: find a worker, e.g., by email or use the first one
        const mockWorker = MOCK_WORKERS.find(w => w.email === currentUser.email) || MOCK_WORKERS[0];
        baseProfile = { ...baseProfile, ...mockWorker, role: 'worker' };
        setName(mockWorker.name);
        setEmail(mockWorker.email);
        setSkillsInput(mockWorker.skills?.join(', ') || '');
        setHourlyRateInput(mockWorker.hourlyRate?.toString() || '');
        setBio(mockWorker.bio || '');
        setAddress(mockWorker.location ? `${mockWorker.location.lat}, ${mockWorker.location.lng}` : 'Location not set');
      } else { // Customer
        // For a real app, fetch customer details from Firestore
        // For mock: find a customer, e.g., by email or use the first one
        const mockCustomer = MOCK_CUSTOMERS.find(c => c.email === currentUser.email) || MOCK_CUSTOMERS[0];
        baseProfile = { ...baseProfile, ...mockCustomer, role: 'customer' };
        setName(mockCustomer.name);
        setEmail(mockCustomer.email);
        setAddress((mockCustomer as Customer).address || '');
      }
      setProfileData(baseProfile);
    }
  }, [currentUser, userAppRole]);

  // Update individual form states when profileData changes (e.g. after initial load)
  // This handles the case where currentUser loads after initial render
 useEffect(() => {
    setName(profileData.name || currentUser?.displayName || '');
    setEmail(profileData.email || currentUser?.email || '');
    if (profileData.role === 'customer') {
        setAddress((profileData as Customer).address || '');
    } else if (profileData.role === 'worker') {
        const workerData = profileData as Worker;
        setSkillsInput(workerData.skills?.join(', ') || '');
        setHourlyRateInput(workerData.hourlyRate?.toString() || '');
        setBio(workerData.bio || '');
        // For simplicity, worker address field shows lat/lng or a placeholder
        setAddress(workerData.location ? `Worker Location (Lat: ${workerData.location.lat}, Lng: ${workerData.location.lng})` : 'Location not set');
    }
}, [profileData, currentUser]);


  const handleSaveChanges = () => {
    if (!currentUser || !profileData.role) return;

    // Construct the data to "save"
    const updatedDetails: Partial<User> = {
      name,
      email, // Note: Firebase email updates need special handling (re-auth, verification)
    };

    if (profileData.role === 'customer') {
      (updatedDetails as Partial<Customer>).address = address;
    } else if (profileData.role === 'worker') {
      (updatedDetails as Partial<Worker>).skills = skillsInput.split(',').map(s => s.trim() as ServiceCategory);
      (updatedDetails as Partial<Worker>).hourlyRate = parseFloat(hourlyRateInput as string);
      (updatedDetails as Partial<Worker>).bio = bio;
      // Saving worker location from a simple address string would need geocoding in a real app
    }
    
    console.log("Saving changes (mock):", { uid: currentUser.uid, role: profileData.role, ...updatedDetails });

    // Optimistically update local profileData state
    setProfileData(prev => ({ ...prev, ...updatedDetails }));

    toast({
      title: "Profile Updated (Mock)",
      description: "Your changes have been locally updated. Backend integration needed for persistence.",
    });
  };

  if (!currentUser || !profileData.role) {
    return <p className="text-center py-10">Loading profile...</p>; 
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center">
            <UserCircle className="mr-3 h-8 w-8 text-primary" />
            My Profile
        </h1>
        <p className="text-muted-foreground">
          View and manage your account details. You are logged in as a {profileData.role}.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={profileData.avatarUrl || 'https://placehold.co/128x128.png'} alt={name} data-ai-hint="person avatar" />
            <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl">{name}</CardTitle>
            <CardDescription className="capitalize">{profileData.role}</CardDescription>
            <Button variant="outline" size="sm" className="mt-2">
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
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              
              {profileData.role === 'customer' && (
                 <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., 123 Main St, Anytown"/>
                </div>
              )}
               {profileData.role === 'worker' && ( 
                 <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="address">Primary Location (City/Area or Lat,Lng)</Label>
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., Whitefield, Bangalore or 12.97,77.59" />
                </div>
              )}
            </div>
          </div>

          {profileData.role === 'worker' && (
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
                        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell customers about yourself and your experience." className="min-h-[80px]"/>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="availability" checked={(profileData as Worker).isVerified} disabled />
                        <Label htmlFor="availability">Profile Verified (Admin)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="aadhaarVerified" checked={(profileData as Worker).aadhaarVerified} disabled />
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
                <Button variant="outline">Change Password</Button>
                <Button variant="destructive" className="ml-2">Delete Account</Button>
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
