import { CheckCircle2, Package, ArrowRight, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function OrderSuccess() {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4" style={{ paddingTop: "72px" }}>
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#007B8A] to-emerald-400" />

          <div className="p-10 text-center space-y-6">
            {/* Icon */}
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" strokeWidth={1.5} />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">Commande confirmée !</h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                Merci pour votre achat.{" "}
                {orderId && (
                  <span className="font-medium text-gray-800">
                    Votre commande <span className="text-[#007B8A]">#{orderId}</span> a bien été enregistrée.
                  </span>
                )}{" "}
                Vous retrouverez tous les détails dans votre historique de commandes.
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Actions */}
            <div className="space-y-3">
              <Link
                to="/mes-commandes"
                className="w-full flex items-center justify-center gap-2.5 bg-[#007B8A] text-white py-3.5 px-6 rounded-full hover:bg-[#006170] transition-colors text-sm font-medium"
              >
                <Package className="w-4 h-4" />
                Suivre ma commande
              </Link>

              <Link
                to="/home"
                className="w-full flex items-center justify-center gap-2.5 bg-white text-gray-700 border border-gray-200 py-3.5 px-6 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <ShoppingBag className="w-4 h-4" />
                Continuer mes achats
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Link>
            </div>
          </div>
        </div>

        {/* Small notice */}
        <p className="text-center text-xs text-gray-400 mt-5">
          Un e-mail de confirmation vous sera envoyé prochainement.
        </p>
      </div>
    </div>
  );
}
