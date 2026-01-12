import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

interface CartOverlayProps {
  onClose: () => void;
}

export const CartOverlay = ({ onClose }: CartOverlayProps) => {
  const { items, removeFromCart, updateQuantity, total } = useCart();
   const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/85 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="fixed top-0 right-0 bottom-0  w-full md:w-1/2 px-8 md:px-10 lg:px-12 xl:px-36 bg-white z-50 overflow-y-auto flex flex-col"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* Header */}
        <div className="py-8 sm:py-6 ">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-sm">Mon panier ({items.length})</h3>
            <button
              onClick={onClose}
              className="hover:text-[#007B8A] transition-colors duration-300"
              aria-label="Fermer"
            >
              <X size={22} className="sm:hidden" />
              <X size={24} className="hidden sm:block" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {items.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-gray-600 mb-6">Votre panier est vide</p>
              <button
                onClick={onClose}
                className="bg-[#007B8A] text-white px-6 sm:px-8 py-3 text-sm sm:text-base hover:bg-[#006170] transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                CONTINUER VOS ACHATS
              </button>
            </div>
          ) : (
            <div className="space-y-3  sm:space-y-6 ">
              {items.map((item, index) => {
                const inWishlist = isInWishlist(item.id.toString());

                const toggleWishlist = () => {
                  if (inWishlist) {
                    removeFromWishlist(item.id.toString());
                  } else {
                    addToWishlist(item);
                  }
                };
              return(
                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}-${index}`} className="flex  xl:h-54   justify-center  items-center  gap-3 sm:gap-4">
                  <div className="w-20 h-28 md:h-54 md:w-40 bg-black/5 flex-shrink" >
                    <img
                      src={item.productImage ?? item.mannequinImage ?? ""}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                
                  <div className="flex-1 h-full w-full md:py-9  flex flex-col justify-between">
                  <div className=''>
                      <div className='flex justify-between  pb-1 '>
                      
                        <p className="text-xs text-black">{item.id}</p>
                        <button
                        onClick={toggleWishlist}
                        className="  flex items-center justify-center hover:text-[#007B8A] transition-all duration-300"
                        >
                          <Heart size={18} 
                          className={`sm:hidden ${inWishlist ? "text-[#007B8A]" : ""}`} />
                          <Heart size={20} 
                          className={`hidden sm:block ${inWishlist ? "text-[#007B8A]" : ""}`}  />
                        </button>
                      
                      </div>
                      <Link
                      to={`/produit/${item.id}`}
                      onClick={onClose}
                      className="hover:text-[#007B8A] transition-colors  duration-300"
                      >
                        <h4 className="text-xs sm:text-sm mb-1 line-clamp-2">{item.name}</h4>
                      </Link>
                  </div>
                  <div className='  py-2 md:py-4 '>
                      <p className="text-sm text-black/40   ">
                       Couleur: {item.selectedColor}
                      </p>
                      <p className="text-sm text-black/40   ">
                      Taille: {item.selectedSize}
                      </p>
                      

                  </div>
                  <div className="flex flex-row justify-between items-center  w-full">
                      <p className="text-sm sm:text-base  ">{item.price.toLocaleString('fr-FR')} FC</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 sm:gap-3">
  <div className="flex items-center justify-center border px-1 rounded border-gray-300">

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

                  </div>
                </div>
              
            
            );
          })}
            </div>
            
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 sm:p-6">
            <div className="flex justify-between mb-4 sm:mb-6 text-sm sm:text-base">
              <span>TOTAL</span>
              <span>{total.toLocaleString('fr-FR')} FC</span>
            </div>
            <Link to="/panier" className="w-full bg-[#007B8A] text-white py-3 sm:py-4 px-16 text-sm sm:text-base rounded-full mb-2 sm:mb-3 hover:bg-[#006170] transition-all duration-300 hover:scale-105 hover:shadow-lg">
              Valider la commande
            </Link>
            
          </div>
        )}
      </motion.div>
    </>
  );
};
