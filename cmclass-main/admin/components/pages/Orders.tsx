import { Card, CardHeader, CardContent } from '../Card';
import { Button } from '../Button';
import { Search, Filter, ExternalLink, Download } from 'lucide-react';

const orders = [
  { id: '#CMD-2847', customer: 'Sophie Dubois', date: '2025-12-09', total: '4 250 €', status: 'Livrée', items: 2, payment: 'Payée' },
  { id: '#CMD-2846', customer: 'Isabelle Martin', date: '2025-12-08', total: '2 890 €', status: 'En Transit', items: 1, payment: 'Payée' },
  { id: '#CMD-2845', customer: 'Emma Rousseau', date: '2025-12-08', total: '1 560 €', status: 'En Préparation', items: 3, payment: 'Payée' },
  { id: '#CMD-2844', customer: 'Olivia Bernard', date: '2025-12-07', total: '5 890 €', status: 'En Transit', items: 2, payment: 'Payée' },
  { id: '#CMD-2843', customer: 'Charlotte Petit', date: '2025-12-07', total: '3 120 €', status: 'Livrée', items: 1, payment: 'Payée' },
  { id: '#CMD-2842', customer: 'Amélie Laurent', date: '2025-12-06', total: '8 950 €', status: 'En Préparation', items: 4, payment: 'Payée' },
  { id: '#CMD-2841', customer: 'Mia Lefebvre', date: '2025-12-06', total: '2 340 €', status: 'Livrée', items: 2, payment: 'Payée' },
  { id: '#CMD-2840', customer: 'Léa Moreau', date: '2025-12-05', total: '4 780 €', status: 'Annulée', items: 1, payment: 'Remboursée' },
];

export function Orders() {
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Total Commandes</p>
            <p className="text-2xl mb-1">903</p>
            <p className="text-sm text-[#007B8A]">↑ 12,5% ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">En Attente</p>
            <p className="text-2xl mb-1">28</p>
            <p className="text-sm text-gray-500">Nécessite attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">En Transit</p>
            <p className="text-2xl mb-1">156</p>
            <p className="text-sm text-gray-500">En cours de livraison</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Valeur Moyenne</p>
            <p className="text-2xl mb-1">3 640 €</p>
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
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-[#007B8A]">{order.id}</span>
                  </td>
                  <td className="px-6 py-4">{order.customer}</td>
                  <td className="px-6 py-4 text-gray-600">{order.date}</td>
                  <td className="px-6 py-4 text-gray-600">{order.items}</td>
                  <td className="px-6 py-4">{order.total}</td>
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
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ExternalLink size={16} className="text-gray-600" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Order Details Panel */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <h3>Détails de la Commande #CMD-2847</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <p className="text-sm text-gray-500 mb-1">Client</p>
                <p>Sophie Dubois</p>
                <p className="text-sm text-gray-600">sophie.dubois@email.com</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Adresse de Livraison</p>
                <p className="text-sm">15 Avenue Montaigne</p>
                <p className="text-sm">75008 Paris, France</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-3">Articles Commandés</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded"></div>
                    <div>
                      <p className="text-sm">Robe de Soirée en Soie</p>
                      <p className="text-xs text-gray-500">Taille: M, Couleur: Noir</p>
                    </div>
                  </div>
                  <p>2 500 €</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded"></div>
                    <div>
                      <p className="text-sm">Sac à Main en Cuir</p>
                      <p className="text-xs text-gray-500">Couleur: Beige</p>
                    </div>
                  </div>
                  <p>1 750 €</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total</span>
                <span>4 250 €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Livraison</span>
                <span>Gratuite</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>4 250 €</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3>Actions de Commande</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="primary" className="w-full">
              Marquer comme Livrée
            </Button>
            <Button variant="outline" className="w-full">
              Modifier la Commande
            </Button>
            <Button variant="outline" className="w-full">
              Imprimer le Bordereau
            </Button>
            <Button variant="outline" className="w-full">
              Envoyer un Email au Client
            </Button>
            <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
              Annuler la Commande
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
