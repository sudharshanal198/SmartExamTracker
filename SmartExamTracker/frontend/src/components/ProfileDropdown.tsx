import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Settings, LogOut, Flame } from 'lucide-react';

const ProfileDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (email?: string) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 focus:outline-none transition-transform hover:scale-105 active:scale-95"
      >
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-primary text-background flex items-center justify-center font-bold text-lg shadow-md border-2 border-primary/20">
            {getInitials(user?.email)}
          </div>
          {/* Online status indicator */}
          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-background"></span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-bold text-primary max-w-[120px] truncate">{user?.email?.split('@')[0]}</p>
          <p className="text-xs font-semibold text-primary/60 flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-500" /> {user?.streak || 0} Day Streak
          </p>
        </div>
      </button>

      {/* Dropdown Menu */}
      <div 
        className={`absolute right-0 mt-3 w-56 rounded-2xl shadow-xl bg-card border border-primary/10 overflow-hidden transition-all duration-200 origin-top-right z-50 ${
          isOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'
        }`}
      >
        <div className="px-4 py-3 border-b border-primary/10 bg-primary/5">
          <p className="text-sm font-bold text-primary truncate">{user?.email}</p>
          <p className="text-xs mt-1 font-semibold text-primary/60 uppercase tracking-wide">
            Role: {user?.role || 'Student'}
          </p>
        </div>

        <div className="py-2">
          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-2 text-sm text-primary hover:bg-primary/5 transition-colors group"
          >
            <User className="h-4 w-4 mr-3 text-primary/50 group-hover:text-primary transition-colors" />
            View Profile
          </Link>
          <Link
            to="/settings"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-2 text-sm text-primary hover:bg-primary/5 transition-colors group"
          >
            <Settings className="h-4 w-4 mr-3 text-primary/50 group-hover:text-primary transition-colors" />
            Edit Profile
          </Link>
          
          <div className="my-1 border-t border-primary/10"></div>
          
          <div className="px-4 py-2 flex items-center justify-between group cursor-default">
            <span className="flex items-center text-sm text-primary font-medium">
              <Flame className="h-4 w-4 mr-3 text-orange-500" />
              Current Streak
            </span>
            <span className="text-sm font-black text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full shadow-sm">
              {user?.streak || 0}
            </span>
          </div>

          <div className="my-1 border-t border-primary/10"></div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors group text-left font-semibold"
          >
            <LogOut className="h-4 w-4 mr-3 text-red-500 group-hover:text-red-600 transition-colors" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDropdown;
