import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { trustBadgeConfig, formatDate } from '../utils/helpers';

const PublicProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        setUser(response.data.user);
      } catch {
        setUser(null);
      }
      setLoading(false);
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return <div className="page-container"><div className="skeleton h-64 max-w-md mx-auto rounded-2xl" /></div>;
  }

  if (!user) {
    return (
      <div className="page-container text-center py-20">
        <span className="text-6xl block mb-4">😕</span>
        <h2 className="text-xl font-bold text-gray-700">User not found</h2>
      </div>
    );
  }

  const badge = trustBadgeConfig[user.trustBadge] || trustBadgeConfig.new;

  return (
    <div className="page-container fade-in">
      <div className="max-w-md mx-auto card-static p-8 rounded-2xl text-center">
        {user.avatar ? (
          <img src={user.avatar} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 border-4 border-white shadow-lg">
            {user.name?.[0]?.toUpperCase()}
          </div>
        )}

        <h2 className="text-xl font-bold text-[var(--color-secondary)]">{user.name}</h2>
        <p className="text-sm text-gray-500 capitalize mt-1">{user.role} • {user.city || 'India'}</p>
        {user.bio && <p className="text-sm text-gray-600 mt-3">{user.bio}</p>}

        <div className="flex items-center justify-center gap-3 mt-4">
          <span className={`badge ${badge.className}`}>{badge.icon} {badge.label}</span>
          <span className="text-xs text-gray-500">Score: {user.trustScore}/100</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div>
            <p className="text-xl font-bold text-[var(--color-secondary)]">{user.completedBookings || 0}</p>
            <p className="text-xs text-gray-500">Bookings</p>
          </div>
          <div>
            <p className="text-xl font-bold text-[var(--color-secondary)]">{user.averageRating > 0 ? user.averageRating.toFixed(1) : '–'}</p>
            <p className="text-xs text-gray-500">Rating</p>
          </div>
          <div>
            <p className="text-xl font-bold text-[var(--color-secondary)]">{formatDate(user.createdAt)}</p>
            <p className="text-xs text-gray-500">Joined</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
