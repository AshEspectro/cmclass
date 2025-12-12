import { useState } from 'react';
import { Card, CardHeader, CardContent } from '../Card';
import { Button } from '../Button';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

const products = [
  {
    id: 1,
    name: 'Robe de Soirée en Soie',
    category: 'Robes',
    price: '2 500 €',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1567777301743-3b7ef158aadf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdoJTIwZW5kJTIwZmFzaGlvbiUyMG1vZGVsfGVufDF8fHx8MTc2NTI3MTY3M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Actif'
  },
  {
    id: 2,
    name: 'Sac à Main en Cuir',
    category: 'Accessoires',
    price: '1 850 €',
    stock: 24,
    image: 'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBoYW5kYmFnfGVufDF8fHx8MTc2NTIzNzcyN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Actif'
  },
  {
    id: 3,
    name: 'Manteau en Cachemire',
    category: 'Manteaux',
    price: '3 200 €',
    stock: 8,
    image: 'https://images.unsplash.com/photo-1693763824929-bd6b4b959e2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwbHV4dXJ5JTIwcHJvZHVjdHxlbnwxfHx8fDE3NjUyMTM3MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Actif'
  },
  {
    id: 4,
    name: 'Boucles d\'Oreilles Diamant',
    category: 'Bijoux',
    price: '5 600 €',
    stock: 3,
    image: 'https://images.unsplash.com/photo-1670177257750-9b47927f68eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3YXRjaHxlbnwxfHx8fDE3NjUyMTE2MTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Stock Faible'
  },
  {
    id: 5,
    name: 'Lunettes de Créateur',
    category: 'Accessoires',
    price: '650 €',
    stock: 45,
    image: 'https://images.unsplash.com/photo-1625622176700-e55445383b85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHNob2VzfGVufDF8fHx8MTc2NTE5ODU0Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Actif'
  },
  {
    id: 6,
    name: 'Montre de Luxe',
    category: 'Bijoux',
    price: '12 000 €',
    stock: 0,
    image: 'https://images.unsplash.com/photo-1670177257750-9b47927f68eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3YXRjaHxlbnwxfHx8fDE3NjUyMTE2MTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'Rupture de Stock'
  },
];

export function Products() {
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Rechercher des produits..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded w-80 focus:outline-none focus:border-[#007B8A] transition-colors"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter size={16} />
            Filtres
          </Button>
        </div>
        <Button variant="primary">
          <Plus size={18} />
          Ajouter un Nouveau Produit
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-gray-500">Produit</th>
                  <th className="text-left px-6 py-4 text-gray-500">Catégorie</th>
                  <th className="text-left px-6 py-4 text-gray-500">Prix</th>
                  <th className="text-left px-6 py-4 text-gray-500">Stock</th>
                  <th className="text-left px-6 py-4 text-gray-500">Statut</th>
                  <th className="text-right px-6 py-4 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr 
                    key={product.id} 
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{product.category}</td>
                    <td className="px-6 py-4">{product.price}</td>
                    <td className="px-6 py-4">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        product.status === 'Actif' 
                          ? 'bg-[#e6f4f6] text-[#007B8A]' 
                          : product.status === 'Stock Faible'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedProduct(product.id)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Edit size={16} className="text-gray-600" strokeWidth={1.5} />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-full transition-colors">
                          <Trash2 size={16} className="text-red-500" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Product Editor Panel */}
      {selectedProduct && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3>Modifier le Produit</h3>
              <div className="flex gap-3">
                <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)}>
                  Annuler
                </Button>
                <Button variant="primary" size="sm">
                  Enregistrer les Modifications
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Nom du Produit</label>
                  <input
                    type="text"
                    defaultValue={products.find(p => p.id === selectedProduct)?.name}
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Prix</label>
                    <input
                      type="text"
                      defaultValue={products.find(p => p.id === selectedProduct)?.price}
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Stock</label>
                    <input
                      type="number"
                      defaultValue={products.find(p => p.id === selectedProduct)?.stock}
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Catégorie</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors">
                    <option>Robes</option>
                    <option>Accessoires</option>
                    <option>Manteaux</option>
                    <option>Bijoux</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Description</label>
                  <textarea
                    rows={5}
                    placeholder="Entrez la description du produit..."
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Images du Produit</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="aspect-square bg-gray-100 rounded overflow-hidden">
                      <img 
                        src={products.find(p => p.id === selectedProduct)?.image}
                        alt="Produit"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-[#007B8A] transition-colors cursor-pointer">
                      <Plus size={32} className="text-gray-400" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Variantes</label>
                  <div className="space-y-2">
                    {['Taille: S, M, L, XL', 'Couleur: Noir, Blanc, Marine'].map((variant, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                        <span className="text-sm">{variant}</span>
                        <Button variant="ghost" size="sm">Modifier</Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full">
                      Ajouter une Variante
                    </Button>
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
