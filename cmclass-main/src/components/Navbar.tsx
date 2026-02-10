import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, Heart, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { MegaMenu } from './MegaMenu';
import { SearchPanel } from './SearchPanel';
import { CartOverlay } from './CartOverlay';
import { UserAccountOverlayWrapper } from "./Account";
export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [brandLogo, setBrandLogo] = useState<string>('');
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  void showMobileSearch;
  void setShowMobileSearch;

  // Fetch brand logo from API
  useEffect(() => {
    const fetchBrandLogo = async () => {
      try {
        const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/brand');
        if (!response.ok) throw new Error('Failed to fetch brand');
        const data = await response.json();
        const logo = data.logoLightUrl || data.logoUrl || data.logoDarkUrl;
        if (logo) {
          setBrandLogo(logo);
        }
      } catch (err) {
        console.error('Failed to fetch brand logo:', err);
        // Keep default fallback
      }
    };

    fetchBrandLogo();
  }, []);


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
        className={`fixed top-0 left-0 border-b border-black/5 right-0 z-30 transition-all duration-300 ${
          isScrolled
            ? 'bg-white shadow-sm py-6 lg:py-8 '
            : 'bg-white  backdrop-blur-md pt-4 lg:py-8'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      ><div className="max-w-[1440px] mx-auto w-full overflow-x-hidden px-4 sm:px-6 lg:px-12 bg-white">
 <div className="flex items-center justify-between">
            {/* LEFT SECTION */}
            <div className="hidden md:flex items-center gap-6 xl:gap-8">
              <button
                onClick={() => setIsMegaMenuOpen(true)}
                className="flex items-center gap-2 hover:text-[#007B8A] transition-colors duration-300 group"
                aria-label="Menu"
              >
                <Menu size={24} />
                <span className="text-sm tracking-wider font-medium">Menu</span>
              </button>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-3 text-gray-600 hover:text-[#007B8A] transition-colors duration-300"
              >
                <Search size={22} />
                <span className="text-sm">Que cherchez-vous ?</span>
              </button>
            </div>

            {/* MOBILE MENU BUTTON */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMegaMenuOpen(true)}
                className="hover:text-[#007B8A] transition-colors duration-300"
                aria-label="Menu"
              >
                <Menu size={24} />
              </button>
            </div>

            {/* CENTER LOGO */}
            <Link to="/home" className="absolute left-1/2 -translate-x-1/2  justify-center">
              <motion.div
                className={`text-center transition-transform duration-300 align-middle   ${
                  isScrolled ? 'scale-30' : 'scale-30'
                }`}
              >
                {brandLogo && (
                  <img
                     src={brandLogo}
                    alt="CM CLASS Logo"
                    className={`mx-auto transition-all duration-300 ${
                      isScrolled
                        ? 'w-28 sm:w-32 md:w-36 xl:w-40'
                        : 'w-32 sm:w-32 md:w-36 xl:w-40'
                    }`}
                  />
                )}
              </motion.div>
            </Link>

            {/* RIGHT SECTION */}
            <div className="flex items-center  gap-4 sm:gap-6 xl:gap-8">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-sm text-gray-500 hover:text-[#007B8A] transition-colors duration-300 hidden md:block"
              >
                Contactez-nous
              </button>

              <Link
                to="/wishlist"
                className="relative hover:text-[#007B8A] my-2 transition-colors duration-300 hidden sm:block"
                aria-label="Liste de souhaits"
              >
                <Heart size={22} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#007B8A] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* User Icon */}
      <UserAccountOverlayWrapper />


              <button
                onClick={() => setIsCartOpen(true)}
                className="relative hover:text-[#007B8A] transition-colors duration-300  hidden sm:block"
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

          {/* MOBILE SEARCH */}
          <AnimatePresence>
            {!isPastHero && (
              <motion.div
                className="md:hidden py-3 pt-5  "
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher "
                    value={mobileSearchQuery}
                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchOpen(true)}
                    className="w-full border border-gray-300 py-3 px-6 pr-10 text-sm rounded-4xl focus:outline-none focus:border-[#007B8A] transition-colors duration-300"
                  />
                  <Search
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* PANELS */}
      <AnimatePresence>
        {isMegaMenuOpen && <MegaMenu onClose={() => setIsMegaMenuOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && <SearchPanel onClose={() => setIsSearchOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && <CartOverlay onClose={() => setIsCartOpen(false)} />}
      </AnimatePresence>
    </>
  );
};
