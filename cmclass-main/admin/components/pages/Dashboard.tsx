import { useEffect, useMemo, useState } from 'react';
import { StatCard } from '../StatCard';
import { Card, CardHeader, CardContent } from '../Card';
import { Button } from '../Button';
import { DollarSign, ShoppingBag, Users, TrendingUp, Package, Plus, Edit, Upload, Bell } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchWithAuth, createFetchOptions } from '../../services/api';
import { setPendingQuickAction, type QuickActionKey } from '../../services/quickActions';

const BACKEND_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

type AlertPriority = 'high' | 'medium' | 'low';
type TrendDirection = 'up' | 'down';

type MoMChange = {
  value: number | null;
  trend: TrendDirection;
};

type DashboardPageKey = 'content' | 'products' | 'media';
type AdminRole = 'USER' | 'SUPPORT' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

type QuickActionItem = {
  id: QuickActionKey;
  label: string;
  icon: typeof Plus;
  targetPage: DashboardPageKey;
  minRole: AdminRole;
};

type DashboardPayload = {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    conversionRate: number;
    totalProducts: number;
  };
  mom: {
    totalRevenue: MoMChange;
    totalOrders: MoMChange;
    totalCustomers: MoMChange;
    totalProducts: MoMChange;
    conversionRate: MoMChange;
  };
  salesData: { month: string; revenue: number; orders: number }[];
  topProducts: { name: string; sales: number; revenue: number }[];
  contentAlerts: { type: string; message: string; priority: AlertPriority }[];
  notifications?: { id: number; title: string; message: string; type: string; read: boolean; createdAt: string }[];
  unreadNotifications?: number;
};

interface DashboardProps {
  onNavigate?: (page: DashboardPageKey) => void;
}

const quickActions: QuickActionItem[] = [
  { id: 'add-product', label: 'Ajouter un Produit', icon: Plus, targetPage: 'products', minRole: 'ADMIN' },
  { id: 'upload-media', label: 'Télécharger des Médias', icon: Upload, targetPage: 'media', minRole: 'ADMIN' },
  { id: 'edit-homepage', label: 'Modifier la Page d\'Accueil', icon: Edit, targetPage: 'content', minRole: 'ADMIN' },
  { id: 'new-campaign', label: 'Nouvelle Campagne', icon: Plus, targetPage: 'content', minRole: 'ADMIN' },
];

