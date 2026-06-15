import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyBookings, cancelBooking } from '../store/bookingSlice';
import { getNotifications, markAsRead, markAllAsRead } from '../store/notificationSlice';
import { Link } from 'react-router-dom';
import { formatRent, formatDate, statusLabels, timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';
import { HiOutlineCalendar, HiOutlineBell, HiOutlinePhone, HiOutlineStar } from 'react-icons/hi';

const TenantDashboard = () => {
  const dispatch = useDispatch();
  const { myBookings, loading, actionLoading } = useSelector((s) => s.bookings);
  const { items: notifications, unreadCount, loading: notiLoading } = useSelector((s) => s.notifications);
  const [activeTab, setActiveTab] = useState('bookings');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(getMyBookings(statusFilter ? { status: statusFilter } : {}));
    dispatch(getNotifications({}));
  }, [dispatch, statusFilter]);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    const result = await dispatch(cancelBooking(id));
    if (!result.error) toast.success('Booking cancelled');
    else toast.error(result.payload || 'Failed to cancel');
  };

  const tabs = [
    { id: 'bookings', label: 'My Bookings', icon: <HiOutlineCalendar className="w-4 h-4" />, count: myBookings.length },
    { id: 'notifications', label: 'Notifications', icon: <HiOutlineBell className="w-4 h-4" />, count: unreadCount },
  ];

  return (
    <div className="page-container fade-in">
      <div className="mb-6">
        <h1 className="section-title">Dashboard</h1>
        <p className="text-sm text-gray-500">Manage your bookings and notifications</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border-none cursor-pointer ${
              activeTab === tab.id ? 'bg-white shadow-sm text-[var(--color-primary)]' : 'bg-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.icon} {tab.label}
            {tab.count > 0 && (
              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                activeTab === tab.id ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-300 text-gray-600'
              }`}>{tab.count > 99 ? '99+' : tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div>
          {/* Status filter chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['', 'requested', 'approved', 'active', 'completed', 'cancelled', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border-none cursor-pointer ${
                  statusFilter === s ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >{s ? statusLabels[s] : 'All'}</button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>
          ) : myBookings.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl block mb-4">📋</span>
              <h3 className="text-lg font-bold text-gray-700 mb-2">No bookings yet</h3>
              <p className="text-sm text-gray-500 mb-4">Start exploring rooms and send your first booking request!</p>
              <Link to="/search" className="btn-primary">Browse Rooms</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map((booking) => (
                <div key={booking._id} className="card-static p-5 rounded-2xl flex flex-col sm:flex-row gap-4">
                  {/* Listing Image */}
                  <Link to={`/listings/${booking.listing?._id}`} className="w-full sm:w-40 h-28 rounded-xl overflow-hidden flex-shrink-0 block">
                    <img src={booking.listing?.images?.[0]?.url || 'https://placehold.co/200x140/E67E22/white?text=Room'} alt="" className="w-full h-full object-contain bg-gray-100" />
                  </Link>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to={`/listings/${booking.listing?._id}`} className="text-sm font-bold text-[var(--color-secondary)] hover:text-[var(--color-primary)] line-clamp-1 no-underline">
                          {booking.listing?.title}
                        </Link>
                        <p className="text-xs text-gray-500 capitalize mt-0.5">{booking.listing?.area}, {booking.listing?.city}</p>
                      </div>
                      <span className={`badge status-${booking.status} flex-shrink-0`}>{statusLabels[booking.status]}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                      <span>💰 {formatRent(booking.listing?.rent)}/mo</span>
                      <span>📅 Move-in: {formatDate(booking.moveInDate)}</span>
                      <span>⏱️ {booking.duration} month{booking.duration > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {['requested', 'approved'].includes(booking.status) && (
                        <button onClick={() => handleCancel(booking._id)} disabled={actionLoading} className="btn-danger btn-sm">Cancel</button>
                      )}
                      {booking.landlord?.phone && ['requested', 'approved', 'active', 'completed'].includes(booking.status) && (
                        <a href={`tel:${booking.landlord.phone}`} className="btn-secondary btn-sm no-underline flex items-center gap-1">
                           <HiOutlinePhone className="w-3 h-3" /> Call Landlord
                        </a>
                      )}
                      {booking.status === 'completed' && (
                        <Link to={`/listings/${booking.listing?._id}`} state={{ showReviewModal: true, bookingId: booking._id }} className="btn-secondary btn-sm no-underline flex items-center gap-1">
                          <HiOutlineStar className="w-3 h-3" /> Leave Review
                        </Link>
                      )}
                    </div>
                    {booking.rejectionReason && (
                      <p className="text-xs text-red-500 mt-2 bg-red-50 p-2 rounded-lg">Reason: {booking.rejectionReason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div>
          {unreadCount > 0 && (
            <div className="flex justify-end mb-4">
              <button onClick={() => dispatch(markAllAsRead())} className="text-xs text-[var(--color-primary)] font-medium hover:underline border-none bg-transparent cursor-pointer">
                Mark all as read
              </button>
            </div>
          )}

          {notiLoading ? (
            <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl block mb-4">🔔</span>
              <h3 className="text-lg font-bold text-gray-700 mb-2">No notifications</h3>
              <p className="text-sm text-gray-500">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && dispatch(markAsRead(n._id))}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    n.isRead ? 'bg-white border-gray-100' : 'bg-orange-50/50 border-orange-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.isRead ? 'bg-transparent' : 'bg-[var(--color-primary)]'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TenantDashboard;
