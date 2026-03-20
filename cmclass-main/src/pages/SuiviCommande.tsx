import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Package, Clock, CheckCircle2, XCircle, ShoppingBag, RefreshCw, CreditCard, HelpCircle, Store, AlertTriangle, MessageCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { AuthRequired } from "../components/AuthRequired";
import { ordersApi, type CustomerOrder } from "../services/ordersApi";

/* ─── Status configs ─────────────────────────────────────────── */

const ORDER_STATUS_MAP: Record<string, { label: string; pill: string; accent: string; description: string }> = {
  CREATED: {
    label: "Créée", pill: "bg-gray-100 text-gray-700 border-gray-200", accent: "text-gray-500",
    description: "La commande vient d'être initiée.",
  },
  RESERVED: {
    label: "Réservée", pill: "bg-amber-50 text-amber-700 border border-amber-200", accent: "text-amber-500",
    description: "Vos articles sont de côté. Présentez-vous en boutique avant l'expiration.",
  },
  AWAITING_PAYMENT: {
    label: "Attente paiement", pill: "bg-amber-50 text-amber-700 border border-amber-200", accent: "text-amber-500",
    description: "En attente de la confirmation de votre paiement mobile money.",
  },
  CONFIRMED: {
    label: "Confirmée", pill: "bg-emerald-50 text-emerald-700 border border-emerald-200", accent: "text-emerald-500",
    description: "Paiement reçu. Nous allons préparer votre commande.",
  },
  PREPARING: {
    label: "En préparation", pill: "bg-blue-50 text-blue-700 border border-blue-200", accent: "text-blue-500",
    description: "Notre équipe prépare activement vos articles.",
  },
  READY_FOR_PICKUP: {
    label: "Prête au retrait", pill: "bg-[#007B8A]/10 text-[#007B8A] border-[#007B8A]/30", accent: "text-[#007B8A]",
    description: "Vos articles sont prêts. Présentez-vous avec votre code de retrait.",
  },
  PICKED_UP: {
    label: "Retirée", pill: "bg-emerald-100 text-emerald-800 border-emerald-300 gap-1", accent: "text-emerald-600",
    description: "Commande récupérée en boutique. Merci de votre confiance !",
  },
  EXPIRED: {
    label: "Expirée", pill: "bg-gray-100 text-gray-600 border-gray-300", accent: "text-gray-500",
    description: "Le délai de réservation ou de retrait a expiré.",
  },
  CANCELLED: {
    label: "Annulée", pill: "bg-red-50 text-red-700 border border-red-200", accent: "text-red-500",
    description: "Cette commande a été annulée.",
  },
};

const PAYMENT_STATUS_MAP: Record<string, string> = {
  UNPAID: "Non payée",
  PENDING: "Paiement en attente",
  PAID: "Payée",
  FAILED: "Échec du paiement",
  CANCELLED: "Paiement annulé",
  REFUNDED: "Remboursée",
};

const PAYMENT_METHOD_MAP: Record<string, { label: string; icon: any }> = {
  MAXICASH: { label: "Mobile money", icon: CreditCard },
  PAY_IN_STORE: { label: "Paiement en boutique", icon: Store },
};

/* ─── Helpers ────────────────────────────────────────────────── */
const formatAmount = (amount: number, currency?: string) => {
  const code = (currency || "FC").toUpperCase();
  if (code === "FC" || code === "CDF") return `${amount.toLocaleString("fr-FR")} FC`;
  return `${amount.toLocaleString("fr-FR")} ${code}`;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("fr-FR", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
  }).replace(" à ", ", ");
};

