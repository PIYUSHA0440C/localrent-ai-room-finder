import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { updateProfile, updateAvatar } from '../store/authSlice';
import { useState } from 'react';
import { trustBadgeConfig, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { HiOutlineCamera, HiOutlineShieldCheck, HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      city: user?.city || '',
    },
  });

  const badge = trustBadgeConfig[user?.trustBadge] || trustBadgeConfig.new;

  const onSubmit = async (data) => {
    const result = await dispatch(updateProfile(data));
    if (!result.error) {
      toast.success('Profile updated!');
      setIsEditing(false);
    } else {
      toast.error(result.payload || 'Update failed');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    const result = await dispatch(updateAvatar(formData));
    if (!result.error) toast.success('Avatar updated!');
    else toast.error('Upload failed');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/change-password', passwords);
      toast.success('Password changed! Please login again.');
      setChangingPassword(false);
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="card-static p-8 rounded-2xl text-center mb-6">
          <div className="relative inline-block mb-4">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              <HiOutlineCamera className="w-4 h-4 text-gray-600" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          <h2 className="text-xl font-bold text-[var(--color-secondary)]">{user?.name}</h2>
          <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
            <HiOutlineMail className="w-4 h-4" /> {user?.email}
            {user?.isEmailVerified && <span className="text-green-500 text-xs">✓ Verified</span>}
          </p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className={`badge ${badge.className} text-xs`}>{badge.icon} {badge.label}</span>
            <span className="text-xs text-gray-500">Trust Score: {user?.trustScore}/100</span>
          </div>

          {/* Trust Score Bar */}
          <div className="max-w-xs mx-auto mt-4">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] rounded-full transition-all" style={{ width: `${user?.trustScore || 0}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div>
              <p className="text-xl font-bold text-[var(--color-secondary)]">{user?.completedBookings || 0}</p>
              <p className="text-xs text-gray-500">Bookings</p>
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--color-secondary)]">{user?.averageRating > 0 ? user.averageRating.toFixed(1) : '–'}</p>
              <p className="text-xs text-gray-500">Rating</p>
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--color-secondary)] capitalize">{user?.role}</p>
              <p className="text-xs text-gray-500">Role</p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card-static p-6 rounded-2xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-700">Profile Details</h3>
            <button onClick={() => setIsEditing(!isEditing)} className="text-xs text-[var(--color-primary)] font-medium hover:underline border-none bg-transparent cursor-pointer">
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Name</label>
                <input type="text" className="input-field" {...register('name', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } })} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Phone</label>
                <input type="tel" className="input-field" placeholder="10-digit number" {...register('phone')} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">City</label>
                <input type="text" className="input-field" placeholder="Your city" {...register('city')} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Bio</label>
                <textarea className="input-field resize-none" rows={3} placeholder="Tell us about yourself..." {...register('bio', { maxLength: { value: 300, message: 'Max 300 chars' } })} />
              </div>
              <button type="submit" className="btn-primary w-full">Save Changes</button>
            </form>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">{user?.phone || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">City</span><span className="font-medium capitalize">{user?.city || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Bio</span><span className="font-medium text-right max-w-[60%]">{user?.bio || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Joined</span><span className="font-medium">{formatDate(user?.createdAt)}</span></div>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="card-static p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-700">Security</h3>
            <button onClick={() => setChangingPassword(!changingPassword)} className="text-xs text-[var(--color-primary)] font-medium hover:underline border-none bg-transparent cursor-pointer">
              {changingPassword ? 'Cancel' : 'Change Password'}
            </button>
          </div>
          {changingPassword && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <input type="password" placeholder="Current password" value={passwords.currentPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))} required className="input-field" />
              <input type="password" placeholder="New password (min 6 chars)" value={passwords.newPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))} required minLength={6} className="input-field" />
              <button type="submit" className="btn-primary w-full">Change Password</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
