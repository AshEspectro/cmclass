import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../contexts/CartContext";
import type { CartItem } from "../contexts/CartContext";
import { ProductCard } from "../components/Hero_cat";
import { publicApi } from "../services/publicApi";

// Product shape returned by the public API
export interface ApiProduct {
  id: number;
  label?: string | null;
  name: string;
  price?: string | number;
  sizes?: string[];
  longDescription?: string | null;
  productImage?: string | null;
  mannequinImage?: string | null;
  colors?: Array<{ name?: string; hex: string; images?: string[] } | string>;
  images?: string[];
  inStock?: boolean;
  categoryId?: number;
  category?: string | null;
  description?: string | null;
  careInstructions?: string | null;
  environmentalInfo?: string | null;
}

const normalizeAssetUrl = (url?: string | null) => {
  if (!url) return "";
  const doubleHttpMatch = url.match(/^(https?:\/\/[^/]+)(https?:\/\/.*)$/);
  if (doubleHttpMatch) return doubleHttpMatch[2];
  return url;
};

const normalizeImages = (images?: string[] | null) =>
  Array.isArray(images) ? images.map((img) => normalizeAssetUrl(img)).filter(Boolean) : [];

const normalizeColors = (
  colors: ApiProduct["colors"]
): Array<{ hex: string; images: string[]; name?: string }> => {
  if (!Array.isArray(colors)) return [];
  return colors
    .map((color) => {
      if (typeof color === "string") return { hex: color, images: [] };
      if (!color || typeof color !== "object") return null;
      return {
        hex: color.hex,
        images: normalizeImages(color.images),
        name: color.name,
      };
    })
    .filter(
      (color): color is { hex: string; images: string[]; name?: string } =>
        Boolean(color && color.hex)
    );
};

export function ExpandableText({
  children,
  maxLines = 1,
}: {
  children: string;
  maxLines?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full text-gray-700">
      <div className="relative">
        <p
          className={`text-justify text-sm transition-all duration-300 ${expanded ? "" : `line-clamp-${maxLines}`
            }`}
        >
          {children}
        </p>

        {!expanded && (
          <div className="pointer-events-none absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-gray-200/40 to-transparent"></div>
        )}
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-sm text-black underline underline-offset-4"
      >
        {expanded ? "Voir moins" : "Voir plus"}
      </button>
    </div>
  );
}

interface ExpandableSectionProps {
  title: string;
  children: ReactNode;
}

export const ExpandableSection = ({ title, children }: ExpandableSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 pb-1 pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left focus:outline-none"
      >
        <span className="text-sm">{title}</span>
        <span className="text-black">
          {isOpen ? <Minus size={14} /> : <Plus size={14} />}
        </span>
      </button>

      <div
        className={`mt-3 text-gray-700 text-sm transition-all duration-300 overflow-hidden ${isOpen ? "max-h-96" : "max-h-0"
          }`}
      >
        {children}
      </div>
    </div>
  );
};

interface SingleProductPageProps {
  product?: ApiProduct | null;
}

