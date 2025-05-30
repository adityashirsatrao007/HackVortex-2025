
export type UserRole = 'customer' | 'worker';

export type ServiceCategory = 'plumber' | 'electrician' | 'mason' | 'carpenter' | 'painter' | 'cleaner';

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface BaseUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Customer extends BaseUser {
  role: 'customer';
  address: string;
}

export interface Worker extends BaseUser {
  role: 'worker';
  skills: ServiceCategory[];
  location: GeoLocation;
  isVerified: boolean;
  aadhaarNumber?: string;
  aadhaarVerified?: boolean;
  selfieWithGpsUrl?: string;
  rating: number;
  bio?: string;
  hourlyRate?: number;
  availability?: { day: string, start: string, end: string }[];
  totalJobs?: number;
  address: string;
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

export interface NotificationType {
  id:string;
  recipientId: string; // Changed from workerId
  recipientRole: UserRole; // Added to help direct notifications appropriately
  bookingId: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  // Optional fields for more context in the notification message
  serviceCategory?: ServiceCategory;
  customerName?: string; // Name of the customer who made the booking
  workerName?: string; // Name of the worker involved
}
    