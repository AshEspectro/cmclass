import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function OrderSuccess() {
  const location = useLocation();
  // Assume state is passed with order details, e.g. navigate('/commande-succes', { state: { orderId: 123 } })
  const orderId = location.state?.orderId;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-20 pt-24 px-4">
      <div className="w-full max-w-lg bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 text-center animate-fade-in">
        
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        
        <h1 className="text-3xl font-medium tracking-wide mb-3">Commande confirmée !</h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Merci pour votre achat.
          {orderId && (
             <span className="block mt-1 font-medium text-black">
               Votre commande #{orderId} a bien été enregistrée.
             </span>
          )}
          Vous retrouverez tous les détails dans votre historique de commandes.
        </p>

        <div className="space-y-4">
          <Link
            to="/mes-commandes"
            className="w-full flex items-center justify-center gap-3 bg-[#007B8A] text-white py-4 px-6 rounded-full hover:bg-[#006170] transition-colors"
          >
            <Package className="w-5 h-5" />
            Suivre ma commande
          </Link>
          
          <Link
            to="/home"
            className="w-full flex items-center justify-center gap-3 bg-white text-black border border-gray-200 py-4 px-6 rounded-full hover:bg-gray-50 transition-colors"
          >
            Continuer mes achats
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        
      </div>
    </div>
  );
}
