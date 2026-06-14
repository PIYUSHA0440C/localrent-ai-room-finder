import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getFeaturedListings } from '../store/listingSlice';
import { useEffect } from 'react';
import ListingCard from '../components/ListingCard';
import { HiOutlineSearch, HiOutlineShieldCheck, HiOutlineCurrencyRupee, HiOutlineLocationMarker, HiOutlineChat, HiOutlineStar } from 'react-icons/hi';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featured, loading } = useSelector((s) => s.listings);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(getFeaturedListings());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const popularCities = [
    { name: 'Bangalore', emoji: '🏙️' },
    { name: 'Mumbai', emoji: '🌊' },
    { name: 'Delhi', emoji: '🏛️' },
    { name: 'Pune', emoji: '🎓' },
    { name: 'Hyderabad', emoji: '🕌' },
    { name: 'Chennai', emoji: '🏖️' },
  ];

  const features = [
    { icon: <HiOutlineCurrencyRupee className="w-7 h-7" />, title: 'Zero Brokerage', desc: 'No broker fees, no hidden charges. Connect directly with landlords and PG owners.' },
    { icon: <HiOutlineShieldCheck className="w-7 h-7" />, title: 'Trust Scores', desc: 'Every user has a trust score. Verified profiles, real reviews, genuine listings.' },
    { icon: <HiOutlineLocationMarker className="w-7 h-7" />, title: 'Search by Landmark', desc: 'Find rooms near your college, coaching center, office, IT park, or metro station.' },
    { icon: <HiOutlineChat className="w-7 h-7" />, title: 'Direct Booking', desc: 'Send booking requests directly. Get approved and move in — no middlemen.' },
    { icon: <HiOutlineStar className="w-7 h-7" />, title: 'Real Reviews', desc: 'Read genuine reviews from past tenants before making your decision.' },
    { icon: <HiOutlineSearch className="w-7 h-7" />, title: 'Smart Search', desc: 'Use AI-powered search. Just type what you need in plain English.' },
  ];

  return (
    <div className="fade-in">
      {/* ======== HERO SECTION ======== */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 50%, #DBEAFE 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur text-sm font-medium text-[var(--color-primary-dark)] mb-6 shadow-sm">
              🎯 Trusted by 10,000+ students & professionals
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--color-secondary)] leading-tight mb-4">
              Find Your Perfect
              <span className="text-gradient block mt-1">Room, Zero Brokerage</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
              PGs, shared rooms & flats near your college or office. No brokers, no hassle — just verified listings from real landlords.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
              <div className="flex bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 focus-within:border-[var(--color-primary)] transition-all focus-within:shadow-[0_0_0_3px_rgba(230,126,34,0.1)]">
                <div className="flex items-center pl-5 text-gray-400">
                  <HiOutlineSearch className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Try "PG near IIT Delhi under 8000" or "2BHK in Koramangala"'
                  className="flex-1 px-4 py-4 text-sm bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400"
                  id="hero-search-input"
                />
                <button type="submit" className="btn-primary m-1.5 rounded-xl px-6" id="hero-search-btn">
                  Search
                </button>
              </div>
            </form>

            {/* Popular Cities */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <span className="text-xs text-gray-500">Popular:</span>
              {popularCities.map((city) => (
                <Link
                  key={city.name}
                  to={`/search?city=${city.name.toLowerCase()}`}
                  className="px-3 py-1.5 rounded-full bg-white/60 hover:bg-white text-xs font-medium text-gray-600 hover:text-[var(--color-primary)] transition-all hover:shadow-sm no-underline"
                >
                  {city.emoji} {city.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20" style={{background: 'radial-gradient(circle, var(--color-primary-light), transparent)'}} />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-15" style={{background: 'radial-gradient(circle, var(--color-accent), transparent)'}} />
      </section>

      {/* ======== HOW IT WORKS ======== */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="section-title">How LocalRent Works</h2>
            <p className="section-subtitle">Find and move into your room in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Search & Discover', desc: 'Search by city, area, or landmark. Filter by budget, type, and amenities. Use AI-powered natural language search.', emoji: '🔍' },
              { step: '02', title: 'Book Directly', desc: 'Found the right place? Send a booking request directly to the landlord. No brokers, no middlemen.', emoji: '📋' },
              { step: '03', title: 'Move In & Review', desc: 'Get approved, move in on your date. After your stay, leave a review to help future tenants.', emoji: '🏡' },
            ].map((item) => (
              <div key={item.step} className="text-center p-6 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 group">
                <div className="text-5xl mb-4">{item.emoji}</div>
                <span className="inline-block text-xs font-bold text-[var(--color-primary)] bg-orange-50 px-3 py-1 rounded-full mb-3">Step {item.step}</span>
                <h3 className="text-lg font-bold text-[var(--color-secondary)] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== FEATURES ======== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="section-title">Why Choose LocalRent?</h2>
            <p className="section-subtitle">Built for students and professionals moving to a new city</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-[var(--color-primary)] mb-4 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-[var(--color-secondary)] mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== FEATURED LISTINGS ======== */}
      {(featured.recent?.length > 0 || featured.topRated?.length > 0) && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {featured.recent?.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="section-title">Recently Added</h2>
                    <p className="text-sm text-gray-500">Fresh listings from across India</p>
                  </div>
                  <Link to="/search?sortBy=createdAt" className="btn-secondary btn-sm">View All →</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  {featured.recent.map((listing) => (
                    <ListingCard key={listing._id} listing={listing} />
                  ))}
                </div>
              </>
            )}

            {featured.topRated?.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="section-title">Top Rated</h2>
                    <p className="text-sm text-gray-500">Highest-rated rooms by tenants</p>
                  </div>
                  <Link to="/search?sortBy=averageRating" className="btn-secondary btn-sm">View All →</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featured.topRated.map((listing) => (
                    <ListingCard key={listing._id} listing={listing} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {loading && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map((i) => (
                <div key={i} className="skeleton h-72 rounded-2xl" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======== CTA ======== */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, var(--color-secondary) 0%, #1a252f 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to find your room?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join thousands of students and professionals who found their perfect room without paying broker fees.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/search" className="btn-primary px-8 py-3 text-base rounded-xl">
              🔍 Start Searching
            </Link>
            <Link to="/register?role=landlord" className="btn-secondary px-8 py-3 text-base rounded-xl bg-transparent border-gray-600 text-gray-300 hover:border-white hover:text-white">
              🏠 List Your Property
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
