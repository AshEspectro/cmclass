import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { X, Phone, Leaf, User, ChevronRight, Globe, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface MegaMenuProps {
  onClose: () => void;
}

export const FALLBACK_HERO_CONTENT: Record<string, { img: string; title: string; text: string }> = {
  Homme: { img: "/homme.jfif", title: "Homme", text: "L’élégance masculine repensée." },
  Femme: { img: "/woman.jfif", title: "Femme", text: "Féminité contemporaine." },
};

export const FALLBACK_MAIN_CATEGORIES = [
  { title: "Femme", slug: "femme", subcategories: [{ title: "Robes", slug: "femme-robes", subcategories: [] }] },
  { title: "Homme", slug: "homme", subcategories: [{ title: "Chemises", slug: "homme-chemises", subcategories: [] }] },
];

export const MegaMenu = ({ onClose }: MegaMenuProps) => {
  const [active, setActive] = useState(false);
  const [panelStack, setPanelStack] = useState<string[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [mainCategoriesState, setMainCategoriesState] = useState<any[]>(FALLBACK_MAIN_CATEGORIES);
  const [heroContentState, setHeroContentState] = useState<Record<string, any>>(FALLBACK_HERO_CONTENT);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const base = import.meta.env.VITE_API_URL || '';
    const url = `${base}/categories`;
    const ac = new AbortController();
    setLoading(true);
    fetch(url, { signal: ac.signal })
      .then((r) => { if (!r.ok) throw new Error('Failed to fetch'); return r.json(); })
      .then((body) => {
        if (body?.mainCategories) setMainCategoriesState(body.mainCategories);
        if (body?.heroContent) setHeroContentState(body.heroContent);
      })
      .catch((err) => { if ((err as any).name !== 'AbortError') console.error(err); })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setActive(false);
        setPanelStack([]);
      }
    }
    if (active) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [active]);

  function closeMenu() {
    setActive(false);
    setPanelStack([]);
    onClose();
  }

  function findNodeBySlug(slug: string, nodes = mainCategoriesState): any | null {
    for (const n of nodes) {
      if (!n) continue;
      if (n.slug === slug || n.title === slug) return n;
      if (n.subcategories?.length) {
        const f = findNodeBySlug(slug, n.subcategories);
        if (f) return f;
      }
    }
    return null;
  }

  function findPathToSlug(slug: string, nodes = mainCategoriesState, path: string[] = []): string[] | null {
    for (const n of nodes) {
      if (!n) continue;
      const id = n.slug ?? n.title;
      if (id === slug || n.title === slug) return [...path, id];
      if (n.subcategories?.length) {
        const res = findPathToSlug(slug, n.subcategories, [...path, id]);
        if (res) return res;
      }
    }
    return null;
  }

  function openPanelForSlug(slug: string) {
    const path = findPathToSlug(slug) || [slug];
    setPanelStack(path);
    setActive(true);
  }

  return (
    <motion.div
  className="fixed inset-0 bg-black/80 z-50 overflow-hidden flex flex-col md:flex-row"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>


  

      {/* Left Column - Main Categories */}
      <div
        onClick={(e) => e.stopPropagation()}
        ref={containerRef}
        className="flex-1 overflow-y-auto z-50 bg-white w-full max-w-full md:max-w-[420px]"
      >
        <div className="px-6 lg:px-6 py-16 sm:py-8">
          {/* Close */}
          <div className="flex justify-normal mb-4 sm:mb-12
          ">
            <button onClick={closeMenu} className="hover:text-[#007B8A] transition-colors duration-300 pr-4" aria-label="Fermer">
              <X size={20} />
            </button>
            <span>Fermer</span>
          </div>

          {/* Main Categories */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 rounded-full border-4 border-t-transparent border-[#007B8A] animate-spin" />
              <span className="ml-3 text-sm text-gray-600">Chargement...</span>
            </div>
          ) : (
            <nav className="space-y-2 mb-12">
              {mainCategoriesState.map((item: any) => {
                const slug = item.slug ?? item.title;
                return (
                  <button
                    key={slug}
                    onMouseEnter={() => setHoveredCategory(slug)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onClick={() =>
                      item.subcategories?.length
                        ? openPanelForSlug(slug)
                        : (window.location.href = item.link || `/collections/${slug}`)
                    }
                    className="w-full flex items-center justify-between py-2  group relative overflow-hidden"
                  >
                    <span className="text-lg sm:text-xl font-medium tracking-wide transition-colors duration-300 group-hover:text-[#007B8A]">
                    {item.title}
                  </span>
                    <motion.span
                      className="absolute bottom-0 left-0 h-[1.5px] bg-[#007B8A]"
                      initial={{ width: 0 }}
                      animate={{ width: hoveredCategory === slug ? "100%" : "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                    {/* Chevron */}
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{
                      opacity:
                        hoveredCategory === slug &&
                        item.subcategories?.length
                          ? 1
                          : 0,
                      x:
                        hoveredCategory === slug &&
                        item.subcategories?.length
                          ? 0
                          : 10,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.subcategories && item.subcategories.length > 0 && (
                      <ChevronRight
                        size={18}
                        className={`absolute right-0 top-2 transition-transform duration-300 ${
                          panelStack[0] === slug ? "rotate-90" : ""
                        }`}
                      />
                    )}</motion.div>
                  </button>
                );
              })}
            </nav>

          )}
          {/* Utilities */}
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
                to="/developpement-durable"
                onClick={onClose}
                className="flex items-center gap-3 text-sm sm:text-base text-gray-600 hover:text-[#007B8A] transition-colors duration-300"
              >
                <Leaf size={18} />
                <span>Développement Durable</span>
              </Link>
              <Link
                to="/compte"
                onClick={onClose}
                className="flex items-center gap-3 text-sm sm:text-base text-gray-600 hover:text-[#007B8A] transition-colors duration-300"
              >
                <User size={18} />
                <span>Mon Compte</span>
              </Link>
              <Link
                to="/magasins"
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

      {/* Right Column - Active Submenu + Hero */}
      <AnimatePresence>
        {panelStack.length > 0 && (
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="hidden md:block w-[420px] bg-white border-l border-gray-300 overflow-y-auto"
            initial={{ x: "300%" }}
            animate={{ x: 0 }}
            exit={{ x: "300%" }}
            transition={{ type: "spring", damping: 90, stiffness: 300 }}
            
          >
            <div className="p-12">
              {panelStack.map((slug, idx) => {
                const node = findNodeBySlug(slug);
                if (!node) return null;
                const children = node.subcategories || [];
                // Normalize hero: either object with img/title/text, or fallback
                function getHeroFromState(key: string | undefined) {
                  if (!key) return null;
                  const state = heroContentState || {};
                  if (state[key]?.img) return state[key];
                  if (node.title && state[node.title]?.img) return state[node.title];
                  const lower = key.toLowerCase();
                  for (const k of Object.keys(state)) {
                    if (k.toLowerCase() === lower && state[k]?.img) return state[k];
                  }
                  return null;
                }

                const heroObj =
                  getHeroFromState(slug) ||
                  (node.imageUrl
                    ? {
                        img: node.imageUrl,
                        title: node.title || node.name,
                        text: node.description,
                      }
                    : null);


                return (
                  <div key={`${slug}-${idx}`} className="mb-8">
                    {/* Hero */}
                    {idx === 0 && heroObj && (
  <div className="mb-8 relative rounded-xl overflow-hidden">
    <img
      src={heroObj.img}
      alt={heroObj.title}
      className="w-full h-56 object-cover"
    />
    <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-6">
                      <h3 className="text-white text-2xl font-semibold mb-2">
                        {heroObj.title}
                      </h3>

                      {heroObj.text && (
                      <p className="text-white/90 text-sm">
                        {heroObj.text}
                      </p>
                    )}
    </div>
  </div>
)}


                    {/* Subcategories */}
                    <div className="space-y-3">
                      {children.map((sub: any) => {
                        const sslug = sub.slug ?? sub.title;
                        return (
                          <button
                            key={sslug}
                            onClick={() =>
                              sub.subcategories?.length
                                ? openPanelForSlug(sslug)
                                : (window.location.href = sub.link || `/collections/${sslug}`)
                            }
                            onMouseEnter={() => setHoveredCategory(sslug)}
                            onMouseLeave={() => setHoveredCategory(null)}
                            className="w-full text-left text-lg text-gray-800 hover:text-[#007B8A] relative py-2"
                          >
                            {sub.title || sub.name}
                            <motion.span
                              className="absolute bottom-0 left-0 h-[1.5px] bg-[#007B8A]"
                              initial={{ width: 0 }}
                              animate={{ width: hoveredCategory === sslug ? "100%" : "0%" }}
                              transition={{ duration: 0.22 }}
                            />
                            {sub.subcategories && sub.subcategories.length > 0 && (
                              <ChevronRight
                                size={16}
                                className={`absolute right-0 top-2 transition-transform duration-300 ${
                                  panelStack[idx + 1] === sslug ? "rotate-90" : ""
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    
    </motion.div>
  );
};
