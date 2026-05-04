import React, { useState } from 'react';
import {
  Home,
  BookOpen,
  Video,
  RotateCw,
  CheckSquare,
  User,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Award,
  TrendingUp,
  Shield
} from 'lucide-react';

const NavigationMenu = ({ currentPage, onNavigate, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home', name: 'Trang chủ', icon: Home, path: '' },
    { id: 'vocabulary', name: 'Từ vựng', icon: BookOpen, path: 'vocabulary' },
    { id: 'review', name: 'Ôn tập', icon: RotateCw, path: 'review' },
    { id: 'ai-conversation', name: 'Học với AI', icon: MessageSquare, path: 'ai-conversation' },
    { id: 'videos', name: 'Video', icon: Video, path: 'videos' },
    { id: 'leaderboard', name: 'Xếp hạng', icon: Award, path: 'leaderboard' },
    { id: 'exercises', name: 'Kiểm tra', icon: CheckSquare, path: 'exercises' },
    { id: 'profile', name: 'Profile', icon: User, path: 'profile' },
  ];

  // Add admin menu item if user is admin
  if (user.role === 'admin') {
    menuItems.push({ id: 'admin-dashboard', name: 'Admin', icon: Shield, path: 'admin-dashboard' });
  }

  const handleNavigate = (path) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          {/* Logo Row */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              🎓 EnglishMaster
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-lg">
                <TrendingUp size={14} className="text-purple-600" />
                <span className="font-semibold text-purple-600 text-sm">{user.xp || 0} XP</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                <Award size={14} className="text-blue-600" />
                <span className="font-semibold text-blue-600 text-sm">{user.level || 'Beginner'}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Menu Items Row */}
          <div className="flex items-center justify-center gap-1 py-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium text-sm">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white shadow-lg">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              🎓 EnglishMaster
            </div>

            {/* User Stats */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg text-sm">
                <TrendingUp size={14} className="text-purple-600" />
                <span className="font-semibold text-purple-600">{user.xp || 0}</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Navigation (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center h-16">
          {menuItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.path)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                  isActive ? 'text-purple-600' : 'text-gray-500'
                }`}
              >
                <Icon size={24} />
                <span className="text-xs mt-1">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default NavigationMenu;
