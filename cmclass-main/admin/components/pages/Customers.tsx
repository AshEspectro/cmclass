import React, { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardContent } from "../Card";
import { Button } from "../Button";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { clientsAPI } from "../../services/api";

type ProductSummary = {
  id: number;
  name: string;
  label?: string | null;
  price?: string | number;
  productImage?: string | null;
};

type CartItemSummary = ProductSummary & {
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
};

type Client = {
  id: number;
  email: string;
  username?: string;
  createdAt?: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  marketingOptIn?: boolean;
  marketingEmails?: boolean;
  marketingSms?: boolean;
  marketingTargetedAds?: boolean;
  wishlist: ProductSummary[];
  cart: CartItemSummary[];
};

export function Customers() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadClients = async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      const res = await clientsAPI.list(query);
      setClients(Array.isArray(res?.data) ? res.data : []);
    } catch (err: any) {
      setError(err?.message || "Erreur lors du chargement des clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handle = window.setTimeout(() => {
      loadClients(search);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    loadClients("");
  }, []);

  const stats = useMemo(() => {
    const totalClients = clients.length;
    const wishlistCount = clients.reduce((sum, c) => sum + (c.wishlist?.length || 0), 0);
    const cartCount = clients.reduce((sum, c) => sum + (c.cart?.length || 0), 0);
    return { totalClients, wishlistCount, cartCount };
  }, [clients]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Clients enregistrés</p>
            <p className="text-2xl mb-1">{stats.totalClients}</p>
            <p className="text-sm text-gray-500">Total des comptes clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Articles en wishlist</p>
            <p className="text-2xl mb-1">{stats.wishlistCount}</p>
            <p className="text-sm text-gray-500">Tous clients confondus</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Articles au panier</p>
            <p className="text-2xl mb-1">{stats.cartCount}</p>
            <p className="text-sm text-gray-500">Tous clients confondus</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3>Clients & Activités</h3>
              <p className="text-sm text-gray-500 mt-1">Wishlist et panier par client</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => loadClients(search)}>
                Actualiser
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Rechercher des clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded w-72 focus:outline-none focus:border-[#007B8A] transition-colors text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Chargement...</div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">{error}</div>
          ) : clients.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">Aucun client trouvé.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-gray-500">Client</th>
                  <th className="text-left px-6 py-4 text-gray-500">Téléphone</th>
                  <th className="text-left px-6 py-4 text-gray-500">Wishlist</th>
                  <th className="text-left px-6 py-4 text-gray-500">Panier</th>
                  <th className="text-left px-6 py-4 text-gray-500">Inscrit le</th>
                  <th className="text-right px-6 py-4 text-gray-500">Détails</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => {
                  const isOpen = expandedId === client.id;
                  const fullName = [client.title, client.firstName, client.lastName].filter(Boolean).join(" ");
                  const phone = client.phoneNumber ? `${client.phoneCountryCode || ""} ${client.phoneNumber}` : "-";

                  return (
                    <React.Fragment key={client.id}>
                      <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="mb-1 font-medium">{fullName || client.username || "Client"}</p>
                            <p className="text-sm text-gray-500">{client.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{phone}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{client.wishlist?.length || 0} article(s)</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{client.cart?.length || 0} article(s)</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {client.createdAt ? new Date(client.createdAt).toLocaleDateString("fr-FR") : "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            className="inline-flex items-center gap-1 text-sm text-[#007B8A] hover:underline"
                            onClick={() => setExpandedId(isOpen ? null : client.id)}
                          >
                            {isOpen ? "Masquer" : "Voir"} {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-3 gap-8">
                              {/* Profile Section */}
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Profil & Préférences</h4>
                                <div className="space-y-3 text-sm text-gray-700">
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase">Date de naissance</p>
                                    <p>{client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString("fr-FR") : "-"}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">Consentements marketing</p>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${client.marketingOptIn ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <p>Opt-in Global: {client.marketingOptIn ? "Oui" : "Non"}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${client.marketingEmails ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <p>Emails: {client.marketingEmails ? "Acceptés" : "Refusés"}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${client.marketingSms ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <p>SMS: {client.marketingSms ? "Acceptés" : "Refusés"}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${client.marketingTargetedAds ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <p>Publicité ciblée: {client.marketingTargetedAds ? "Oui" : "Non"}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Wishlist Section */}
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Wishlist</h4>
                                {client.wishlist?.length ? (
                                  <ul className="space-y-3 text-sm text-gray-700">
                                    {client.wishlist.map((item) => (
                                      <li key={`wl-${client.id}-${item.id}`} className="flex items-center gap-3">
                                        {item.productImage && (
                                          <img src={item.productImage} alt={item.name} className="w-10 h-10 object-cover rounded shadow-sm border border-gray-200" />
                                        )}
                                        <div>
                                          <p className="text-sm font-medium">{item.name}</p>
                                          {item.price !== undefined && (
                                            <p className="text-xs text-gray-500">
                                              {typeof item.price === 'number'
                                                ? item.price.toLocaleString('fr-FR') + ' FC'
                                                : item.price}
                                            </p>
                                          )}
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-500 italic">Aucun article en wishlist</p>
                                )}
                              </div>

                              {/* Cart Section */}
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Panier</h4>
                                {client.cart?.length ? (
                                  <ul className="space-y-3 text-sm text-gray-700">
                                    {client.cart.map((item) => (
                                      <li key={`cart-${client.id}-${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex items-center gap-3">
                                        {item.productImage && (
                                          <img src={item.productImage} alt={item.name} className="w-10 h-10 object-cover rounded shadow-sm border border-gray-200" />
                                        )}
                                        <div>
                                          <p className="text-sm font-medium">{item.name}</p>
                                          <p className="text-xs text-gray-500">
                                            Qté: {item.quantity} • Taille: {item.selectedSize || "Unique"} • Couleur: {item.selectedColor || "-"}
                                          </p>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-500 italic">Panier vide</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
