import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, LogOut, User as UserIcon, LayoutDashboard, ShoppingCart } from 'lucide-react';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-primary-600 font-bold text-xl">
            <Sprout className="w-6 h-6 text-primary-500" />
            <span>Veritas</span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-6">
            <Link to="/" className="text-slate-600 hover:text-primary-600 font-medium">
              Marketplace
            </Link>

            {user ? (
              <>
                {/* Role-based Dashboard Links */}
                {user.role === 'farmer' && (
                  <Link to="/farmer-dashboard" className="text-slate-600 hover:text-primary-600 font-medium flex items-center space-x-1">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Farmer Dashboard</span>
                  </Link>
                )}
                {user.role === 'buyer' && (
                  <Link to="/buyer-dashboard" className="text-slate-600 hover:text-primary-600 font-medium flex items-center space-x-1">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>My Purchases</span>
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin-dashboard" className="text-slate-600 hover:text-primary-600 font-medium flex items-center space-x-1">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                {/* User badge */}
                <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-900">
                      {user.profile.firstName} {user.profile.lastName}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                <Link
                  to="/auth"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Log In
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
