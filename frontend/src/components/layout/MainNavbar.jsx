import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Menu, X, Bell, User, LogOut, Settings, LayoutDashboard, ChevronDown, Network, TrendingUp, Trophy, CreditCard, MapPin, BookOpen, Moon, Sun } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';

const MainNavbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-based navigation links - Standardized structure with role-specific visibility
  const getRoleBasedNavLinks = () => {
    if (!isAuthenticated) {
      // Unauthenticated users - show main features (will prompt login)
      return [
        { name: 'Home', path: '/' },
        { name: 'Alumni', path: '/directory' },
        { name: 'Mentorship', path: '/mentorship/find' },
        { name: 'Jobs', path: '/jobs' },
        { name: 'Events', path: '/events' },
        { name: 'Forum', path: '/forum' },
      ];
    }

    const role = user?.role;

    // Standardized navigation structure: Home, Alumni, Mentorship, Jobs, Events, Forum
    // Role-specific visibility for what each role can access
    switch (role) {
      case 'admin':
        // Admin: Full access to all features
        return [
          { name: 'Home', path: '/' },
          { name: 'Alumni', path: '/directory' },
          { name: 'Mentorship', path: '/mentorship/find' },
          { name: 'Jobs', path: '/jobs' },
          { name: 'Events', path: '/events' },
          { name: 'Forum', path: '/forum' },
        ];

      case 'alumni':
        // Alumni: Can mentor, view directory, participate in events and forum
        return [
          { name: 'Home', path: '/' },
          { name: 'Alumni', path: '/directory' },
          { name: 'Mentorship', path: '/mentorship/dashboard' },
          { name: 'Jobs', path: '/jobs' },
          { name: 'Events', path: '/events' },
          { name: 'Forum', path: '/forum' },
        ];

      case 'student':
        // Student: Can find mentors, apply for jobs, attend events
        return [
          { name: 'Home', path: '/' },
          { name: 'Alumni', path: '/directory' },
          { name: 'Mentorship', path: '/mentorship/find' },
          { name: 'Jobs', path: '/jobs' },
          { name: 'Events', path: '/events' },
          { name: 'Forum', path: '/forum' },
        ];

      case 'recruiter':
        // Recruiter: Can post jobs, view directory for recruitment, attend events
        return [
          { name: 'Home', path: '/' },
          { name: 'Alumni', path: '/directory' },
          { name: 'Mentorship', path: '/mentorship/find' },
          { name: 'Jobs', path: '/jobs' },
          { name: 'Events', path: '/events' },
          { name: 'Forum', path: '/forum' },
        ];

      default:
        return [
          { name: 'Home', path: '/' },
          { name: 'Alumni', path: '/directory' },
        ];
    }
  };

  // Role-based advanced features for "More" dropdown
  const getRoleBasedAdvancedFeatures = () => {
    if (!isAuthenticated) {
      return []; // No advanced features for unauthenticated users
    }

    const role = user?.role;
    const allFeatures = [
      { name: 'Skill Graph', path: '/skills/graph', icon: Network, roles: ['admin', 'alumni', 'student', 'recruiter'] },
      { name: 'Career Paths', path: '/career/paths', icon: TrendingUp, roles: ['admin', 'alumni', 'student', 'recruiter'] },
      { name: 'Leaderboard', path: '/leaderboard', icon: Trophy, roles: ['admin', 'alumni', 'student'] },
      { name: 'Alumni Card', path: '/alumni-card', icon: CreditCard, roles: ['admin', 'alumni'] },
      { name: 'Talent Heatmap', path: '/heatmap', icon: MapPin, roles: ['admin', 'alumni', 'student', 'recruiter'] },
      { name: 'Knowledge', path: '/knowledge', icon: BookOpen, roles: ['admin', 'alumni', 'student', 'recruiter'] },
    ];

    // Filter features based on user role
    return allFeatures.filter(feature => feature.roles.includes(role));
  };

  const navLinks = getRoleBasedNavLinks();
  const advancedFeatures = getRoleBasedAdvancedFeatures();

  const isActive = (path) => location.pathname === path;

  const getInitials = (email) => {
    return email ? email.substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 shadow-lg shadow-gray-100/20 dark:shadow-gray-900/20 transition-colors duration-300" data-testid="main-navbar">
      {/* Gradient Line at Top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group" data-testid="navbar-logo">
            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
              <span className="text-white font-bold text-xl relative z-10">A</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">AlumUnity</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 -mt-1 tracking-wider uppercase">Professional Network</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-${link.name.toLowerCase()}-link`}
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden group ${
                  isActive(link.path)
                    ? 'text-blue-600 dark:text-blue-400 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 shadow-md shadow-blue-100/50 dark:shadow-blue-900/30'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"></span>
                )}
                <span className="relative z-10">{link.name}</span>
                {!isActive(link.path) && (
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                )}
              </Link>
            ))}
            
            {/* More Dropdown - Only show for authenticated users with advanced features */}
            {isAuthenticated && advancedFeatures.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1 transition-all duration-300"
                    data-testid="nav-more-dropdown"
                  >
                    More
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white/90 backdrop-blur-xl border-gray-200/50 shadow-xl shadow-gray-200/50 rounded-xl">
                  <DropdownMenuLabel className="text-gray-500">Advanced Features</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {advancedFeatures.map((feature) => (
                    <DropdownMenuItem key={feature.path} onClick={() => navigate(feature.path)} className="rounded-lg !bg-transparent hover:!bg-gradient-to-r hover:!from-blue-50 hover:!to-purple-50 focus:!bg-gradient-to-r focus:!from-blue-50 focus:!to-purple-50 data-[highlighted]:!bg-gradient-to-r data-[highlighted]:!from-blue-50 data-[highlighted]:!to-purple-50 cursor-pointer transition-all duration-200">
                      <feature.icon className="mr-2 h-4 w-4 text-blue-600" />
                      {feature.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Right Side - Auth & User Menu */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            {typeof toggleTheme === 'function' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-300"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-amber-500 transition-transform duration-300 hover:rotate-180" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
                )}
              </Button>
            )}

            {isAuthenticated ? (
              <>
                {/* Role Badge */}
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 uppercase tracking-wider">
                    {user?.role}
                  </span>
                </div>

                {/* Notification Bell */}
                <NotificationBell />

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 focus:outline-none group">
                      <Avatar className="w-10 h-10 ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all duration-300">
                        <AvatarImage src="" alt={user?.email} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
                          {getInitials(user?.email)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white/90 backdrop-blur-xl border-gray-200/50 shadow-xl shadow-gray-200/50 rounded-xl">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{user?.email}</span>
                        <span className="text-xs text-gray-500 capitalize bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium">{user?.role}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="rounded-lg !bg-transparent hover:!bg-gradient-to-r hover:!from-blue-50 hover:!to-purple-50 focus:!bg-gradient-to-r focus:!from-blue-50 focus:!to-purple-50 data-[highlighted]:!bg-gradient-to-r data-[highlighted]:!from-blue-50 data-[highlighted]:!to-purple-50 cursor-pointer transition-all duration-200">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-blue-600" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-lg !bg-transparent hover:!bg-gradient-to-r hover:!from-blue-50 hover:!to-purple-50 focus:!bg-gradient-to-r focus:!from-blue-50 focus:!to-purple-50 data-[highlighted]:!bg-gradient-to-r data-[highlighted]:!from-blue-50 data-[highlighted]:!to-purple-50 cursor-pointer transition-all duration-200">
                      <User className="mr-2 h-4 w-4 text-purple-600" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings/notifications')} className="rounded-lg !bg-transparent hover:!bg-gradient-to-r hover:!from-blue-50 hover:!to-purple-50 focus:!bg-gradient-to-r focus:!from-blue-50 focus:!to-purple-50 data-[highlighted]:!bg-gradient-to-r data-[highlighted]:!from-blue-50 data-[highlighted]:!to-purple-50 cursor-pointer transition-all duration-200">
                      <Settings className="mr-2 h-4 w-4 text-gray-600" />
                      Notification Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-lg !bg-transparent hover:!bg-red-50 focus:!bg-red-50 data-[highlighted]:!bg-red-50 cursor-pointer text-red-600 transition-all duration-200">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="text-gray-600 hover:text-blue-600"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-all duration-300"
              data-testid="mobile-menu-toggle"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-200"
            data-testid="mobile-menu"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Advanced Features Section - Only show for authenticated users with features */}
            {isAuthenticated && advancedFeatures.length > 0 && (
              <div className="pt-4">
                <div className="px-3 py-2 text-sm font-semibold text-gray-500">
                  Advanced Features
                </div>
                {advancedFeatures.map((feature) => (
                  <Link
                    key={feature.path}
                    to={feature.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    <feature.icon className="mr-2 h-4 w-4" />
                    {feature.name}
                  </Link>
                ))}
              </div>
            )}
            
            {!isAuthenticated && (
              <div className="pt-4 space-y-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    navigate('/register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default MainNavbar;
