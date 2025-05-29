
import type { ServiceCategory, Worker, Booking, Review, Customer, UserRole } from './types';

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: 'plumber', label: 'Plumber' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'mason', label: 'Mason' },
  { value: 'carpenter', label: 'Carpenter' },
  { value: 'painter', label: 'Painter' },
  { value: 'cleaner', label: 'Cleaner' },
];

const DEFAULT_MOCK_WORKERS: Worker[] = [
  {
    id: 'worker-1',
    name: 'Rajesh Kumar',
    username: 'rajeshk_worker',
    email: 'rajesh.worker@example.com',
    role: 'worker',
    skills: ['plumber', 'electrician'],
    location: { lat: 12.9716, lng: 77.5946 },
    isVerified: true,
    aadhaarVerified: true,
    selfieWithGpsUrl: 'https://placehold.co/100x100.png',
    rating: 4.5,
    bio: 'Experienced plumber and electrician with 10+ years of service. Reliable and efficient.',
    hourlyRate: 250,
    avatarUrl: 'https://placehold.co/100x100.png',
    totalJobs: 120,
    address: 'Worker Address 1, Bangalore',
  },
  {
    id: 'worker-2',
    name: 'Priya Singh',
    username: 'priyas_worker',
    email: 'priya.worker@example.com',
    role: 'worker',
    skills: ['carpenter'],
    location: { lat: 12.9352, lng: 77.6245 },
    isVerified: true,
    aadhaarVerified: false,
    rating: 4.8,
    bio: 'Skilled carpenter specializing in custom furniture and repairs.',
    hourlyRate: 300,
    avatarUrl: 'https://placehold.co/100x100.png',
    totalJobs: 85,
    address: 'Worker Address 2, Bangalore',
  },
  {
    id: 'worker-3',
    name: 'Amit Patel',
    username: 'amitp_worker',
    email: 'amit.worker@example.com',
    role: 'worker',
    skills: ['mason', 'painter'],
    location: { lat: 13.0000, lng: 77.6500 },
    isVerified: false,
    aadhaarVerified: true,
    selfieWithGpsUrl: 'https://placehold.co/100x100.png',
    rating: 4.2,
    bio: 'Dedicated mason and painter. Committed to quality workmanship.',
    hourlyRate: 200,
    avatarUrl: 'https://placehold.co/100x100.png',
    totalJobs: 60,
    address: 'Worker Address 3, Bangalore',
  },
];

const DEFAULT_MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'customer-1',
    name: 'Sita Sharma',
    username: 'sitas_customer',
    email: 'sita.customer@example.com',
    role: 'customer',
    avatarUrl: 'https://placehold.co/128x128.png',
    address: '123 Blossom St, Whitefield, Bangalore',
  },
  {
    id: 'customer-2',
    name: 'Vikram Reddy',
    username: 'vikramr_customer',
    email: 'vikram.customer@example.com',
    role: 'customer',
    avatarUrl: 'https://placehold.co/128x128.png',
    address: '456 Oak Rd, Koramangala, Bangalore',
  },
   {
    id: 'customer-test',
    name: 'Test Customer User',
    username: 'test_customer',
    email: 'customer@example.com',
    role: 'customer',
    avatarUrl: 'https://placehold.co/128x128.png',
    address: '789 Test Lane, Test City',
  },
];

const WORKERS_STORAGE_KEY = 'karigarKartMockWorkers';
const CUSTOMERS_STORAGE_KEY = 'karigarKartMockCustomers';

let MOCK_WORKERS_INSTANCE: Worker[] | undefined = undefined;
let MOCK_CUSTOMERS_INSTANCE: Customer[] | undefined = undefined;

