// Format rent in INR
export const formatRent = (amount) => {
  if (!amount) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

// Format date
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Format relative time
export const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

// Listing type labels
export const listingTypeLabels = {
  pg_room: 'PG Room',
  shared_room: 'Shared Room',
  private_room: 'Private Room',
  studio: 'Studio',
  '1bhk': '1 BHK',
  '2bhk': '2 BHK',
};

// Furnishing labels
export const furnishingLabels = {
  furnished: 'Furnished',
  semi_furnished: 'Semi Furnished',
  unfurnished: 'Unfurnished',
};

// Gender labels
export const genderLabels = {
  boys: 'Boys Only',
  girls: 'Girls Only',
  any: 'Any Gender',
};

// Amenity labels
export const amenityLabels = {
  wifi: '📶 WiFi',
  ac: '❄️ AC',
  meals: '🍽️ Meals',
  laundry: '👕 Laundry',
  parking: '🅿️ Parking',
  gym: '💪 Gym',
  power_backup: '🔋 Power Backup',
  water_supply: '💧 Water Supply',
  attached_bathroom: '🚿 Attached Bathroom',
  balcony: '🌅 Balcony',
  tv: '📺 TV',
  fridge: '🧊 Fridge',
  washing_machine: '🧺 Washing Machine',
  kitchen: '🍳 Kitchen',
  security: '🔒 Security',
  cctv: '📹 CCTV',
  geyser: '🔥 Geyser',
  wardrobe: '👔 Wardrobe',
  study_table: '📚 Study Table',
  bed: '🛏️ Bed',
};

// Trust badge config
export const trustBadgeConfig = {
  new: { label: 'New', className: 'badge-new', icon: '🌱' },
  rising: { label: 'Rising', className: 'badge-rising', icon: '⭐' },
  trusted: { label: 'Trusted', className: 'badge-trusted', icon: '✅' },
  verified: { label: 'Verified', className: 'badge-verified', icon: '🛡️' },
};

// Status labels
export const statusLabels = {
  requested: 'Requested',
  approved: 'Approved',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Truncate text
export const truncate = (str, maxLen = 100) => {
  if (!str || str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
};
