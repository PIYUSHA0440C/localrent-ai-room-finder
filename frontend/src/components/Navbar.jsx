import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useCallback } from 'react';
import { logout } from '../store/authSlice';
import { getUnreadCount } from '../store/notificationSlice';
import { usePolling, useOutsideClick } from '../hooks/useCustomHooks';
import { HiOutlineMenu, HiOutlineX, HiOutlineBell, HiOutlineUser, HiOutlineLogout, HiOutlineHome, HiOutlineSearch, HiOutlineViewGrid } from 'react-icons/hi';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.notifications);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useOutsideClick(() => setProfileOpen(false));

  // Poll for notifications every 30 seconds
  usePolling(
    useCallback(() => {
      if (isAuthenticated) dispatch(getUnreadCount());
    }, [isAuthenticated, dispatch]),
    30000,
    isAuthenticated
  );

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'landlord') return '/dashboard/landlord';
    return '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/20" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="text-2xl">🏠</span>
            <span className="text-xl font-extrabold text-gradient">LocalRent</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/search" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[var(--color-primary)] transition-colors">
              <HiOutlineSearch className="w-4 h-4" /> Search
            </Link>

            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[var(--color-primary)] transition-colors">
                  <HiOutlineViewGrid className="w-4 h-4" /> Dashboard
                </Link>

                {/* Notifications */}
                <Link to="/dashboard" className="relative text-gray-600 hover:text-[var(--color-primary)] transition-colors" state={{ tab: 'notifications' }}>
                  <HiOutlineBell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[var(--color-error)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center text-white text-sm font-bold">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.name?.split(' ')[0]}</span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 card-static rounded-xl shadow-xl py-2 fade-in z-50" style={{background: 'white'}}>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className={`badge badge-${user.trustBadge} mt-1`}>{user.trustBadge}</span>
                      </div>
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setProfileOpen(false)}>
                        <HiOutlineUser className="w-4 h-4" /> My Profile
                      </Link>
                      <Link to={getDashboardLink()} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setProfileOpen(false)}>
                        <HiOutlineHome className="w-4 h-4" /> Dashboard
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full border-none bg-transparent cursor-pointer border-t border-gray-100">
                        <HiOutlineLogout className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-[var(--color-primary)]">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary btn-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 text-gray-600 border-none bg-transparent cursor-pointer" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 fade-in border-t border-gray-100">
            <div className="flex flex-col gap-1 pt-3">
              <Link to="/search" className="px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50" onClick={() => setMobileOpen(false)}>🔍 Search Rooms</Link>
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardLink()} className="px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50" onClick={() => setMobileOpen(false)}>📊 Dashboard</Link>
                  <Link to="/profile" className="px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50" onClick={() => setMobileOpen(false)}>👤 Profile</Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 text-left border-none bg-transparent cursor-pointer">🚪 Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50" onClick={() => setMobileOpen(false)}>Sign In</Link>
                  <Link to="/register" className="mx-3 mt-2 btn-primary text-center" onClick={() => setMobileOpen(false)}>Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
