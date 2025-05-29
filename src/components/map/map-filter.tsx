
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { Filter, Search } from "lucide-react";
import React from 'react';

interface MapFilterProps {
  onFilterChange: (filters: { category?: string; query?: string }) => void;
}

export function MapFilter({ onFilterChange }: MapFilterProps) {
  const [currentCategory, setCurrentCategory] = React.useState<string | undefined>(undefined);
  const [currentQuery, setCurrentQuery] = React.useState<string>('');

  const handleCategoryChange = (categoryValue: string) => {
    const newCategory = categoryValue === "all" ? undefined : categoryValue;
    setCurrentCategory(newCategory);
    onFilterChange({ category: newCategory, query: currentQuery });
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setCurrentQuery(newQuery);
    // Optionally trigger search on type, or wait for form submit
    // For now, let's keep it on form submit to avoid too many re-renders if user types fast
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onFilterChange({ category: currentCategory, query: currentQuery });
  };

  return (
    <Card className="shadow-xl mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
            <Filter className="mr-2 h-5 w-5 text-primary" />
            Filter Workers
        </CardTitle>
        <CardDescription>Narrow down your search for the perfect professional.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="serviceCategory">Service Category</Label>
            <Select onValueChange={handleCategoryChange} defaultValue="all">
              <SelectTrigger id="serviceCategory" className="w-full shadow-sm">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {SERVICE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="searchQuery">Search by Username</Label>
            <div className="flex gap-2">
              <Input
                id="searchQuery"
                name="searchQuery"
                placeholder="e.g., rajeshk_worker"
                className="flex-grow shadow-sm"
                value={currentQuery}
                onChange={handleSearchInputChange}
              />
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow hover:shadow-md">
                <Search className="mr-0 md:mr-2 h-4 w-4" />
                <span className="hidden md:inline">Search</span>
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

