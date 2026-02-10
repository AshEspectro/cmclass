import { useEffect, useMemo, useState } from 'react';
import { StatCard } from '../StatCard';
import { Card, CardHeader, CardContent } from '../Card';
import { Button } from '../Button';
import { DollarSign, ShoppingBag, Users, TrendingUp, Plus, Edit, Upload, Bell } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchWithAuth, createFetchOptions } from '../../services/api';

const salesData = [
  { month: 'Jan', revenue: 45000, orders: 120 },
  { month: 'Fév', revenue: 52000, orders: 145 },
  { month: 'Mar', revenue: 48000, orders: 132 },
  { month: 'Avr', revenue: 61000, orders: 168 },
  { month: 'Mai', revenue: 55000, orders: 151 },
  { month: 'Juin', revenue: 67000, orders: 187 },
];

const topProducts = [
  { name: 'Robe de Soirée en Soie', sales: 45, revenue: '22 500 €' },
  { name: 'Sac à Main en Cuir', sales: 38, revenue: '19 000 €' },
  { name: 'Manteau en Cachemire', sales: 32, revenue: '48 000 €' },
  { name: 'Boucles d\'Oreilles Diamant', sales: 28, revenue: '56 000 €' },
  { name: 'Lunettes de Créateur', sales: 25, revenue: '12 500 €' },
];

const contentAlerts = [
  { type: 'Bannière Héro', message: 'Mettre à jour la campagne Printemps 2025', priority: 'high' },
  { type: 'Description Produit', message: 'Nouveautés nécessitent des descriptions', priority: 'medium' },
  { type: 'Page Collection', message: 'Texte du lookbook d\'été en attente', priority: 'low' },
];

const BACKEND_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

type AlertPriority = 'high' | 'medium' | 'low';

type DashboardPayload = {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    conversionRate: number;
  };
  salesData: { month: string; revenue: number; orders: number }[];
  topProducts: { name: string; sales: number; revenue: number }[];
  contentAlerts: { type: string; message: string; priority: AlertPriority }[];
  notifications?: { id: number; title: string; message: string; type: string; read: boolean; createdAt: string }[];
  unreadNotifications?: number;
};

export function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const chartData = dashboard?.salesData?.length ? dashboard.salesData : salesData;
  const products = dashboard?.topProducts?.length ? dashboard.topProducts : topProducts;
  const alerts = dashboard?.contentAlerts?.length ? dashboard.contentAlerts : contentAlerts;
  const notifications = dashboard?.notifications || [];
  const unreadCount = dashboard?.unreadNotifications || 0;

  const formatCurrency = useMemo(() => {
    return (value: number) =>
      new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  }, []);

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="Revenu Total"
          value={stats ? formatCurrency(stats.totalRevenue) : "—"}
          change="12,5% du mois dernier"
          trend="up"
          icon={DollarSign}
        />
        <StatCard
          title="Commandes"
          value={stats ? stats.totalOrders.toLocaleString('fr-FR') : "—"}
          change="8,2% du mois dernier"
          trend="up"
          icon={ShoppingBag}
        />
        <StatCard
          title="Clients"
          value={stats ? stats.totalCustomers.toLocaleString('fr-FR') : "—"}
          change="15,3% du mois dernier"
          trend="up"
          icon={Users}
        />
        <StatCard
          title="Taux de Conversion"
          value={stats ? `${stats.conversionRate.toFixed(1)}%` : "—"}
          change="2,1% du mois dernier"
          trend="down"
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
                {products.map((product, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">{product.name}</td>
                    <td className="px-6 py-4 text-right">{product.sales}</td>
                    <td className="px-6 py-4 text-right">
                      {typeof product.revenue === 'number' ? formatCurrency(product.revenue) : product.revenue}
                    </td>
                  </tr>
                ))}
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
            {alerts.map((alert, index) => (
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
            ))}
            <Button variant="primary" size="sm" className="w-full mt-4">
              <Edit size={16} />
              Aller à la Gestion de Contenu
            </Button>
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
            <Button variant="outline" className="justify-start">
              <Plus size={18} />
              Ajouter un Produit
            </Button>
            <Button variant="outline" className="justify-start">
              <Upload size={18} />
              Télécharger des Médias
            </Button>
            <Button variant="outline" className="justify-start">
              <Edit size={18} />
              Modifier la Page d'Accueil
            </Button>
            <Button variant="outline" className="justify-start">
              <Plus size={18} />
              Nouvelle Campagne
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
