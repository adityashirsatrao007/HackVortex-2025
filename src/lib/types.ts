export type UserRole = 'customer' | 'worker';

export type ServiceCategory = 'plumber' | 'electrician' | 'mason' | 'carpenter' | 'painter' | 'cleaner';

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Customer extends BaseUser {
  role: 'customer';
  address?: string;
}

export interface Worker extends BaseUser {
  role: 'worker';
  skills: ServiceCategory[];
  location: GeoLocation;
  isVerified: boolean;
  aadhaarVerified?: boolean; // Added from prompt
  selfieWithGpsUrl?: string; // Added from prompt
  rating: number; // Average rating
  bio?: string;
  hourlyRate?: number;
  availability?: { day: string, start: string, end: string }[]; // Example: [{ day: 'Mon', start: '09:00', end: '17:00' }]
  totalJobs?: number;
}

export type BookingStatus = 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled' | 'rejected';

export interface Review {
  id: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string; // denormalized for easy display
  workerId: string;
  workerName: string; // denormalized
  serviceCategory: ServiceCategory;
  dateTime: string; // ISO string
  status: BookingStatus;
  locationPreview: string; // e.g., "123 Main St, Anytown"
  notes?: string;
  review?: Review; // Review associated with this booking after completion
}

export type User = Customer | Worker;
