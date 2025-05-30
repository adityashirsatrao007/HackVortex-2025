
'use client';

import { useState, useEffect, useCallback } from 'react';
import { WorkerMap } from '@/components/map/worker-map';
import { MapFilter } from '@/components/map/map-filter';
import type { Worker, ServiceCategory, Booking } from '@/lib/types';
import { MOCK_WORKERS, MOCK_BOOKINGS, refreshMockBookingsFromLocalStorage } from '@/lib/constants';
import { WorkerCard } from '@/components/worker/worker-card';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Briefcase, TrendingUp, CheckSquare, CalendarClock, Users, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { userAppRole, currentUser } = useAuth();
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([...MOCK_WORKERS]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | undefined>(undefined);

  // State for worker dashboard stats
  const [pendingJobsCount, setPendingJobsCount] = useState(0);
  const [upcomingJobsCount, setUpcomingJobsCount] = useState(0);
  const [completedJobsCount, setCompletedJobsCount] = useState(0);

  const fetchWorkerJobCounts = useCallback(() => {
    if (userAppRole === 'worker' && currentUser) {
      refreshMockBookingsFromLocalStorage(); // Ensure we have latest bookings
      const workerBookings = MOCK_BOOKINGS.filter(b => b.workerId === currentUser.uid);
      setPendingJobsCount(workerBookings.filter(b => b.status === 'pending').length);
      setUpcomingJobsCount(workerBookings.filter(b => (b.status === 'accepted' || b.status === 'in-progress') && new Date(b.dateTime) >= new Date()).length);
      setCompletedJobsCount(workerBookings.filter(b => b.status === 'completed').length);
    }
  }, [currentUser, userAppRole]);


  useEffect(() => {
    // Initialize workers list and selected worker based on current user context
    // MOCK_WORKERS is already loaded from localStorage by constants.ts
    setFilteredWorkers([...MOCK_WORKERS]);
    setSelectedWorkerId(undefined);

    if (userAppRole === 'worker') {
      fetchWorkerJobCounts(); // Initial fetch for worker stats
    }
  }, [currentUser, userAppRole, fetchWorkerJobCounts]); // Rerun if user or role changes

  // Periodically refresh job counts for worker dashboard to simulate real-time updates
  useEffect(() => {
    if (userAppRole === 'worker') {
        fetchWorkerJobCounts(); // Fetch once immediately
        const intervalId = setInterval(() => {
            fetchWorkerJobCounts();
        }, 5000); // Refresh every 5 seconds
        return () => clearInterval(intervalId); // Cleanup interval on component unmount or role change
    }
  }, [userAppRole, fetchWorkerJobCounts]);


  const handleFilterChange = (filters: { category?: string; query?: string }) => {
    let workersToFilter = [...MOCK_WORKERS]; // Always start with a fresh list
    if (filters.category) {
      workersToFilter = workersToFilter.filter(worker => worker.skills.includes(filters.category as ServiceCategory));
    }
    if (filters.query) {
      const queryLower = filters.query.toLowerCase();
      workersToFilter = workersToFilter.filter(worker =>
        (worker.username && worker.username.toLowerCase().includes(queryLower)) ||
        (worker.address && worker.address.toLowerCase().includes(queryLower))
      );
    }
    setFilteredWorkers(workersToFilter);
    setSelectedWorkerId(undefined); // Reset selected worker on filter change
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-secondary/40 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Job Requests</CardTitle>
                        <CheckSquare className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingJobsCount}</div>
                        <p className="text-xs text-muted-foreground">{pendingJobsCount > 0 ? "Action required! Check 'Schedule'." : "No new requests."}</p>
                    </CardContent>
                </Card>
                <Card className="bg-secondary/40 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Confirmed Jobs</CardTitle>
                        <CalendarClock className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingJobsCount}</div>
                         <p className="text-xs text-muted-foreground">Check your schedule for details.</p>
                    </CardContent>
                </Card>
                 <Card className="bg-secondary/40 hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jobs Completed (All Time)</CardTitle>
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedJobsCount}</div>
                         <p className="text-xs text-muted-foreground">Keep up the great work!</p>
                    </CardContent>
                </Card>
            </div>
             <Alert className="mt-6 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700/50">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-700 dark:text-blue-300">More Features Coming Soon!</AlertTitle>
              <AlertDescription className="text-blue-600 dark:text-blue-400">
                Earnings reports and performance analytics are under construction.
                Use "Schedule" to manage new and upcoming jobs.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center">
            <Users className="mr-3 h-8 w-8 text-primary" />
            Find Local Professionals
        </h1>
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
                  <Card className="border-dashed border-muted-foreground/30">
                    <CardContent className="py-10 flex flex-col items-center justify-center text-center">
                        <AlertCircle className="h-10 w-10 text-muted-foreground/70 mb-3" />
                        <p className="text-muted-foreground">No workers found matching your criteria.</p>
                        <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search term.</p>
                    </CardContent>
                  </Card>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
