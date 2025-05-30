
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock, Send, MapPinIcon, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { ServiceCategory, Worker, Booking, UserRole } from '@/lib/types';
import { SERVICE_CATEGORIES, MOCK_BOOKINGS, MOCK_CUSTOMERS, saveBookingsToLocalStorage } from "@/lib/constants";
import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNotification } from "@/contexts/notification-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const bookingFormSchema = z.object({
  serviceCategory: z.enum(SERVICE_CATEGORIES.map(sc => sc.value) as [ServiceCategory, ...ServiceCategory[]], {
    required_error: "Please select a service category.",
  }),
  date: z.date({
    required_error: "A date for the service is required.",
  }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Please enter a valid time (HH:MM)."
  }),
  location: z.string().min(5, { message: "Location must be at least 5 characters." }),
  notes: z.string().max(300, "Notes cannot exceed 300 characters.").optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingRequestFormProps {
  worker: Worker;
  onFormSubmit?: () => void;
}

export function BookingRequestForm({ worker, onFormSubmit }: BookingRequestFormProps) {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { addNotification } = useNotification();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      serviceCategory: worker.skills[0] || undefined,
      date: undefined,
      time: "09:00",
      location: MOCK_CUSTOMERS.find(c => c.email === currentUser?.email)?.address || "",
      notes: "",
    },
  });

  const estimatedPrice = worker.hourlyRate ? worker.hourlyRate * 2 : 0; // Mock estimate for 2 hours

  function onSubmit(data: BookingFormValues) {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to book." });
      return;
    }

    const customerName = currentUser.displayName || MOCK_CUSTOMERS.find(c => c.email === currentUser.email)?.name || "A Customer";

    const newBooking: Booking = {
      id: `booking-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      customerId: currentUser.uid,
      customerName: customerName,
      workerId: worker.id,
      workerName: worker.name,
      serviceCategory: data.serviceCategory as ServiceCategory,
      dateTime: new Date(`${format(data.date, "yyyy-MM-dd")}T${data.time}:00`).toISOString(),
      status: 'pending',
      locationPreview: data.location,
      notes: data.notes,
    };

    MOCK_BOOKINGS.unshift(newBooking); // Add to the beginning of the array
    saveBookingsToLocalStorage();

    addNotification({
        recipientId: worker.id,
        recipientRole: 'worker',
        bookingId: newBooking.id,
        message: `New booking request for ${newBooking.serviceCategory} from ${newBooking.customerName}.`,
        serviceCategory: newBooking.serviceCategory,
        customerName: newBooking.customerName,
    });

    toast({
      title: "Booking Request Sent!",
      description: `Your request for ${data.serviceCategory} with ${worker.name} on ${format(data.date, "PPP")} at ${data.time} has been sent.`,
    });
    form.reset({
        serviceCategory: worker.skills[0] || undefined,
        date: undefined,
        time: "09:00",
        location: MOCK_CUSTOMERS.find(c => c.email === currentUser?.email)?.address || "",
        notes: ""
    });
    onFormSubmit?.();
  }

  const timeSlots = Array.from({ length: (18 - 8) * 2 + 1 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-2">
        <FormField
          control={form.control}
          name="serviceCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="shadow-sm">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SERVICE_CATEGORIES.filter(sc => worker.skills.includes(sc.value)).map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                  {SERVICE_CATEGORIES.filter(sc => worker.skills.includes(sc.value)).length === 0 && (
                    <SelectItem value="disabled" disabled>No specific skills listed for this worker</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal shadow-sm",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="shadow-sm">
                      <Clock className="mr-2 h-4 w-4 opacity-50 inline-block"/>
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeSlots.map(slot => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><MapPinIcon className="mr-2 h-4 w-4 text-primary" /> Service Location / Address</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 123 Main St, Anytown, Landmark..." {...field} className="shadow-sm"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes / Instructions (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any specific details for the worker (e.g., problem description, entry instructions)..."
                  className="resize-none min-h-[100px] shadow-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {estimatedPrice > 0 && (
            <Card className="bg-secondary/50 border-primary/20 shadow-sm">
                <CardHeader className="pb-2 pt-3 px-4">
                    <CardTitle className="text-sm font-medium text-primary flex items-center">
                        <IndianRupee className="mr-1.5 h-4 w-4" /> Estimated Cost
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                    <p className="text-2xl font-bold text-foreground">₹{estimatedPrice.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">(Based on approx. 2 hours of work at worker's rate. Final cost may vary.)</p>
                </CardContent>
            </Card>
        )}

        <Button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg text-base py-6 transition-transform active:scale-95"
        >
          <Send /> Send Booking Request
        </Button>
      </form>
    </Form>
  );
}
