import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { searchListings } from '../store/listingSlice';
import ListingCard from '../components/ListingCard';
import { useDebounce } from '../hooks/useCustomHooks';
import { listingTypeLabels, genderLabels, amenityLabels } from '../utils/helpers';
import { HiOutlineSearch, HiOutlineAdjustments, HiOutlineX } from 'react-icons/hi';

const SearchListings = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { listings, pagination, loading } = useSelector((s) => s.listings);
  const [showFilters, setShowFilters] = useState(false);

  // Read filters from URL
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    area: searchParams.get('area') || '',
    type: searchParams.get('type') || '',
    minRent: searchParams.get('minRent') || '',
    maxRent: searchParams.get('maxRent') || '',
    gender: searchParams.get('gender') || '',
    amenities: searchParams.get('amenities') || '',
    furnishing: searchParams.get('furnishing') || '',
    mealsIncluded: searchParams.get('mealsIncluded') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: parseInt(searchParams.get('page')) || 1,
  });

  const debouncedSearch = useDebounce(filters.search, 400);

  // Fetch listings when filters change
  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([key, val]) => {
      if (val && val !== '') params[key] = val;
    });
    // Use debounced search
    if (debouncedSearch) params.search = debouncedSearch;
    else delete params.search;

    dispatch(searchListings(params));

    // Update URL
    const newParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val && key !== 'page') newParams.set(key, val);
      if (key === 'page' && val > 1) newParams.set(key, val);
    });
    setSearchParams(newParams, { replace: true });
  }, [debouncedSearch, filters.city, filters.area, filters.type, filters.minRent, filters.maxRent, filters.gender, filters.amenities, filters.furnishing, filters.mealsIncluded, filters.sortBy, filters.sortOrder, filters.page, dispatch]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '', city: '', area: '', type: '', minRent: '', maxRent: '',
      gender: '', amenities: '', furnishing: '', mealsIncluded: '',
      sortBy: 'createdAt', sortOrder: 'desc', page: 1,
    });
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, val]) => val && !['search', 'sortBy', 'sortOrder', 'page'].includes(key)
  ).length;

  return (
    <div className="page-container fade-in">
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="section-title">Find Your Room</h1>
        <p className="text-sm text-gray-500">
          {pagination ? `${pagination.total} rooms found` : 'Searching...'}
        </p>
      </div>

      {/* Search Bar + Filter Toggle */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            placeholder="Search by city, area, landmark..."
            className="input-field pl-10"
            id="search-input"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center gap-2 ${showFilters ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : ''}`}
          id="filter-toggle-btn"
        >
          <HiOutlineAdjustments className="w-5 h-5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-[var(--color-primary)] text-white text-xs rounded-full flex items-center justify-center">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card-static p-6 mb-6 rounded-2xl slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-700">Filters</h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-[var(--color-primary)] font-medium hover:underline border-none bg-transparent cursor-pointer">
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">City</label>
              <select value={filters.city} onChange={(e) => updateFilter('city', e.target.value)} className="input-field text-sm" id="filter-city">
                <option value="">All Cities</option>
                {['bangalore','mumbai','delhi','pune','hyderabad','chennai','kolkata','jaipur','lucknow','noida','gurgaon','chandigarh'].map((c) => (
                  <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Area</label>
              <input type="text" value={filters.area} onChange={(e) => updateFilter('area', e.target.value)} placeholder="e.g., Koramangala" className="input-field text-sm" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Room Type</label>
              <select value={filters.type} onChange={(e) => updateFilter('type', e.target.value)} className="input-field text-sm" id="filter-type">
                <option value="">All Types</option>
                {Object.entries(listingTypeLabels).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Gender</label>
              <select value={filters.gender} onChange={(e) => updateFilter('gender', e.target.value)} className="input-field text-sm" id="filter-gender">
                <option value="">Any</option>
                {Object.entries(genderLabels).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Min Rent (₹)</label>
              <input type="number" value={filters.minRent} onChange={(e) => updateFilter('minRent', e.target.value)} placeholder="2000" className="input-field text-sm" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Max Rent (₹)</label>
              <input type="number" value={filters.maxRent} onChange={(e) => updateFilter('maxRent', e.target.value)} placeholder="15000" className="input-field text-sm" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Furnishing</label>
              <select value={filters.furnishing} onChange={(e) => updateFilter('furnishing', e.target.value)} className="input-field text-sm">
                <option value="">Any</option>
                <option value="furnished">Furnished</option>
                <option value="semi_furnished">Semi Furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Meals</label>
              <select value={filters.mealsIncluded} onChange={(e) => updateFilter('mealsIncluded', e.target.value)} className="input-field text-sm">
                <option value="">Any</option>
                <option value="true">Meals Included</option>
                <option value="false">No Meals</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Sort Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500">Sort by:</label>
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
            }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none cursor-pointer"
            id="sort-select"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="rent-asc">Rent: Low → High</option>
            <option value="rent-desc">Rent: High → Low</option>
            <option value="averageRating-desc">Highest Rated</option>
            <option value="viewCount-desc">Most Viewed</option>
          </select>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="skeleton h-80 rounded-2xl" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">🔍</span>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No rooms found</h3>
          <p className="text-sm text-gray-500 mb-6">Try adjusting your filters or searching in a different area</p>
          <button onClick={clearFilters} className="btn-primary">Clear All Filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                className="btn-secondary btn-sm disabled:opacity-40"
              >← Prev</button>

              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setFilters((prev) => ({ ...prev, page: pageNum }))}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all border-none cursor-pointer ${
                      pagination.page === pageNum
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >{pageNum}</button>
                );
              })}

              <button
                disabled={!pagination.hasMore}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                className="btn-secondary btn-sm disabled:opacity-40"
              >Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchListings;
