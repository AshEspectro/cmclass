// src/pages/WishlistPage.tsx
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useWishlist } from "../contexts/WishlistContext";
import { ProductGrid } from "../components/Hero_cat";
import { X } from "lucide-react";

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { items, removeFromWishlist } = useWishlist();

  const wishlistEmpty = items.length === 0;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-3 md:px-0 py-16">

      {/* Titre */}
      <h1 className="text-xl font-light tracking-wide mt-24">
        {wishlistEmpty ? "Votre liste d’envies est vide." : "Votre liste d’envies"}
      </h1>

      {/* --- SI VIDE --- */}
      {wishlistEmpty && (
        <>
          <p className="text-center text-black/70 max-w-2xl mt-4 leading-relaxed">
            Enregistrez des produits et des styles dans votre liste d’envies pour les fêtes
            et partagez-les.
            <br />
            Besoin d’inspiration ?
          </p>

          {!isAuthenticated && (
            <Link
              to="/login"
              className="mt-8 px-6 py-3 border border-black rounded-full text-sm tracking-wide bg-black text-white hover:bg-white hover:text-black transition"
            >
              Se connecter
            </Link>
          )}

          <div className="mt-24 mb-8"></div>

          {/* Consulté récemment */}
          <div className="w-full">
            <h2 className="text-lg font-light mb-6 ml-0 md:ml-8 lg:ml-12 xl:ml-24">
              Consulté récemment
            </h2>

            <ProductGrid limit={4} />
          </div>
        </>
      )}

      {/* --- SI NON VIDE --- */}
      {!wishlistEmpty && (
        <div className="w-full mt-16 px-4 md:px-8 lg:px-12 xl:px-24">

          {/* GRID WISHLIST */}
          <div className="
            grid 
            grid-cols-2 
            sm:grid-cols-3 
            md:grid-cols-4 
            xl:grid-cols-5 
            gap-6
          ">
            {items.map(product => (
              <div 
                key={product.id}
                className="relative group"
              >
                {/* Remove button */}
                <button
                  onClick={() => removeFromWishlist(product.id.toString())}
                  className="
                    absolute top-2 right-2 bg-white/80 backdrop-blur 
                    p-1 rounded-full shadow 
                    opacity-0 group-hover:opacity-100 transition
                  "
                >
                  <X className="w-4 h-4 text-black" />
                </button>

                {/* Image */}
                <Link to={`/product/${product.id}`}>
                  <img
                    src={product.productImage}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-md border"
                  />
                </Link>

                {/* Info */}
                <div className="mt-3">
                  <p className="text-xs text-black/70">{product.id}</p>
                  <p className="text-sm text-black">{product.name}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Consulté récemment */}
          <div className="w-full">
            <h2 className="text-lg font-light my-10 ml-0 md:ml-2 lg:ml-4">
              Consulté récemment
            </h2>

            <ProductGrid limit={4} />
          </div>
        </div>
      )}
    </div>
  );
}
