export default function HeroSection({
  image,
  title,
  description,
  
}: {
  image: string;
  title: string;
  description: string;
  ctaLabel?: string;
  onClick?: () => void;
}) {
  return (
    <section className="w-full">
      {/* IMAGE WRAPPER */}
      <div  className="relative w-full h-[60vh] lg:h-[70vh] xl:h-[100vh]   overflow-hidden" >
        <img
          
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/4 to-transparent" />


        {/* TEXT INSIDE IMAGE FOR md+ */}
        <div className="hidden md:flex absolute inset-0  items-end px-16">
          <div className="text-white max-w-sm">
            <h1 className="text-lg  mb-4">{title}</h1>
            <p className="text-sm leading-relaxed opacity-90 mb-12">{description}</p>
            
            
          </div>
        </div>
      </div>

      {/* TEXT OUTSIDE IMAGE FOR MOBILE */}
      <div className="md:hidden mt-6 px-12">
        <h1 className="text-lg  mb-4">{title}</h1>
        <p className="text-sm text-gray-700 leading-relaxed mb-6">{description}</p>

        
      </div>
    </section>
  );
}
export  function HeroProduct({
  image,
  
  
}: {
  image: string;
 
}) {
  return (
    <section className="w-full">
      {/* IMAGE WRAPPER */}
      <div className="relative w-full h-[60vh] lg:h-[70vh] xl:h-[100vh]   overflow-hidden">
        <img
          src={image}
          alt={image}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/4 to-transparent" />


        {/* TEXT INSIDE IMAGE FOR md+ */}
        <div className="hidden md:flex absolute inset-0  items-end px-16">
          <div className="text-white max-w-sm">
            
            
          </div>
        </div>
      </div>

      
    </section>
  );
}
import { useEffect, useState } from "react";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";


// -------------------------
// ProductGrid.tsx
// -------------------------


import type { Product_cat } from "../data/products";
import { publicApi } from "../services/publicApi";

interface ProductGridProps {
  limit?: number; // optional
}

export function ProductGrid({ limit }: ProductGridProps) {
  const [items, setItems] = useState<Product_cat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await publicApi.getProducts();
        const mapped: Product_cat[] = Array.isArray(data)
          ? data.map((p: any) => {
              const price =
                typeof p.price === "string"
                  ? p.price
                  : typeof p.price === "number"
                  ? `${p.price.toFixed(2)}$`
                  : typeof p.priceCents === "number"
                  ? `${(p.priceCents / 100).toFixed(2)}$`
                  : "0.00$";

              const colors = Array.isArray(p.colors)
                ? p.colors.map((c: any) =>
                    typeof c === "string"
                      ? { hex: c, images: [] }
                      : { hex: c?.hex || "#000000", images: Array.isArray(c?.images) ? c.images : [] }
                  )
                : [];

              return {
                id: Number(p.id),
                label: p.label || "",
                name: p.name || p.label || "",
                price,
                longDescription: p.longDescription || p.description || "",
                productImage: p.productImage || p.images?.[0] || "",
                mannequinImage: p.mannequinImage || p.images?.[1] || p.productImage || "",
                colors,
                sizes: Array.isArray(p.sizes) ? p.sizes : [],
              };
            })
          : [];

        if (mounted) setItems(mapped);
      } catch (err) {
        console.error("Failed to load products for grid", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const limitedItems = limit ? items.slice(0, limit) : items;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 w-full">
      {loading ? (
        <div className="col-span-full text-center text-gray-500 py-6">
          Chargement des produits...
        </div>
      ) : limitedItems.length === 0 ? (
        <div className="col-span-full text-center text-gray-500 py-6">
          Aucun produit à afficher.
        </div>
      ) : (
        limitedItems.map((p) => (
          <ProductCard key={p.id} product_cat={p} />
        ))
      )}
    </div>
  );
}




// -------------------------
// ProductCard.tsx
// -------------------------

import { useWishlist } from "../contexts/WishlistContext";
import { Link } from "react-router-dom";

const normalizeAssetUrl = (url?: string | null) => {
  if (!url) return '';
  const doubleHttpMatch = url.match(/^(https?:\/\/[^/]+)(https?:\/\/.*)$/);
  if (doubleHttpMatch) return doubleHttpMatch[2];
  return url;
};

interface ProductCardProps {
  product_cat: Product_cat;
}

