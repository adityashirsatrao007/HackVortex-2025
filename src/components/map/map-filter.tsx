'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { Filter, Search } from "lucide-react";

interface MapFilterProps {
  onFilterChange: (filters: { category?: string; query?: string }) => void;
}

export function MapFilter({ onFilterChange }: MapFilterProps) {
  const handleCategoryChange = (category: string) => {
    onFilterChange({ category: category === "all" ? undefined : category });
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get("searchQuery") as string;
    onFilterChange({ query });
  };

  return (
    <Card className="shadow-lg mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
            <Filter className="mr-2 h-5 w-5 text-primary" />
            Filter Workers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="serviceCategory">Service Category</Label>
            <Select onValueChange={handleCategoryChange} defaultValue="all">
              <SelectTrigger id="serviceCategory" className="w-full">
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
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="searchQuery">Search by Name or Skill</Label>
            <div className="flex gap-2">
              <Input
                id="searchQuery"
                name="searchQuery"
                placeholder="e.g., Rajesh Kumar or plumbing"
                className="flex-grow"
              />
              <Button type="submit" variant="outline">
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
