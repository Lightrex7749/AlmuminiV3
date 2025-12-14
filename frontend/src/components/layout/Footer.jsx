import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Heart, ArrowUpRight, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Alumni Directory', path: '/directory', color: 'blue' },
    { name: 'Job Board', path: '/jobs', color: 'purple' },
    { name: 'Events', path: '/events', color: 'cyan' },
    { name: 'Mentorship', path: '/mentorship', color: 'green' },
  ];

  const resources = [
    { name: 'About Us', path: '/about' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
  ];

  const socialLinks = [
    { icon: Github, href: 'https://github.com', label: 'GitHub', color: 'from-gray-700 to-gray-900' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter', color: 'from-blue-500 to-blue-700' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn', color: 'from-blue-600 to-blue-900' },
    { icon: Mail, href: 'mailto:contact@alumni.edu', label: 'Email', color: 'from-purple-500 to-pink-600' },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-slate-900 to-black dark:from-black dark:via-gray-950 dark:to-black border-t border-gray-800 dark:border-gray-900 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/3 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(59,130,246,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.01)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-6">
            <Link to="/" className="flex items-center space-x-3 group w-fit">
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                <span className="text-white font-bold text-xl relative z-10">A</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent group-hover:from-blue-400 group-hover:via-purple-400 group-hover:to-cyan-400 transition-all duration-300">
                AlumUnity
              </span>
            </Link>
            <p className="text-gray-400 dark:text-gray-500 leading-relaxed text-sm">
              Empowering connections between alumni, students, and recruiters to build a stronger, more vibrant professional community.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>Bangalore, India</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white dark:text-gray-100 uppercase tracking-wider mb-6 flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-200 transition-all duration-200 flex items-center gap-2 group"
                  >
                    <span className={`w-1.5 h-1.5 bg-${link.color}-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}></span>
                    <span className="relative">
                      {link.name}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                    </span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-bold text-white dark:text-gray-100 uppercase tracking-wider mb-6 flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              Resources
            </h3>
            <ul className="space-y-3">
              {resources.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-200 transition-all duration-200 flex items-center gap-2 group"
                  >
                    <span className="relative">
                      {link.name}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-sm font-bold text-white dark:text-gray-100 uppercase tracking-wider mb-6 flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
              Connect
            </h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
              Follow us on social media for updates and news
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-11 h-11 bg-gray-800/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-400 hover:text-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-110 border border-gray-700/50 dark:border-gray-800/50 overflow-hidden"
                  aria-label={social.label}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${social.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <social.icon className="w-5 h-5 relative z-10" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800/50 dark:border-gray-900/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-center md:text-left text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2 text-sm">
              © {currentYear} AlumUnity. Made with 
              <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> 
              by passionate developers
            </p>
            <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-600">
              <Link to="/privacy" className="hover:text-gray-300 dark:hover:text-gray-400 transition-colors">Privacy</Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-gray-300 dark:hover:text-gray-400 transition-colors">Terms</Link>
              <span>•</span>
              <Link to="/cookies" className="hover:text-gray-300 dark:hover:text-gray-400 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Animated gradient line at top of footer */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
    </footer>
  );
};

export default Footer;
