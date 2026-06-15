import { Link } from 'react-router-dom';
import { formatRent, listingTypeLabels, genderLabels, trustBadgeConfig } from '../utils/helpers';
import { HiOutlineLocationMarker, HiOutlineStar, HiOutlineEye } from 'react-icons/hi';

const ListingCard = ({ listing }) => {
  const mainImage = listing.images?.[0]?.url || 'https://placehold.co/400x250/E67E22/white?text=No+Image';
  const badge = trustBadgeConfig[listing.landlord?.trustBadge] || trustBadgeConfig.new;

  return (
    <Link to={`/listings/${listing._id}`} className="card overflow-hidden block no-underline group">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[16/10] bg-gray-100">
        <img
          src={mainImage}
          alt={listing.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Type badge */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-[var(--color-secondary)]">
          {listingTypeLabels[listing.type] || listing.type}
        </span>
        {/* Gender badge */}
        {listing.genderPreference && listing.genderPreference !== 'any' && (
          <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${listing.genderPreference === 'girls' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
            {genderLabels[listing.genderPreference]}
          </span>
        )}
        {/* Meals tag */}
        {listing.mealsIncluded && (
          <span className="absolute bottom-3 left-3 bg-green-500/90 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            🍽️ Meals
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Rent */}
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xl font-extrabold text-[var(--color-secondary)]">
            {formatRent(listing.rent)}
            <span className="text-xs font-normal text-gray-500">/mo</span>
          </span>
          {listing.averageRating > 0 && (
            <span className="flex items-center gap-1 text-sm text-amber-600 font-semibold">
              <HiOutlineStar className="w-4 h-4 fill-amber-400 text-amber-400" />
              {listing.averageRating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-800 mb-1.5 line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
          {listing.title}
        </h3>

        {/* Location */}
        <p className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <HiOutlineLocationMarker className="w-3.5 h-3.5 text-[var(--color-primary)]" />
          <span className="capitalize">{listing.area}</span>
          {listing.city && <span className="capitalize">, {listing.city}</span>}
        </p>

        {/* Amenities preview */}
        {listing.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {listing.amenities.slice(0, 4).map((a) => (
              <span key={a} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                {a.replace('_', ' ')}
              </span>
            ))}
            {listing.amenities.length > 4 && (
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                +{listing.amenities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Footer: Landlord + Views */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {listing.landlord?.avatar ? (
              <img src={listing.landlord.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary)] flex items-center justify-center text-white text-[10px] font-bold">
                {listing.landlord?.name?.[0]?.toUpperCase() || 'L'}
              </div>
            )}
            <span className="text-xs text-gray-600 font-medium max-w-[80px] truncate">{listing.landlord?.name || 'Landlord'}</span>
            <span className={`badge ${badge.className}`} style={{fontSize: '9px', padding: '1px 5px'}}>
              {badge.icon} {badge.label}
            </span>
          </div>
          {listing.viewCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <HiOutlineEye className="w-3 h-3" /> {listing.viewCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
