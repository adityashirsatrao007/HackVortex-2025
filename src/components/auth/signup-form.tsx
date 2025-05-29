
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// RadioGroup import removed as role selection is removed from this form
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// UserRole type import removed
import { useAuth } from "@/hooks/use-auth"; 
import { UserPlus, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react"; 
import { KarigarKartToolboxLogoIcon } from "@/components/icons/karigar-kart-toolbox-logo-icon";
import React, { useState } from "react";
// Separator import removed
import { useToast } from "@/hooks/use-toast";
import { MOCK_CUSTOMERS, MOCK_WORKERS } from "@/lib/constants";


const signupFormSchemaBase = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
  // role field removed from base schema
});

const signupFormSchemaWithOtp = signupFormSchemaBase.extend({
  otp: z.string().length(6, { message: "OTP must be 6 digits." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const signupFormSchemaWithoutOtp = signupFormSchemaBase.refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupFormSchemaWithOtp>;

export function SignupForm() {
  const { signup, loading } = useAuth(); 
  const { toast } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(otpSent ? signupFormSchemaWithOtp : signupFormSchemaWithoutOtp),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      // role default removed
      otp: "",
    },
  });

  async function onSubmit(data: SignupFormValues) {
    if (!otpSent) { 
      const usernameLower = data.username.toLowerCase();
      const usernameExistsInWorkers = MOCK_WORKERS.some(w => w.username.toLowerCase() === usernameLower);
      const usernameExistsInCustomers = MOCK_CUSTOMERS.some(c => c.username.toLowerCase() === usernameLower);

      if (usernameExistsInWorkers || usernameExistsInCustomers) {
        form.setError("username", { type: "manual", message: "Username is already taken." });
        toast({ variant: "destructive", title: "Signup Failed", description: "Username is already taken. Please choose another." });
        return;
      }

      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(mockOtp);
      setOtpSent(true);
      form.trigger(); 
      toast({
        title: "Mock OTP Sent",
        description: `(For testing) Your OTP is: ${mockOtp}. Please enter it below.`,
        duration: 10000, 
      });
    } else { 
      if (data.otp === generatedOtp) {
        await signup(data.email, data.password, data.name, data.username); // Role removed from signup call
        setOtpSent(false);
        setGeneratedOtp(null);
        form.reset(); 
      } else {
        toast({
          variant: "destructive",
          title: "Invalid OTP",
          description: "The OTP you entered is incorrect. Please try again.",
        });
        form.setError("otp", { type: "manual", message: "Invalid OTP." });
      }
    }
  }

  let buttonText = otpSent ? "Verify & Complete Signup" : "Send OTP & Continue";
  let ButtonIconComponent = otpSent ? ShieldCheck : UserPlus;

  if (loading) {
    buttonText = otpSent ? "Verifying & Signing Up..." : "Processing...";
    ButtonIconComponent = Loader2;
  }


  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
             <KarigarKartToolboxLogoIcon className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold">Create an Account</CardTitle>
        <CardDescription>Join Karigar Kart today.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} disabled={otpSent || loading} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe_123" {...field} disabled={otpSent || loading} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} disabled={otpSent || loading} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                     <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        {...field} 
                        disabled={otpSent || loading}
                        className="w-full pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-primary"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={otpSent || loading}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        {...field} 
                        disabled={otpSent || loading}
                        className="w-full pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-primary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={otpSent || loading}
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Role selection RadioGroup removed */}

            {otpSent && (
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter OTP</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="6-digit OTP" 
                        {...field} 
                        disabled={loading} 
                        className="w-full"
                        maxLength={6}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-md hover:shadow-lg transition-all" 
              disabled={loading}
            >
              <ButtonIconComponent className={loading ? "animate-spin" : ""} />
              {buttonText}
            </Button>
          </form>
        </Form>

        {/* Removed Google Sign-Up Button and Separator */}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
