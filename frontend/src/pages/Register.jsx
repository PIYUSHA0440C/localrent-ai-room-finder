import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { register as registerUser, clearError } from '../store/authSlice';
import toast from 'react-hot-toast';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: searchParams.get('role') || 'tenant'
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) toast.error(error);
    return () => dispatch(clearError());
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(registerUser(formData)).unwrap();
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      // Error handled by useEffect and slice
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl mb-3 block">🏠</span>
          <h1 className="text-2xl font-extrabold text-[var(--color-secondary)]">Join LocalRent</h1>
          <p className="text-sm text-gray-500 mt-1">Create your free account</p>
        </div>

        <div className="card-static p-8 rounded-2xl">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => handleRoleChange('tenant')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${formData.role === 'tenant' ? 'border-[var(--color-primary)] bg-orange-50 text-[var(--color-primary)]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  🎒 Looking for Room
                </button>
                <button 
                  type="button"
                  onClick={() => handleRoleChange('landlord')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${formData.role === 'landlord' ? 'border-[var(--color-primary)] bg-orange-50 text-[var(--color-primary)]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  🏠 Listing Rooms
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-name">Full Name</label>
              <input 
                id="reg-name" 
                name="name"
                type="text" 
                value={formData.name}
                onChange={handleChange}
                required 
                minLength={2}
                className="input-field" 
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-email">Email</label>
              <input 
                id="reg-email" 
                name="email"
                type="email" 
                value={formData.email}
                onChange={handleChange}
                required 
                className="input-field" 
                placeholder="you@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-phone">Phone Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  +91
                </span>
                <input 
                  id="reg-phone" 
                  name="phone"
                  type="tel" 
                  pattern="[6-9][0-9]{9}"
                  title="Please enter a valid 10-digit Indian phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required 
                  className="input-field !rounded-l-none" 
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-password">Password</label>
              <input 
                id="reg-password" 
                name="password"
                type="password" 
                value={formData.password}
                onChange={handleChange}
                required 
                minLength={6}
                className="input-field" 
                placeholder="Min 6 characters"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3" id="register-submit-btn">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[var(--color-primary)] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
