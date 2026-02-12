import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ChevronRight, Phone, Leaf, User, MapPin, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MegaMenuProps {
  onClose: () => void;
}

interface SubCategory {
  id?: number;
  name: string;
  link: string;
  children?: SubCategory[];
}

interface MenuItem {
  title: string;
  link: string;
  subcategories?: SubCategory[];
}

// Hero content for main categories
export const heroContent: Record<string, { img: string; title: string; text: string }> = {
  Homme: {
    img: "/homme.jfif",
    title: "Homme",
    text: "L’élégance masculine repensée — entre distinction et audace.",
  },
  Femme: {
    img: "/woman.jfif",
    title: "Femme",
    text: "Féminité contemporaine, allure intemporelle.",
  },
  Joaillerie: {
    img: "/jewlery.jfif",
    title: "Joaillerie",
    text: "Des pièces d’exception pour raconter votre éclat.",
  },
  "Parfums et Beauté": {
    img: "/parfum.jfif",
    title: "Parfums et Beauté",
    text: "Une empreinte olfactive, un art de séduire.",
  },
};
export const mainCategories: MenuItem[] = [
  {
    title: "Cadeaux et Personnalisation",
    link: "/cadeaux",
    subcategories: [
      { name: "Cadeaux pour Lui", link: "/cadeaux/lui" },
      { name: "Personnalisation", link: "/cadeaux/personnalisation" },
    ],
  },
  {
    title: "Nouveautés",
    link: "/nouveautes",
    subcategories: [
      { name: "Dernières Créations", link: "/nouveautes/creations" },
      { name: "Collection Capsule", link: "/nouveautes/capsule" },
    ],
  },
  {
    title: "Sacs et Petite Maroquinerie",
    link: "/sacs",
    subcategories: [
      { name: "Sacs à Main", link: "/sacs/main" },
      { name: "Petite Maroquinerie", link: "/sacs/maroquinerie" },
    ],
  },
  {
    title: "Femme",
    link: "/femme",
    subcategories: [
      { name: "Robes", link: "/femme/robes" },
      { name: "Pantalons", link: "/femme/pantalons" },
      { name: "Vestes", link: "/femme/vestes" },
      { name: "Chemisiers", link: "/femme/chemisiers" },
      { name: "Jupes", link: "/femme/jupes" },
      { name: "Accessoires", link: "/femme/accessoires" },
      { name: "Tout Voir", link: "/femme" }
    ]
  },
  {
    title: "Homme",
    link: "/homme",
    subcategories: [
      { name: "Chemises", link: "/homme/chemises" },
      { name: "Pantalons", link: "/homme/pantalons" },
      { name: "Vestes", link: "/homme/vestes" },
      { name: "Tout Voir", link: "/homme" },
    ],
  },
  {
    title: "Parfums et Beauté",
    link: "/parfums",
    subcategories: [
      { name: "Parfums", link: "/parfums/parfums" },
      { name: "Soins", link: "/parfums/soins" },
    ],
  },
  {
    title: "Joaillerie",
    link: "/joaillerie",
    subcategories: [{ name: "Bijoux", link: "/joaillerie/bijoux" }],
  },
  {
    title: "Montres",
    link: "/montres",
    subcategories: [{ name: "Collections", link: "/montres/collections" }],
  },
  {
    title: "Malles, Voyage et Maison",
    link: "/voyage",
    subcategories: [{ name: "Articles de Voyage", link: "/voyage/articles" }],
  },
  {
    title: "Services",
    link: "/services",
    subcategories: [],
  },
  {
    title: "La Maison CM CLASS",
    link: "/a-propos",
    subcategories: [
      { name: "Notre Histoire", link: "/a-propos" },
      { name: "Nos Valeurs", link: "/a-propos" },
      { name: "Stories", link: "/stories" },
    ],
  },
];
export const MegaMenu = ({ onClose }: MegaMenuProps) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<MenuItem[]>([]);
  const [apiHeroContent, setApiHeroContent] = useState<Record<string, { img: string | null; title: string; text: string | null }>>({});
  const [loading, setLoading] = useState(true);

  // Fetch categories from public API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();

        // Transform API response to match MenuItem structure
        const transformedCategories = (data.mainCategories || []).map((cat: any) => {
          const firstSubId = cat?.subcategories?.[0]?.id;
          return {
            title: cat.title,
            link: firstSubId ? `/category?categoryId=${firstSubId}` : cat.link,
            subcategories:
              cat.subcategories?.map((sub: any) => ({
                id: sub.id,
                name: sub.name,
                link: sub.id ? `/category?categoryId=${sub.id}` : sub.link,
                children: sub.children || [],
              })) || [],
          };
        });

        setCategories(transformedCategories);
        setApiHeroContent(data.heroContent || {});
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        // Fallback to hardcoded categories if API fails
        setCategories(mainCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);


  return (
    <motion.div
      className="fixed inset-0 bg-black/80 z-50 overflow-hidden flex flex-col md:flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main Menu - Left Side */}
      <div className="flex-1 overflow-y-auto bg-white w-full max-w-full md:max-w-[420px]">
        <div className="px-6 lg:px-6 py-16 sm:py-8">
          {/* Close Button */}
          <div className="flex justify-normal mb-4 sm:mb-12
          ">
            <button
              onClick={onClose}
              className="hover:text-[#007B8A] transition-colors duration-300 pr-4"
              aria-label="Fermer"
            >
              <X size={20} />
            </button><span >Fermer</span>
          </div>

          {/* Main Categories */}
          <nav className="space-y-0 mb-12">
            {categories.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
              >
                <button
                  onMouseEnter={() => setHoveredCategory(item.title)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => {
                    if (item.subcategories && item.subcategories.length > 0) {
                      setActiveSubmenu(
                        activeSubmenu === item.title ? null : item.title
                      );
                    } else {
                      onClose();
                      window.location.href = item.link;
                    }
                  }}
                  className="w-full flex items-center justify-between py-2  group relative overflow-hidden"
                >
                  <span className="text-lg sm:text-xl font-medium tracking-wide transition-colors duration-300 group-hover:text-[#007B8A]">
                    {item.title}
                  </span>

                  {/* Animated underline */}
                  <motion.span
                    className="absolute bottom-0 left-0 h-[1.5px] bg-[#007B8A]"
                    initial={{ width: 0 }}
                    animate={{
                      width: hoveredCategory === item.title ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Chevron */}
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{
                      opacity:
                        hoveredCategory === item.title &&
                          item.subcategories?.length
                          ? 1
                          : 0,
                      x:
                        hoveredCategory === item.title &&
                          item.subcategories?.length
                          ? 0
                          : 10,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.subcategories && item.subcategories.length > 0 && (
                      <ChevronRight
                        size={18}
                        className={`transition-transform duration-300 ${activeSubmenu === item.title ? "rotate-90" : ""
                          }`}
                      />
                    )}
                  </motion.div>
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
              <button className="flex items-center gap-3 text-sm sm:text-base text-gray-600 hover:text-[#007B8A] transition-colors duration-300">
                <Phone size={18} />
                <span>Besoin d'aide ? +243 99 123 4567</span>
              </button>

              <Link
                to="/compte"
                onClick={onClose}
                className="flex items-center gap-3 text-sm sm:text-base text-gray-600 hover:text-[#007B8A] transition-colors duration-300"
              >
                <User size={18} />
                <span>Mon Compte</span>
              </Link>
              <Link
                to="/a-propos"
                onClick={onClose}
                className="flex items-center gap-3 text-sm sm:text-base text-gray-600 hover:text-[#007B8A] transition-colors duration-300"
              >
                <MapPin size={18} />
                <span>Magasins</span>
              </Link>
              <button className="flex items-center gap-3 text-sm sm:text-base text-gray-600 hover:text-[#007B8A] transition-colors duration-300">
                <Globe size={18} />
                <span>Pays de livraison: RD Congo</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Submenu - Right Side with Hero */}
      <AnimatePresence mode="wait">
        {activeSubmenu && (
          <motion.div
            className="hidden md:block w-[400px] bg-white border-l border-gray-200 overflow-y-auto"
            initial={{ x: "300%" }}
            animate={{ x: 0 }}
            exit={{ x: "300%" }}
            transition={{ type: "spring", damping: 80, stiffness: 300 }}
          >
            <div className="p-12">
              {/* Hero Section */}
              {(apiHeroContent[activeSubmenu] || heroContent[activeSubmenu]) && (
                <motion.div className="mb-8 overflow-hidden rounded-xl relative">
                  <img
                    src={(apiHeroContent[activeSubmenu]?.img || heroContent[activeSubmenu]?.img) || '/placeholder.jpg'}
                    alt={activeSubmenu}
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-6">
                    <h3 className="text-white text-2xl font-semibold mb-2">
                      {apiHeroContent[activeSubmenu]?.title || heroContent[activeSubmenu]?.title}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {apiHeroContent[activeSubmenu]?.text || heroContent[activeSubmenu]?.text}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Subcategories */}
              <div className="space-y-5">
                {categories
                  .find((cat) => cat.title === activeSubmenu)
                  ?.subcategories?.map((sub, index) => (
                    <motion.div
                      key={sub.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      <Link
                        to={sub.link || (sub.id ? `/category?categoryId=${sub.id}` : '#')}
                        onClick={onClose}
                        className="group block text-lg tracking-wide font-medium relative text-gray-800 hover:text-[#007B8A] transition-colors duration-300"
                      >
                        {sub.name}
                        <motion.span
                          className="absolute bottom-0 left-0 h-[1.5px] bg-[#007B8A]"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                          transition={{ duration: 0.3 }}
                        />
                      </Link>
                    </motion.div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Submenu */}
      <AnimatePresence>
        {activeSubmenu && (
          <motion.div
            className="md:hidden fixed inset-0 bg-white z-10 overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="px-0 py-0">
              {/* Hero Section for Mobile */}
              {heroContent[activeSubmenu] && (
                <motion.div className="w-full overflow-hidden relative">
                  <img
                    src={heroContent[activeSubmenu].img}
                    alt={activeSubmenu}
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-6">
                    <h3 className="text-white text-2xl font-semibold mb-2">
                      {heroContent[activeSubmenu].title}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {heroContent[activeSubmenu].text}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Header & Close Button */}
              <div className="flex items-center justify-between px-6 py-4">
                <h3 className="text-xl font-semibold">{activeSubmenu}</h3>
                <button
                  onClick={() => setActiveSubmenu(null)}
                  className="hover:text-[#007B8A] transition-colors duration-300"
                  aria-label="Retour"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Subcategories */}
              <div className="px-6 py-4 space-y-6">
                {categories
                  .find((cat) => cat.title === activeSubmenu)
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
                        className="block text-lg font-medium text-gray-800 relative hover:text-[#007B8A] transition-colors duration-300"
                      >
                        {sub.name}
                        <motion.span
                          className="absolute bottom-0 left-0 h-[1.5px] bg-[#007B8A]"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                          transition={{ duration: 0.3 }}
                        />
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
