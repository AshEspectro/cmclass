import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, User, Heart, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { MegaMenu } from './MegaMenu';
import { SearchPanel } from './SearchPanel';
import { CartOverlay } from './CartOverlay';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setIsPastHero(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMegaMenuOpen || isSearchOpen || isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMegaMenuOpen, isSearchOpen, isCartOpen]);

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-sm py-3 md:py-6' : 'bg-white/95 backdrop-blur-sm py-4 md:py-6'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-[1440px] mx-auto px-2 sm:px-6 lg:px-9">
          <div className="flex items-center justify-between">
            {/* Left Section - Desktop: Menu text + Search icon + placeholder */}
            <div className="hidden lg:flex items-center gap-6">
              <button
                onClick={() => setIsMegaMenuOpen(true)}
                className="flex items-center gap-2 hover:text-[#556f73] transition-colors duration-300 group"
                aria-label="Menu"
              >
                <Menu size={24} />
                <span className="text-sm tracking-wider">MENU</span>
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="hover:text-[#007B8A] transition-colors duration-300"
                  aria-label="Rechercher"
                >
                  <Search size={22} />
                </button>
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="text-sm text-gray-500 hover:text-[#007B8A] transition-colors duration-300"
                >
                  Que cherchez-vous ?
                </button>
              </div>
            </div>

            {/* Left Section - Mobile & Tablet: Hamburger only */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMegaMenuOpen(true)}
                className="hover:text-[#007B8A] transition-colors duration-300"
                aria-label="Menu"
              >
                <Menu size={24} />
              </button>
            </div>

            {/* Center: Logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <motion.div
                className={`text-center transition-all duration-300 ${
                  isScrolled ? 'scale-50' : 'scale-30'
                }`}
              >
              
                <img
                  src="/cmclass@.svg"
                  alt="CM CLASS Logo"
                  className={`mx-auto transition-all duration-300 ${
                    isScrolled ? 'w-24 sm:w-28 md:w-32' : 'w-28 sm:w-36 md:w-44'
                  }`}
                />
           
              </motion.div>
            </Link>

            {/* Right Section: Wishlist → Account → Cart */}
            <div className="flex items-center gap-4 md:gap-6">
              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative hover:text-[#007B8A] transition-colors duration-300 hidden sm:block"
                aria-label="Liste de souhaits"
              >
                <Heart size={22} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#007B8A] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Account */}
              <Link
                to="/compte"
                className="hover:text-[#007B8A] transition-colors duration-300"
                aria-label="Compte"
              >
                <User size={22} />
              </Link>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative hover:text-[#007B8A] transition-colors duration-300"
                aria-label="Panier"
              >
                <ShoppingBag size={22} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#007B8A] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Field - Shows when not past hero */}
          <AnimatePresence>
            {!isPastHero && (
              <motion.div
                className="lg:hidden mt-4 pt-4 border-t border-gray-200"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher (ex. Costumes Homme)"
                    value={mobileSearchQuery}
                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                    onFocus={() => setShowMobileSearch(true)}
                    className="w-full border border-gray-300 py-2 px-4 pr-10 text-sm focus:outline-none focus:border-[#007B8A] transition-colors duration-300"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Mega Menu */}
      <AnimatePresence>
        {isMegaMenuOpen && <MegaMenu onClose={() => setIsMegaMenuOpen(false)} />}
      </AnimatePresence>

      {/* Search Panel */}
      <AnimatePresence>
        {isSearchOpen && <SearchPanel onClose={() => setIsSearchOpen(false)} />}
      </AnimatePresence>

      {/* Cart Overlay */}
      <AnimatePresence>
        {isCartOpen && <CartOverlay onClose={() => setIsCartOpen(false)} />}
      </AnimatePresence>
    </>
  );
};
