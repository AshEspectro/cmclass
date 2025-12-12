import { useState } from 'react';
import { Card, CardHeader, CardContent } from '../Card';
import { Button } from '../Button';
import { Plus, Edit, Trash2, MoveVertical, Upload } from 'lucide-react';

const categories = [
  { id: 1, name: 'Robes', productCount: 24, image: 'https://images.unsplash.com/photo-1567777301743-3b7ef158aadf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdoJTIwZW5kJTIwZmFzaGlvbiUyMG1vZGVsfGVufDF8fHx8MTc2NTI3MTY3M3ww&ixlib=rb-4.1.0&q=80&w=1080', active: true },
  { id: 2, name: 'Accessoires', productCount: 56, image: 'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBoYW5kYmFnfGVufDF8fHx8MTc2NTIzNzcyN3ww&ixlib=rb-4.1.0&q=80&w=1080', active: true },
  { id: 3, name: 'Manteaux', productCount: 18, image: 'https://images.unsplash.com/photo-1693763824929-bd6b4b959e2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwbHV4dXJ5JTIwcHJvZHVjdHxlbnwxfHx8fDE3NjUyMTM3MDR8MA&ixlib=rb-4.1.0&q=80&w=1080', active: true },
  { id: 4, name: 'Bijoux', productCount: 32, image: 'https://images.unsplash.com/photo-1670177257750-9b47927f68eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3YXRjaHxlbnwxfHx8fDE3NjUyMTE2MTh8MA&ixlib=rb-4.1.0&q=80&w=1080', active: true },
  { id: 5, name: 'Chaussures', productCount: 28, image: 'https://images.unsplash.com/photo-1625622176700-e55445383b85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHNob2VzfGVufDF8fHx8MTc2NTE5ODU0Mnww&ixlib=rb-4.1.0&q=80&w=1080', active: true },
  { id: 6, name: 'Archives', productCount: 12, image: 'https://images.unsplash.com/photo-1719518411339-5158cea86caf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwZWRpdG9yaWFsfGVufDF8fHx8MTc2NTIwODQ4Nnww&ixlib=rb-4.1.0&q=80&w=1080', active: false },
];

export function Categories() {
  const [showNewCategory, setShowNewCategory] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">Gérer les catégories de produits et leur hiérarchie</p>
        </div>
        <Button variant="primary" onClick={() => setShowNewCategory(!showNewCategory)}>
          <Plus size={18} />
          Créer une Catégorie
        </Button>
      </div>

      {/* New Category Form */}
      {showNewCategory && (
        <Card>
          <CardHeader>
            <h3>Nouvelle Catégorie</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Nom de la Catégorie</label>
                  <input
                    type="text"
                    placeholder="ex: Tenues de Soirée"
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Description de la catégorie..."
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Catégorie Parente</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors">
                    <option value="">Aucune (Catégorie de Niveau Supérieur)</option>
                    {categories.map(cat => <option key={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Image de la Catégorie</label>
                <div className="border-2 border-dashed border-gray-300 rounded p-12 text-center hover:border-[#007B8A] transition-colors cursor-pointer h-64 flex flex-col items-center justify-center">
                  <Upload size={48} className="mx-auto mb-4 text-gray-400" strokeWidth={1.5} />
                  <p className="text-sm text-gray-600">Cliquez pour télécharger</p>
                  <p className="text-xs text-gray-400 mt-2">PNG, JPG, WebP jusqu'à 5 Mo</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="primary">Créer la Catégorie</Button>
              <Button variant="ghost" onClick={() => setShowNewCategory(false)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <Card>
        <CardHeader>
          <h3>Toutes les Catégories</h3>
          <p className="text-sm text-gray-500 mt-1">Glisser pour réorganiser les catégories</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((category) => (
            <div 
              key={category.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded hover:border-[#007B8A] transition-colors cursor-move"
            >
              <div className="flex items-center gap-4">
                <MoveVertical size={18} className="text-gray-400" strokeWidth={1.5} />
                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="mb-1">{category.name}</p>
                  <p className="text-sm text-gray-500">{category.productCount} produits</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    defaultChecked={category.active}
                    className="w-4 h-4 accent-[#007B8A]"
                  />
                  <span className="text-sm text-gray-600">Actif</span>
                </label>
                <Button variant="ghost" size="sm">
                  <Edit size={16} />
                  Modifier
                </Button>
                <button className="p-2 hover:bg-red-50 rounded-full transition-colors">
                  <Trash2 size={16} className="text-red-500" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Category Settings */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3>Fusion de Catégories</h3>
            <p className="text-sm text-gray-500 mt-1">Combiner deux catégories en une</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Catégorie Source</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors">
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => <option key={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Fusionner dans</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors">
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => <option key={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <Button variant="secondary" className="w-full">Fusionner les Catégories</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3>Actions en Masse</h3>
            <p className="text-sm text-gray-500 mt-1">Appliquer des actions à plusieurs catégories</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Exporter les Catégories
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Upload size={16} />
                Importer les Catégories
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Activer Toutes
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 size={16} />
                Supprimer les Catégories Inactives
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
