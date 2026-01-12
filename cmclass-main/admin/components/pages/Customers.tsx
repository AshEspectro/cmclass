import { Card, CardHeader, CardContent } from '../Card';
import { Button } from '../Button';
import { Search, Filter, Download, Mail } from 'lucide-react';

const customers = [
  { id: 1, name: 'Sophie Dubois', email: 'sophie.d@email.com', orders: 28, spent: '45 230 €', joined: '2023-01-15', segment: 'VIP', lastOrder: '2025-12-09' },
  { id: 2, name: 'Isabelle Martin', email: 'isabelle.m@email.com', orders: 15, spent: '28 450 €', joined: '2023-06-22', segment: 'VIP', lastOrder: '2025-12-08' },
  { id: 3, name: 'Emma Rousseau', email: 'emma.r@email.com', orders: 12, spent: '19 870 €', joined: '2024-02-10', segment: 'Fidèle', lastOrder: '2025-12-08' },
  { id: 4, name: 'Olivia Bernard', email: 'olivia.b@email.com', orders: 8, spent: '12 560 €', joined: '2024-05-18', segment: 'Fidèle', lastOrder: '2025-12-07' },
  { id: 5, name: 'Charlotte Petit', email: 'charlotte.p@email.com', orders: 5, spent: '8 450 €', joined: '2024-08-30', segment: 'Régulier', lastOrder: '2025-12-07' },
  { id: 6, name: 'Amélie Laurent', email: 'amelie.l@email.com', orders: 1, spent: '8 950 €', joined: '2025-12-06', segment: 'Nouveau', lastOrder: '2025-12-06' },
  { id: 7, name: 'Mia Lefebvre', email: 'mia.l@email.com', orders: 18, spent: '32 100 €', joined: '2023-03-14', segment: 'VIP', lastOrder: '2025-12-05' },
  { id: 8, name: 'Léa Moreau', email: 'lea.m@email.com', orders: 3, spent: '6 240 €', joined: '2025-09-12', segment: 'Régulier', lastOrder: '2025-12-05' },
];

export function Customers() {
  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'VIP':
        return 'bg-[#007B8A] text-white';
      case 'Fidèle':
        return 'bg-blue-50 text-blue-700';
      case 'Régulier':
        return 'bg-gray-100 text-gray-700';
      case 'Nouveau':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Total Clients</p>
            <p className="text-2xl mb-1">1 284</p>
            <p className="text-sm text-[#007B8A]">↑ 15,3% ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Membres VIP</p>
            <p className="text-2xl mb-1">142</p>
            <p className="text-sm text-gray-500">Clients premium</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Nouveaux ce Mois</p>
            <p className="text-2xl mb-1">89</p>
            <p className="text-sm text-[#007B8A]">↑ 22,4% du mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Valeur Vie Client Moy.</p>
            <p className="text-2xl mb-1">15 840 €</p>
            <p className="text-sm text-[#007B8A]">↑ 6,8% ce mois</p>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3>Tous les Clients</h3>
              <p className="text-sm text-gray-500 mt-1">Voir et gérer les relations clients</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Mail size={16} />
                Envoyer un Email
              </Button>
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
                placeholder="Rechercher des clients..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded w-64 focus:outline-none focus:border-[#007B8A] transition-colors text-sm"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter size={16} />
              Filtrer par Segment
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-gray-500">Client</th>
                <th className="text-left px-6 py-4 text-gray-500">Segment</th>
                <th className="text-left px-6 py-4 text-gray-500">Commandes</th>
                <th className="text-left px-6 py-4 text-gray-500">Total Dépensé</th>
                <th className="text-left px-6 py-4 text-gray-500">Dernière Commande</th>
                <th className="text-left px-6 py-4 text-gray-500">Inscrit le</th>
                <th className="text-right px-6 py-4 text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#007B8A] flex items-center justify-center text-white">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="mb-1">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full ${getSegmentColor(customer.segment)}`}>
                      {customer.segment}
                    </span>
                  </td>
                  <td className="px-6 py-4">{customer.orders}</td>
                  <td className="px-6 py-4">{customer.spent}</td>
                  <td className="px-6 py-4 text-gray-600">{customer.lastOrder}</td>
                  <td className="px-6 py-4 text-gray-600">{customer.joined}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Mail size={16} className="text-gray-600" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Customer Insights */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h3>Meilleurs Clients</h3>
            <p className="text-sm text-gray-500 mt-1">Par valeur vie</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {customers.slice(0, 5).map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-4">#{index + 1}</span>
                  <div>
                    <p className="text-sm mb-1">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.orders} commandes</p>
                  </div>
                </div>
                <p className="text-sm">{customer.spent}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3>Répartition des Segments</h3>
            <p className="text-sm text-gray-500 mt-1">Segments de clientèle</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#007B8A]"></div>
                <span className="text-sm">VIP</span>
              </div>
              <span className="text-sm">142 clients</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">Fidèle</span>
              </div>
              <span className="text-sm">328 clients</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-sm">Régulier</span>
              </div>
              <span className="text-sm">625 clients</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Nouveau</span>
              </div>
              <span className="text-sm">189 clients</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3>Activité Récente</h3>
            <p className="text-sm text-gray-500 mt-1">Dernières 24 heures</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="pb-3 border-b border-gray-100">
              <p className="text-sm mb-1">3 nouveaux clients</p>
              <p className="text-xs text-gray-500">Dernier: Amélie Laurent</p>
            </div>
            <div className="pb-3 border-b border-gray-100">
              <p className="text-sm mb-1">12 commandes passées</p>
              <p className="text-xs text-gray-500">Valeur totale: 28 450 €</p>
            </div>
            <div className="pb-3 border-b border-gray-100">
              <p className="text-sm mb-1">5 clients VIP actifs</p>
              <p className="text-xs text-gray-500">Dépenses moyennes: 4 200 €</p>
            </div>
            <div>
              <p className="text-sm mb-1">24 emails ouverts</p>
              <p className="text-xs text-gray-500">Taux d\'ouverture: 68%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
