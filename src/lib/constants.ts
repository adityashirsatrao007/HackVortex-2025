
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
    aadhaarNumber: '123456789012',
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
    aadhaarNumber: '234567890123',
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
    aadhaarNumber: '345678901234',
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
const USER_ROLE_STORAGE_KEY_PREFIX = 'karigarKartUserRole_';


let MOCK_WORKERS_INSTANCE: Worker[] = [...DEFAULT_MOCK_WORKERS];
let MOCK_CUSTOMERS_INSTANCE: Customer[] = [...DEFAULT_MOCK_CUSTOMERS];

if (typeof window !== 'undefined') {
  try {
    const storedWorkers = localStorage.getItem(WORKERS_STORAGE_KEY);
    if (storedWorkers) {
      const parsedWorkers = JSON.parse(storedWorkers);
      if (Array.isArray(parsedWorkers)) {
        MOCK_WORKERS_INSTANCE = parsedWorkers.length > 0 ? parsedWorkers : [...DEFAULT_MOCK_WORKERS];
      } else {
        console.warn("KarigarKart: Stored workers data is not an array, using defaults.");
        MOCK_WORKERS_INSTANCE = [...DEFAULT_MOCK_WORKERS];
      }
    } else {
      // If nothing in localStorage, MOCK_WORKERS_INSTANCE already has defaults
    }
    // Always save back, to ensure format is correct or defaults are stored if it was null/invalid
    localStorage.setItem(WORKERS_STORAGE_KEY, JSON.stringify(MOCK_WORKERS_INSTANCE));
  } catch (e) {
    console.error("KarigarKart: Error processing/parsing stored workers from localStorage. Using defaults.", e);
    MOCK_WORKERS_INSTANCE = [...DEFAULT_MOCK_WORKERS];
    localStorage.setItem(WORKERS_STORAGE_KEY, JSON.stringify(MOCK_WORKERS_INSTANCE));
  }

  try {
    const storedCustomers = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
    if (storedCustomers) {
      const parsedCustomers = JSON.parse(storedCustomers);
      if (Array.isArray(parsedCustomers)) {
        MOCK_CUSTOMERS_INSTANCE = parsedCustomers.length > 0 ? parsedCustomers : [...DEFAULT_MOCK_CUSTOMERS];
      } else {
        console.warn("KarigarKart: Stored customers data is not an array, using defaults.");
        MOCK_CUSTOMERS_INSTANCE = [...DEFAULT_MOCK_CUSTOMERS];
      }
    } else {
      // If nothing in localStorage, MOCK_CUSTOMERS_INSTANCE already has defaults
    }
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(MOCK_CUSTOMERS_INSTANCE));
  } catch (e) {
    console.error("KarigarKart: Error processing/parsing stored customers from localStorage. Using defaults.", e);
    MOCK_CUSTOMERS_INSTANCE = [...DEFAULT_MOCK_CUSTOMERS];
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(MOCK_CUSTOMERS_INSTANCE));
  }
}

export const MOCK_WORKERS: Worker[] = MOCK_WORKERS_INSTANCE;
export const MOCK_CUSTOMERS: Customer[] = MOCK_CUSTOMERS_INSTANCE;


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
      localStorage.setItem(`${USER_ROLE_STORAGE_KEY_PREFIX}${userId}`, role);
    } catch (e) {
      console.error("Error saving user role to localStorage:", e);
    }
  }
}

