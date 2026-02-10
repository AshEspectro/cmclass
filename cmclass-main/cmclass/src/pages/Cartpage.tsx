/* eslint-disable @typescript-eslint/no-explicit-any */
import { ShieldCheck, Truck, RefreshCcw, Store, ChevronRight, Heart, X, Plus, Minus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useAuth } from "../contexts/AuthContext";


interface CMClassOverlayProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function CMClassOverlay({ open, onClose, title, children }: CMClassOverlayProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999]">
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* PANEL */}
      <div
        className="absolute left-13 md:left-56 lg:left-72 xl:left-108 top-50 h-sm md:h-xl lg:h-2xl xl:h-3xl w-sm sm:w-[480px] md:w-xl lg:w-3xl bg-white shadow-xl 
                   animate-slide-left flex flex-col"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b bg-white sticky top-0 z-10">
          <h2 className="font-medium text-lg">{title}</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-6 py-6 overflow-y-auto text-sm text-gray-700 leading-relaxed space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}


export default function Cartpage() {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { items: cartItems, removeFromCart, updateQuantity, total, loading } = useCart();
  const { isAuthenticated } = useAuth();

  const [openOverlay, setOpenOverlay] = useState(false);
  const [activeService, setActiveService] = useState<any>(null);

  const openService = (service: any) => {
    setActiveService(service);
    setOpenOverlay(true);
  };

  const toggleWishlist = (product: any) => {
    if (isInWishlist(product.id.toString())) {
      removeFromWishlist(product.id.toString());
    } else {
      addToWishlist(product);
    }
  };

  const services = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-black" />,
      title: "Paiement sécurisé",
      text: "Carte de crédit et de débit, Paypal et Apple Pay.",
      content:
        "La livraison est offerte pour toute commande éligible. Nos équipes s’engagent..."
    },
    {
      icon: <Truck className="w-6 h-6 text-black" />,
      title: "Livraison offerte",
      text: "Livraison avant Noël selon disponibilité.",
      content:
        "La livraison est offerte pour toute commande éligible. Nos équipes s’engagent..."
    },
    {
      icon: <RefreshCcw className="w-6 h-6 text-black" />,
      title: "Échange ou retour sans frais",
      text: "Période prolongée jusqu’au 31 janvier.",
      content:
        "Vous bénéficiez d’une période d’échange ou de retour prolongée..."
    },
    {
      icon: <Store className="w-6 h-6 text-black" />,
      title: "Retrait en magasin",
      text: "Retrait possible avant Noël.",
      content:
        "Ce service est offert et disponible dans l’ensemble de nos magasins..."
    },
  ];

  const cartIsEmpty = cartItems.length === 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
        <h1 className="text-xl font-light tracking-wide">Connectez-vous pour accéder à votre panier</h1>
        <p className="text-sm text-gray-600 mt-4 text-center max-w-md">
          Votre panier est lié à votre compte. Connectez-vous pour voir vos articles et continuer vos achats.
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
    <div className="flex flex-col bg-black/5 items-center lg:flex-row lg:items-start lg:space-x-8 mt-18 w-full min-h-screen">

      {/* ----------------------------------------------------------- */}
      {/* 1️⃣  EMPTY STATE → Inspiration Block */}
      {/* ----------------------------------------------------------- */}
      {cartIsEmpty && !loading && (
        <div className="w-sm md:w-1/2 flex-col items-center bg-white mx-6 md:mx-16 lg:mx-32 xl:mx-52 my-12">

          <div className="flex justify-center mb-8">
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200"
              alt="Inspiration"
              className="w-72 mt-8 h-80 object-cover"
            />
          </div>

          <div className="py-8 flex flex-col items-center text-center">
            <h3 className="text-xl mb-6">EN MANQUE D’INSPIRATION ?</h3>

            <Link
              to="/home"
              className="border text-black px-12 py-3 rounded-full text-sm tracking-wide hover:bg-black hover:text-white transition-all duration-300"
            >
              Commencer votre shopping
            </Link>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* 2️⃣  NON-EMPTY STATE → CART GRID */}
      {/* ----------------------------------------------------------- */}
      {!cartIsEmpty && (
        <div className="w-full md:w-3xl px-2 lg:w-1/2 flex-col xl:items-start mx-6 md:mx-16 lg:mx-32 xl:mx-52 my-12">

          <h2 className="text-lg font-light my-6 ml-2">Mon panier({cartItems.length})</h2>

          <div className="gap-6">

            {cartItems.map((item, index) => {
              const inWishlist = isInWishlist(String(item.productId));

              return (
                <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor}-${index}`} className="flex h-40 md:h-56 xl:h-60 p-2.5 justify-start bg-white rounded-lg mb-3 gap-3 sm:gap-4">

                  {/* IMAGE */}
                  <div className="w-36 h-full md:w-48 xl:w-56 bg-black/5 flex-shrink">
                    <img
                      src={item.productImage || (item as any).image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>

                  {/* INFO */}
                  <div className="w-full flex flex-col justify-between py-2">
                    <div>
                      <div className="flex w-full justify-between pb-1">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{item.label || 'PRODUIT'}</p>

                        <button
                          onClick={() => toggleWishlist(item)}
                          className="hover:text-[#007B8A] transition-all duration-300"
                        >
                          <Heart
                            size={18}
                            fill={inWishlist ? "#007B8A" : "none"}
                            className={inWishlist ? "text-[#007B8A]" : "text-gray-400"}
                          />
                        </button>
                      </div>

                      <Link
                        to={`/product/${item.productId}`}
                        className="hover:text-[#007B8A] transition-colors duration-300"
                      >
                        <h4 className="text-xs sm:text-sm font-medium mb-1 line-clamp-2 uppercase">
                          {item.name}
                        </h4>
                      </Link>

                      <div className='mt-2 space-y-0.5 text-[11px] text-gray-500 uppercase tracking-wider'>
                        <p>Couleur: {item.selectedColor || 'N/A'}</p>
                        <p>Taille: {item.selectedSize || 'Unique'}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-end pr-3 w-full">
                      <p className="text-sm sm:text-base font-semibold">{item.price.toLocaleString('fr-FR')} FC</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded border-gray-200 overflow-hidden">
                        {item.quantity === 1 ? (
                          <button
                            onClick={() => removeFromCart(item.productId, item.selectedSize, item.selectedColor)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            aria-label="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity - 1)}
                            className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-50 transition-colors"
                            aria-label="Diminuer"
                          >
                            <Minus size={14} />
                          </button>
                        )}

                        <span className="px-3 text-xs font-medium min-w-[30px] text-center border-x border-gray-100">{item.quantity}</span>

                        <button
                          onClick={() => updateQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity + 1)}
                          className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-50 transition-colors"
                          aria-label="Augmenter"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* SERVICES LIST ALWAYS SHOWN */}
      {/* ----------------------------------------------------------- */}

      <div className="w-full lg:w-1/3 mt-0">

        {!cartIsEmpty && (
          <div className="border-b bg-white mt-0 mb-2 lg:mb-0 border-black/5 py-6 px-8 md:px-4 lg:px-6 xl:px-18 space-y-4">
            <div className="flex justify-between text-sm sm:text-base">
              <span>Sous-Total</span>
              <span>{total.toLocaleString('fr-FR')} FC</span>
            </div>
            <div className="flex justify-between text-sm sm:text-base text-gray-500">
              <span>Livraison</span>
              <span>Gratuite</span>
            </div>
            <div className="flex justify-between pt-6 text-base sm:text-lg font-semibold border-t">
              <span>Total</span>
              <span>{total.toLocaleString('fr-FR')} FC</span>
            </div>
            <div className="pt-4 space-y-3">
              <button className="w-full bg-[#007B8A] text-white py-4 rounded-full text-sm font-medium tracking-wide hover:bg-[#006170] transition-colors shadow-lg shadow-[#007B8A]/20">
                PASSER À LA CAISSE
              </button>
              <button className="w-full bg-black text-white py-4 rounded-full text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors">
                PAYER AVEC MOBILE MONEY
              </button>
              <Link to="/home" className="flex underline justify-center pt-3 text-xs text-gray-500 hover:text-black transition-colors uppercase tracking-widest">
                continuer vos achats
              </Link>
            </div>
          </div>
        )}

        <div className="pb-24 px-6 bg-white md:px-4 lg:px-6 xl:px-18 pt-4">
          {services.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-5 border-b border-gray-50 last:border-0 group cursor-pointer hover:bg-gray-50 -mx-4 px-4 transition-colors" onClick={() => openService(s)}>
              <div className="flex gap-4 items-center">
                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">{s.icon}</div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{s.title}</h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed max-w-[200px]">{s.text}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors" />
            </div>
          ))}
        </div>

      </div>

      {/* ----------------------------------------------------------- */}
      {/* OVERLAY */}
      {/* ----------------------------------------------------------- */}
      {activeService && (
        <CMClassOverlay
          open={openOverlay}
          onClose={() => setOpenOverlay(false)}
          title={activeService.title}
        >
          <div className="prose prose-sm">
            {activeService.content}
          </div>
        </CMClassOverlay>
      )}

    </div>
  );
}
