// src/pages/WishlistPage.tsx
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useWishlist } from "../contexts/WishlistContext";
import { ProductGrid } from "../components/Hero_cat";
import { SkeletonProductCard } from "../components/Skeleton";
import { ShoppingBag, X } from "lucide-react";

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { items, removeFromWishlist, loading } = useWishlist();

  const wishlistEmpty = items.length === 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
        <h1 className="text-xl font-light tracking-wide mt-24">Connectez-vous pour accéder à votre liste d’envies</h1>
        <p className="text-sm text-gray-600 mt-4 text-center max-w-md">
          Votre liste d’envies est liée à votre compte. Connectez-vous pour voir vos articles enregistrés.
        </p>
        <Link
          to="/login"
          className="mt-8 px-6 py-3 border border-black rounded-full text-sm tracking-wide bg-black text-white hover:bg-white hover:text-black transition"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-3 md:px-0 py-16">
      {/* Titre */}
      <h1 className="text-xl font-light tracking-wide mt-24">
        {wishlistEmpty ? "Votre liste d’envies est vide." : "Votre liste d’envies"}
      </h1>

      {/* --- LOADING --- */}
      {loading && (
        <div className="w-full max-w-[1440px] px-4 md:px-12 lg:px-20 mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonProductCard key={i} />)}
        </div>
      )}

      {/* --- SI VIDE --- */}
      {!loading && wishlistEmpty && (
        <>
          <p className="text-center text-black/70 max-w-2xl mt-4 leading-relaxed">
            Enregistrez des produits et des styles dans votre liste d’envies pour les fêtes
            et partagez-les.
            <br />
            Besoin d’inspiration ?
          </p>

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
      {!loading && !wishlistEmpty && (
        <div className="w-full">
          {/* GRID WISHLIST */}
          <div className=" grid grid-cols-2 md:grid-cols-4 bg-black/5 mt-16  ">
            {items.map(product => (
              <div
                key={product.id}
                className="relative group w-full aspect-4/5 overflow-hidden"
              >
                {/* REMOVE BUTTON (replaces heart) */}
                <button
                  onClick={() => removeFromWishlist(product.id.toString())}
                  className="
                    absolute top-2 right-2 
                    p-2 rounded-full 
                    opacity-100 
                    transition duration-300 z-20
                  "
                >
                  <X className="w-4 h-4 hover:text-black/50 text-black" />
                </button>

                {/* IMAGE */}
                <div >
                  <img
                    src={product.productImage}
                    alt={product.name}
                    className="
                      absolute inset-0 w-full h-full 
                      object-cover transition-opacity duration-500
                    "
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-black/5 to-transparent" />

                {/* INFO BOTTOM */}
                <div
                  className="
                    absolute bottom-0 left-0 right-0
                    px-4 pb-4
                    flex flex-col
                    transition-opacity duration-300
                  "
                >
                  <p className="text-xs text-gray-500">{product.label}</p>
                  <p className="text-sm font-medium w-36 md:w-40 mt-1">{product.name}</p>
                  <p className="text-sm font-medium mt-1">
                    {typeof product.price === 'number'
                      ? product.price.toLocaleString('fr-FR') + ' FC'
                      : product.price}
                  </p>
                </div>
                <Link
                  to={`/product/${product.id}`}
                  className="
                    absolute bottom-4 right-4
                    flex items-center
                    border rounded-full 
                    p-2 md:p-2 
                    text-black 
                    hover:border-2 
                    transition-all duration-300
                  "
                >
                  {/* TEXT visible only on md+ */}
                  <span className="hidden md:group-hover:inline-block  text-sm pl-2 mr-3">
                    Commander
                  </span>

                  <ShoppingBag size={18} className="shrink-0" />
                </Link>
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
