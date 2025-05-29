'use client';

import { useState } from 'react';
import { WorkerMap } from '@/components/map/worker-map';
import { MapFilter } from '@/components/map/map-filter';
import type { Worker, ServiceCategory } from '@/lib/types';
import { MOCK_WORKERS } from '@/lib/constants';
import { WorkerCard } from '@/components/worker/worker-card'; // Will create this next

export default function DashboardPage() {
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>(MOCK_WORKERS);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | undefined>(undefined);

  const handleFilterChange = (filters: { category?: string; query?: string }) => {
    let workers = MOCK_WORKERS;
    if (filters.category) {
      workers = workers.filter(worker => worker.skills.includes(filters.category as ServiceCategory));
    }
    if (filters.query) {
      const queryLower = filters.query.toLowerCase();
      workers = workers.filter(worker =>
        worker.name.toLowerCase().includes(queryLower) ||
        worker.skills.some(skill => skill.toLowerCase().includes(queryLower))
      );
    }
    setFilteredWorkers(workers);
    setSelectedWorkerId(undefined); // Reset selection on filter change
  };

  const handleWorkerSelectOnMap = (workerId: string) => {
    setSelectedWorkerId(workerId);
    // Optionally, scroll to worker card if list view is also present
  };

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
        <div className="lg:col-span-1 space-y-4 max-h-[550px] overflow-y-auto pr-2">
            <h2 className="text-xl font-semibold">Available Workers ({filteredWorkers.length})</h2>
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
                <p className="text-muted-foreground">No workers found matching your criteria.</p>
            )}
        </div>
      </div>
    </div>
  );
}
