import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LayoutDashboard, BarChart3, List, Users } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-card shadow-sm border-b border-primary/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-black text-xl tracking-wide uppercase">SmartTracker</span>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`${
                  isActive('/') ? 'border-primary text-primary' : 'border-transparent text-primary/70 hover:text-primary'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium uppercase tracking-wide`}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
              <Link
                to="/subjects"
                className={`${
                  isActive('/subjects') ? 'border-primary text-primary' : 'border-transparent text-primary/70 hover:text-primary'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium uppercase tracking-wide`}
              >
                <List className="h-4 w-4 mr-2" />
                Subjects
              </Link>
              <Link
                to="/analytics"
                className={`${
                  isActive('/analytics') ? 'border-primary text-primary' : 'border-transparent text-primary/70 hover:text-primary'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium uppercase tracking-wide`}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`${
                    isActive('/admin') ? 'border-primary text-primary' : 'border-transparent text-primary/70 hover:text-primary'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium uppercase tracking-wide`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
