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
    <footer className="bg-background dark:bg-[#0a0c14] border-t border-border relative overflow-hidden transition-colors duration-300">
      {/* Enhanced Background Effects - Subtler for professional SaaS tone */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7091E6]/10 dark:bg-[#3D52A0]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8697C4]/10 dark:bg-[#7091E6]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-6">
            <Link to="/" className="flex items-center space-x-3 group w-fit">
              <div className="relative w-12 h-12 bg-gradient-to-br from-[#3D52A0] to-[#7091E6] rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                <span className="text-white font-bold text-xl relative z-10">A</span>
              </div>
              <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-all duration-300">
                AlumUnity
              </span>
            </Link>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Empowering connections between alumni, students, and recruiters to build a stronger, more vibrant professional community.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Bangalore, India</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200">
                <Phone className="w-4 h-4 text-primary" />
                <span>+91 98765 43210</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
              <div className="w-8 h-0.5 bg-[#3D52A0]"></div>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-muted-foreground hover:text-primary transition-all duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-[#7091E6] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <span className="relative">
                      {link.name}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#7091E6] group-hover:w-full transition-all duration-300"></span>
                    </span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
              <div className="w-8 h-0.5 bg-[#8697C4]"></div>
              Resources
            </h3>
            <ul className="space-y-3">
              {resources.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-muted-foreground hover:text-primary transition-all duration-200 flex items-center gap-2 group"
                  >
                    <span className="relative">
                      {link.name}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#8697C4] group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
              <div className="w-8 h-0.5 bg-[#7091E6]"></div>
              Connect
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Follow us on social media for updates and news
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-11 h-11 bg-secondary/50 backdrop-blur-sm rounded-xl flex items-center justify-center text-muted-foreground hover:text-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-border overflow-hidden"
                  aria-label={social.label}
                >
                  <div className="absolute inset-0 bg-[#3D52A0] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <social.icon className="w-5 h-5 relative z-10" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-center md:text-left text-muted-foreground flex items-center justify-center gap-2 text-sm">
              © {currentYear} AlumUnity. Made with 
              <Heart className="w-4 h-4 text-[#7091E6] fill-[#7091E6]" /> 
              by passionate developers
            </p>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <span>•</span>
              <Link to="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Animated gradient line at top of footer */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#3D52A0] to-transparent opacity-30"></div>
    </footer>
  );
};

export default Footer;
