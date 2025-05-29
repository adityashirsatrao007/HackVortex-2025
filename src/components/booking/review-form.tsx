'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const reviewFormSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5),
  comment: z.string().max(500, "Comment cannot exceed 500 characters.").optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  bookingId: string;
  workerName: string;
  onFormSubmit?: () => void;
}

export function ReviewForm({ bookingId, workerName, onFormSubmit }: ReviewFormProps) {
  const { toast } = useToast();
  const [hoverRating, setHoverRating] = useState(0);
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const currentRating = form.watch("rating");

  function onSubmit(data: ReviewFormValues) {
    console.log("Review Data:", { ...data, bookingId });
    toast({
      title: "Review Submitted!",
      description: `Thank you for reviewing ${workerName}. Your feedback is valuable.`,
    });
    form.reset();
    onFormSubmit?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Rating for {workerName}</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-8 w-8 cursor-pointer transition-colors",
                        (hoverRating >= star || currentRating >= star)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted-foreground hover:text-yellow-300"
                      )}
                      onClick={() => field.onChange(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comments (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={`Share your experience with ${workerName}...`}
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Send className="mr-2 h-4 w-4" /> Submit Review
        </Button>
      </form>
    </Form>
  );
}