/* ─── Status Stepper ─────────────────────────────────────────── */
function OrderStepper({ status, paymentMethod }: { status: string; paymentMethod: string }) {
  if (status === "CANCELLED" || status === "EXPIRED") {
    const isCancel = status === "CANCELLED";
    return (
      <div className={`flex items-center gap-2 text-sm font-medium p-3 rounded-lg ${isCancel ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
        {isCancel ? <XCircle size={18} /> : <AlertTriangle size={18} />}
        {isCancel ? "Commande annulée" : "Délai expiré"}
      </div>
    );
  }

  // Define steps dynamically based on payment mode
  let steps = [];
  if (paymentMethod === "MAXICASH") {
    steps = [
      { key: "AWAITING_PAYMENT", label: "Attente paiement", icon: Clock },
      { key: "CONFIRMED", label: "Confirmée", icon: CheckCircle2 },
      { key: "PREPARING", label: "Préparation", icon: Package },
      { key: "READY_FOR_PICKUP", label: "Prête au retrait", icon: Store },
      { key: "PICKED_UP", label: "Retirée", icon: CheckCircle2 },
    ];
  } else {
    // PAY_IN_STORE
    steps = [
      { key: "RESERVED", label: "Réservée", icon: Clock },
      { key: "PREPARING", label: "Préparation", icon: Package },
      { key: "READY_FOR_PICKUP", label: "Prête au retrait", icon: Store },
      { key: "PICKED_UP", label: "Retirée", icon: CheckCircle2 },
    ];
  }

  // Find current index
  let currentIdx = steps.findIndex((s) => s.key === status);
  
  // Handle transition edge cases gracefully
  if (currentIdx === -1) {
    if (status === "CREATED") currentIdx = 0; // treat as first step visually
    else currentIdx = 0; 
  }

  return (
    <div className="flex items-center w-full mt-2">
      {steps.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            {/* Step Circle */}
            <div className="flex flex-col items-center gap-1 shrink-0 relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  done
                    ? active
                      ? "bg-[#007B8A] border-[#007B8A] text-white shadow-sm ring-4 ring-[#007B8A]/10"
                      : "bg-[#007B8A]/80 border-[#007B8A]/80 text-white"
                    : "bg-white border-gray-200 text-gray-300"
                }`}
              >
                <Icon size={14} />
              </div>
              <span
                className={`text-[10px] leading-tight text-center max-w-[65px] hidden sm:block mt-1 ${
                  active ? "text-[#007B8A] font-semibold" : done ? "text-gray-600 font-medium" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {idx < steps.length - 1 && (
              <div
                className={`h-[2px] w-full mx-1 sm:mx-2 rounded-full transition-colors duration-500 ${
                  idx < currentIdx ? "bg-[#007B8A]/80" : "bg-gray-100"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Contextual Helper Block ────────────────────────────────── */
function OrderContextHelper({ order }: { order: CustomerOrder }) {
  const { status, paymentStatus, reservedUntil, pickupExpiresAt, pickupCode, readyNotificationStatus } = order;

  // Don't show helper for pure terminal states that don't need explanation, or show simple ones.
  if (status === "PICKED_UP") return null;

  let message = null;
  let isAlert = false;
  let isSuccess = false;

  if (status === "RESERVED" && reservedUntil) {
    message = (
      <>
        <strong>Vos articles sont réservés.</strong> Veuillez vous présenter en boutique avant le <strong className="text-black">{formatDate(reservedUntil)}</strong> pour régler et récupérer votre commande.
      </>
    );
  } else if (status === "AWAITING_PAYMENT") {
    message = "Votre paiement mobile money est en cours de validation. Si vous avez quitté la page de paiement avant d'avoir terminé, votre commande sera annulée automatiquement dans quelques temps.";
  } else if (paymentStatus === "FAILED") {
    message = "Le paiement a échoué. Veuillez passer une nouvelle commande.";
    isAlert = true;
  } else if (status === "READY_FOR_PICKUP") {
    isSuccess = true;
    message = (
      <div className="flex flex-col gap-1">
        <span><strong>Votre commande est prête !</strong> 🎉</span>
        <div className="mt-2 bg-white/60 p-3 rounded flex items-center justify-between border border-[#007B8A]/20">
          <span className="text-sm">Code de retrait à présenter :</span>
          <span className="font-mono text-lg font-bold tracking-widest text-[#007B8A] bg-white px-3 py-1 rounded shadow-sm">
            {pickupCode || "N/A"}
          </span>
        </div>
        {pickupExpiresAt && (
          <span className="text-xs text-gray-600 mt-2">
            À retirer avant le : <strong>{formatDate(pickupExpiresAt)}</strong>
          </span>
        )}
        {readyNotificationStatus === "SENT" && (
          <span className="text-xs text-[#007B8A] flex items-center gap-1 mt-1 font-medium">
            <MessageCircle size={12} /> Un message WhatsApp vous a été envoyé.
          </span>
        )}
      </div>
    );
  } else if (status === "EXPIRED") {
    message = "Le délai imparti pour cette commande a expiré. Vous devez passer une nouvelle commande si vous souhaitez obtenir ces articles.";
    isAlert = true;
  } else if (status === "CANCELLED") {
    message = order.cancelReason ? `Annulée : ${order.cancelReason}` : "Commande annulée par le magasin.";
    isAlert = true;
  }

  if (!message) return null;

  let bg = "bg-gray-50 border-gray-100 text-gray-600";
  if (isAlert) bg = "bg-red-50 border-red-100 text-red-700";
  else if (isSuccess) bg = "bg-[#007B8A]/5 border-[#007B8A]/10 text-gray-800";

  return (
    <div className={`mt-5 p-4 rounded-xl border text-sm ${bg} leading-relaxed`}>
      {message}
    </div>
  );
}


/* ─── Order Card ─────────────────────────────────────────────── */
function OrderCard({ order }: { order: CustomerOrder }) {
  const [open, setOpen] = useState(false);
  
  const statusCfg = ORDER_STATUS_MAP[order.status] ?? {
    label: order.status, pill: "bg-gray-100 text-gray-700", accent: "text-gray-500", description: ""
  };
  const payLabel = PAYMENT_STATUS_MAP[order.paymentStatus] ?? order.paymentStatus;
  const methodCfg = PAYMENT_METHOD_MAP[order.paymentMethod] ?? { label: order.paymentMethod, icon: ShoppingBag };
  const MethodIcon = methodCfg.icon;

  return (
    <article className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:border-gray-300 transition-colors duration-300 shadow-sm">
      {/* Header Info */}
      <header className="px-5 sm:px-6 py-5 border-b border-gray-100 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900 tracking-tight">Commande #{order.id}</h2>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${statusCfg.pill}`}>
                {statusCfg.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              <Clock size={14} className="opacity-70" /> {formatDate(order.createdAt)}
            </p>
          </div>
          
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1">
            <span className="text-lg font-semibold text-gray-900">
              {formatAmount(order.total, order.currency)}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded border border-gray-100">
              <MethodIcon size={12} />
              <span>{methodCfg.label} · {payLabel}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Stepper */}
        <div className="pt-2 px-1 pb-1">
          <OrderStepper status={order.status} paymentMethod={order.paymentMethod} />
        </div>

        {/* Contextual Instructions/Warnings */}
        <OrderContextHelper order={order} />

      </header>

      {/* Accordion Items List */}
      <div>
        <button
          onClick={() => setOpen((p) => !p)}
          className="w-full flex items-center justify-between px-5 sm:px-6 py-3.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium border-t border-transparent"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag size={15} className="opacity-60" />
            Voir {order.items.length > 1 ? `les ${order.items.length} articles` : "l'article"}
          </span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {open && (
          <div className="px-5 sm:px-6 pb-6 pt-1 space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-gray-50/50 border border-gray-100 rounded-xl p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-16 h-16 bg-white border border-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag size={20} className="text-gray-200" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1.5">
                    <span className="font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-700">Qté: {item.quantity}</span>
                    {item.size && <span>Taille: {item.size}</span>}
                    {item.color && <span>Couleur: {item.color}</span>}
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-800 shrink-0 tabular-nums">
                  {formatAmount(item.price * item.quantity, order.currency)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/* ─── Legend Block ───────────────────────────────────────────── */
function StatusLegend() {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="bg-white border text-left border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 text-gray-800 font-medium text-sm transition-colors"
      >
        <span className="flex items-center gap-2">
          <HelpCircle size={16} className="text-gray-400" />
          Comprendre les statuts de commande
        </span>
        {open ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
      </button>
      
      {open && (
        <div className="p-4 sm:p-5 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(ORDER_STATUS_MAP).filter(([k]) => k !== 'CREATED').map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1 text-sm text-left">
              <span className={`inline-flex self-start px-2 py-0.5 rounded font-medium border text-[11px] ${v.pill}`}>
                {v.label}
              </span>
              <span className="text-gray-600 leading-relaxed text-xs">{v.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


/* ─── Main Page ──────────────────────────────────────────────── */
export default function SuiviCommande() {
  const { isAuthenticated, isLoading, accessToken } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    if (!accessToken) return;
    setLoadingOrders(true);
    setError(null);
    try {
      const data = await ordersApi.getMyOrders(accessToken);
      setOrders(data);
    } catch (err: any) {
      setError(err?.message || "Impossible de charger vos commandes.");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;
    loadOrders();
  }, [isAuthenticated, accessToken]);

  const totalOrders = useMemo(() => orders.length, [orders]);

  /* Auth loading */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <RefreshCw size={24} className="animate-spin mr-2" />
        Chargement...
      </div>
    );
  }

  /* Not logged in */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center px-3 md:px-0 py-16">
        <div className="w-full max-w-2xl mt-24">
          <AuthRequired
            title="Connectez-vous pour consulter vos commandes"
            description="Accédez à l'historique, au statut et au détail de vos achats."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-8">
      {/* Page header */}
      <div className="flex items-end justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Mes Commandes</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Retrouvez ici toutes vos réservations et vos achats.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
            {totalOrders} {totalOrders > 1 ? "commandes" : "commande"}
          </span>
          <button
            onClick={loadOrders}
            disabled={loadingOrders}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50"
            aria-label="Actualiser"
          >
            <RefreshCw size={18} className={loadingOrders ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl p-4 text-sm flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            <p>{error}</p>
          </div>
          <button onClick={loadOrders} className="w-full sm:w-auto px-4 py-2 bg-white rounded-lg border border-red-200 hover:bg-red-50 transition shadow-sm font-medium">
            Réessayer
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loadingOrders && !orders.length && (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden bg-white/50 animate-pulse h-64" />
          ))}
        </div>
      )}

      {/* Legend Map */}
      {!loadingOrders && !error && orders.length > 0 && <StatusLegend />}

      {/* Empty state */}
      {!loadingOrders && !error && orders.length === 0 && (
        <div className="border border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-5 bg-gray-50/50">
          <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center">
            <ShoppingBag size={32} className="text-gray-400" />
          </div>
          <div className="max-w-xs">
            <p className="text-gray-900 font-semibold text-lg">Aucune commande</p>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">Vous n'avez encore jamais réservé d'articles ni passé de commandes.</p>
          </div>
          <Link
            to="/home"
            className="mt-2 inline-flex items-center justify-center px-8 py-3 rounded-full bg-[#007B8A] text-white hover:bg-[#006170] transition-colors shadow-sm text-sm font-medium"
          >
            Commencer mes achats
          </Link>
        </div>
      )}

      {/* Orders list */}
      {!loadingOrders && orders.length > 0 && (
        <div className="space-y-6">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
