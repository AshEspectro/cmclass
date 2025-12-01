import { useState } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useWishlist } from "../contexts/WishlistContext";
import type { Product_cat } from "../data/products";
import { Link } from "react-router";

interface SingleProductPageProps {
  product: Product_cat;
}

export function SingleProductPage({ product }: SingleProductPageProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0].hex);
  const [imageIndex, setImageIndex] = useState(0);
  const [hoveringImage, setHoveringImage] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id.toString());

  const colorImages =
    product.colors.find((c) => c.hex === selectedColor)?.images || [];

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
      setTimeout(() => setShowToast(false), 3000); // auto-hide toast
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 pt-32 md:pt-24 md:grid-cols-2 gap-6">
      {/* Product Images */}
      <div className="relative w-full mb-6 md:flex md:flex-col ">
        {/* Image container for mobile: overlap */}
        <div className="relative w-full aspect-[4/5] ">
          <img
      src={product.productImage}
      className={`absolute inset-0 w-full h-full aspect-4/5 md:aspect-1/1 object-cover transition-opacity duration-500 md:relative md:opacity-100 md:w-full md:h-auto ${
        hoveringImage ? "opacity-0" : "opacity-100"
      }`}
      onMouseEnter={() => setHoveringImage(true)}
      onMouseLeave={() => setHoveringImage(false)}
    />
    <img
      src={product.mannequinImage}
      className={`absolute inset-0 w-full h-full aspect-4/5 md:aspect-1/1 object-cover transition-opacity duration-500 md:relative md:opacity-100 md:w-full md:h-auto ${
        hoveringImage ? "opacity-100" : "opacity-0"
      }`}
    />

    {colorImages.length > 0 && (
      <img
        src={colorImages[imageIndex]}
        className="absolute inset-0 w-full h-full aspect-4/5 md:aspect-1/1 object-cover transition-opacity duration-500 md:relative md:opacity-100 md:w-full md:h-auto"
      />
    )}

    {/* Chevrons (keep only for mobile) */}
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



      {/* Product Info */}
      <div className=" p-6 px-18 flex-row md:gap-8">
        <div className="   -center gap-2 mb-6">
          <div className="items-center">
          <div className="flex w-full justify-between pb-6 "><h1 className="text-sm self-center  ">{product.id}</h1>
          {/* Wishlist button */}
          <button
            onClick={toggleWishlist}
            className=" "
          >
            <Heart
              size={18}
              className={`transition-colors ${inWishlist ? "text-[#007B8A]" : "text-black"}`}
            />
          </button></div>
          <p className="text-xs text-gray-500 ">{product.label}</p>
          <p className="text-lg  ">{product.name}</p>
          <p className="text-lg font-regular pb-4 mb-4">{product.price}</p>
          </div>
          {/* Color selector */}
          <div className="mb-6">
  {/* TITLE */}
  <div className="flex w-full justify-between"><p className="text-sm font-medium mb-1">Couleur</p>

  {/* COLOR NAME (dynamic) */}
  <p className="text-sm text-gray-600 mb-3">
    {product.colors.find((c) => c.hex === selectedColor)?.hex}
  </p></div>

  {/* COLOR BUTTONS */}
  <div className="flex items-center gap-4">
    {product.colors.map((c) => (
      <button
        key={c.hex}
        onClick={() => {
          setSelectedColor(c.hex);
          setImageIndex(0);
        }}
        className={`w-12 h-12  rounded-sm ${
          selectedColor === c.hex ? "ring-2 ring-[#007B8A]" : "border-gray-300"
        }`}
        style={{ backgroundColor: c.hex }}
      />
    ))}
  </div>
</div>

          {/* Add to cart button */}<div className="  flex justify-center  mb-6">
          <button className="bg-black text-white px-24 md:px-32 py-3 rounded-full hover:bg-white hover:text-[#007B8A] hover:border hover:border-[#007B8A] transition">
            Ajouter au panier
          </button>
          
          </div><div className="  flex justify-center  mb-6"><Link to='' className="text-xs ">Contacter un conseiller</Link></div>
          {/* Optional product description or details */}
          <div className="  flex justify-center  mb-6">
          
          <p className="text-gray-700 w-full text-justify ">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
            vulputate, arcu non scelerisque imperdiet, augue purus bibendum
            sapien, nec luctus justo neque non justo.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
            vulputate, arcu non scelerisque imperdiet, augue purus bibendum
            sapien, nec luctus justo neque non justo
          </p>
          </div>
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
