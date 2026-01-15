import { useState } from 'react';
import { Card, CardHeader, CardContent } from '../Card';
import { Button } from '../Button';
import { Eye, Upload, Save, MoveVertical, X } from 'lucide-react';

const contentBlocks = [
  { id: 1, type: 'Bannière Héro', title: 'Collection Printemps 2025', active: true },
  { id: 2, type: 'Produits Vedettes', title: 'Nouveautés', active: true },
  { id: 3, type: 'Campagne', title: 'Lookbook d\'Été', active: false },
  { id: 4, type: 'Histoire de la Marque', title: 'Notre Héritage', active: true },
];

export function ContentManager() {
  const [heroText, setHeroText] = useState('Découvrez l\'Essence du Luxe');
  const [heroSubtext, setHeroSubtext] = useState('Explorez notre collection raffinée d\'élégance intemporelle');
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const selectedBlockObj = contentBlocks.find(b => b.id === selectedBlock) ?? null;

  return (
    <div className="space-y-8">
      {/* Hero Text Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3>Section Héro de la Page d'Accueil</h3>
              <p className="text-sm text-gray-500 mt-1">Modifier le texte et l'imagerie de la bannière héro</p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm">
                <Eye size={16} />
                Aperçu
              </Button>
              <Button variant="primary" size="sm">
                <Save size={16} />
                Publier les Modifications
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            {/* Editor */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Titre Principal</label>
                <input
                  type="text"
                  value={heroText}
                  onChange={(e) => setHeroText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2 text-gray-700">Sous-titre</label>
                <textarea
                  value={heroSubtext}
                  onChange={(e) => setHeroSubtext(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Image de Fond Héro</label>
                <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center hover:border-[#007B8A] transition-colors cursor-pointer">
                  <Upload size={32} className="mx-auto mb-3 text-gray-400" strokeWidth={1.5} />
                  <p className="text-sm text-gray-600">Cliquez pour télécharger ou glisser-déposer</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP jusqu'à 10 Mo</p>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Appel à l'Action</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Texte du Bouton"
                    defaultValue="Découvrir"
                    className="px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="URL du Lien"
                    defaultValue="/collections/nouveautes"
                    className="px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-gray-50 rounded p-6 border border-gray-200">
              <p className="text-xs text-gray-500 mb-4 uppercase tracking-wide">Aperçu en Direct</p>
              <div 
                className="relative h-96 rounded overflow-hidden bg-gray-900 flex items-center justify-center"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1719518411339-5158cea86caf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwZWRpdG9yaWFsfGVufDF8fHx8MTc2NTIwODQ4Nnww&ixlib=rb-4.1.0&q=80&w=1080)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <div className="relative text-center text-white px-8">
                  <h1 className="text-4xl mb-4 text-white">{heroText}</h1>
                  <p className="text-lg mb-6 opacity-90">{heroSubtext}</p>
                  <button className="bg-white text-black px-8 py-3 rounded-full hover:bg-gray-100 transition-colors">
                    Découvrir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3>Gestionnaire de Campagnes</h3>
              <p className="text-sm text-gray-500 mt-1">Créer et modifier les campagnes saisonnières</p>
            </div>
            <Button variant="primary" size="sm">
              <Upload size={16} />
              Nouvelle Campagne
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              { title: 'Élégance Printanière', image: 'https://images.unsplash.com/photo-1567777301743-3b7ef158aadf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdoJTIwZW5kJTIwZmFzaGlvbiUyMG1vZGVsfGVufDF8fHx8MTc2NTI3MTY3M3ww&ixlib=rb-4.1.0&q=80&w=1080', status: 'Actif' },
              { title: 'Classiques Intemporels', image: 'https://images.unsplash.com/photo-1693763824929-bd6b4b959e2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwbHV4dXJ5JTIwcHJvZHVjdHxlbnwxfHx8fDE3NjUyMTM3MDR8MA&ixlib=rb-4.1.0&q=80&w=1080', status: 'Brouillon' },
              { title: 'Collection d\'Été', image: 'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBoYW5kYmFnfGVufDF8fHx8MTc2NTIzNzcyN3ww&ixlib=rb-4.1.0&q=80&w=1080', status: 'Planifié' },
            ].map((campaign, index) => (
              <div key={index} className="group border border-gray-200 rounded overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative h-48 bg-gray-200">
                  <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      campaign.status === 'Actif' ? 'bg-[#007B8A] text-white' :
                      campaign.status === 'Brouillon' ? 'bg-gray-200 text-gray-700' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="mb-2">{campaign.title}</h4>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1">Modifier</Button>
                    <Button variant="outline" size="sm" className="flex-1">Aperçu</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Homepage Block Manager */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3>Gestionnaire de Blocs de la Page d'Accueil</h3>
              <p className="text-sm text-gray-500 mt-1">Organiser et personnaliser les sections de la page d'accueil</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contentBlocks.map((block) => (
              <div 
                key={block.id}
                onClick={() => setSelectedBlock(block.id)}
                className={`flex items-center justify-between p-4 rounded hover:border-[#007B8A] transition-colors cursor-move ${selectedBlock === block.id ? 'border-[#007B8A] bg-white/50' : 'border-gray-200'}`}
              >
                <div className="flex items-center gap-4">
                  <MoveVertical size={18} className="text-gray-400" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm">{block.title}</p>
                    <p className="text-xs text-gray-500">{block.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      defaultChecked={block.active}
                      className="w-4 h-4 accent-[#007B8A]"
                    />
                    <span className="text-sm text-gray-600">Actif</span>
                  </label>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); /* edit action */ }}>Modifier</Button>
                  <Button className="p-2 hover:bg-gray-100 rounded-full" onClick={(e) => { e.stopPropagation(); setSelectedBlock(null); }}>
                    <X size={16} className="text-gray-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">
            Ajouter un Nouveau Bloc
          </Button>
          {selectedBlockObj && (
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4>Détails du Bloc Sélectionné</h4>
                      <p className="text-xs text-gray-500">Modifier les propriétés du bloc</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedBlock(null)}>Fermer</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm mb-1 text-gray-700">Titre</label>
                      <input type="text" value={selectedBlockObj.title} readOnly className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-gray-700">Type</label>
                      <input type="text" value={selectedBlockObj.type} readOnly className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-50" />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={selectedBlockObj.active} readOnly className="w-4 h-4 accent-[#007B8A]" />
                        <span className="text-sm text-gray-600">Actif</span>
                      </label>
                      <Button variant="primary" size="sm">Enregistrer les Modifications</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
