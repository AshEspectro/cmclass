import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardContent } from '../Card';
import { Button } from '../Button';
import { Search, ExternalLink, Download, MessageCircle, AlertTriangle } from 'lucide-react';
import { fetchWithAuth, createFetchOptions } from '../../services/api';

type OrderLine = {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image?: string | null;
};

type Order = {
  id: number;
  displayId: string;
  customer: string;
  email: string;
  phone: string;
  paymentMethod: string;
  paymentMethodLabel: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  status: string;
  statusLabel: string;
  total: number;
  currency: string;
  itemsCount: number;
  pickupCode: string | null;
  reservedUntil: string | null;
  readyAt: string | null;
  pickupExpiresAt: string | null;
  cancelReason: string | null;
  whatsappStatus: string | null;
  badges: string[];
  allowedActions: string[];
  createdAt: string;
  lines: OrderLine[];
};

type Stats = {
  actionNeeded: number;
  inProgress: number;
  readyForPickup: number;
  completed: number;
  issues: number;
};

const BACKEND_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const ACTION_LABELS: Record<string, string> = {
  PREPARING: 'Passer en préparation',
  READY_FOR_PICKUP: 'Marquer Prêt au retrait',
  PICKED_UP: 'Marquer comme Retirée',
  CANCELLED: 'Annuler la commande',
};

