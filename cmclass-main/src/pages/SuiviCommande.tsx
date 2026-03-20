import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Package, Clock, Truck, CheckCircle2, XCircle, ShoppingBag, RefreshCw } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { AuthRequired } from "../components/AuthRequired";
import { ordersApi, type CustomerOrder } from "../services/ordersApi";

/* ─── Status config ─────────────────────────────────────────── */
const ORDER_STEPS = [
  { key: "PENDING",    label: "Reçue",         Icon: Clock },
  { key: "PROCESSING", label: "En préparation", Icon: Package },
  { key: "SHIPPED",    label: "Expédiée",       Icon: Truck },
  { key: "DELIVERED",  label: "Livrée",         Icon: CheckCircle2 },
];

const statusConfig: Record<string, { label: string; pill: string; icon: typeof Clock; accent: string }> = {
  PENDING: {
    label: "En attente",
    pill: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: Clock,
    accent: "text-amber-500",
  },
  PROCESSING: {
    label: "En préparation",
    pill: "bg-blue-50 text-blue-700 border border-blue-200",
    icon: Package,
    accent: "text-blue-500",
  },
  SHIPPED: {
    label: "Expédiée",
    pill: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    icon: Truck,
    accent: "text-indigo-500",
  },
  DELIVERED: {
    label: "Livrée",
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: CheckCircle2,
    accent: "text-emerald-500",
  },
  CANCELLED: {
    label: "Annulée",
    pill: "bg-red-50 text-red-700 border border-red-200",
    icon: XCircle,
    accent: "text-red-400",
  },
};

const paymentStatusConfig: Record<string, { label: string; pill: string }> = {
  PENDING: { label: "Paiement en attente", pill: "bg-amber-50 text-amber-700 border border-amber-200" },
  PAID:    { label: "Payée",              pill: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  REFUNDED:{ label: "Remboursée",         pill: "bg-slate-100 text-slate-600 border border-slate-200" },
};

/* ─── Helpers ────────────────────────────────────────────────── */
const formatAmount = (amount: number, currency?: string) => {
  const code = (currency || "FC").toUpperCase();
  if (code === "USD" || code === "EUR") {
    return new Intl.NumberFormat(code === "USD" ? "en-US" : "fr-FR", {
      style: "currency", currency: code, minimumFractionDigits: 2,
    }).format(amount);
  }
  if (code === "FC" || code === "CDF") return `${amount.toLocaleString("fr-FR")} FC`;
  return `${amount.toLocaleString("fr-FR")} ${code}`;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fr-FR", {
    year: "numeric", month: "long", day: "numeric",
  });

/* ─── Status Stepper ─────────────────────────────────────────── */
function OrderStepper({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500 font-medium">
        <XCircle size={16} />
        Commande annulée
      </div>
    );
  }

  const currentIdx = ORDER_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center gap-0 w-full mt-1">
      {ORDER_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        const Icon = step.Icon;

        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            {/* step circle */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  done
                    ? active
                      ? "bg-[#007B8A] border-[#007B8A] text-white"
                      : "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-white border-gray-200 text-gray-300"
                }`}
              >
                <Icon size={15} />
              </div>
              <span
                className={`text-[10px] leading-tight text-center max-w-[60px] hidden sm:block ${
                  done ? (active ? "text-[#007B8A] font-semibold" : "text-emerald-600 font-medium") : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* connector line (not after last) */}
            {idx < ORDER_STEPS.length - 1 && (
              <div
                className={`h-[2px] flex-1 mx-1 rounded-full transition-colors duration-500 ${
                  idx < currentIdx ? "bg-emerald-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Order Card ─────────────────────────────────────────────── */
function OrderCard({ order }: { order: CustomerOrder }) {
  const [open, setOpen] = useState(false);
  const cfg = statusConfig[order.status] ?? {
    label: order.status,
    pill: "bg-slate-100 text-slate-700 border border-slate-200",
    icon: Package,
    accent: "text-slate-500",
  };
  const pay = paymentStatusConfig[order.paymentStatus] ?? {
    label: order.paymentStatus,
    pill: "bg-slate-100 text-slate-600 border border-slate-200",
  };

  return (
    <article className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <header className="px-5 sm:px-6 py-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Commande #{order.id}</p>
            <p className="text-sm text-gray-500">Passée le {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${cfg.pill}`}>{cfg.label}</span>
            <span className={`text-xs px-3 py-1 rounded-full ${pay.pill}`}>{pay.label}</span>
            <span className="text-sm font-semibold text-gray-900 ml-1">
              {formatAmount(order.total, order.currency)}
            </span>
          </div>
        </div>

        {/* Progress stepper */}
        <div className="mt-4 px-1">
          <OrderStepper status={order.status} />
        </div>
      </header>

      {/* Collapsible items */}
      <div>
        <button
          onClick={() => setOpen((p) => !p)}
          className="w-full flex items-center justify-between px-5 sm:px-6 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <span>
            {order.items.length} article{order.items.length > 1 ? "s" : ""}
          </span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {open && (
          <div className="px-5 sm:px-6 pb-5 space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border border-gray-100 rounded-xl p-3 hover:border-gray-200 transition-colors"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={20} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Qté: {item.quantity}
                    {item.size ? ` · Taille: ${item.size}` : ""}
                    {item.color ? ` · Couleur: ${item.color}` : ""}
                  </p>
                </div>
                <div className="text-sm font-semibold text-gray-800 shrink-0">
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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 py-16 space-y-8">
      {/* Page header */}
      <div className="mt-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Mes Commandes</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Consultez l'historique de vos commandes et leur progression.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {totalOrders} commande{totalOrders > 1 ? "s" : ""}
          </span>
          <button
            onClick={loadOrders}
            disabled={loadingOrders}
            className="flex items-center gap-1.5 text-sm text-[#007B8A] hover:text-[#006170] transition-colors disabled:opacity-50"
            aria-label="Actualiser"
          >
            <RefreshCw size={14} className={loadingOrders ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl p-4 text-sm flex items-center justify-between gap-4">
          <p>{error}</p>
          <button
            onClick={loadOrders}
            className="shrink-0 px-4 py-2 rounded-full border border-red-300 hover:bg-red-100 transition text-sm"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loadingOrders && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden bg-white animate-pulse">
              <div className="px-6 py-5 space-y-3">
                <div className="h-3 w-32 bg-gray-100 rounded-full" />
                <div className="h-3 w-48 bg-gray-100 rounded-full" />
                <div className="mt-4 flex gap-2">
                  {[0, 1, 2, 3].map((j) => (
                    <div key={j} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100" />
                      <div className="h-2 w-12 bg-gray-100 rounded-full hidden sm:block" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loadingOrders && !error && orders.length === 0 && (
        <div className="border border-gray-200 rounded-2xl p-12 text-center space-y-5">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag size={28} className="text-gray-300" />
          </div>
          <div>
            <p className="text-gray-700 font-medium">Vous n'avez encore passé aucune commande.</p>
            <p className="text-gray-400 text-sm mt-1">Découvrez notre collection et faites votre premier achat.</p>
          </div>
          <Link
            to="/home"
            className="inline-block px-8 py-3 rounded-full bg-[#007B8A] text-white hover:bg-[#006170] transition-colors text-sm font-medium"
          >
            Commencer mes achats
          </Link>
        </div>
      )}

      {/* Orders list */}
      {!loadingOrders && orders.length > 0 && (
        <div className="space-y-5">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
