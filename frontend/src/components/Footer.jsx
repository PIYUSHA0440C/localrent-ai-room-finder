import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[var(--color-secondary)] text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏠</span>
              <span className="text-xl font-extrabold text-white">LocalRent</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              India&apos;s brokerage-free room discovery platform. Find PGs, shared rooms, and flats near your college or office.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              <li><Link to="/search" className="text-sm text-gray-300 hover:text-white transition-colors">Search Rooms</Link></li>
              <li><Link to="/search?city=bangalore" className="text-sm text-gray-300 hover:text-white transition-colors">Rooms in Bangalore</Link></li>
              <li><Link to="/search?city=mumbai" className="text-sm text-gray-300 hover:text-white transition-colors">Rooms in Mumbai</Link></li>
              <li><Link to="/search?city=delhi" className="text-sm text-gray-300 hover:text-white transition-colors">Rooms in Delhi</Link></li>
              <li><Link to="/search?city=pune" className="text-sm text-gray-300 hover:text-white transition-colors">Rooms in Pune</Link></li>
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">For Users</h4>
            <ul className="space-y-2.5">
              <li><Link to="/register" className="text-sm text-gray-300 hover:text-white transition-colors">Register</Link></li>
              <li><Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/register?role=landlord" className="text-sm text-gray-300 hover:text-white transition-colors">List Your Property</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Contact</h4>
            <ul className="space-y-2.5">
              <li className="text-sm text-gray-300">📧 support@localrent.in</li>
              <li className="text-sm text-gray-300">📱 +91 98765 43210</li>
              <li className="text-sm text-gray-300">🕐 Mon-Sat, 9 AM - 7 PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} LocalRent. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Made with ❤️ for students & professionals across India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