export function Orders() {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Tabs layout
  const TABS = [
    { id: 'all', label: 'Toutes' },
    { id: 'action', label: 'Action requise', count: stats?.actionNeeded },
    { id: 'in_progress', label: 'En cours', count: stats?.inProgress },
    { id: 'ready', label: 'Prêt au retrait', count: stats?.readyForPickup },
    { id: 'completed', label: 'Terminées', count: stats?.completed },
    { id: 'issues', label: 'Problèmes', count: stats?.issues },
  ];

  const fetchOrders = async (tab: string) => {
    setLoading(true);
    setError(null);
    try {
      const qs = tab === 'all' ? '' : `?tab=${tab}`;
      const res = await fetchWithAuth(`${BACKEND_URL}/admin/orders${qs}`, createFetchOptions('GET'));
      if (!res.ok) throw new Error('Failed to fetch orders');
      
      const data = await res.json();
      setOrders(data?.orders || []);
      setStats((prev) => tab === 'all' ? data?.stats : prev || data?.stats);
      if (data?.orders?.length > 0) {
        setSelectedOrder(data.orders[0]);
      } else {
        setSelectedOrder(null);
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setActionLoading(true);
    try {
      const reason = newStatus === 'CANCELLED' ? window.prompt("Raison de l'annulation ?") : undefined;
      if (newStatus === 'CANCELLED' && reason === null) {
         setActionLoading(false);
         return; 
      }

      const res = await fetchWithAuth(`${BACKEND_URL}/admin/orders/${orderId}/status`, {
        ...createFetchOptions('PATCH'),
        body: JSON.stringify({ status: newStatus, reason }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      // Refresh
      fetchOrders(activeTab);
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue lors de la mise à jour.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetryWhatsapp = async (orderId: number) => {
    try {
      const res = await fetchWithAuth(`${BACKEND_URL}/admin/orders/${orderId}/notify/retry`, createFetchOptions('POST'));
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || "Erreur de renvoi");
      }
      alert("Notification WhatsApp relancée avec succès !");
      fetchOrders(activeTab);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    if (['CREATED', 'RESERVED', 'AWAITING_PAYMENT'].includes(status)) return 'bg-amber-50 text-amber-700 border border-amber-200';
    if (['CONFIRMED', 'PREPARING'].includes(status)) return 'bg-blue-50 text-blue-700 border border-blue-200';
    if (status === 'READY_FOR_PICKUP') return 'bg-[#007B8A]/10 text-[#007B8A] border-[#007B8A]/30';
    if (status === 'PICKED_UP') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    return 'bg-red-50 text-red-700 border border-red-200'; // CANCELLED, EXPIRED
  };

  const formatCurrency = useMemo(() => {
    return (value: number, curr = 'FC') =>
      new Intl.NumberFormat('fr-FR', { style: 'currency', currency: curr === 'EUR' ? 'EUR' : 'CDF', maximumFractionDigits: 0 })
      .format(value).replace('CDF', 'FC');
  }, []);

  const filteredOrders = orders.filter((order) => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return (
      order.displayId.toLowerCase().includes(term) ||
      order.customer.toLowerCase().includes(term) ||
      (order.email || '').toLowerCase().includes(term) ||
      (order.pickupCode || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-900 font-bold">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#007B8A] text-[#007B8A]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-[#007B8A]/10 text-[#007B8A]' : 'bg-gray-100'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Rechercher (Nom, Email, #CMD, Code retrait)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded w-full focus:outline-none focus:border-[#007B8A] transition-colors text-sm"
              />
            </div>
            <Button variant="outline" size="sm">
              <Download size={16} /> Exporter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Commande</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Client</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Statut</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Paiement</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Badges</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className={`border-b border-gray-50 cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-blue-50/40' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-4 py-3">
                    <span className="text-[#007B8A] font-medium">{order.displayId}</span>
                    <div className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{order.customer}</div>
                    <div className="text-xs text-gray-500">{order.phone || order.email || '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${getStatusColor(order.status)}`}>
                      {order.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium">{order.paymentStatusLabel}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{order.paymentMethodLabel}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {order.badges.includes('whatsapp_sent') && <MessageCircle size={14} className="text-green-500" title="WhatsApp Envoyé" />}
                      {order.badges.includes('whatsapp_failed') && <AlertTriangle size={14} className="text-red-500" title="Échec WhatsApp" />}
                      {(order.badges.includes('reservation_expiring_soon') || order.badges.includes('pickup_expiring_soon')) && (
                        <Clock size={14} className="text-orange-500" title="Expire bientôt" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(order.total, order.currency)}
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    {loading ? 'Chargement...' : 'Aucune commande trouvée dans cette vue.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Order Details Panel */}
      {selectedOrder && (
        <Card className="border-t-4 border-t-[#007B8A]">
          <CardHeader className="bg-gray-50/50 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Détails {selectedOrder.displayId}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Passée le {new Date(selectedOrder.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.statusLabel}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Infos */}
              <div className="col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block mb-1">Code de retrait</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded font-bold text-gray-800 tracking-wider">
                      {selectedOrder.pickupCode || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Moyen de paiement</span>
                    <span className="font-medium text-gray-900">{selectedOrder.paymentMethodLabel}</span>
                    <span className="text-xs text-gray-500 ml-2">({selectedOrder.paymentStatusLabel})</span>
                  </div>
                  {selectedOrder.status === 'RESERVED' && selectedOrder.reservedUntil && (
                    <div className="col-span-2 text-amber-700 bg-amber-50 p-2 rounded border border-amber-100">
                      <strong>Attention :</strong> Réservation expire le {new Date(selectedOrder.reservedUntil).toLocaleString('fr-FR')}
                    </div>
                  )}
                  {selectedOrder.status === 'READY_FOR_PICKUP' && selectedOrder.pickupExpiresAt && (
                    <div className="col-span-2 text-[#007B8A] bg-[#007B8A]/10 p-2 rounded border border-[#007B8A]/20">
                      <strong>En attente client :</strong> Retrait avant le {new Date(selectedOrder.pickupExpiresAt).toLocaleString('fr-FR')}
                    </div>
                  )}
                </div>

                {/* Articles */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Articles ({selectedOrder.itemsCount})</h4>
                  <div className="space-y-3 border border-gray-100 rounded-lg p-3 bg-gray-50/30">
                    {selectedOrder.lines.map((line, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                            {line.image ? <img src={line.image} alt="" className="w-full h-full object-cover" /> : null}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{line.name}</p>
                            <p className="text-xs text-gray-500">Vol: {line.quantity} {line.size ? `· ${line.size}` : ''}</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium">{formatCurrency(line.price * line.quantity, selectedOrder.currency)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-3 border-t border-gray-100 font-semibold text-gray-900 px-2">
                      <span>Total</span>
                      <span>{formatCurrency(selectedOrder.total, selectedOrder.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Mettre à jour le statut</h4>
                <div className="space-y-2">
                  {selectedOrder.allowedActions.map((action) => (
                    <Button
                      key={action}
                      variant="outline"
                      className={`w-full justify-start text-left text-sm ${action === 'CANCELLED' ? 'text-red-600 border-red-200 hover:bg-red-50' : 'hover:border-[#007B8A] hover:bg-[#007B8A]/5'}`}
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(selectedOrder.id, action)}
                    >
                      {ACTION_LABELS[action] || action}
                    </Button>
                  ))}
                  {selectedOrder.allowedActions.length === 0 && (
                    <p className="text-xs text-gray-500 italic text-center py-2">Aucune action possible.</p>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Notifications Client</h4>
                  <div className="text-xs text-gray-600 space-y-2 bg-white p-3 rounded border border-gray-100">
                    <div className="flex justify-between items-center">
                      <span>WhatsApp Retrait :</span>
                      <span className={`font-medium ${selectedOrder.whatsappStatus === 'SENT' ? 'text-green-600' : selectedOrder.whatsappStatus === 'FAILED' ? 'text-red-500' : 'text-gray-500'}`}>
                        {selectedOrder.whatsappStatus || 'Non pertinent'}
                      </span>
                    </div>
                    {selectedOrder.status === 'READY_FOR_PICKUP' && (
                      <button 
                        onClick={() => handleRetryWhatsapp(selectedOrder.id)}
                        className="text-[#007B8A] hover:underline w-full text-center mt-2 pt-2 border-t border-gray-50"
                      >
                        Renvoyer message WhatsApp
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
