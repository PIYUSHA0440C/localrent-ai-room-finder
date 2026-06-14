import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, clearError } from '../store/authSlice';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) toast.error(error);
    return () => dispatch(clearError());
  }, [error, dispatch]);

  const onSubmit = (data) => {
    dispatch(login(data));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl mb-3 block">🏠</span>
          <h1 className="text-2xl font-extrabold text-[var(--color-secondary)]">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your LocalRent account</p>
        </div>

        <div className="card-static p-8 rounded-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                className="input-field"
                placeholder="you@email.com"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3" id="login-submit-btn">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-[var(--color-primary)] hover:underline">Create one free</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
