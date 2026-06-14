export const ROLES = {
  TENANT: 'tenant',
  LANDLORD: 'landlord',
  ADMIN: 'admin',
};

export const LISTING_TYPES = ['pg_room', 'shared_room', 'private_room', 'studio', '1bhk', '2bhk'];

export const GENDER_PREFERENCES = ['boys', 'girls', 'any'];

export const FURNISHING_TYPES = ['furnished', 'semi_furnished', 'unfurnished'];

export const BOOKING_STATUSES = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
};

// Valid booking status transitions: { currentStatus: [allowedNextStatuses] }
export const BOOKING_TRANSITIONS = {
  requested: ['approved', 'rejected', 'cancelled'],
  approved: ['active', 'cancelled'],
  active: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  rejected: [],
};

export const NOTIFICATION_TYPES = [
  'booking_request',
  'booking_approved',
  'booking_rejected',
  'booking_cancelled',
  'booking_completed',
  'booking_activated',
  'review_request',
  'system',
];

export const TRUST_BADGES = {
  NEW: 'new',
  RISING: 'rising',
  TRUSTED: 'trusted',
  VERIFIED: 'verified',
};

export const AMENITIES_LIST = [
  'wifi',
  'ac',
  'meals',
  'laundry',
  'parking',
  'gym',
  'power_backup',
  'water_supply',
  'attached_bathroom',
  'balcony',
  'tv',
  'fridge',
  'washing_machine',
  'kitchen',
  'security',
  'cctv',
  'geyser',
  'wardrobe',
  'study_table',
  'bed',
];

export const HOUSE_RULES_LIST = [
  'no_smoking',
  'no_drinking',
  'no_pets',
  'no_guests',
  'no_loud_music',
  'vegetarian_only',
  'gate_closing_time',
  'id_required',
];

export const INDIAN_CITIES = [
  'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai',
  'kolkata', 'pune', 'ahmedabad', 'jaipur', 'lucknow',
  'chandigarh', 'bhopal', 'indore', 'nagpur', 'kochi',
  'coimbatore', 'visakhapatnam', 'patna', 'dehradun', 'noida',
  'gurgaon', 'ghaziabad', 'faridabad', 'mysore', 'mangalore',
  'thiruvananthapuram', 'surat', 'vadodara', 'rajkot', 'ranchi',
];