export function SingleProductPage({ product: productProp }: SingleProductPageProps) {
  const { id } = useParams();
  const [product, setProduct] = useState<ApiProduct | null>(productProp ?? null);
  const [loading, setLoading] = useState(!productProp);
  const [error, setError] = useState<string | null>(null);
  type DiscoveryItem = {
    id: number;
    label: string;
    name: string;
    price: string;
    sizes?: string[];
    longDescription?: string;
    productImage: string;
    mannequinImage: string;
    colors: { hex: string; images: string[]; name?: string }[];
  };

  const [discoveryProducts, setDiscoveryProducts] = useState<DiscoveryItem[]>([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(true);

  useEffect(() => {
    if (productProp) {
      setProduct(productProp);
      setLoading(false);
      setError(null);
    }
  }, [productProp]);

  useEffect(() => {
    if (productProp) return;
    if (!id) {
      setLoading(false);
      setError("Produit introuvable");
      return;
    }

    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      const fetched = await publicApi.getProduct(id);
      console.log("[DEBUG] Fetched product data:", fetched);
      if (!mounted) return;
      if (!fetched) {
        setError("Produit introuvable");
        setProduct(null);
      } else {
        setProduct(fetched);
      }
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [id, productProp]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setDiscoveryLoading(true);
      try {
        const data = await publicApi.getProducts({ page: 1, pageSize: 100 });

        const mapped: Product_cat[] = Array.isArray(data)
          ? data.map((p: any) => ({
            id: Number(p.id),
            label: p.label || "",
            name: p.name || "",
            price:
              typeof p.price === "string"
                ? p.price
                : typeof p.price === "number"
                  ? `${p.price.toFixed(2)}$`
                  : typeof p.priceCents === "number"
                    ? `${(p.priceCents / 100).toFixed(2)}$`
                    : "0.00$",
            longDescription: p.longDescription || p.description || "",
            productImage: p.productImage || (Array.isArray(p.images) ? p.images[0] : "") || "",
            mannequinImage:
              p.mannequinImage || (Array.isArray(p.images) ? p.images[1] : "") || p.productImage || "",
            colors: Array.isArray(p.colors)
              ? p.colors.map((c: any) =>
                typeof c === "string"
                  ? { hex: c, images: [] }
                  : { hex: c?.hex || "#000000", images: Array.isArray(c?.images) ? c.images : [] }
              )
              : [],
            sizes: Array.isArray(p.sizes) ? p.sizes : [],
          }))
          : [];

        const filtered = product?.id != null ? mapped.filter((p) => p.id !== Number(product.id)) : mapped;

        const picked = filtered.slice(0, 4);
        if (mounted) setDiscoveryProducts(picked);
      } catch (err) {
        console.error("Failed to load discovery products", err);
        if (mounted) setDiscoveryProducts([]);
      } finally {
        if (mounted) setDiscoveryLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [product?.id]);

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [imageIndex, setImageIndex] = useState(0);
  const [hoveringImage, setHoveringImage] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showCartCard, setShowCartCard] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!product) return;
    const normalized = normalizeColors(product.colors);
    setSelectedColor(normalized[0]?.hex || "#000000");
    // Do not auto-select a size — require user choice when multiple sizes exist
    setSelectedSize(product.sizes && product.sizes.length > 0 ? null : "Unique");
    setImageIndex(0);
    setDropdownOpen(false);
    setQuantity(1);
  }, [product?.id]);

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  if (!product) {
    return <div className="p-8">{error || "Produit introuvable"}</div>;
  }

  const safeColors = normalizeColors(product.colors);
  const normalizedImages = normalizeImages(product.images);
  const normalizedProductImage = normalizeAssetUrl(product.productImage);
  const normalizedMannequinImage = normalizeAssetUrl(product.mannequinImage);

  const colorImages =
    safeColors.find((c) => c.hex === selectedColor)?.images || normalizedImages || [];
  const sizes = product.sizes ? product.sizes.map((size) => ({ size })) : [];
  const effectiveSize = selectedSize || (sizes.length === 0 ? "Unique" : "");
  const mainImage = normalizedProductImage || normalizedImages[0] || "";
  const mannequinImage = normalizedMannequinImage || normalizedImages[1] || mainImage;

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id.toString());

  const prev = () =>
    setImageIndex((i) => (i === 0 ? colorImages.length - 1 : i - 1));
  const next = () =>
    setImageIndex((i) => (i === colorImages.length - 1 ? 0 : i + 1));

  const toggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id.toString());
    } else {
      addToWishlist(product);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleSizeClick = (size: string) => {
    setSelectedSize(size);
    setDropdownOpen(false);
  };

  const handleAddToCart = () => {
    // If product has sizes, require the user to select one
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setDropdownOpen(true);
      return;
    }
    if (!selectedColor) return;
    const parsedPrice = Number(String(product.price ?? 0).replace(/[^0-9.-]+/g, ""));
    addToCart(
      { ...(product as unknown as Partial<CartItem>), price: parsedPrice } as Partial<CartItem>,
      effectiveSize,
      selectedColor,
      quantity
    );
    setShowCartCard(true);
  };

  return (
    <>
      <div className="max-w-8xl mx-auto px-0 md:px-8 grid grid-cols-1 pt-32 md:pt-24 md:grid-cols-2 gap-6">
        <div className="relative sticky top-0 md:static w-full md:flex md:flex-col">
          <div className="relative w-full aspect-[4/5]">
            <img
              src={mainImage}
              className={`absolute inset-0 w-full bg-black/10 h-full aspect-4/5 md:aspect-1/1 object-cover transition-opacity duration-500 md:relative md:opacity-100 md:w-full md:h-auto ${hoveringImage ? "opacity-0" : "opacity-100"
                }`}
              onMouseEnter={() => setHoveringImage(true)}
              onMouseLeave={() => setHoveringImage(false)}
              alt={product.name}
            />
            <img
              src={mannequinImage}
              className={`absolute inset-0 w-full h-full aspect-4/5 md:aspect-1/1 object-cover transition-opacity duration-500 md:relative md:opacity-100 md:w-full md:h-auto ${hoveringImage ? "opacity-100" : "opacity-0"
                }`}
              alt={`${product.name} mannequin`}
            />

            {colorImages.length > 0 && (
              <img
                src={colorImages[imageIndex]}
                className="absolute inset-0 w-full h-full aspect-4/5 md:aspect-1/1 object-cover transition-opacity duration-500 md:relative md:opacity-100 md:w-full md:h-auto"
                alt={`${product.name} variant`}
              />
            )}

            {colorImages.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute top-1/2 -translate-y-1/2 left-2 bg-white/30 hover:bg-white/50 rounded-full p-1 md:hidden"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={next}
                  className="absolute top-1/2 -translate-y-1/2 right-2 bg-white/30 hover:bg-white/50 rounded-full p-1 md:hidden"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="md:sticky md:top-24 flex-col items-center h-fit z-20 bg-white flex justify-center">
          <div className="px-4 md:px-8 w-full md:w-sm flex-row justify-center md:gap-8">
            <div className="gap-2 pt-8 md:pt-0">
              <div className="items-center">
                <div className="flex w-full justify-between pb-6">
                  <h1 className="text-sm self-center">{product.id}</h1>
                  <button onClick={toggleWishlist} className="">
                    <Heart
                      size={18}
                      className={`transition-colors ${inWishlist ? "text-[#007B8A]" : "text-black"
                        }`}
                    />
                  </button>
                </div>
                {product.label ? (
                  <p className="text-xs text-gray-500">{product.label}</p>
                ) : null}
                <p className="text-lg text-black">{product.name}</p>
                <p className="text-lg text-black/70 pb-4 mb-4">{product.price}</p>
              </div>

              {safeColors.length > 0 && (
                <div className="mb-6">
                  <div className="flex w-full justify-between">
                    <p className="text-sm font-medium mb-1">Couleur</p>
                    <p className="text-sm text-gray-600 mb-3">
                      {safeColors.find((c) => c.hex === selectedColor)?.name ||
                        selectedColor}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {safeColors.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => {
                          setSelectedColor(c.hex);
                          setImageIndex(0);
                        }}
                        className={`w-12 h-12 hover:border hover:border-[#007B8A] rounded-sm ${selectedColor === c.hex ? "ring-2 ring-[#007B8A]" : "border-gray-300"
                          }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {sizes.length > 0 ? (
                <>
                  <div className="flex w-full justify-between py-3 border-y my-4 border-black/5">
                    <p>Taille</p>
                    <button
                      onClick={() => setDropdownOpen((prev) => !prev)}
                      className="flex items-center gap-2 text-sm md:text-sm transition-all duration-300 active:scale-95"
                    >
                      {selectedSize || "Sélectionner"}
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                  </div>

                  {dropdownOpen && (
                    <div className="w-full md:w-80 bg-white shadow-lg rounded-b-lg border-gray-200 pb-2 animate-dropdown">
                      <div className="max-w-7xl mx-auto flex flex-col">
                        {sizes.map((item, idx) => {
                          const isSelected = selectedSize === item.size;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleSizeClick(item.size)}
                              className={`w-full text-left px-6 py-2 text-sm flex justify-between items-center transition-colors ${!isSelected ? "hover:bg-gray-100" : "bg-gray-50"
                                }`}
                            >
                              <span>{item.size}</span>
                              {isSelected && <Check size={18} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex w-full justify-between py-3 border-y my-4 border-black/5">
                  <p>Taille</p>
                  <span className="text-sm">Unique</span>
                </div>
              )}

              <div className="flex items-center gap-4 my-8">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="border w-10 h-10 hover:border-2 rounded"
                >
                  -
                </button>

                <span className="w-6 text-center">{quantity}</span>

                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="border w-10 h-10 rounded hover:border-2"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <button
                onClick={handleAddToCart}
                className="bg-black text-white w-xl py-2 rounded-full hover:bg-white hover:text-[#007B8A] hover:border hover:border-[#007B8A] transition"
              >
                Ajouter au panier
              </button>
              {showCartCard && (
                <div
                  className="fixed inset-0 bg-black/85 flex items-center justify-center w-full z-50 animate-fadeIn"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setShowCartCard(false);
                    }
                  }}
                >
                  <div className="bg-black w-xl flex items-center justify-center">
                    <div
                      className="bg-white w-sm md:w-xl lg:w-2xl absolute p-6"
                      ref={cardRef}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setShowCartCard(false)}
                        className="absolute top-4 right-4 text-black hover:text-black text-4xl"
                      >
                        ×
                      </button>

                      <h3 className="text-sm mb-4">Produit Ajouté</h3>

                      <div className="flex h-28 mb-4 items-center">
                        <img
                          src={mainImage}
                          alt={product.name}
                          className="w-28 h-28 object-cover"
                        />
                        <div className="ml-4">
                          <div>
                            <p className="text-xs text-black">{product.id}</p>
                            <p className="text-black text-xs">{product.name}</p>
                          </div>

                          <div className="text-xs text-black">
                            <p>
                              <span className="text-xs text-black">Couleurs :</span>{" "}
                              {selectedColor}
                            </p>
                            <p>
                              <span className="text-xs text-black">Taille :</span>{" "}
                              {effectiveSize}
                            </p>
                            <p className="text-xs text-black">{product.price}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex-col w-full">
                        <Link to="/panier">
                          <button className="bg-black text-white my-3 py-2.5 w-full border rounded-full hover:bg-white hover:text-black transition">
                            Commander maintenant
                          </button>
                        </Link>

                        <button
                          onClick={() => setShowCartCard(false)}
                          className="border border-black py-2.5 w-full rounded-full hover:border-2 hover:text-black transition"
                        >
                          Continuer mes achats
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center mb-6">
              <Link to="" className="text-xs underline underline-offset-4">
                Contacter un conseiller
              </Link>
            </div>

            <p className="text-sm leading-relaxed text-gray-600 pb-12">
              Livraison avant Noël pour toute commande passée avant le 23 décembre à 11h59 selon la
              disponibilité produit.
            </p>
            <div className="flex justify-center border-b pb-4 border-black/5">
              {product.longDescription && (
                <ExpandableText maxLines={2}>{product.longDescription}</ExpandableText>
              )}
            </div>
          </div>
        </div>

        <div className="w-full md:w-sm px-8">
          {product.environmentalInfo && (
            <ExpandableSection title="Caractéristiques environnementales">
              <p className="text-sm whitespace-pre-line leading-relaxed">
                {product.environmentalInfo}
              </p>
            </ExpandableSection>
          )}

          {product.careInstructions && (
            <ExpandableSection title="Entretien du produit">
              <p className="text-sm whitespace-pre-line leading-relaxed">
                {product.careInstructions}
              </p>
            </ExpandableSection>
          )}
        </div>
      </div>

      {showToast && (
        <div className="fixed top-10 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="bg-[#007B8A] mx-4 md:mx-16 text-white rounded-lg shadow-lg flex items-center gap-3 transition-opacity duration-300 pointer-events-auto">
            <img
              src={mainImage}
              alt={product.name}
              className="w-16 h-16 rounded-l-lg object-cover"
            />
            <div className="text-sm flex flex-col p-2">
              <span>{`L'article ${product.name} a été ajouté à votre wishlist`}</span>
              <Link to="/wishlist" className="underline font-medium">
                Voir votre wishlist
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Discovery section */}
      <div className="flex-col w-full items-center">
        <div className="flex justify-center py-8 md:py-16 lg:py-24">
          <Link to="" className="text-xs text-center underline underline-offset-4">
            À découvrir également
          </Link>
        </div>

        {discoveryLoading ? (
          <div className="w-full text-center text-gray-500 py-6">Chargement des produits...</div>
        ) : discoveryProducts.length === 0 ? (
          <div className="w-full text-center text-gray-500 py-6">
            Aucun produit à afficher
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 w-full">
            {discoveryProducts.map((p) => (
              <ProductCard key={p.id} product_cat={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
