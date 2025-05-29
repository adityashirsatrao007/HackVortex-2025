'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MOCK_WORKERS, SERVICE_CATEGORIES } from "@/lib/constants";
import type { User } from "@/lib/types";
import { UserCircle, Edit3, Mail, Phone, MapPinIcon, Briefcase, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// Mock user data - in a real app, this would come from auth/context
const mockUser: User = {
  id: 'customer-1',
  name: 'Sita Sharma',
  email: 'sita.sharma@example.com',
  role: 'customer', // or 'worker'
  avatarUrl: 'https://placehold.co/128x128.png',
  address: '123 Blossom St, Whitefield, Bangalore',
  // If worker:
  // ...MOCK_WORKERS[0],
};


export default function ProfilePage() {
  const user = mockUser; // In a real app, fetch user data based on session

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
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person avatar" />
            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl">{user.name}</CardTitle>
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
                <Input id="name" defaultValue={user.name} readOnly className="bg-muted/50"/>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue={user.email} readOnly className="bg-muted/50"/>
              </div>
              {user.role === 'customer' && user.address && (
                 <div className="space-y-1 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" defaultValue={user.address} readOnly className="bg-muted/50"/>
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
                        <Label htmlFor="skills">Skills</Label>
                        <Input id="skills" defaultValue={(user as any).skills.join(', ')} readOnly className="bg-muted/50"/>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                        <Input id="hourlyRate" type="number" defaultValue={(user as any).hourlyRate} readOnly className="bg-muted/50"/>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" defaultValue={(user as any).bio} readOnly className="bg-muted/50 min-h-[80px]"/>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="availability" checked={(user as any).isVerified} disabled />
                        <Label htmlFor="availability">Profile Verified</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="aadhaarVerified" checked={(user as any).aadhaarVerified} disabled />
                        <Label htmlFor="aadhaarVerified">Aadhaar Verified</Label>
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
                <Button variant="destructiveOutline" className="ml-2">Delete Account</Button>
            </div>
          </div>

        </CardContent>
        <CardFooter>
            <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
