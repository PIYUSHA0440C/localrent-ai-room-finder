import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyListings, deleteListing } from '../store/listingSlice';
import { getLandlordBookings, approveBooking, rejectBooking, activateBooking, completeBooking } from '../store/bookingSlice';
import { Link } from 'react-router-dom';
import { formatRent, formatDate, statusLabels, trustBadgeConfig, timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineX, HiOutlinePlay, HiOutlineFlag } from 'react-icons/hi';

const LandlordDashboard = () => {
  const dispatch = useDispatch();
  const { myListings, loading: listingsLoading } = useSelector((s) => s.listings);
  const { landlordBookings, loading: bookingsLoading, actionLoading } = useSelector((s) => s.bookings);
  const [activeTab, setActiveTab] = useState('listings');
  const [statusFilter, setStatusFilter] = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    dispatch(getMyListings({}));
    dispatch(getLandlordBookings(statusFilter ? { status: statusFilter } : {}));
  }, [dispatch, statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will deactivate the listing.')) return;
    const r = await dispatch(deleteListing(id));
    if (!r.error) toast.success('Listing deactivated');
  };

  const handleApprove = async (id) => {
    const r = await dispatch(approveBooking(id));
    if (!r.error) toast.success('Booking approved!');
    else toast.error(r.payload);
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    const r = await dispatch(rejectBooking({ id: rejectModal, reason: rejectReason }));
    if (!r.error) toast.success('Booking rejected');
    else toast.error(r.payload);
    setRejectModal(null);
    setRejectReason('');
  };

  const handleActivate = async (id) => {
    const r = await dispatch(activateBooking(id));
    if (!r.error) toast.success('Tenant marked as moved in!');
    else toast.error(r.payload);
  };

  const handleComplete = async (id) => {
    if (!window.confirm('Mark this booking as completed?')) return;
    const r = await dispatch(completeBooking(id));
    if (!r.error) toast.success('Booking completed!');
    else toast.error(r.payload);
  };

  return (
    <div className="page-container fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Landlord Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your properties and booking requests</p>
        </div>
        <Link to="/listings/new" className="btn-primary" id="create-listing-btn">
          <HiOutlinePlus className="w-4 h-4" /> New Listing
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'listings', label: `My Listings (${myListings.length})` },
          { id: 'bookings', label: `Booking Requests (${landlordBookings.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-none cursor-pointer ${
              activeTab === tab.id ? 'bg-white shadow-sm text-[var(--color-primary)]' : 'bg-transparent text-gray-600'
            }`}
          >{tab.label}</button>
        ))}
      </div>

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        listingsLoading ? (
          <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
        ) : myListings.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🏠</span>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No listings yet</h3>
            <p className="text-sm text-gray-500 mb-4">Create your first listing and start receiving bookings!</p>
            <Link to="/listings/new" className="btn-primary">Create Listing</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myListings.map((listing) => (
              <div key={listing._id} className="card-static p-5 rounded-2xl flex flex-col sm:flex-row gap-4">
                <Link to={`/listings/${listing._id}`} className="w-full sm:w-36 h-24 rounded-xl overflow-hidden flex-shrink-0 block">
                  <img src={listing.images?.[0]?.url || 'https://placehold.co/200x120/E67E22/white?text=Room'} alt="" className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/listings/${listing._id}`} className="text-sm font-bold text-[var(--color-secondary)] hover:text-[var(--color-primary)] no-underline">
                        {listing.title}
                      </Link>
                      <p className="text-xs text-gray-500 capitalize">{listing.area}, {listing.city} • {formatRent(listing.rent)}/mo</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`badge ${listing.isAvailable && listing.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {listing.isAvailable && listing.isActive ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>⭐ {listing.averageRating > 0 ? listing.averageRating.toFixed(1) : '–'}</span>
                    <span>👁️ {listing.viewCount} views</span>
                    <span>📝 {listing.totalReviews} reviews</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Link to={`/listings/${listing._id}/edit`} className="btn-secondary btn-sm no-underline flex items-center gap-1"><HiOutlinePencil className="w-3 h-3" /> Edit</Link>
                    <button onClick={() => handleDelete(listing._id)} className="btn-danger btn-sm flex items-center gap-1"><HiOutlineTrash className="w-3 h-3" /> Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div>
          <div className="flex flex-wrap gap-2 mb-6">
            {['', 'requested', 'approved', 'active', 'completed', 'cancelled', 'rejected'].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border-none cursor-pointer ${statusFilter === s ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s ? statusLabels[s] : 'All'}
              </button>
            ))}
          </div>

          {bookingsLoading ? (
            <div className="space-y-4">{[1,2,3].map((i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}</div>
          ) : landlordBookings.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl block mb-4">📬</span>
              <h3 className="text-lg font-bold text-gray-700 mb-2">No booking requests</h3>
              <p className="text-sm text-gray-500">When tenants request to book your listings, they&apos;ll appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {landlordBookings.map((booking) => (
                <div key={booking._id} className="card-static p-5 rounded-2xl">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] flex items-center justify-center text-white font-bold text-lg">
                        {booking.tenant?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{booking.tenant?.name}</p>
                        <p className="text-xs text-gray-500">{booking.tenant?.email}</p>
                        {booking.tenant?.trustBadge && (
                          <span className={`badge badge-${booking.tenant.trustBadge} mt-0.5`}>
                            {trustBadgeConfig[booking.tenant.trustBadge]?.icon} {booking.tenant.trustBadge}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 border-l border-gray-100 pl-4 sm:ml-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-700">{booking.listing?.title}</p>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                            <span>📅 {formatDate(booking.moveInDate)}</span>
                            <span>⏱️ {booking.duration} months</span>
                            <span>💰 {formatRent(booking.listing?.rent)}/mo</span>
                          </div>
                        </div>
                        <span className={`badge status-${booking.status}`}>{statusLabels[booking.status]}</span>
                      </div>
                      {booking.message && (
                        <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg italic">&quot;{booking.message}&quot;</p>
                      )}
                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {booking.status === 'requested' && (
                          <>
                            <button onClick={() => handleApprove(booking._id)} disabled={actionLoading} className="btn-primary btn-sm"><HiOutlineCheck className="w-3 h-3" /> Approve</button>
                            <button onClick={() => setRejectModal(booking._id)} className="btn-danger btn-sm"><HiOutlineX className="w-3 h-3" /> Reject</button>
                          </>
                        )}
                        {booking.status === 'approved' && (
                          <button onClick={() => handleActivate(booking._id)} disabled={actionLoading} className="btn-primary btn-sm"><HiOutlinePlay className="w-3 h-3" /> Mark Moved In</button>
                        )}
                        {booking.status === 'active' && (
                          <button onClick={() => handleComplete(booking._id)} disabled={actionLoading} className="btn-secondary btn-sm"><HiOutlineFlag className="w-3 h-3" /> Complete</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md slide-up">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Reject Booking</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)..."
              rows={3}
              className="input-field mb-4 resize-none"
            />
            <div className="flex gap-3">
              <button onClick={handleReject} disabled={actionLoading} className="btn-danger flex-1">Reject</button>
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandlordDashboard;
