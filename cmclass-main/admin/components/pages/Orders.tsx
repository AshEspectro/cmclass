import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardContent } from '../Card';
import { Button } from '../Button';
import { Search, Filter, ExternalLink, Download } from 'lucide-react';
import { fetchWithAuth, createFetchOptions } from '../../services/api';

type OrderStatus = 'Livrée' | 'En Transit' | 'En Préparation' | 'Annulée';
type PaymentStatus = 'Payée' | 'Remboursée' | 'En attente';

type OrderLine = {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image?: string | null;
};

type Order = {
  id: string;
  customer: string;
  email?: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: number;
  payment: PaymentStatus;
  lines?: OrderLine[];
};

const BACKEND_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<{ totalOrders: number; pendingOrders: number; inTransitOrders: number; avgOrderValue: number } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchWithAuth(`${BACKEND_URL}/admin/orders`, createFetchOptions('GET'))
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          throw new Error(payload?.message || 'Failed to fetch orders');
        }
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        setOrders(data?.orders || []);
        setStats(data?.stats || null);
        setSelectedOrder((data?.orders || [])[0] || null);
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.message || 'Failed to load orders');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Livrée':
        return 'bg-green-50 text-green-700';
      case 'En Transit':
        return 'bg-blue-50 text-blue-700';
      case 'En Préparation':
        return 'bg-yellow-50 text-yellow-700';
      case 'Annulée':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getPaymentColor = (payment: string) => {
    switch (payment) {
      case 'Payée':
        return 'bg-[#e6f4f6] text-[#007B8A]';
      case 'Remboursée':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-orange-50 text-orange-700';
    }
  };

  const formatCurrency = useMemo(() => {
    return (value: number) =>
      new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  }, []);

  const filteredOrders = orders.filter((order) => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return (
      order.id.toLowerCase().includes(term) ||
      order.customer.toLowerCase().includes(term) ||
      (order.email || '').toLowerCase().includes(term)
    );
  });

  const [actionLoading, setActionLoading] = useState(false);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const numericId = parseInt(orderId.replace('#CMD-', ''), 10);
      const res = await fetchWithAuth(`${BACKEND_URL}/admin/orders/${numericId}/status`, {
        ...createFetchOptions('PATCH'),
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      // Refresh orders
      const ordersRes = await fetchWithAuth(`${BACKEND_URL}/admin/orders`, createFetchOptions('GET'));
      const data = await ordersRes.json();
      setOrders(data?.orders || []);
      setStats(data?.stats || null);
      if (selectedOrder?.id === orderId) {
        const updated = (data?.orders || []).find((o: Order) => o.id === orderId);
        setSelectedOrder(updated || null);
      }
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue lors de la mise à jour.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-900 font-bold">dismiss</button>
        </div>
      )}
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Total Commandes</p>
            <p className="text-2xl mb-1">{stats ? stats.totalOrders.toLocaleString('fr-FR') : '—'}</p>
            <p className="text-sm text-[#007B8A]">↑ 12,5% ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">En Attente</p>
            <p className="text-2xl mb-1">{stats ? stats.pendingOrders.toLocaleString('fr-FR') : '—'}</p>
            <p className="text-sm text-gray-500">Nécessite attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">En Transit</p>
            <p className="text-2xl mb-1">{stats ? stats.inTransitOrders.toLocaleString('fr-FR') : '—'}</p>
            <p className="text-sm text-gray-500">En cours de livraison</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Valeur Moyenne</p>
            <p className="text-2xl mb-1">{stats ? formatCurrency(stats.avgOrderValue) : '—'}</p>
            <p className="text-sm text-[#007B8A]">↑ 8,2% ce mois</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3>Commandes Récentes</h3>
              <p className="text-sm text-gray-500 mt-1">Gérer et suivre les commandes clients</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Download size={16} />
                Exporter
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Rechercher des commandes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded w-64 focus:outline-none focus:border-[#007B8A] transition-colors text-sm"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter size={16} />
              Filtrer par Statut
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-gray-500">Commande</th>
                <th className="text-left px-6 py-4 text-gray-500">Client</th>
                <th className="text-left px-6 py-4 text-gray-500">Date</th>
                <th className="text-left px-6 py-4 text-gray-500">Articles</th>
                <th className="text-left px-6 py-4 text-gray-500">Total</th>
                <th className="text-left px-6 py-4 text-gray-500">Statut</th>
                <th className="text-left px-6 py-4 text-gray-500">Paiement</th>
                <th className="text-right px-6 py-4 text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedOrder?.id === order.id ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <span className="text-[#007B8A] font-medium">{order.id}</span>
                  </td>
                  <td className="px-6 py-4">{order.customer}</td>
                  <td className="px-6 py-4 text-gray-600">{order.date}</td>
                  <td className="px-6 py-4 text-gray-600">{order.items}</td>
                  <td className="px-6 py-4">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full ${getPaymentColor(order.payment)}`}>
                      {order.payment}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 hover:bg-[#007B8A]/10 rounded-full transition-colors group"
                        onClick={() => setSelectedOrder(order)}
                        title="Voir détails"
                      >
                        <ExternalLink size={16} className="text-gray-400 group-hover:text-[#007B8A]" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                    {loading ? 'Chargement...' : 'Aucune commande trouvée'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Order Details Panel */}
      <div className="grid grid-cols-3 gap-6 pb-12">
        <Card className="col-span-2">
          <CardHeader>
            <h3>Détails de la Commande {selectedOrder?.id || ''}</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedOrder ? (
              <>
                <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Client</p>
                    <p className="font-medium">{selectedOrder.customer}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.email || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Statut Actuel</p>
                    <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                    <p className="text-sm text-gray-600 mt-2">{selectedOrder.payment}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-3">Articles Commandés</p>
                  <div className="space-y-3">
                    {(selectedOrder.lines || []).map((line, idx) => (
                      <div key={`${line.name}-${idx}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                            {line.image ? (
                              <img src={line.image} alt={line.name} className="w-full h-full object-cover" />
                            ) : null}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{line.name}</p>
                            <p className="text-xs text-gray-500">
                              Quantité: {line.quantity}
                              {line.size ? ` • Taille: ${line.size}` : ''}
                              {line.color ? ` • Couleur: ${line.color}` : ''}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium">{formatCurrency(line.price * line.quantity)}</p>
                      </div>
                    ))}
                    {(!selectedOrder.lines || selectedOrder.lines.length === 0) && (
                      <p className="text-sm text-gray-500 italic">Aucun détail d'article disponible.</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Sous-total</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Livraison</span>
                    <span>Gratuite</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100 text-lg font-medium">
                    <span>Total</span>
                    <span className="text-[#007B8A]">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <p>Sélectionnez une commande pour voir les détails.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3>Actions de Commande</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="primary"
              className="w-full"
              disabled={!selectedOrder || selectedOrder.status === 'Livrée' || actionLoading}
              onClick={() => handleUpdateStatus(selectedOrder!.id, 'DELIVERED')}
            >
              {actionLoading ? 'Mise à jour...' : 'Marquer comme Livrée'}
            </Button>

            {selectedOrder?.status === 'En Préparation' && (
              <Button
                variant="outline"
                className="w-full"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPED')}
              >
                Passer en Livraison
              </Button>
            )}

            <Button variant="outline" className="w-full">
              Imprimer le Bordereau
            </Button>
            <Button variant="outline" className="w-full">
              Envoyer un Email au Client
            </Button>

            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              disabled={!selectedOrder || selectedOrder.status === 'Annulée' || actionLoading}
              onClick={() => handleUpdateStatus(selectedOrder!.id, 'CANCELLED')}
            >
              Annuler la Commande
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
