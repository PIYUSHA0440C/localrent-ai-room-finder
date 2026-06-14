import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data.message);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center fade-in">
      <div className="text-center max-w-md px-4">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700">Verifying your email...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <span className="text-6xl block mb-4">✅</span>
            <h2 className="text-2xl font-bold text-green-700 mb-2">Email Verified!</h2>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <span className="text-6xl block mb-4">❌</span>
            <h2 className="text-2xl font-bold text-red-700 mb-2">Verification Failed</h2>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <Link to="/" className="btn-primary">Go Home</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
