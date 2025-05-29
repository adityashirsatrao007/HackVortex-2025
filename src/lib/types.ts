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
  aadhaarVerified?: boolean;
  selfieWithGpsUrl?: string;
  rating: number; // Average rating
  bio?: string;
  hourlyRate?: number;
  availability?: { day: string, start: string, end: string }[];
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
  customerName: string;
  workerId: string;
  workerName: string;
  serviceCategory: ServiceCategory;
  dateTime: string; // ISO string
  status: BookingStatus;
  locationPreview: string;
  notes?: string;
  review?: Review;
}

export type User = Customer | Worker;