export function ProductCard({ product_cat }: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState(
    product_cat.colors?.[0]?.hex || "#000000"
  );
  const [index, setIndex] = useState(0);
  const [hoveringImage, setHoveringImage] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product_cat.id.toString());

  const toggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product_cat.id.toString());
    } else {
      addToWishlist(product_cat);
      setShowToast(true); // Show notification
    }
  };
   // Auto-hide toast after 2 seconds
  useEffect(() => {
    if (showToast) {
      const timeout = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [showToast]);

  const colorImages = (product_cat.colors.find((c) => c.hex === selectedColor)?.images || [])
    .map((img) => normalizeAssetUrl(img))
    .filter(Boolean);
  const productImage = normalizeAssetUrl(product_cat.productImage);
  const mannequinImage = normalizeAssetUrl(product_cat.mannequinImage);

  const prev = () =>
    setIndex((i) => (i === 0 ? colorImages.length - 1 : i - 1));
  const next = () =>
    setIndex((i) => (i === colorImages.length - 1 ? 0 : i + 1));

  return (
    <div className="relative w-full aspect-4/5 overflow-hidden group">
     
      <div
        className="w-full h-full relative"
        onMouseEnter={() => setHoveringImage(true)}
        onMouseLeave={() => setHoveringImage(false)}
      >
        {/* Default image */} <Link to={`/product/${product_cat.id}`} >{/* IMAGE AREA */}
        <img
          src={productImage}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            hoveringImage ? "opacity-0" : "opacity-100"
          }`}
        /></Link>
        {/* Mannequin image on hover */}
        <img
          src={mannequinImage}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            hoveringImage ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Browsable images per color */}
        {colorImages.length > 0 && (
          <img
            src={colorImages[index]}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              hoveringImage ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* Top gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-black/5 to-transparent" />

        {/* CHEVRONS */}
        {colorImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className={`absolute top-1/2 -translate-y-1/2 left-2 text-black transition-opacity duration-300 ${
                hoveringImage ? "opacity-100" : "opacity-0"
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className={`absolute top-1/2 -translate-y-1/2 right-2 text-black transition-opacity duration-300 ${
                hoveringImage ? "opacity-100" : "opacity-0"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* BOTTOM INFO */}
      <div
        className={`absolute bottom-0 flex justify-between left-0 right-0 px-4 pb-6 text-black transition-opacity duration-300 ${
          hoveringImage ? "opacity-0" : "opacity-100"
        }`}
      >
        <Link to={`/product/${product_cat.id}`} >
          <p className="text-xs text-gray-500">{product_cat.label}</p>
          {/* IMAGE AREA */}
<p className="text-sm font-medium ">{product_cat.name}</p>
          <p className="text-sm">{product_cat.price}</p>
        </Link>

        {/* COLOR SELECTOR */}
        <div className="flex items-end gap-1 mt-2">
          {product_cat.colors.map((c, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedColor(c.hex);
                setIndex(0);
              }}
              className={`w-3 h-3 rounded-full ${
                selectedColor === c.hex ? "ring-1 ring-black scale-110" : ""
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>
    
      {/* WISHLIST BUTTON */}
      <button
        onClick={toggleWishlist}
        className="absolute top-2 right-2 p-2 transition-colors"
      >
        <Heart
          size={18}
          className={`transition-colors ${
            inWishlist ? "text-[#007B8A]" : "text-black"
          }`}
        />
      </button>{/* TOAST NOTIFICATION */}
      {showToast && (
  <div className="fixed top-10 left-0 right-0 z-50 flex justify-center pointer-events-none">
    <div className="bg-[#007B8A] mx-4 md:mx-16 text-white rounded-lg shadow-lg flex items-center gap-3 transition-opacity duration-300 pointer-events-auto">
      {/* Image du produit */}
      <img
        src={product_cat.productImage}
        alt={product_cat.name}
        className="w-16 md:w-24 h-16 md:h-24 rounded-l-lg object-cover"
      />

      {/* Texte et lien */}
      <div className="text-sm pr-4 md:pr-6 flex flex-col p-2">
        <span>{`L'article ${product_cat.name} a été ajouté à votre wishlist`}</span>
        <Link to="/wishlist" className="underline  font-medium">
          Voir votre wishlist
        </Link>
      </div>
    </div>
  </div>

)}

    </div>
  );
}
