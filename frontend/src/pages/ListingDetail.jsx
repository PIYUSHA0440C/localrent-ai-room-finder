import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getListingById } from '../store/listingSlice';
import { createBooking } from '../store/bookingSlice';
import { getListingReviews, createReview, checkReviewEligibility } from '../store/reviewSlice';
import { formatRent, formatDate, listingTypeLabels, genderLabels, furnishingLabels, amenityLabels, trustBadgeConfig, timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';
import { HiOutlineLocationMarker, HiOutlineStar, HiOutlineCalendar, HiOutlineCurrencyRupee, HiOutlineEye, HiOutlineShieldCheck, HiOutlineCheck, HiOutlinePhone } from 'react-icons/hi';
import { HiSparkles } from 'react-icons/hi2';
import api from '../lib/api';

const ListingDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentListing: listing, detailLoading } = useSelector((s) => s.listings);
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const { reviews, eligibility } = useSelector((s) => s.reviews);
  const { actionLoading: bookingLoading } = useSelector((s) => s.bookings);

  const [activeImage, setActiveImage] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({ moveInDate: '', duration: 6, message: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ bookingId: '', rating: 5, comment: '' });
  const [reviewSummary, setReviewSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const location = useLocation();

  useEffect(() => {
    dispatch(getListingById(id));
    dispatch(getListingReviews({ listingId: id }));
    if (isAuthenticated && user?.role === 'tenant') {
      dispatch(checkReviewEligibility(id));
    }
  }, [id, dispatch, isAuthenticated, user]);

  useEffect(() => {
    // Check if we navigated here specifically to leave a review
    if (location.state?.showReviewModal && location.state?.bookingId) {
      setReviewData(prev => ({ ...prev, bookingId: location.state.bookingId }));
      setShowReviewForm(true);
      // Clean up state so refresh doesn't reopen modal
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const result = await dispatch(createBooking({ listingId: id, ...bookingData }));
    if (!result.error) {
      toast.success('Booking request sent! The landlord will review it.');
      setShowBookingForm(false);
    } else {
      toast.error(result.payload || 'Booking failed');
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    const result = await dispatch(createReview({ bookingId: reviewData.bookingId, rating: reviewData.rating, comment: reviewData.comment }));
    if (!result.error) {
      toast.success('Review submitted!');
      setShowReviewForm(false);
      // Check eligibility again to hide the button
      if (isAuthenticated && user?.role === 'tenant') {
        dispatch(checkReviewEligibility(id));
      }
    } else {
      toast.error(result.payload || 'Failed to submit review');
    }
  };

  const handleSummarizeReviews = async () => {
    setIsSummarizing(true);
    try {
      const response = await api.post('/ai/summarize-reviews', { listingId: id });
      setReviewSummary(response.data.summary);
      toast.success('Reviews summarized!');
    } catch (err) {
      toast.error('Failed to summarize reviews');
    } finally {
      setIsSummarizing(false);
    }
  };

  if (detailLoading) {
    return (
      <div className="page-container">
        <div className="skeleton h-96 rounded-2xl mb-6" />
        <div className="skeleton h-8 w-2/3 mb-4" />
        <div className="skeleton h-4 w-1/3 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><div className="skeleton h-64 rounded-2xl" /></div>
          <div><div className="skeleton h-64 rounded-2xl" /></div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="page-container text-center py-20">
        <span className="text-6xl block mb-4">😕</span>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Listing not found</h2>
        <Link to="/search" className="btn-primary mt-4">Browse Rooms</Link>
      </div>
    );
  }

  const badge = trustBadgeConfig[listing.landlord?.trustBadge] || trustBadgeConfig.new;
  const canBook = isAuthenticated && user?.role === 'tenant' && listing.isAvailable;

  return (
    <div className="page-container fade-in">
      {/* Image Gallery */}
      <div className="mb-8">
        <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-[16/9] md:aspect-[21/9] mb-3">
          <img
            src={listing.images?.[activeImage]?.url || 'https://placehold.co/1200x500/E67E22/white?text=No+Images'}
            alt={listing.title}
            className="w-full h-full object-contain"
          />
        </div>
        {listing.images?.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {listing.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${i === activeImage ? 'border-[var(--color-primary)]' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img.url} alt="" className="w-full h-full object-contain bg-gray-100" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="badge bg-orange-50 text-[var(--color-primary)] font-semibold">{listingTypeLabels[listing.type]}</span>
              {listing.genderPreference !== 'any' && (
                <span className={`badge ${listing.genderPreference === 'girls' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'}`}>
                  {genderLabels[listing.genderPreference]}
                </span>
              )}
              {!listing.isAvailable && <span className="badge bg-red-50 text-red-700">Not Available</span>}
              {listing.mealsIncluded && <span className="badge bg-green-50 text-green-700">🍽️ Meals Included</span>}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--color-secondary)] mb-2">{listing.title}</h1>
            <p className="flex items-center gap-1.5 text-gray-500 text-sm capitalize">
              <HiOutlineLocationMarker className="w-4 h-4 text-[var(--color-primary)]" />
              {listing.area}, {listing.city}
              {listing.landmark && <span> • Near {listing.landmark}</span>}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card-static p-4 text-center rounded-xl">
              <HiOutlineCurrencyRupee className="w-5 h-5 mx-auto mb-1 text-[var(--color-primary)]" />
              <p className="text-lg font-extrabold text-[var(--color-secondary)]">{formatRent(listing.rent)}</p>
              <p className="text-xs text-gray-500">per month</p>
            </div>
            <div className="card-static p-4 text-center rounded-xl">
              <HiOutlineCurrencyRupee className="w-5 h-5 mx-auto mb-1 text-gray-400" />
              <p className="text-lg font-extrabold text-[var(--color-secondary)]">{formatRent(listing.deposit)}</p>
              <p className="text-xs text-gray-500">deposit</p>
            </div>
            <div className="card-static p-4 text-center rounded-xl">
              <HiOutlineStar className="w-5 h-5 mx-auto mb-1 text-amber-500" />
              <p className="text-lg font-extrabold text-[var(--color-secondary)]">{listing.averageRating > 0 ? listing.averageRating.toFixed(1) : '–'}</p>
              <p className="text-xs text-gray-500">{listing.totalReviews} reviews</p>
            </div>
            <div className="card-static p-4 text-center rounded-xl">
              <HiOutlineEye className="w-5 h-5 mx-auto mb-1 text-gray-400" />
              <p className="text-lg font-extrabold text-[var(--color-secondary)]">{listing.viewCount}</p>
              <p className="text-xs text-gray-500">views</p>
            </div>
          </div>

          {/* Description */}
          <div className="card-static p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-[var(--color-secondary)] mb-3">About this place</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>

          {/* Details */}
          <div className="card-static p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-[var(--color-secondary)] mb-4">Details</h2>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div className="text-gray-500">Furnishing</div>
              <div className="font-medium text-gray-800">{furnishingLabels[listing.furnishing]}</div>
              <div className="text-gray-500">Max Occupants</div>
              <div className="font-medium text-gray-800">{listing.maxOccupants}</div>
              <div className="text-gray-500">Gender</div>
              <div className="font-medium text-gray-800">{genderLabels[listing.genderPreference]}</div>
              <div className="text-gray-500">Listed</div>
              <div className="font-medium text-gray-800">{formatDate(listing.createdAt)}</div>
            </div>
          </div>

          {/* Amenities */}
          {listing.amenities?.length > 0 && (
            <div className="card-static p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-[var(--color-secondary)] mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {listing.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-gray-700">
                    <HiOutlineCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{amenityLabels[a] || a.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* House Rules */}
          {listing.houseRules?.length > 0 && (
            <div className="card-static p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-[var(--color-secondary)] mb-4">House Rules</h2>
              <div className="flex flex-wrap gap-2">
                {listing.houseRules.map((r) => (
                  <span key={r} className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-full capitalize">
                    🚫 {r.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="card-static p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--color-secondary)]">
                Reviews {listing.totalReviews > 0 && `(${listing.totalReviews})`}
              </h2>
              <div className="flex gap-2">
                {eligibility?.canReview && (
                  <button 
                    onClick={() => {
                      setReviewData(prev => ({ ...prev, bookingId: eligibility.bookingId }));
                      setShowReviewForm(true);
                    }}
                    className="btn-primary btn-sm flex items-center gap-1 cursor-pointer"
                  >
                    <HiOutlineStar className="w-4 h-4" /> Write a Review
                  </button>
                )}
                {reviews.length > 0 && (
                  <button 
                    onClick={handleSummarizeReviews} 
                    disabled={isSummarizing}
                    className="btn-secondary btn-sm flex items-center gap-1 cursor-pointer"
                  >
                    {isSummarizing ? <><span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>...</> : <><HiSparkles className="w-4 h-4 text-purple-500" /> AI Summary</>}
                  </button>
                )}
              </div>
            </div>

            {reviewSummary && (
              <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100 flex gap-3 items-start fade-in">
                <HiSparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-purple-900 mb-1">AI Summary</h4>
                  <p className="text-sm text-purple-800 leading-relaxed whitespace-pre-line">{reviewSummary}</p>
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-100 pb-4 last:border-none last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold">
                        {review.reviewer?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{review.reviewer?.name}</p>
                        <p className="text-xs text-gray-400">{timeAgo(review.createdAt)}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <HiOutlineStar key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed ml-11">{review.comment}</p>
                    {review.isEdited && <span className="text-xs text-gray-400 ml-11">(edited)</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Card */}
          <div className="card-static p-6 rounded-2xl sticky top-20">
            <div className="text-center mb-4">
              <p className="text-3xl font-extrabold text-[var(--color-secondary)]">{formatRent(listing.rent)}<span className="text-sm font-normal text-gray-500">/mo</span></p>
              <p className="text-xs text-gray-500 mt-1">+ {formatRent(listing.deposit)} deposit</p>
            </div>

            {canBook ? (
              showBookingForm ? (
                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Move-in Date</label>
                    <input type="date" required value={bookingData.moveInDate} onChange={(e) => setBookingData((p) => ({ ...p, moveInDate: e.target.value }))}
                      min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Duration (months)</label>
                    <select value={bookingData.duration} onChange={(e) => setBookingData((p) => ({ ...p, duration: parseInt(e.target.value) }))} className="input-field text-sm">
                      {[1,2,3,6,9,12,18,24].map((m) => <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Message (optional)</label>
                    <textarea value={bookingData.message} onChange={(e) => setBookingData((p) => ({ ...p, message: e.target.value }))}
                      placeholder="Introduce yourself..." rows={3} className="input-field text-sm resize-none" maxLength={500} />
                  </div>
                  <button type="submit" disabled={bookingLoading} className="btn-primary w-full py-3">
                    {bookingLoading ? 'Sending...' : 'Send Booking Request'}
                  </button>
                  <button type="button" onClick={() => setShowBookingForm(false)} className="btn-secondary w-full">Cancel</button>
                </form>
              ) : (
                <button onClick={() => setShowBookingForm(true)} className="btn-primary w-full py-3" id="book-now-btn">
                  <HiOutlineCalendar className="w-5 h-5" /> Book This Room
                </button>
              )
            ) : !isAuthenticated ? (
              <Link to="/login" className="btn-primary w-full py-3 text-center block">Sign in to Book</Link>
            ) : !listing.isAvailable ? (
              <p className="text-center text-sm text-red-500 font-medium py-3">Currently occupied</p>
            ) : user?.role === 'landlord' ? (
              <p className="text-center text-sm text-gray-500 py-3">Landlords cannot book rooms</p>
            ) : null}

            {listing.isAvailable && (
              <p className="flex items-center justify-center gap-1.5 text-xs text-green-600 mt-3 font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Available now
              </p>
            )}
          </div>

          {/* Landlord Card */}
          <div className="card-static p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Listed by</h3>
            <Link to={`/users/${listing.landlord?._id}`} className="flex items-center gap-3 no-underline group">
              {listing.landlord?.avatar ? (
                <img src={listing.landlord.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] flex items-center justify-center text-white text-lg font-bold">
                  {listing.landlord?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-[var(--color-primary)]">{listing.landlord?.name}</p>
                <span className={`badge ${badge.className} mt-0.5`}>{badge.icon} {badge.label}</span>
              </div>
            </Link>
            
            {/* Landlord Contact Phone */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              {isAuthenticated ? (
                listing.landlord?.phone ? (
                  <a href={`tel:${listing.landlord.phone}`} className="btn-secondary w-full flex items-center justify-center gap-2 no-underline">
                    <HiOutlinePhone className="w-4 h-4" /> Call Landlord
                  </a>
                ) : (
                  <p className="text-sm text-gray-500 text-center">Phone number not provided</p>
                )
              ) : (
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">Contact details are hidden</p>
                  <Link to="/login" className="btn-secondary btn-sm block mx-auto w-fit">Sign in to view</Link>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-[var(--color-secondary)]">{listing.landlord?.trustScore || 0}</p>
                <p className="text-xs text-gray-500">Trust Score</p>
              </div>
              <div>
                <p className="text-lg font-bold text-[var(--color-secondary)]">{listing.landlord?.completedBookings || 0}</p>
                <p className="text-xs text-gray-500">Bookings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm fade-in">
          <div className="card-static w-full max-w-md p-6 slide-up" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-[var(--color-secondary)] mb-4">Rate your stay</h2>
            <form onSubmit={handleReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData(p => ({ ...p, rating: star }))}
                      className="text-2xl border-none bg-transparent cursor-pointer hover:scale-110 transition-transform"
                    >
                      {star <= reviewData.rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Comment</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData(p => ({ ...p, comment: e.target.value }))}
                  required
                  minLength={10}
                  placeholder="Tell us what you liked (or didn't like) about this place... (min 10 chars)"
                  className="input-field resize-none h-32"
                  maxLength={500}
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1 py-2.5">Submit Review</button>
                <button type="button" onClick={() => setShowReviewForm(false)} className="btn-secondary flex-1 py-2.5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;