if (typeof window !== 'undefined') {
  try {
    const storedWorkers = localStorage.getItem(WORKERS_STORAGE_KEY);
    if (storedWorkers) {
      const parsedWorkers = JSON.parse(storedWorkers);
      // Ensure parsedWorkers is an array and not empty before assigning
      if (Array.isArray(parsedWorkers) && parsedWorkers.length > 0) {
        MOCK_WORKERS_INSTANCE = parsedWorkers;
      }
    }
  } catch (e) {
    console.error("Error parsing stored workers from localStorage:", e);
    // localStorage.removeItem(WORKERS_STORAGE_KEY); // Optionally clear corrupted data
  }
  
  // If MOCK_WORKERS_INSTANCE is still undefined (not found, empty, or error), initialize with defaults and save.
  if (!MOCK_WORKERS_INSTANCE) {
    MOCK_WORKERS_INSTANCE = [...DEFAULT_MOCK_WORKERS];
    try {
      localStorage.setItem(WORKERS_STORAGE_KEY, JSON.stringify(MOCK_WORKERS_INSTANCE));
    } catch (e) {
      console.error("Error saving default workers to localStorage:", e);
    }
  }

  try {
    const storedCustomers = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
    if (storedCustomers) {
      const parsedCustomers = JSON.parse(storedCustomers);
      // Ensure parsedCustomers is an array and not empty before assigning
      if (Array.isArray(parsedCustomers) && parsedCustomers.length > 0) {
        MOCK_CUSTOMERS_INSTANCE = parsedCustomers;
      }
    }
  } catch (e) {
    console.error("Error parsing stored customers from localStorage:", e);
    // localStorage.removeItem(CUSTOMERS_STORAGE_KEY); // Optionally clear corrupted data
  }

  // If MOCK_CUSTOMERS_INSTANCE is still undefined, initialize with defaults and save.
  if (!MOCK_CUSTOMERS_INSTANCE) {
    MOCK_CUSTOMERS_INSTANCE = [...DEFAULT_MOCK_CUSTOMERS];
    try {
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(MOCK_CUSTOMERS_INSTANCE));
    } catch (e) {
      console.error("Error saving default customers to localStorage:", e);
    }
  }
}

// These exports will now use the instances that have been robustly initialized/defaulted.
export const MOCK_WORKERS: Worker[] = MOCK_WORKERS_INSTANCE || [...DEFAULT_MOCK_WORKERS];
export const MOCK_CUSTOMERS: Customer[] = MOCK_CUSTOMERS_INSTANCE || [...DEFAULT_MOCK_CUSTOMERS];


export function saveWorkersToLocalStorage() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(WORKERS_STORAGE_KEY, JSON.stringify(MOCK_WORKERS));
    } catch (e) {
      console.error("Error saving workers to localStorage:", e);
    }
  }
}

export function saveCustomersToLocalStorage() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(MOCK_CUSTOMERS));
    } catch (e) {
      console.error("Error saving customers to localStorage:", e);
    }
  }
}

export function saveUserRoleToLocalStorage(userId: string, role: UserRole) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`userRole_${userId}`, role);
    } catch (e) {
      console.error("Error saving user role to localStorage:", e);
    }
  }
}

export function loadUserRoleFromLocalStorage(userId: string): UserRole | null {
  if (typeof window !== 'undefined') {
    try {
      const role = localStorage.getItem(`userRole_${userId}`);
      return role ? role as UserRole : null;
    } catch (e) {
      console.error("Error loading user role from localStorage:", e);
      return null;
    }
  }
  return null;
}

export function detectUserRoleFromMocks(email: string | null): UserRole | null {
  if (!email) return null;
  if (MOCK_WORKERS.some(worker => worker.email === email)) {
    return 'worker';
  }
  if (MOCK_CUSTOMERS.some(customer => customer.email === email)) {
    return 'customer';
  }
  return null;
}

export function checkProfileCompletion(
  user: { email: string | null; uid: string; displayName: string | null }, 
  role: UserRole | null
): boolean {
  if (!user || !role) return false; // Simplified: if no role, profile can't be complete. Email null check is implicit if matching by ID.

  if (role === 'customer') {
    const customerProfile = MOCK_CUSTOMERS.find(c => c.id === user.uid || c.email === user.email);
    return !!(customerProfile && customerProfile.address && customerProfile.address.trim() !== '');
  } else if (role === 'worker') {
    const workerProfile = MOCK_WORKERS.find(w => w.id === user.uid || w.email === user.email);
    return !!(
      workerProfile &&
      workerProfile.skills && workerProfile.skills.length > 0 &&
      workerProfile.bio && workerProfile.bio.trim() !== '' &&
      workerProfile.address && workerProfile.address.trim() !== ''
    );
  }
  return false;
}


