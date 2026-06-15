import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createListing, updateListing, getListingById, uploadListingImages } from '../store/listingSlice';
import { useEffect, useState } from 'react';
import { listingTypeLabels, amenityLabels, furnishingLabels } from '../utils/helpers';
import toast from 'react-hot-toast';
import api from '../lib/api';

const CreateEditListing = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentListing, detailLoading } = useSelector((s) => s.listings);
  
  const [imageFiles, setImageFiles] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '', description: '', type: 'pg_room', rent: '', deposit: '',
    city: '', area: '', landmark: '', address: '',
    amenities: [], houseRules: [], genderPreference: 'any',
    maxOccupants: 1, furnishing: 'semi_furnished', mealsIncluded: false,
  });

  useEffect(() => {
    if (isEdit) dispatch(getListingById(id));
  }, [id, isEdit, dispatch]);

  useEffect(() => {
    if (isEdit && currentListing) {
      setFormData({
        title: currentListing.title || '',
        description: currentListing.description || '',
        type: currentListing.type || 'pg_room',
        rent: currentListing.rent || '',
        deposit: currentListing.deposit || '',
        city: currentListing.city || '',
        area: currentListing.area || '',
        landmark: currentListing.landmark || '',
        address: currentListing.address || '',
        amenities: currentListing.amenities || [],
        houseRules: currentListing.houseRules || [],
        genderPreference: currentListing.genderPreference || 'any',
        maxOccupants: currentListing.maxOccupants || 1,
        furnishing: currentListing.furnishing || 'semi_furnished',
        mealsIncluded: currentListing.mealsIncluded || false,
      });
    }
  }, [isEdit, currentListing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const toggleArrayField = (field, value) => {
    const current = formData[field];
    if (current.includes(value)) {
      setFormData({ ...formData, [field]: current.filter((v) => v !== value) });
    } else {
      setFormData({ ...formData, [field]: [...current, value] });
    }
  };

  const generateDescription = async () => {
    if (!formData.title || !formData.type || !formData.rent || !formData.city) {
      toast.error('Fill in title, type, rent, and city first');
      return;
    }
    setAiLoading(true);
    try {
      const response = await api.post('/ai/generate-description', formData);
      setFormData({ ...formData, description: response.data.description });
      toast.success('Description generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI service unavailable');
    }
    setAiLoading(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Convert string inputs to numbers where required
    const dataToSubmit = {
      ...formData,
      rent: Number(formData.rent),
      deposit: Number(formData.deposit),
      maxOccupants: Number(formData.maxOccupants),
    };

    try {
      let result;
      if (isEdit) {
        result = await dispatch(updateListing({ id, data: dataToSubmit }));
      } else {
        result = await dispatch(createListing(dataToSubmit));
      }

      if (result.error) {
        toast.error(result.payload || 'Failed to save listing');
        return;
      }

      const listingId = result.payload.listing._id;

      if (imageFiles.length > 0) {
        const imageFormData = new FormData();
        imageFiles.forEach((f) => imageFormData.append('images', f));
        await dispatch(uploadListingImages({ id: listingId, formData: imageFormData }));
      }

      toast.success(isEdit ? 'Listing updated!' : 'Listing created!');
      navigate(`/listings/${listingId}`);
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (isEdit && detailLoading) {
    return <div className="page-container"><div className="skeleton h-96 rounded-2xl" /></div>;
  }

  return (
    <div className="page-container fade-in">
      <div className="max-w-3xl mx-auto">
        <h1 className="section-title mb-6">{isEdit ? 'Edit Listing' : 'Create New Listing'}</h1>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="card-static p-6 rounded-2xl">
            <h2 className="text-base font-bold text-gray-700 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required minLength={5} className="input-field" placeholder="e.g., Spacious PG room near IIT Delhi" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-600">Description *</label>
                  <button type="button" onClick={generateDescription} disabled={aiLoading} className="text-xs text-[var(--color-primary)] font-medium hover:underline border-none bg-transparent cursor-pointer">
                    {aiLoading ? '✨ Generating...' : '✨ AI Generate'}
                  </button>
                </div>
                <textarea name="description" value={formData.description} onChange={handleChange} required minLength={20} className="input-field resize-none" rows={5} placeholder="Describe your room..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Room Type *</label>
                  <select name="type" value={formData.type} onChange={handleChange} required className="input-field">
                    {Object.entries(listingTypeLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Gender Preference</label>
                  <select name="genderPreference" value={formData.genderPreference} onChange={handleChange} className="input-field">
                    <option value="any">Any Gender</option>
                    <option value="boys">Boys Only</option>
                    <option value="girls">Girls Only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card-static p-6 rounded-2xl">
            <h2 className="text-base font-bold text-gray-700 mb-4">Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Monthly Rent (₹) *</label>
                <input type="number" name="rent" value={formData.rent} onChange={handleChange} required min="500" className="input-field" placeholder="5000" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Deposit (₹) *</label>
                <input type="number" name="deposit" value={formData.deposit} onChange={handleChange} required min="0" className="input-field" placeholder="10000" />
              </div>
            </div>
          </div>

          <div className="card-static p-6 rounded-2xl">
            <h2 className="text-base font-bold text-gray-700 mb-4">Location</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required className="input-field" placeholder="e.g., Bangalore" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Area *</label>
                <input type="text" name="area" value={formData.area} onChange={handleChange} required className="input-field" placeholder="e.g., Koramangala" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Landmark</label>
                <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} className="input-field" placeholder="e.g., Near Forum Mall" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Full Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="input-field" placeholder="Street, building" />
              </div>
            </div>
          </div>

          <div className="card-static p-6 rounded-2xl">
            <h2 className="text-base font-bold text-gray-700 mb-4">Room Details</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Furnishing</label>
                <select name="furnishing" value={formData.furnishing} onChange={handleChange} className="input-field">
                  {Object.entries(furnishingLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Max Occupants</label>
                <input type="number" name="maxOccupants" value={formData.maxOccupants} onChange={handleChange} min="1" max="10" className="input-field" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer p-2">
                  <input type="checkbox" name="mealsIncluded" checked={formData.mealsIncluded} onChange={handleChange} className="w-4 h-4 accent-[var(--color-primary)]" />
                  <span className="text-sm font-medium text-gray-700">Meals Included</span>
                </label>
              </div>
            </div>
          </div>

          <div className="card-static p-6 rounded-2xl">
            <h2 className="text-base font-bold text-gray-700 mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(amenityLabels).map(([key, label]) => (
                <button key={key} type="button" onClick={() => toggleArrayField('amenities', key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
                    formData.amenities.includes(key)
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >{label}</button>
              ))}
            </div>
          </div>

          <div className="card-static p-6 rounded-2xl">
            <h2 className="text-base font-bold text-gray-700 mb-4">House Rules</h2>
            <div className="flex flex-wrap gap-2">
              {['no_smoking', 'no_drinking', 'no_pets', 'no_guests', 'no_loud_music', 'vegetarian_only', 'gate_closing_time', 'id_required'].map((rule) => (
                <button key={rule} type="button" onClick={() => toggleArrayField('houseRules', rule)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
                    formData.houseRules.includes(rule)
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >🚫 {rule.replace(/_/g, ' ')}</button>
              ))}
            </div>
          </div>

          {!isEdit && (
            <div className="card-static p-6 rounded-2xl">
              <h2 className="text-base font-bold text-gray-700 mb-4">Photos (max 8)</h2>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImageFiles(Array.from(e.target.files).slice(0, 8))}
                className="input-field"
              />
              {imageFiles.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {imageFiles.map((f, i) => (
                    <div key={i} className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100">
                      <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-contain bg-gray-100" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button type="submit" className="btn-primary w-full py-3 text-base">
            {isEdit ? 'Update Listing' : 'Create Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEditListing;