export function Dashboard({ onNavigate }: DashboardProps) {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleRank: Record<AdminRole, number> = {
    USER: 0,
    SUPPORT: 1,
    MODERATOR: 2,
    ADMIN: 3,
    SUPER_ADMIN: 4,
  };

  const getUserRoleFromToken = (): AdminRole | null => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!token) return null;

      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
      const payload = JSON.parse(atob(padded));
      const role = payload?.role as string | undefined;
      if (!role || !(role in roleRank)) return null;
      return role as AdminRole;
    } catch {
      return null;
    }
  };

  const canAccessAction = (action: QuickActionItem, role: AdminRole | null) => {
    if (!role) return false;
    return roleRank[role] >= roleRank[action.minRole];
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchWithAuth(`${BACKEND_URL}/admin/dashboard`, createFetchOptions('GET'))
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          throw new Error(payload?.message || 'Failed to fetch dashboard');
        }
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        setDashboard(data);
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.message || 'Failed to load dashboard');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = dashboard?.stats;
  const mom = dashboard?.mom;
  const chartData = dashboard?.salesData || [];
  const products = dashboard?.topProducts || [];
  const alerts = dashboard?.contentAlerts || [];
  const notifications = dashboard?.notifications || [];
  const unreadCount = dashboard?.unreadNotifications || 0;

  const formatChange = (change?: MoMChange) => {
    if (!change || change.value === null || Number.isNaN(change.value)) {
      return { label: 'N/A', trend: 'up' as TrendDirection };
    }
    const sign = change.value >= 0 ? '+' : '';
    const label = `${sign}${change.value.toFixed(1).replace('.', ',')}% vs 30 jours précédents`;
    return { label, trend: change.trend };
  };

  const revenueChange = formatChange(mom?.totalRevenue);
  const ordersChange = formatChange(mom?.totalOrders);
  const customersChange = formatChange(mom?.totalCustomers);
  const productsChange = formatChange(mom?.totalProducts);
  const conversionChange = formatChange(mom?.conversionRate);

  const formatCurrency = useMemo(() => {
    return (value: number) =>
      new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  }, []);

  const currentRole = useMemo(() => getUserRoleFromToken(), []);
  const availableQuickActions = useMemo(
    () => quickActions.filter((action) => canAccessAction(action, currentRole)),
    [currentRole],
  );
  const canEditHomepage = useMemo(
    () => availableQuickActions.some((action) => action.id === 'edit-homepage'),
    [availableQuickActions],
  );

  const handleQuickAction = (targetPage: DashboardPageKey, action: QuickActionKey) => {
    if (!onNavigate) return;
    setPendingQuickAction(action);
    onNavigate(targetPage);
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        <StatCard
          title="Revenu Total"
          value={stats ? formatCurrency(stats.totalRevenue) : "—"}
          change={revenueChange.label}
          trend={revenueChange.trend}
          icon={DollarSign}
        />
        <StatCard
          title="Commandes"
          value={stats ? stats.totalOrders.toLocaleString('fr-FR') : "—"}
          change={ordersChange.label}
          trend={ordersChange.trend}
          icon={ShoppingBag}
        />
        <StatCard
          title="Clients"
          value={stats ? stats.totalCustomers.toLocaleString('fr-FR') : "—"}
          change={customersChange.label}
          trend={customersChange.trend}
          icon={Users}
        />
        <StatCard
          title="Produits"
          value={stats ? stats.totalProducts.toLocaleString('fr-FR') : "—"}
          change={productsChange.label}
          trend={productsChange.trend}
          icon={Package}
        />
        <StatCard
          title="Taux de Conversion"
          value={stats ? `${stats.conversionRate.toFixed(1)}%` : "—"}
          change={conversionChange.label}
          trend={conversionChange.trend}
          icon={TrendingUp}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3>Aperçu des Revenus</h3>
            <p className="text-sm text-gray-500 mt-1">Tendance des revenus mensuels</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#999" style={{ fontSize: '12px' }} />
                <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #e5e5e5',
                    borderRadius: '4px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#007B8A" 
                  strokeWidth={2}
                  dot={{ fill: '#007B8A', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3>Volume des Commandes</h3>
            <p className="text-sm text-gray-500 mt-1">Nombre de commandes mensuelles</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#999" style={{ fontSize: '12px' }} />
                <YAxis stroke="#999" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #e5e5e5',
                    borderRadius: '4px'
                  }} 
                />
                <Bar dataKey="orders" fill="#007B8A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Top Products */}
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3>Meilleurs Produits</h3>
                <p className="text-sm text-gray-500 mt-1">Les plus vendus ce mois</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-gray-500">Produit</th>
                  <th className="text-right px-6 py-3 text-gray-500">Ventes</th>
                  <th className="text-right px-6 py-3 text-gray-500">Revenu</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-sm text-gray-500" colSpan={3}>
                      Aucun produit vendu pour le moment.
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">{product.name}</td>
                      <td className="px-6 py-4 text-right">{product.sales}</td>
                      <td className="px-6 py-4 text-right">
                        {typeof product.revenue === 'number' ? formatCurrency(product.revenue) : product.revenue}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Content Alerts */}
        <Card>
          <CardHeader>
            <h3>Mises à Jour de Contenu</h3>
            <p className="text-sm text-gray-500 mt-1">Éléments nécessitant attention</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune alerte pour le moment.</p>
            ) : (
              alerts.map((alert, index) => (
                <div key={index} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm">{alert.type}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      alert.priority === 'high' 
                        ? 'bg-red-50 text-red-600' 
                        : alert.priority === 'medium'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {alert.priority === 'high' ? 'urgent' : alert.priority === 'medium' ? 'moyen' : 'faible'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                </div>
              ))
            )}
            {canEditHomepage && (
              <Button
                variant="primary"
                size="sm"
                className="w-full mt-4"
                onClick={() => handleQuickAction('content', 'edit-homepage')}
                disabled={!onNavigate}
              >
                <Edit size={16} />
                Aller à la Gestion de Contenu
              </Button>
            )}
            {loading && (
              <p className="text-xs text-gray-400 mt-2 text-center">Chargement des statistiques...</p>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3>Notifications</h3>
                <p className="text-sm text-gray-500 mt-1">Dernieres alertes</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Bell size={16} />
                <span>{unreadCount} non lues</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucune notification.</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="border border-gray-100 rounded p-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{n.type}</span>
                        {!n.read && <span className="text-xs text-[#007B8A]">Non lu</span>}
                      </div>
                      <p className="font-medium">{n.title}</p>
                      <p className="text-sm text-gray-700">{n.message}</p>
                      <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3>Actions Rapides</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {availableQuickActions.length === 0 ? (
              <p className="col-span-4 text-sm text-gray-500">
                Aucune action rapide disponible pour votre rôle.
              </p>
            ) : (
              availableQuickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="justify-start"
                    onClick={() => handleQuickAction(action.targetPage, action.id)}
                    disabled={!onNavigate}
                  >
                    <Icon size={18} />
                    {action.label}
                  </Button>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