export const MOCK_REVIEWS: Review[] = [
  {
    id: 'review-1',
    customerId: 'customer-1',
    customerName: 'Sita Sharma',
    rating: 5,
    comment: 'Rajesh did an excellent job fixing the leak. Very professional.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'review-2',
    customerId: 'customer-2',
    customerName: 'Vikram Reddy',
    rating: 4,
    comment: 'Good work by Priya on the custom shelf. Took a bit longer than expected but quality is great.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    customerId: (MOCK_CUSTOMERS_INSTANCE || DEFAULT_MOCK_CUSTOMERS).find(c=>c.email === 'sita.customer@example.com')?.id || 'customer-1',
    customerName: (MOCK_CUSTOMERS_INSTANCE || DEFAULT_MOCK_CUSTOMERS).find(c=>c.email === 'sita.customer@example.com')?.name || 'Sita Sharma',
    workerId: (MOCK_WORKERS_INSTANCE || DEFAULT_MOCK_WORKERS).find(w=>w.email === 'rajesh.worker@example.com')?.id || 'worker-1',
    workerName: (MOCK_WORKERS_INSTANCE || DEFAULT_MOCK_WORKERS).find(w=>w.email === 'rajesh.worker@example.com')?.name || 'Rajesh Kumar',
    serviceCategory: 'plumber',
    dateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    locationPreview: '123 Blossom St, Whitefield',
    notes: 'Leaky faucet in the kitchen.',
    review: MOCK_REVIEWS.find(r => r.id === 'review-1'),
  },
  {
    id: 'booking-2',
    customerId: (MOCK_CUSTOMERS_INSTANCE || DEFAULT_MOCK_CUSTOMERS).find(c=>c.email === 'vikram.customer@example.com')?.id || 'customer-2',
    customerName: (MOCK_CUSTOMERS_INSTANCE || DEFAULT_MOCK_CUSTOMERS).find(c=>c.email === 'vikram.customer@example.com')?.name || 'Vikram Reddy',
    workerId: (MOCK_WORKERS_INSTANCE || DEFAULT_MOCK_WORKERS).find(w=>w.email === 'priya.worker@example.com')?.id || 'worker-2',
    workerName: (MOCK_WORKERS_INSTANCE || DEFAULT_MOCK_WORKERS).find(w=>w.email === 'priya.worker@example.com')?.name || 'Priya Singh',
    serviceCategory: 'carpenter',
    dateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    locationPreview: '456 Oak Rd, Koramangala',
    notes: 'Need a custom bookshelf built.',
    review: MOCK_REVIEWS.find(r => r.id === 'review-2'),
  },
  {
    id: 'booking-3',
    customerId: (MOCK_CUSTOMERS_INSTANCE || DEFAULT_MOCK_CUSTOMERS).find(c=>c.email === 'sita.customer@example.com')?.id || 'customer-1',
    customerName: (MOCK_CUSTOMERS_INSTANCE || DEFAULT_MOCK_CUSTOMERS).find(c=>c.email === 'sita.customer@example.com')?.name || 'Sita Sharma',
    workerId: (MOCK_WORKERS_INSTANCE || DEFAULT_MOCK_WORKERS).find(w=>w.email === 'amit.worker@example.com')?.id || 'worker-3',
    workerName: (MOCK_WORKERS_INSTANCE || DEFAULT_MOCK_WORKERS).find(w=>w.email === 'amit.worker@example.com')?.name || 'Amit Patel',
    serviceCategory: 'painter',
    dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'accepted',
    locationPreview: '789 Pine Ln, Indiranagar',
    notes: 'Painting the living room, light blue color.',
  },
  {
    id: 'booking-4',
    customerId: (MOCK_CUSTOMERS_INSTANCE || DEFAULT_MOCK_CUSTOMERS).find(c=>c.email === 'customer@example.com')?.id || 'customer-test',
    customerName: (MOCK_CUSTOMERS_INSTANCE || DEFAULT_MOCK_CUSTOMERS).find(c=>c.email === 'customer@example.com')?.name || 'Test Customer User',
    workerId: (MOCK_WORKERS_INSTANCE || DEFAULT_MOCK_WORKERS).find(w=>w.email === 'rajesh.worker@example.com')?.id || 'worker-1',
    workerName: (MOCK_WORKERS_INSTANCE || DEFAULT_MOCK_WORKERS).find(w=>w.email === 'rajesh.worker@example.com')?.name || 'Rajesh Kumar',
    serviceCategory: 'electrician',
    dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    locationPreview: '321 Palm Ave, Jayanagar',
    notes: 'Fix wiring for new AC unit.',
  },
  {
    id: 'booking-5',
    customerId: (MOCK_CUSTOMERS_INSTANCE || DEFAULT_MOCK_CUSTOMERS).find(c=>c.email === 'vikram.customer@example.com')?.id || 'customer-2',
    customerName: (MOCK_CUSTOMERS_INSTANCE || DEFAULT_MOCK_CUSTOMERS).find(c=>c.email === 'vikram.customer@example.com')?.name || 'Vikram Reddy',
    workerId: (MOCK_WORKERS_INSTANCE || DEFAULT_MOCK_WORKERS).find(w=>w.email === 'rajesh.worker@example.com')?.id || 'worker-1',
    workerName: (MOCK_WORKERS_INSTANCE || DEFAULT_MOCK_WORKERS).find(w=>w.email === 'rajesh.worker@example.com')?.name || 'Rajesh Kumar',
    serviceCategory: 'electrician',
    dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'accepted',
    locationPreview: 'Vikram Reddy House',
    notes: 'Install new ceiling fan.',
  }
];
    