export function loadUserRoleFromLocalStorage(userId: string): UserRole | null {
  if (typeof window !== 'undefined') {
    try {
      const role = localStorage.getItem(`${USER_ROLE_STORAGE_KEY_PREFIX}${userId}`);
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
  if (!user || !role || !user.email) return false;

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

// Initialize MOCK_BOOKINGS and MOCK_REVIEWS after MOCK_WORKERS and MOCK_CUSTOMERS are set
export const MOCK_REVIEWS: Review[] = [
  {
    id: 'review-1',
    customerId: MOCK_CUSTOMERS.find(c=>c.email === 'sita.customer@example.com')?.id || 'customer-1-fallback',
    customerName: MOCK_CUSTOMERS.find(c=>c.email === 'sita.customer@example.com')?.name || 'Sita Sharma',
    rating: 5,
    comment: 'Rajesh did an excellent job fixing the leak. Very professional.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'review-2',
    customerId: MOCK_CUSTOMERS.find(c=>c.email === 'vikram.customer@example.com')?.id || 'customer-2-fallback',
    customerName: MOCK_CUSTOMERS.find(c=>c.email === 'vikram.customer@example.com')?.name || 'Vikram Reddy',
    rating: 4,
    comment: 'Good work by Priya on the custom shelf. Took a bit longer than expected but quality is great.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    customerId: MOCK_CUSTOMERS.find(c=>c.email === 'sita.customer@example.com')?.id || 'customer-1-fallback',
    customerName: MOCK_CUSTOMERS.find(c=>c.email === 'sita.customer@example.com')?.name || 'Sita Sharma',
    workerId: MOCK_WORKERS.find(w=>w.email === 'rajesh.worker@example.com')?.id || 'worker-1-fallback',
    workerName: MOCK_WORKERS.find(w=>w.email === 'rajesh.worker@example.com')?.name || 'Rajesh Kumar',
    serviceCategory: 'plumber',
    dateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    locationPreview: '123 Blossom St, Whitefield',
    notes: 'Leaky faucet in the kitchen.',
    review: MOCK_REVIEWS.find(r => r.id === 'review-1'),
  },
  {
    id: 'booking-2',
    customerId: MOCK_CUSTOMERS.find(c=>c.email === 'vikram.customer@example.com')?.id || 'customer-2-fallback',
    customerName: MOCK_CUSTOMERS.find(c=>c.email === 'vikram.customer@example.com')?.name || 'Vikram Reddy',
    workerId: MOCK_WORKERS.find(w=>w.email === 'priya.worker@example.com')?.id || 'worker-2-fallback',
    workerName: MOCK_WORKERS.find(w=>w.email === 'priya.worker@example.com')?.name || 'Priya Singh',
    serviceCategory: 'carpenter',
    dateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    locationPreview: '456 Oak Rd, Koramangala',
    notes: 'Need a custom bookshelf built.',
    review: MOCK_REVIEWS.find(r => r.id === 'review-2'),
  },
  {
    id: 'booking-3',
    customerId: MOCK_CUSTOMERS.find(c=>c.email === 'sita.customer@example.com')?.id || 'customer-1-fallback',
    customerName: MOCK_CUSTOMERS.find(c=>c.email === 'sita.customer@example.com')?.name || 'Sita Sharma',
    workerId: MOCK_WORKERS.find(w=>w.email === 'amit.worker@example.com')?.id || 'worker-3-fallback',
    workerName: MOCK_WORKERS.find(w=>w.email === 'amit.worker@example.com')?.name || 'Amit Patel',
    serviceCategory: 'painter',
    dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'accepted',
    locationPreview: '789 Pine Ln, Indiranagar',
    notes: 'Painting the living room, light blue color.',
  },
  {
    id: 'booking-4',
    customerId: MOCK_CUSTOMERS.find(c=>c.email === 'customer@example.com')?.id || 'customer-test-fallback',
    customerName: MOCK_CUSTOMERS.find(c=>c.email === 'customer@example.com')?.name || 'Test Customer User',
    workerId: MOCK_WORKERS.find(w=>w.email === 'rajesh.worker@example.com')?.id || 'worker-1-fallback',
    workerName: MOCK_WORKERS.find(w=>w.email === 'rajesh.worker@example.com')?.name || 'Rajesh Kumar',
    serviceCategory: 'electrician',
    dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    locationPreview: '321 Palm Ave, Jayanagar',
    notes: 'Fix wiring for new AC unit.',
  },
  {
    id: 'booking-5',
    customerId: MOCK_CUSTOMERS.find(c=>c.email === 'vikram.customer@example.com')?.id || 'customer-2-fallback',
    customerName: MOCK_CUSTOMERS.find(c=>c.email === 'vikram.customer@example.com')?.name || 'Vikram Reddy',
    workerId: MOCK_WORKERS.find(w=>w.email === 'rajesh.worker@example.com')?.id || 'worker-1-fallback',
    workerName: MOCK_WORKERS.find(w=>w.email === 'rajesh.worker@example.com')?.name || 'Rajesh Kumar',
    serviceCategory: 'electrician',
    dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'accepted',
    locationPreview: 'Vikram Reddy House',
    notes: 'Install new ceiling fan.',
  }
];
