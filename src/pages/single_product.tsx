import { useState } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useWishlist } from "../contexts/WishlistContext";
import type { Product_cat } from "../data/products";

interface SingleProductPageProps {
  product: Product_cat;
}

export function SingleProductPage({ product }: SingleProductPageProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0].hex);
  const [imageIndex, setImageIndex] = useState(0);
  const [hoveringImage, setHoveringImage] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const colorImages =
    product.colors.find((c) => c.hex === selectedColor)?.images || [];

  const prev = () =>
    setImageIndex((i) => (i === 0 ? colorImages.length - 1 : i - 1));
  const next = () =>
    setImageIndex((i) => (i === colorImages.length - 1 ? 0 : i + 1));

  const toggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000); // auto-hide toast
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Product Images */}
      <div className="relative w-full aspect-[4/5] mb-6">
        <img
          src={product.productImage}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            hoveringImage ? "opacity-0" : "opacity-100"
          }`}
          onMouseEnter={() => setHoveringImage(true)}
          onMouseLeave={() => setHoveringImage(false)}
        />
        <img
          src={product.mannequinImage}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            hoveringImage ? "opacity-100" : "opacity-0"
          }`}
        />

        {colorImages.length > 0 && (
          <img
            src={colorImages[imageIndex]}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500`}
          />
        )}

        {/* Chevrons */}
        {colorImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute top-1/2 -translate-y-1/2 left-2 bg-white/30 hover:bg-white/50 rounded-full p-1"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={next}
              className="absolute top-1/2 -translate-y-1/2 right-2 bg-white/30 hover:bg-white/50 rounded-full p-1"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 p-2 bg-white/30 hover:bg-white/50 rounded-full"
        >
          <Heart
            size={24}
            className={`transition-colors ${inWishlist ? "text-[#007B8A]" : "text-black"}`}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="flex flex-col md:flex-row md:gap-12">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
          <p className="text-sm text-gray-500 mb-2">{product.label}</p>
          <p className="text-xl font-semibold mb-4">{product.price}</p>

          {/* Color selector */}
          <div className="flex items-center gap-2 mb-6">
            {product.colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => {
                  setSelectedColor(c.hex);
                  setImageIndex(0);
                }}
                className={`w-6 h-6 rounded-full border ${selectedColor === c.hex ? "ring-2 ring-[#007B8A]" : "border-gray-300"}`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>

          {/* Add to cart button */}
          <button className="bg-[#007B8A] text-white px-6 py-3 rounded-md hover:bg-[#005f6b] transition">
            Ajouter au panier
          </button>
        </div>

        {/* Optional product description or details */}
        <div className="flex-1 mt-6 md:mt-0">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
            vulputate, arcu non scelerisque imperdiet, augue purus bibendum
            sapien, nec luctus justo neque non justo.
          </p>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-10 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="bg-[#007B8A] mx-4 md:mx-16 text-white rounded-lg shadow-lg flex items-center gap-3 transition-opacity duration-300 pointer-events-auto">
            <img
              src={product.productImage}
              alt={product.name}
              className="w-16 h-16 rounded-l-lg object-cover"
            />
            <div className="text-sm flex flex-col p-2">
              <span>{`L'article ${product.name} a été ajouté à votre wishlist`}</span>
              <a href="/wishlist" className="underline font-medium">
                Voir votre wishlist
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
