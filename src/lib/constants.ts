
import type { ServiceCategory, Worker, Booking, Review, Customer, UserRole } from './types';

// Define default mock data directly
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
    avatarUrl: 'https://images.unsplash.com/photo-1616002851413-ebcc9611139d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8aW5kaWFuJTIwbWFufGVufDB8fHx8MTc0ODU5MDM1OXww&ixlib=rb-4.1.0&q=80&w=1080',
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
    selfieWithGpsUrl: 'https://placehold.co/100x100.png',
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

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: 'plumber', label: 'Plumber' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'mason', label: 'Mason' },
  { value: 'carpenter', label: 'Carpenter' },
  { value: 'painter', label: 'Painter' },
  { value: 'cleaner', label: 'Cleaner' },
];

const WORKERS_STORAGE_KEY = 'karigarKartMockWorkers';
const CUSTOMERS_STORAGE_KEY = 'karigarKartMockCustomers';
const USER_ROLE_STORAGE_KEY_PREFIX = 'karigarKartUserRole_';
const BOOKINGS_STORAGE_KEY = 'karigarKartMockBookings';


// Basic type guard functions
const isValidWorkerArray = (arr: any): arr is Worker[] => Array.isArray(arr) && arr.every(item =>
  typeof item === 'object' && item !== null &&
  'id' in item && typeof item.id === 'string' &&
  'role' in item && item.role === 'worker' &&
  'name' in item && typeof item.name === 'string' &&
  'username' in item && typeof item.username === 'string' &&
  'email' in item && typeof item.email === 'string' &&
  'skills' in item && Array.isArray(item.skills) &&
  'location' in item && typeof item.location === 'object' && item.location !== null && 'lat' in item.location && 'lng' in item.location &&
  'isVerified' in item && typeof item.isVerified === 'boolean' &&
  'rating' in item && typeof item.rating === 'number' &&
  'address' in item && typeof item.address === 'string'
);

const isValidCustomerArray = (arr: any): arr is Customer[] => Array.isArray(arr) && arr.every(item =>
  typeof item === 'object' && item !== null &&
  'id' in item && typeof item.id === 'string' &&
  'role' in item && item.role === 'customer' &&
  'name' in item && typeof item.name === 'string' &&
  'username' in item && typeof item.username === 'string' &&
  'email' in item && typeof item.email === 'string' &&
  'address' in item && typeof item.address === 'string'
);

const isValidBookingArray = (arr: any): arr is Booking[] => Array.isArray(arr) && arr.every(item =>
    typeof item === 'object' && item !== null &&
    'id' in item && 'customerId' in item && 'workerId' in item && 'status' in item
);


// Function to safely load and initialize data from localStorage
function loadAndInitialize<T>(key: string, defaultData: T[], validator?: (data: any) => data is T[]): T[] {
  let instance: T[] = JSON.parse(JSON.stringify(defaultData)); // Start with a deep copy of defaults

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate if the parsed data is an array and, if a validator is provided, it passes
        if (Array.isArray(parsed) && (!validator || validator(parsed))) {
          instance = parsed;
        } else {
          console.warn(`KarigarKart: Data in localStorage for ${key} is invalid or malformed. Using defaults and re-saving.`);
          // If data is invalid, stick with defaultData and save it back to localStorage
          localStorage.setItem(key, JSON.stringify(instance));
        }
      } else {
        // If no data is stored, save the defaultData to localStorage
        localStorage.setItem(key, JSON.stringify(instance));
      }
    } catch (e) {
      console.warn(`KarigarKart: Error processing localStorage for ${key}. Using defaults and re-saving.`, e);
      // Reset instance to defaultData on error and attempt to save it
      instance = JSON.parse(JSON.stringify(defaultData));
      try {
        localStorage.setItem(key, JSON.stringify(instance));
      } catch (saveError) {
        console.error(`KarigarKart: Error re-saving default data to localStorage for ${key}:`, saveError);
      }
    }
  }
  return instance;
}

