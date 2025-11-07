import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronRight, Phone, Leaf, User, MapPin, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MegaMenuProps {
  onClose: () => void;
}

interface SubCategory {
  name: string;
  link: string;
  image?: string;
}

interface MenuItem {
  title: string;
  link: string;
  subcategories?: SubCategory[];
}

export const MegaMenu = ({ onClose }: MegaMenuProps) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const mainCategories: MenuItem[] = [
    {
      title: 'Cadeaux et Personnalisation',
      link: '/cadeaux',
      subcategories: [
        { name: 'Cadeaux pour Lui', link: '/cadeaux/lui', image: 'https://images.unsplash.com/photo-1760624089496-01ae68a92d58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYWNjZXNzb3JpZXMlMjBsZWF0aGVyJTIwZ29vZHN8ZW58MXx8fHwxNzYyMzQxODIyfDA&ixlib=rb-4.1.0&q=80&w=400' },
        { name: 'Personnalisation', link: '/cadeaux/personnalisation', image: 'https://images.unsplash.com/photo-1596552639068-99bd471b579c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMGhhbmRiYWclMjBsZWF0aGVyfGVufDF8fHx8MTc2MjMzMDQxM3ww&ixlib=rb-4.1.0&q=80&w=400' }
      ]
    },
    {
      title: 'Nouveautés',
      link: '/nouveautes',
      subcategories: [
        { name: 'Dernières Créations', link: '/nouveautes/creations', image: 'https://images.unsplash.com/photo-1761522001672-5f1d45ce1b10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwbWVuc3dlYXIlMjBlZGl0b3JpYWx8ZW58MXx8fHwxNzYyMzQxODIxfDA&ixlib=rb-4.1.0&q=80&w=400' },
        { name: 'Collection Capsule', link: '/nouveautes/capsule', image: 'https://images.unsplash.com/photo-1621972188361-bdd4a21801ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMG1hbGUlMjBtb2RlbCUyMHN1aXQlMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzYyMzQxODIxfDA&ixlib=rb-4.1.0&q=80&w=400' }
      ]
    },
    {
      title: 'Sacs et Petite Maroquinerie',
      link: '/sacs',
      subcategories: [
        { name: 'Sacs à Main', link: '/sacs/main', image: 'https://images.unsplash.com/photo-1596552639068-99bd471b579c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMGhhbmRiYWclMjBsZWF0aGVyfGVufDF8fHx8MTc2MjMzMDQxM3ww&ixlib=rb-4.1.0&q=80&w=400' },
        { name: 'Petite Maroquinerie', link: '/sacs/maroquinerie', image: 'https://images.unsplash.com/photo-1760624089496-01ae68a92d58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYWNjZXNzb3JpZXMlMjBsZWF0aGVyJTIwZ29vZHN8ZW58MXx8fHwxNzYyMzQxODIyfDA&ixlib=rb-4.1.0&q=80&w=400' }
      ]
    },
    {
      title: 'Femme',
      link: '/femme',
      subcategories: [
        { name: 'Prochainement', link: '/femme' }
      ]
    },
    {
      title: 'Homme',
      link: '/homme',
      subcategories: [
        { name: 'Chemises', link: '/homme/chemises', image: 'https://images.unsplash.com/photo-1761522001672-5f1d45ce1b10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwbWVuc3dlYXIlMjBlZGl0b3JpYWx8ZW58MXx8fHwxNzYyMzQxODIxfDA&ixlib=rb-4.1.0&q=80&w=400' },
        { name: 'Pantalons', link: '/homme/pantalons', image: 'https://images.unsplash.com/photo-1621972188361-bdd4a21801ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMG1hbGUlMjBtb2RlbCUyMHN1aXQlMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzYyMzQxODIxfDA&ixlib=rb-4.1.0&q=80&w=400' },
        { name: 'Vestes', link: '/homme/vestes', image: 'https://images.unsplash.com/photo-1761522001672-5f1d45ce1b10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwbWVuc3dlYXIlMjBlZGl0b3JpYWx8ZW58MXx8fHwxNzYyMzQxODIxfDA&ixlib=rb-4.1.0&q=80&w=400' },
        { name: 'Tout Voir', link: '/homme' }
      ]
    },
    {
      title: 'Parfums et Beauté',
      link: '/parfums',
      subcategories: [
        { name: 'Parfums', link: '/parfums/parfums', image: 'https://images.unsplash.com/photo-1761659760494-32b921a2449f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJmdW1lJTIwYm90dGxlJTIwbHV4dXJ5fGVufDF8fHx8MTc2MjIzNjAyOHww&ixlib=rb-4.1.0&q=80&w=400' },
        { name: 'Soins', link: '/parfums/soins', image: 'https://images.unsplash.com/photo-1761659760494-32b921a2449f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJmdW1lJTIwYm90dGxlJTIwbHV4dXJ5fGVufDF8fHx8MTc2MjIzNjAyOHww&ixlib=rb-4.1.0&q=80&w=400' }
      ]
    },
    {
      title: 'Joaillerie',
      link: '/joaillerie',
      subcategories: [
        { name: 'Bijoux', link: '/joaillerie/bijoux', image: 'https://images.unsplash.com/photo-1552742275-6aee5589cd29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwd2F0Y2glMjBqZXdlbHJ5fGVufDF8fHx8MTc2MjM0MTgyMnww&ixlib=rb-4.1.0&q=80&w=400' }
      ]
    },
    {
      title: 'Montres',
      link: '/montres',
      subcategories: [
        { name: 'Collections', link: '/montres/collections', image: 'https://images.unsplash.com/photo-1552742275-6aee5589cd29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwd2F0Y2glMjBqZXdlbHJ5fGVufDF8fHx8MTc2MjM0MTgyMnww&ixlib=rb-4.1.0&q=80&w=400' }
      ]
    },
    {
      title: 'Malles, Voyage et Maison',
      link: '/voyage',
      subcategories: [
        { name: 'Articles de Voyage', link: '/voyage/articles', image: 'https://images.unsplash.com/photo-1596552639068-99bd471b579c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMGhhbmRiYWclMjBsZWF0aGVyfGVufDF8fHx8MTc2MjMzMDQxM3ww&ixlib=rb-4.1.0&q=80&w=400' }
      ]
    },
    {
      title: 'Services',
      link: '/services',
      subcategories: []
    },
    {
      title: 'La Maison CM CLASS',
      link: '/a-propos',
      subcategories: [
        { name: 'Notre Histoire', link: '/a-propos' },
        { name: 'Nos Valeurs', link: '/a-propos' },
        { name: 'Stories', link: '/stories' }
      ]
    }
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-white z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-full flex flex-col lg:flex-row">
        {/* Main Menu - Left Side */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
            {/* Close Button */}
            <div className="flex justify-end mb-8 sm:mb-12">
              <button
                onClick={onClose}
                className="hover:text-[#007B8A] transition-colors duration-300"
                aria-label="Fermer"
              >
                <X size={32} />
              </button>
            </div>

            {/* Main Categories */}
            <nav className="space-y-4 mb-12">
              {mainCategories.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  <button
                    onClick={() => {
                      if (item.subcategories && item.subcategories.length > 0) {
                        setActiveSubmenu(activeSubmenu === item.title ? null : item.title);
                      } else {
                        onClose();
                        window.location.href = item.link;
                      }
                    }}
                    className="w-full flex items-center justify-between py-3 border-b border-gray-200 hover:text-[#007B8A] transition-colors duration-300 group"
                  >
                    <span className="text-sm sm:text-base tracking-wider">{item.title}</span>
                    {item.subcategories && item.subcategories.length > 0 && (
                      <ChevronRight 
                        size={20} 
                        className={`transition-transform duration-300 ${
                          activeSubmenu === item.title ? 'rotate-90' : ''
                        }`}
                      />
                    )}
                  </button>
                </motion.div>
              ))}
            </nav>

            {/* Utility Section */}
            <div className="border-t border-gray-300 pt-8 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="space-y-3"
              >
                <button className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#007B8A] transition-colors duration-300">
                  <Phone size={18} />
                  <span>Besoin d'aide ? +243 99 123 4567</span>
                </button>
                <Link 
                  to="/developpement-durable" 
                  onClick={onClose}
                  className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#007B8A] transition-colors duration-300"
                >
                  <Leaf size={18} />
                  <span>Développement Durable</span>
                </Link>
                <Link 
                  to="/compte" 
                  onClick={onClose}
                  className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#007B8A] transition-colors duration-300"
                >
                  <User size={18} />
                  <span>Mon Compte</span>
                </Link>
                <Link 
                  to="/magasins" 
                  onClick={onClose}
                  className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#007B8A] transition-colors duration-300"
                >
                  <MapPin size={18} />
                  <span>Magasins</span>
                </Link>
                <button className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#007B8A] transition-colors duration-300">
                  <Globe size={18} />
                  <span>Pays de livraison: RD Congo</span>
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Submenu - Right Side */}
        <AnimatePresence mode="wait">
          {activeSubmenu && (
            <motion.div
              className="hidden lg:block w-[500px] bg-gray-50 border-l border-gray-200 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="p-12">
                <h3 className="text-2xl mb-8 tracking-wider">{activeSubmenu}</h3>
                <div className="space-y-6">
                  {mainCategories
                    .find(cat => cat.title === activeSubmenu)
                    ?.subcategories?.map((sub, index) => (
                      <motion.div
                        key={sub.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                      >
                        <Link
                          to={sub.link}
                          onClick={onClose}
                          className="group block"
                        >
                          {sub.image && (
                            <div className="aspect-[4/3] mb-3 overflow-hidden bg-gray-200">
                              <img 
                                src={sub.image} 
                                alt={sub.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            </div>
                          )}
                          <h4 className="text-sm tracking-wide group-hover:text-[#007B8A] transition-colors duration-300">
                            {sub.name}
                          </h4>
                        </Link>
                      </motion.div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Submenu Overlay */}
      <AnimatePresence>
        {activeSubmenu && (
          <motion.div
            className="lg:hidden fixed inset-0 bg-white z-10 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="px-4 sm:px-6 py-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg sm:text-xl tracking-wider">{activeSubmenu}</h3>
                <button
                  onClick={() => setActiveSubmenu(null)}
                  className="hover:text-[#007B8A] transition-colors duration-300"
                  aria-label="Retour"
                >
                  <X size={28} />
                </button>
              </div>
              <div className="space-y-6">
                {mainCategories
                  .find(cat => cat.title === activeSubmenu)
                  ?.subcategories?.map((sub, index) => (
                    <motion.div
                      key={sub.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      <Link
                        to={sub.link}
                        onClick={onClose}
                        className="group block"
                      >
                        {sub.image && (
                          <div className="aspect-[4/3] mb-3 overflow-hidden bg-gray-200">
                            <img 
                              src={sub.image} 
                              alt={sub.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                        )}
                        <h4 className="text-sm tracking-wide group-hover:text-[#007B8A] transition-colors duration-300">
                          {sub.name}
                        </h4>
                      </Link>
                    </motion.div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
