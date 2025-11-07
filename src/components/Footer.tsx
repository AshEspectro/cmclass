import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';export const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-12">
          {/* Column 1: About */}
          <div>
            <h4 className="text-white mb-4 sm:mb-6 text-sm sm:text-base">À PROPOS</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <Link to="/a-propos" className="text-gray-400 hover:text-[#007B8A] transition-colors duration-300">
                  Notre Histoire
                </Link>
              </li>
              <li>
                <Link to="/a-propos" className="text-gray-400 hover:text-[#007B8A] transition-colors duration-300">
                  Artisanat
                </Link>
              </li>
              <li>
                <Link to="/stories" className="text-gray-400 hover:text-[#007B8A] transition-colors duration-300">
                  Stories
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-[#007B8A] transition-colors duration-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h4 className="text-white mb-4 sm:mb-6 text-sm sm:text-base">BOUTIQUE</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <Link to="/homme" className="text-gray-400 hover:text-[#007B8A] transition-colors duration-300">
                  Collection Homme
                </Link>
              </li>
              <li>
                <Link to="/femme" className="text-gray-400 hover:text-[#007B8A] transition-colors duration-300">
                  Collection Femme
                </Link>
              </li>
              <li>
                <Link to="/nouveautes" className="text-gray-400 hover:text-[#007B8A] transition-colors duration-300">
                  Nouveautés
                </Link>
              </li>
              <li>
                <Link to="/accessoires" className="text-gray-400 hover:text-[#007B8A] transition-colors duration-300">
                  Accessoires
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Help */}
          <div>
            <h4 className="text-white mb-4 sm:mb-6 text-sm sm:text-base">AIDE</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <Link to="/compte" className="text-gray-400 hover:text-[#007B8A] transition-colors duration-300">
                  Mon Compte
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#007B8A] transition-colors duration-300">
                  Livraison
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#007B8A] transition-colors duration-300">
                  Retours
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#007B8A] transition-colors duration-300">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="text-white mb-4 sm:mb-6 text-sm sm:text-base">CONTACT</h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400">
              <li>Goma, Nord-Kivu</li>
              <li>République Démocratique du Congo</li>
              <li className="pt-2 sm:pt-3">
                <a href="mailto:contact@cmclass.cd" className="hover:text-[#007B8A] transition-colors duration-300">
                  contact@cmclass.cd
                </a>
              </li>
              <li>
                <a href="tel:+243" className="hover:text-[#007B8A] transition-colors duration-300">
                  +243 XXX XXX XXX
                </a>
              </li>
            </ul>

            {/* Social Media */}
            <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-6">
              <a
                href="#"
                className="text-gray-400 hover:text-[#007B8A] transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram size={18} className="sm:hidden" />
                <Instagram size={20} className="hidden sm:block" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#007B8A] transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook size={18} className="sm:hidden" />
                <Facebook size={20} className="hidden sm:block" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#007B8A] transition-colors duration-300"
                aria-label="Twitter"
              >
                <Twitter size={18} className="sm:hidden" />
                <Twitter size={20} className="hidden sm:block" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 text-center md:text-left">
          <p className="text-gray-400 text-xs sm:text-sm">© 2025 CM CLASS. Tous droits réservés.</p>
          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
            <button className="text-gray-400 hover:text-[#007B8A] transition-colors duration-300">
              Français
            </button>
            <span className="text-gray-600">|</span>
            <button className="text-gray-400 hover:text-[#007B8A] transition-colors duration-300">
              English
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