// These are now 'let' so they can be reassigned by refresh functions
export let MOCK_WORKERS: Worker[] = loadAndInitialize<Worker>(WORKERS_STORAGE_KEY, DEFAULT_MOCK_WORKERS, isValidWorkerArray);
export let MOCK_CUSTOMERS: Customer[] = loadAndInitialize<Customer>(CUSTOMERS_STORAGE_KEY, DEFAULT_MOCK_CUSTOMERS, isValidCustomerArray);
export let MOCK_BOOKINGS: Booking[] = loadAndInitialize<Booking>(BOOKINGS_STORAGE_KEY, [], isValidBookingArray); // Default to empty array for bookings initially


// Functions to refresh the in-memory arrays from localStorage
export function refreshMockWorkersFromLocalStorage() {
  MOCK_WORKERS = loadAndInitialize<Worker>(WORKERS_STORAGE_KEY, DEFAULT_MOCK_WORKERS, isValidWorkerArray);
}
export function refreshMockCustomersFromLocalStorage() {
  MOCK_CUSTOMERS = loadAndInitialize<Customer>(CUSTOMERS_STORAGE_KEY, DEFAULT_MOCK_CUSTOMERS, isValidCustomerArray);
}
export function refreshMockBookingsFromLocalStorage() {
  // Initialize with an empty array if nothing is in localStorage, or use DEFAULT_MOCK_BOOKINGS if you have them
  const defaultBookings = DEFAULT_MOCK_BOOKINGS.length > 0 ? DEFAULT_MOCK_BOOKINGS : [];
  MOCK_BOOKINGS = loadAndInitialize<Booking>(BOOKINGS_STORAGE_KEY, defaultBookings, isValidBookingArray);
}

export function refreshAllMockData() {
  console.log("KarigarKart: Refreshing all mock data from localStorage...");
  refreshMockWorkersFromLocalStorage();
  refreshMockCustomersFromLocalStorage();
  refreshMockBookingsFromLocalStorage();
}


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

export function saveBookingsToLocalStorage() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(MOCK_BOOKINGS));
    } catch (e) {
      console.error("Error saving bookings to localStorage:", e);
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
  // Ensure MOCK_WORKERS and MOCK_CUSTOMERS are arrays before using .some()
  if (Array.isArray(MOCK_WORKERS) && MOCK_WORKERS.some(worker => worker.email === email)) {
    return 'worker';
  }
  if (Array.isArray(MOCK_CUSTOMERS) && MOCK_CUSTOMERS.some(customer => customer.email === email)) {
    return 'customer';
  }
  return null;
}

export function checkProfileCompletion(
  user: { email: string | null; uid: string; displayName: string | null },
  role: UserRole | null
): boolean {
  if (!user || !role || !user.email) {
    return false;
  }

  if (role === 'customer') {
    // Ensure MOCK_CUSTOMERS is an array
    const customerProfile = Array.isArray(MOCK_CUSTOMERS) ? MOCK_CUSTOMERS.find(c => c.id === user.uid || c.email === user.email) : undefined;
    return !!(customerProfile && customerProfile.username && customerProfile.username.trim() !== '' && customerProfile.address && customerProfile.address.trim() !== '');
  } else if (role === 'worker') {
    // Ensure MOCK_WORKERS is an array
    const workerProfile = Array.isArray(MOCK_WORKERS) ? MOCK_WORKERS.find(w => w.id === user.uid || w.email === user.email) : undefined;
    return !!(
      workerProfile &&
      workerProfile.username && workerProfile.username.trim() !== '' &&
      workerProfile.skills && Array.isArray(workerProfile.skills) && workerProfile.skills.length > 0 &&
      workerProfile.bio && workerProfile.bio.trim() !== '' &&
      workerProfile.address && workerProfile.address.trim() !== ''
    );
  }
  return false;
}


