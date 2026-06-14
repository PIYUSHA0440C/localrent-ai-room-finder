import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { register as registerUser, clearError } from '../store/authSlice';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: { role: searchParams.get('role') || 'tenant' },
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) toast.error(error);
    return () => dispatch(clearError());
  }, [error, dispatch]);

  const selectedRole = watch('role');

  const onSubmit = (data) => {
    dispatch(registerUser(data));
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${selectedRole === 'tenant' ? 'border-[var(--color-primary)] bg-orange-50 text-[var(--color-primary)]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <input type="radio" value="tenant" {...register('role')} className="hidden" />
                  🎒 Looking for Room
                </label>
                <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${selectedRole === 'landlord' ? 'border-[var(--color-primary)] bg-orange-50 text-[var(--color-primary)]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <input type="radio" value="landlord" {...register('role')} className="hidden" />
                  🏠 Listing Rooms
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-name">Full Name</label>
              <input id="reg-name" type="text" className="input-field" placeholder="Your name"
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" className="input-field" placeholder="you@email.com"
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="reg-password">Password</label>
              <input id="reg-password" type="password" className="input-field" placeholder="Min 6 characters"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
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
