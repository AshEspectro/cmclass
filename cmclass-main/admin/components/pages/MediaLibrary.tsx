import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '../Card';
import { Button } from '../Button';
import { Upload, Grid3x3, List, Trash2, Download, Search, Filter } from 'lucide-react';
import { consumePendingQuickAction } from '../../services/quickActions';

const mediaItems = [
  { id: 1, name: 'campagne-printemps-hero.jpg', type: 'image', size: '2.4 MB', date: '2025-12-08', url: 'https://images.unsplash.com/photo-1719518411339-5158cea86caf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwZWRpdG9yaWFsfGVufDF8fHx8MTc2NTIwODQ4Nnww&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 2, name: 'collection-ete-lookbook.jpg', type: 'image', size: '3.1 MB', date: '2025-12-07', url: 'https://images.unsplash.com/photo-1567777301743-3b7ef158aadf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdoJTIwZW5kJTIwZmFzaGlvbiUyMG1vZGVsfGVufDF8fHx8MTc2NTI3MTY3M3ww&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 3, name: 'produit-sac-detail.jpg', type: 'image', size: '1.8 MB', date: '2025-12-07', url: 'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBoYW5kYmFnfGVufDF8fHx8MTc2NTIzNzcyN3ww&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 4, name: 'manteau-cachemire-lifestyle.jpg', type: 'image', size: '2.9 MB', date: '2025-12-06', url: 'https://images.unsplash.com/photo-1693763824929-bd6b4b959e2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwbHV4dXJ5JTIwcHJvZHVjdHxlbnwxfHx8fDE3NjUyMTM3MDR8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 5, name: 'bijoux-diamant-collection.jpg', type: 'image', size: '2.2 MB', date: '2025-12-06', url: 'https://images.unsplash.com/photo-1670177257750-9b47927f68eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB3YXRjaHxlbnwxfHx8fDE3NjUyMTE2MTh8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 6, name: 'chaussures-designer-nouvelle.jpg', type: 'image', size: '1.9 MB', date: '2025-12-05', url: 'https://images.unsplash.com/photo-1625622176700-e55445383b85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHNob2VzfGVufDF8fHx8MTc2NTE5ODU0Mnww&ixlib=rb-4.1.0&q=80&w=1080' },
];

export function MediaLibrary() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [highlightUploadZone, setHighlightUploadZone] = useState(false);

  useEffect(() => {
    const shouldHighlightUpload = consumePendingQuickAction('upload-media') === 'upload-media';
    if (!shouldHighlightUpload) return;

    setHighlightUploadZone(true);
    const timer = window.setTimeout(() => {
      setHighlightUploadZone(false);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, []);

  const toggleSelection = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded p-12 text-center transition-colors cursor-pointer ${
              highlightUploadZone
                ? 'border-[#007B8A] bg-[#e6f4f6]'
                : 'border-gray-300 hover:border-[#007B8A]'
            }`}
          >
            <Upload size={48} className="mx-auto mb-4 text-gray-400" strokeWidth={1.5} />
            <h3 className="mb-2">Télécharger des Médias</h3>
            <p className="text-sm text-gray-600 mb-4">
              Glisser-déposer des fichiers ici ou cliquer pour parcourir
            </p>
            <p className="text-xs text-gray-400">
              PNG, JPG, WebP, SVG jusqu'à 10 Mo par fichier
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Rechercher des médias..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded w-80 focus:outline-none focus:border-[#007B8A] transition-colors"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter size={16} />
            Filtrer
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {selectedItems.length > 0 && (
            <>
              <span className="text-sm text-gray-600">{selectedItems.length} sélectionné(s)</span>
              <Button variant="ghost" size="sm">
                <Download size={16} />
                Télécharger
              </Button>
              <Button variant="ghost" size="sm">
                <Trash2 size={16} />
                Supprimer
              </Button>
            </>
          )}
          <div className="flex border border-gray-200 rounded overflow-hidden">
            <Button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'} transition-colors`}
            >
              <Grid3x3 size={18} strokeWidth={1.5} />
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'} transition-colors border-l border-gray-200`}
            >
              <List size={18} strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-4 gap-6">
          {mediaItems.map((item) => (
            <div 
              key={item.id} 
              className={`group relative border rounded overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                selectedItems.includes(item.id) ? 'border-[#007B8A] ring-2 ring-[#007B8A]' : 'border-gray-200'
              }`}
              onClick={() => toggleSelection(item.id)}
            >
              <div className="aspect-square bg-gray-100">
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-2 right-2">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleSelection(item.id)}
                  className="w-5 h-5 accent-[#007B8A]"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="p-3 bg-white">
                <p className="text-sm truncate mb-1">{item.name}</p>
                <p className="text-xs text-gray-500">{item.size}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-gray-500 w-12">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-[#007B8A]"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(mediaItems.map(i => i.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </th>
                  <th className="text-left px-6 py-4 text-gray-500">Aperçu</th>
                  <th className="text-left px-6 py-4 text-gray-500">Nom</th>
                  <th className="text-left px-6 py-4 text-gray-500">Taille</th>
                  <th className="text-left px-6 py-4 text-gray-500">Date</th>
                  <th className="text-right px-6 py-4 text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mediaItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      selectedItems.includes(item.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="w-4 h-4 accent-[#007B8A]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4">{item.name}</td>
                    <td className="px-6 py-4 text-gray-600">{item.size}</td>
                    <td className="px-6 py-4 text-gray-600">{item.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                          <Download size={16} className="text-gray-600" strokeWidth={1.5} />
                        </Button>
                        <Button className="p-2 hover:bg-red-50 rounded-full transition-colors">
                          <Trash2 size={16} className="text-red-500" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Storage Info */}
      <Card>
        <CardHeader>
          <h3>Stockage</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Utilisé</span>
              <span className="text-sm">14,8 Go sur 100 Go</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-[#007B8A] h-2 rounded-full" style={{ width: '14.8%' }}></div>
            </div>
            <p className="text-xs text-gray-500">85,2 Go restants</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