const safeGetWorkerById = (id: string, fallbackId: string): string => {
  const worker = MOCK_WORKERS.find(w => w.id === id) || DEFAULT_MOCK_WORKERS.find(w => w.id === id);
  return worker ? worker.id : (DEFAULT_MOCK_WORKERS.find(w => w.id === fallbackId)?.id || fallbackId);
};
const safeGetWorkerNameById = (id: string, fallbackName: string): string => {
  const worker = MOCK_WORKERS.find(w => w.id === id) || DEFAULT_MOCK_WORKERS.find(w => w.id === id);
  return worker ? worker.name : (DEFAULT_MOCK_WORKERS.find(w => w.id === fallbackName)?.name || fallbackName);
};
const safeGetCustomerId = (email: string | null, fallbackId: string): string => {
  if (!email) return DEFAULT_MOCK_CUSTOMERS.find(c => c.id === fallbackId)?.id || fallbackId;
  const customer = MOCK_CUSTOMERS.find(c => c.email === email) || DEFAULT_MOCK_CUSTOMERS.find(c => c.email === email);
  return customer ? customer.id : (DEFAULT_MOCK_CUSTOMERS.find(c => c.id === fallbackId)?.id || fallbackId);
};
const safeGetCustomerName = (email: string | null, fallbackName: string): string => {
  if (!email) return DEFAULT_MOCK_CUSTOMERS.find(c => c.id === fallbackName)?.name || fallbackName;
  const customer = MOCK_CUSTOMERS.find(c => c.email === email) || DEFAULT_MOCK_CUSTOMERS.find(c => c.email === email);
  return customer ? customer.name : (DEFAULT_MOCK_CUSTOMERS.find(c => c.id === fallbackName)?.name || fallbackName);
};


export const MOCK_REVIEWS: Review[] = [
  {
    id: 'review-1',
    customerId: 'customer-1', // Assuming customer-1 is a stable default
    customerName: 'Sita Sharma',
    rating: 5,
    comment: 'Rajesh did an excellent job fixing the leak. Very professional.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'review-2',
    customerId: 'customer-2', // Assuming customer-2 is a stable default
    customerName: 'Vikram Reddy',
    rating: 4,
    comment: 'Good work by Priya on the custom shelf. Took a bit longer than expected but quality is great.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const DEFAULT_MOCK_BOOKINGS: Booking[] = [
  {
    id: 'booking-1',
    customerId: 'customer-1',
    customerName: 'Sita Sharma',
    workerId: 'worker-1',
    workerName: 'Rajesh Kumar',
    serviceCategory: 'plumber',
    dateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    locationPreview: '123 Blossom St, Whitefield',
    notes: 'Leaky faucet in the kitchen.',
    review: MOCK_REVIEWS.find(r => r.id === 'review-1'),
  },
  {
    id: 'booking-2',
    customerId: 'customer-2',
    customerName: 'Vikram Reddy',
    workerId: 'worker-2',
    workerName: 'Priya Singh',
    serviceCategory: 'carpenter',
    dateTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    locationPreview: '456 Oak Rd, Koramangala',
    notes: 'Need a custom bookshelf built.',
    review: MOCK_REVIEWS.find(r => r.id === 'review-2'),
  },
  {
    id: 'booking-3',
    customerId: 'customer-1',
    customerName: 'Sita Sharma',
    workerId: 'worker-3',
    workerName: 'Amit Patel',
    serviceCategory: 'painter',
    dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'accepted',
    locationPreview: '789 Pine Ln, Indiranagar',
    notes: 'Painting the living room, light blue color.',
  },
  {
    id: 'booking-4',
    customerId: 'customer-test', // Uses default test customer
    customerName: 'Test Customer User',
    workerId: 'worker-1',
    workerName: 'Rajesh Kumar',
    serviceCategory: 'electrician',
    dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    locationPreview: '321 Palm Ave, Jayanagar',
    notes: 'Fix wiring for new AC unit.',
  },
  {
    id: 'booking-5',
    customerId: 'customer-2',
    customerName: 'Vikram Reddy',
    workerId: 'worker-1',
    workerName: 'Rajesh Kumar',
    serviceCategory: 'electrician',
    dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'accepted',
    locationPreview: 'Vikram Reddy House',
    notes: 'Install new ceiling fan.',
  }
];
// Initialize MOCK_BOOKINGS after MOCK_WORKERS and MOCK_CUSTOMERS might have been populated from localStorage
// This ensures DEFAULT_MOCK_BOOKINGS can correctly reference dynamic worker/customer names if needed,
// though the current DEFAULT_MOCK_BOOKINGS uses hardcoded names.
if (MOCK_BOOKINGS.length === 0 && DEFAULT_MOCK_BOOKINGS.length > 0 && typeof window !== 'undefined') {
    console.log("KarigarKart: Initializing MOCK_BOOKINGS with default data and saving to localStorage.");
    MOCK_BOOKINGS = [...DEFAULT_MOCK_BOOKINGS];
    saveBookingsToLocalStorage();
}
