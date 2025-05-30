
'use client';

import { useState, useEffect } from 'react';
import { WorkerMap } from '@/components/map/worker-map';
import { MapFilter } from '@/components/map/map-filter';
import type { Worker, ServiceCategory } from '@/lib/types';
import { MOCK_WORKERS } from '@/lib/constants';
import { WorkerCard } from '@/components/worker/worker-card';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Briefcase, TrendingUp, CheckSquare, CalendarClock } from 'lucide-react';

export default function DashboardPage() {
  const { userAppRole, currentUser } = useAuth();
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]); // Initialize as empty
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | undefined>(undefined);

  useEffect(() => {
    // This effect runs on mount and whenever currentUser changes.
    // It ensures filteredWorkers is populated from the MOCK_WORKERS array,
    // which should include all signed-up users whose data has been saved.
    setFilteredWorkers([...MOCK_WORKERS]);
    setSelectedWorkerId(undefined);
  }, [currentUser]); 

  const handleFilterChange = (filters: { category?: string; query?: string }) => {
    let workersToFilter = [...MOCK_WORKERS]; // Start with the full, current list from constants
    if (filters.category) {
      workersToFilter = workersToFilter.filter(worker => worker.skills.includes(filters.category as ServiceCategory));
    }
    if (filters.query) {
      const queryLower = filters.query.toLowerCase();
      workersToFilter = workersToFilter.filter(worker =>
        worker.username.toLowerCase().includes(queryLower) // Case-insensitive username search
      );
    }
    setFilteredWorkers(workersToFilter);
    setSelectedWorkerId(undefined); 
  };

  const handleWorkerSelectOnMap = (workerId: string) => {
    setSelectedWorkerId(workerId);
  };

  if (userAppRole === 'worker') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center">
            <Briefcase className="mr-3 h-8 w-8 text-primary" />
            Worker Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your jobs, schedule, and profile. Welcome, {currentUser?.displayName || 'Worker'}!
          </p>
        </div>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Your current job statistics and alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700/50">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-700 dark:text-blue-300">Dashboard Coming Soon!</AlertTitle>
              <AlertDescription className="text-blue-600 dark:text-blue-400">
                More features like earnings reports and performance analytics are under construction.
                For now, please use the "Schedule" and "Profile" sections to manage your work.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-secondary/40 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Job Requests</CardTitle>
                        <CheckSquare className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">No new requests currently.</p>
                    </CardContent>
                </Card>
                <Card className="bg-secondary/40 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Confirmed Jobs</CardTitle>
                        <CalendarClock className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                         <p className="text-xs text-muted-foreground">Check your schedule for details.</p>
                    </CardContent>
                </Card>
                 <Card className="bg-secondary/40 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jobs Completed (This Month)</CardTitle>
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                         <p className="text-xs text-muted-foreground">Keep up the great work!</p>
                    </CardContent>
                </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Find Local Professionals</h1>
        <p className="text-muted-foreground">
          Discover skilled workers in your area. Use the filters to narrow down your search.
        </p>
      </div>
      
      <MapFilter onFilterChange={handleFilterChange} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <WorkerMap workers={filteredWorkers} selectedWorkerId={selectedWorkerId} onWorkerSelect={handleWorkerSelectOnMap} />
        </div>
        <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold px-1">Available Workers ({filteredWorkers.length})</h2>
            <div className="max-h-[550px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {filteredWorkers.length > 0 ? (
                  filteredWorkers.map(worker => (
                      <WorkerCard 
                          key={worker.id} 
                          worker={worker} 
                          isSelected={worker.id === selectedWorkerId}
                          onSelect={() => setSelectedWorkerId(worker.id)}
                      />
                  ))
              ) : (
                  <p className="text-muted-foreground p-4 text-center">No workers found matching your criteria.</p>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
