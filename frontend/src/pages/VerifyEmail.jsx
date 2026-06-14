import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyOtp, clearError } from '../store/authSlice';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);
  
  const email = searchParams.get('email');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!email) {
      toast.error('Email missing. Please register again.');
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (error) toast.error(error);
    return () => dispatch(clearError());
  }, [error, dispatch]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }
    
    try {
      await dispatch(verifyOtp({ email, otp })).unwrap();
      toast.success('Email verified successfully!');
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by slice and toast
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl mb-3 block">✉️</span>
          <h1 className="text-2xl font-extrabold text-[var(--color-secondary)]">Verify your email</h1>
          <p className="text-sm text-gray-500 mt-2">
            We've sent a 6-digit verification code to <br/>
            <span className="font-semibold text-gray-800">{email}</span>
          </p>
        </div>

        <div className="card-static p-8 rounded-2xl">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="otp-input">Verification Code</label>
              <input
                id="otp-input"
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only allow digits
                className="input-field text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                required
              />
            </div>

            <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full py-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : 'Verify Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
