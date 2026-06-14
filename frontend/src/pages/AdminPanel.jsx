import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminStats, getAdminUsers, toggleSuspendUser, getAdminListings, toggleListingActive, getAdminReviews, toggleReviewHide } from '../store/adminSlice';
import { formatDate, statusLabels } from '../utils/helpers';
import toast from 'react-hot-toast';
import { HiOutlineUsers, HiOutlineHome, HiOutlineCalendar, HiOutlineStar, HiOutlineBan, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const AdminPanel = () => {
  const dispatch = useDispatch();
  const { stats, users, listings, reviews, pagination, loading } = useSelector((s) => s.admin);
  const [activeTab, setActiveTab] = useState('stats');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (activeTab === 'stats') dispatch(getAdminStats());
    if (activeTab === 'users') dispatch(getAdminUsers({ search: searchQuery }));
    if (activeTab === 'listings') dispatch(getAdminListings({ search: searchQuery }));
    if (activeTab === 'reviews') dispatch(getAdminReviews({}));
  }, [activeTab, dispatch, searchQuery]);

  const handleSuspend = async (id) => {
    const r = await dispatch(toggleSuspendUser(id));
    if (!r.error) toast.success(r.payload.message);
  };

  const handleToggleListing = async (id) => {
    const r = await dispatch(toggleListingActive(id));
    if (!r.error) toast.success(r.payload.message);
  };

  const handleToggleReview = async (id) => {
    const r = await dispatch(toggleReviewHide(id));
    if (!r.error) toast.success(r.payload.message);
  };

  const tabs = [
    { id: 'stats', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'listings', label: 'Listings', icon: '🏠' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
  ];

  return (
    <div className="page-container fade-in">
      <h1 className="section-title mb-6">Admin Panel</h1>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border-none cursor-pointer ${activeTab === tab.id ? 'bg-white shadow-sm text-[var(--color-primary)]' : 'bg-transparent text-gray-600'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: <HiOutlineUsers className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600' },
              { label: 'Total Listings', value: stats.totalListings, icon: <HiOutlineHome className="w-6 h-6" />, color: 'bg-green-50 text-green-600' },
              { label: 'Total Bookings', value: stats.totalBookings, icon: <HiOutlineCalendar className="w-6 h-6" />, color: 'bg-orange-50 text-orange-600' },
              { label: 'Total Reviews', value: stats.totalReviews, icon: <HiOutlineStar className="w-6 h-6" />, color: 'bg-purple-50 text-purple-600' },
            ].map((s, i) => (
              <div key={i} className="card-static p-5 rounded-2xl">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
                <p className="text-2xl font-extrabold text-[var(--color-secondary)]">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {stats.usersByRole && (
            <div className="card-static p-6 rounded-2xl">
              <h3 className="text-base font-bold text-gray-700 mb-3">Users by Role</h3>
              <div className="flex gap-4">
                {Object.entries(stats.usersByRole).map(([role, count]) => (
                  <div key={role} className="flex items-center gap-2">
                    <span className="capitalize text-sm font-medium text-gray-700">{role}:</span>
                    <span className="text-sm font-bold text-[var(--color-primary)]">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.bookingsByStatus && (
            <div className="card-static p-6 rounded-2xl">
              <h3 className="text-base font-bold text-gray-700 mb-3">Bookings by Status</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(stats.bookingsByStatus).map(([status, count]) => (
                  <span key={status} className={`badge status-${status} text-xs px-3 py-1`}>{statusLabels[status] || status}: {count}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search users..." className="input-field mb-4 max-w-md" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200">
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Name</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Email</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Role</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Trust</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Joined</th>
                <th className="text-left py-3 px-3 text-gray-500 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium">{u.name} {u.isSuspended && <span className="text-red-500 text-xs">(suspended)</span>}</td>
                    <td className="py-3 px-3 text-gray-500">{u.email}</td>
                    <td className="py-3 px-3 capitalize">{u.role}</td>
                    <td className="py-3 px-3">{u.trustScore}</td>
                    <td className="py-3 px-3 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                    <td className="py-3 px-3">
                      {u.role !== 'admin' && (
                        <button onClick={() => handleSuspend(u._id)} className={`btn-sm ${u.isSuspended ? 'btn-primary' : 'btn-danger'}`}>
                          <HiOutlineBan className="w-3 h-3" /> {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Listings */}
      {activeTab === 'listings' && (
        <div>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search listings..." className="input-field mb-4 max-w-md" />
          <div className="space-y-3">
            {listings.map((l) => (
              <div key={l._id} className="card-static p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{l.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{l.city} • by {l.landlord?.name || 'Unknown'} • {l.isActive ? '✅ Active' : '❌ Inactive'}</p>
                </div>
                <button onClick={() => handleToggleListing(l._id)} className={`btn-sm ${l.isActive ? 'btn-danger' : 'btn-primary'}`}>
                  {l.isActive ? <><HiOutlineEyeOff className="w-3 h-3" /> Deactivate</> : <><HiOutlineEye className="w-3 h-3" /> Activate</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="card-static p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 text-sm font-bold">★ {r.rating}/5</span>
                  <span className="text-xs text-gray-400">by {r.reviewer?.name}</span>
                  <span className="text-xs text-gray-400">on {r.listing?.title}</span>
                  {r.isHidden && <span className="badge bg-red-50 text-red-600">Hidden</span>}
                </div>
                <p className="text-xs text-gray-600 mt-1 line-clamp-1">{r.comment}</p>
              </div>
              <button onClick={() => handleToggleReview(r._id)} className={`btn-sm ${r.isHidden ? 'btn-primary' : 'btn-danger'}`}>
                {r.isHidden ? <><HiOutlineEye className="w-3 h-3" /> Show</> : <><HiOutlineEyeOff className="w-3 h-3" /> Hide</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
