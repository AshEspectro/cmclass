/* eslint-disable @typescript-eslint/no-explicit-any */
import { ShieldCheck, Truck, RefreshCcw, Store, ChevronRight, Heart, X, Plus, Minus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";


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
  const { items: cartItems } = useCart();            // <-- YOUR CART DATA
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { items, removeFromCart, updateQuantity, total } = useCart();

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

  return (
    <div className="flex flex-col bg-black/5 items-center lg:flex-row lg:items-start lg:space-x-8 mt-18 w-full">

      {/* ----------------------------------------------------------- */}
      {/* 1️⃣  EMPTY STATE → Inspiration Block */}
      {/* ----------------------------------------------------------- */}
      {cartIsEmpty && (
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
        <div className="w-full md:w-3xl px-2  lg:w-1/2 flex-col xl:items-start  mx-6 md:mx-16 lg:mx-32 xl:mx-52 my-12">

          <h2 className="text-lg font-light my-6 ml-2">Mon panier({items.length})</h2>

          <div className="  gap-6">

            {cartItems.map((item,index) => {
              const inWishlist = isInWishlist(item.id.toString());

              return (
                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`} className="flex  h-40 md:h-56 xl:h-60   p-2.5 justify-start bg-white rounded-lg mb-3  gap-3 sm:gap-4">

                  {/* IMAGE */}
                  <div className="w-36 h-full md:w-48 xl:w-56 bg-black/5 flex-shrink" >
                    <img
                      src={item.image as string}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* INFO */}
                  <div className="w-full">
                    {/* ids and name */}
                    <div className="pt-3  pr-1 flex flex-col  justify-between">
               
                    <div className="flex w-full justify-between  pb-1 ">
                      <p className="text-xs text-black">{item.id}</p>

                      <button
                        onClick={() => toggleWishlist(item)}
                        className="hover:text-[#007B8A] transition-all duration-300"
                      >
                        <Heart
                          size={18}
                          className={inWishlist ? "text-[#007B8A]" : ""}
                        />
                      </button>
                    </div>

                    <Link
                      to={`/produit/${item.id}`}
                      className="hover:text-[#007B8A] transition-colors duration-300"
                    >
                      <h4 className="text-xs sm:text-sm mb-1 line-clamp-2">
                        {item.name}
                      </h4>
                    </Link>
                  </div>
                  {/* Colors and sizes */}
                  <div className='  mb-0 lg:mb-4 '>
                      <p className="text-sm text-black/40   ">
                       Couleur: {item.selectedColor}
                      </p>
                      <p className="text-sm text-black/40   ">
                      Taille: {item.selectedSize}
                      </p>
                      

                  </div>
                  <div className="flex justify-between items-center xl:flex-col md:justify-between md:items-end pr-3  w-full">
                      <p className="text-sm py-0 md:py-2 sm:text-base  ">{item.price.toLocaleString('fr-FR')} FC</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 sm:gap-3">
  <div className="flex items-center justify-center border px-1 my-2 rounded border-gray-300">

    {/* TRASH BUTTON — visible only when quantity = 1 */}
    {item.quantity === 1 && (
      <button
        onClick={() =>
          removeFromCart(item.id, item.selectedSize, item.selectedColor)
        }
        className="text-gray-400 hover:text-red-600 transition-colors duration-300"
        aria-label="Supprimer"
      >
        <Trash2 size={14} className="sm:hidden" />
        <Trash2 size={16} className="hidden sm:block" />
      </button>
    )}

    {/* MINUS BUTTON — visible only when quantity > 1 */}
    {item.quantity > 1 && (
      <button
        onClick={() =>
          updateQuantity(
            item.id,
            item.selectedSize,
            item.selectedColor,
            item.quantity - 1
          )
        }
        className=" sm:p-1 hover:text-black/50 transition-colors duration-300"
        aria-label="Diminuer la quantité"
      >
        <Minus size={12} className="sm:hidden" />
        <Minus size={14} className="hidden sm:block" />
      </button>
    )}

    {/* QUANTITY */}
    <span className="px-2   text-xl">{item.quantity}</span>

    {/* PLUS BUTTON */}
    <button
      onClick={() =>
        updateQuantity(
          item.id,
          item.selectedSize,
          item.selectedColor,
          item.quantity + 1
        )
      }
      className="p-1 hover:text-black/50 transition-colors duration-300"
      aria-label="Augmenter la quantité"
    >
      <Plus size={12} className="sm:hidden" />
      <Plus size={14} className="hidden sm:block" />
    </button>

  </div>
                      </div>
                  </div>
                </div></div>
              );
            })}

          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* SERVICES LIST ALWAYS SHOWN */}
      {/* ----------------------------------------------------------- */}
      
      <div className="w-full lg:w-1/3   mt-0">
        
        {!cartIsEmpty && <div className="border-b bg-white  mt-0 mb-2 lg:mb-0 border-black/5 py-6 px-8 md:px-4 lg:px-6 xl:px-18 space-y-4">
          <div className="flex justify-between   text-sm sm:text-base">
            <span>Sous-Total</span>
            <span>{total.toLocaleString('fr-FR')} FC</span>
          </div>
          <div className="flex justify-between   text-sm sm:text-base">
            <span>Livraison</span>
            <span>{total.toLocaleString('fr-FR')} FC</span>
          </div>
          <div className="flex justify-between  pt-6 text-sm sm:text-base">
            <span>Total</span>
            <span>{total.toLocaleString('fr-FR')} FC</span>
          </div>
          <div>
            <button className="w-full bg-[#007B8A] text-white py-3 mt-6 rounded-full text-sm sm:text-base hover:bg-white hover:text-black border transition-all duration-300">
              Passer à la caisse
            </button>
            <button className="w-full bg-black text-white py-3 mt-3 rounded-full text-sm sm:text-base hover:bg-white hover:text-black border transition-all duration-300">
              Payer avec mobile money
            </button>
            <Link to="/home" className="flex underline justify-center pt-3">continuer vos achats</Link>

          </div>
        </div>}
        <div className="md:pb-44 pb-0 px-6  bg-white md:px-4 lg:px-6 xl:px-18 pt-0">
          {services.map((s, i) => (
            <div key={i} className="flex items-start justify-between py-6 border-b border-black/10">

              <div className="flex gap-3">
                <div className="p-2 py-4">{s.icon}</div>

                <div>
                  <h3 className="text-base font-medium">{s.title}</h3>
                  <p className="text-xs text-black/60 leading-relaxed w-60">{s.text}</p>
                </div>
              </div>

              <button
                onClick={() => openService(s)}
                className="p-2 hover:bg-black/5 rounded-full"
              >
                <ChevronRight className="w-5 h-5 text-black" />
              </button>

            </div>
          ))}
        </div>
        
      </div>

      {/* ----------------------------------------------------------- */}
      {/* OVERLAY */}
      {/* ----------------------------------------------------------- */}
      {activeService && (
        <><CMClassOverlay
          open={openOverlay}
          onClose={() => setOpenOverlay(false)}
          title={activeService.title}
        >
            {activeService.content}
          </CMClassOverlay></>
      )}

    </div>
  );
}
