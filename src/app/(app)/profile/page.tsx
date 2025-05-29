
'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MOCK_WORKERS, SERVICE_CATEGORIES } from "@/lib/constants";
import type { User, Worker, Customer, ServiceCategory } from "@/lib/types";
import { UserCircle, Edit3, Save } from "lucide-react"; // Added Save icon
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { useAuth } from '@/hooks/use-auth'; // Import useAuth

// Mock user data - in a real app, this would come from auth/context or backend
const getMockUser = (userId: string | undefined): User | undefined => {
  if (!userId) return undefined;
  if (userId.startsWith('customer')) {
    return {
      id: 'customer-1',
      name: 'Sita Sharma',
      email: 'sita.sharma@example.com',
      role: 'customer',
      avatarUrl: 'https://placehold.co/128x128.png',
      address: '123 Blossom St, Whitefield, Bangalore',
    };
  }
  // For demo, if not customer, assume it's the first mock worker
  return MOCK_WORKERS[0]; 
}


export default function ProfilePage() {
  const { currentUser } = useAuth(); // Get current user from AuthContext
  const { toast } = useToast(); // For showing notifications

  // Initialize user state with a default structure or from mockUser
  // In a real app, you'd fetch this based on currentUser.uid
  const [user, setUser] = useState<User | null>(null);
  
  // Form field states
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // Email might not be editable depending on auth provider
  const [address, setAddress] = useState('');
  const [skillsInput, setSkillsInput] = useState(''); // For worker
  const [hourlyRateInput, setHourlyRateInput] = useState<number | string>(''); // For worker
  const [bio, setBio] = useState(''); // For worker

  useEffect(() => {
    // Simulate fetching user data based on currentUser.uid
    // For now, using mock data logic. Replace with actual fetch.
    if (currentUser) {
        // This is a simplified mock fetch. In a real app, you'd query Firestore
        // or your backend using currentUser.uid.
        const fetchedUser = getMockUser(currentUser.uid) || { // Fallback to basic structure if no mock
            id: currentUser.uid,
            name: currentUser.displayName || '',
            email: currentUser.email || '',
            role: 'customer', // Default role, adjust as needed
        };
        setUser(fetchedUser);
        
        setName(fetchedUser.name || '');
        setEmail(fetchedUser.email || ''); // Typically not editable directly
        
        if (fetchedUser.role === 'customer') {
            setAddress((fetchedUser as Customer).address || '');
        } else if (fetchedUser.role === 'worker') {
            const workerUser = fetchedUser as Worker;
            setSkillsInput(workerUser.skills?.join(', ') || '');
            setHourlyRateInput(workerUser.hourlyRate?.toString() || '');
            setBio(workerUser.bio || '');
            setAddress(workerUser.location ? `${workerUser.location.lat}, ${workerUser.location.lng}` : 'Location not set'); // Simplified address for worker
        }
    }
  }, [currentUser]);


  const handleSaveChanges = () => {
    if (!user) return;

    // Here you would typically send the updated data to your backend
    console.log("Saving changes:", {
      name,
      email, // Usually not changed here if managed by Firebase auth directly
      address,
      ...(user.role === 'worker' && {
        skills: skillsInput.split(',').map(s => s.trim() as ServiceCategory),
        hourlyRate: parseFloat(hourlyRateInput as string),
        bio,
      })
    });

    // Optimistically update local user state (or re-fetch)
    setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, name, email };
        if (prevUser.role === 'customer') {
            (updatedUser as Customer).address = address;
        } else if (prevUser.role === 'worker') {
            (updatedUser as Worker).skills = skillsInput.split(',').map(s => s.trim() as ServiceCategory);
            (updatedUser as Worker).hourlyRate = parseFloat(hourlyRateInput as string);
            (updatedUser as Worker).bio = bio;
            // Note: worker location update is more complex than just address string
        }
        return updatedUser;
    });

    toast({
      title: "Profile Updated",
      description: "Your changes have been saved.",
    });
  };

  if (!user) {
    return <p>Loading profile...</p>; // Or a proper loader component
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center">
            <UserCircle className="mr-3 h-8 w-8 text-primary" />
            My Profile
        </h1>
        <p className="text-muted-foreground">
          View and manage your account details.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage src={user.avatarUrl || 'https://placehold.co/128x128.png'} alt={name} data-ai-hint="person avatar" />
            <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl">{name}</CardTitle>
            <CardDescription className="capitalize">{user.role}</CardDescription>
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
                <Input id="email" type="email" value={email} readOnly className="bg-muted/50 cursor-not-allowed" title="Email cannot be changed here."/>
              </div>
              {user.role === 'customer' && (
                 <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
              )}
               {user.role === 'worker' && ( // Worker location/address might be handled differently (e.g. GeoLocation)
                 <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="address">Primary Location (City/Area)</Label>
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., Whitefield, Bangalore" />
                </div>
              )}
            </div>
          </div>

          {user.role === 'worker' && (
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
                        <Switch id="availability" checked={(user as Worker).isVerified} disabled />
                        <Label htmlFor="availability">Profile Verified (Admin)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="aadhaarVerified" checked={(user as Worker).aadhaarVerified} disabled />
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
