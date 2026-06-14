import User from '../models/User.js';
import imageService from '../services/imageService.js';
import trustService from '../services/trustService.js';
import authService from '../services/authService.js';

// PUT /api/users/profile
export const updateProfile = async (req, res) => {
  const { name, phone, bio, city } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) user.bio = bio;
  if (city !== undefined) user.city = city?.toLowerCase();

  await user.save();

  // Recalculate trust score after profile update
  await trustService.updateTrustScore(user._id);

  const updatedUser = await User.findById(user._id);
  res.json({ message: 'Profile updated', user: updatedUser });
};

// PUT /api/users/avatar
export const updateAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an image' });
  }

  const result = await imageService.uploadImage(req.file.buffer, req.file.originalname, 'avatars');

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: result.url },
    { new: true }
  );

  res.json({ message: 'Avatar updated', user });
};

// GET /api/users/:id
export const getPublicProfile = async (req, res) => {
  const user = await User.findById(req.params.id).select(
    'name avatar bio city role trustScore trustBadge completedBookings averageRating totalRatingsReceived createdAt'
  );

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ user });
};

// PUT /api/users/change-password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Both current and new passwords are required' });
  }

  await authService.changePassword(req.user._id, currentPassword, newPassword);

  res.json({ message: 'Password changed successfully. Please login again.' });
};
