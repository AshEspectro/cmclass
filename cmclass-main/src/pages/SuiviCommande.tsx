import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AuthRequired } from "../components/AuthRequired";
import { ordersApi, type CustomerOrder } from "../services/ordersApi";

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "En attente",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  PROCESSING: {
    label: "En préparation",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  SHIPPED: {
    label: "Expédiée",
    className: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  },
  DELIVERED: {
    label: "Livrée",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  CANCELLED: {
    label: "Annulée",
    className: "bg-red-50 text-red-700 border border-red-200",
  },
};

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Paiement en attente",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  PAID: {
    label: "Payée",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  REFUNDED: {
    label: "Remboursée",
    className: "bg-slate-100 text-slate-700 border border-slate-200",
  },
};

const formatAmount = (amount: number, currency?: string) => {
  const code = (currency || "FC").toUpperCase();
  if (code === "USD" || code === "EUR") {
    return new Intl.NumberFormat(code === "USD" ? "en-US" : "fr-FR", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  if (code === "FC" || code === "CDF") {
    return `${amount.toLocaleString("fr-FR")} FC`;
  }
  return `${amount.toLocaleString("fr-FR")} ${code}`;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Chargement...
      </div>
    );
  }

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
      <div className="mt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Mes Commandes</h1>
          <p className="text-gray-600 mt-2">
            Consultez l'historique de vos commandes et leur progression.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {totalOrders} commande{totalOrders > 1 ? "s" : ""}
        </div>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl p-4 text-sm">
          <p>{error}</p>
          <button
            onClick={loadOrders}
            className="mt-3 px-4 py-2 rounded-full border border-red-300 hover:bg-red-100 transition"
          >
            Réessayer
          </button>
        </div>
      )}

      {loadingOrders ? (
        <div className="text-gray-600">Chargement des commandes...</div>
      ) : orders.length === 0 ? (
        <div className="border border-gray-200 rounded-xl p-8 text-center space-y-4">
          <p className="text-gray-700">Vous n'avez encore passé aucune commande.</p>
          <Link
            to="/home"
            className="inline-block px-6 py-3 rounded-full bg-black text-white hover:bg-gray-900 transition"
          >
            Commencer mes achats
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const status = statusConfig[order.status] || {
              label: order.status,
              className: "bg-slate-100 text-slate-700 border border-slate-200",
            };
            const payment = paymentStatusConfig[order.paymentStatus] || {
              label: order.paymentStatus,
              className: "bg-slate-100 text-slate-700 border border-slate-200",
            };

            return (
              <article
                key={order.id}
                className="border border-gray-200 rounded-2xl overflow-hidden bg-white"
              >
                <header className="px-5 sm:px-6 py-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Commande #{order.id}</p>
                    <p className="text-sm text-gray-500">
                      Passée le {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full ${status.className}`}>
                      {status.label}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full ${payment.className}`}>
                      {payment.label}
                    </span>
                    <span className="text-sm font-medium text-gray-900 ml-1">
                      Total: {formatAmount(order.total, order.currency)}
                    </span>
                  </div>
                </header>

                <div className="px-5 sm:px-6 py-4 space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 border border-gray-100 rounded-xl p-3"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Quantité: {item.quantity}
                          {item.size ? ` | Taille: ${item.size}` : ""}
                          {item.color ? ` | Couleur: ${item.color}` : ""}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatAmount(item.price * item.quantity, order.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
