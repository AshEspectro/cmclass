import { useState } from 'react';
import { Card, CardHeader, CardContent } from '../Card';
import { Button } from '../Button';
import { Upload, Save, Plus, Trash2 } from 'lucide-react';

const teamMembers = [
  { id: 1, name: 'Marie Dupont', email: 'marie.d@maison.com', role: 'Administrateur', avatar: 'MD' },
  { id: 2, name: 'Pierre Martin', email: 'pierre.m@maison.com', role: 'Éditeur', avatar: 'PM' },
  { id: 3, name: 'Julie Bernard', email: 'julie.b@maison.com', role: 'Éditeur', avatar: 'JB' },
  { id: 4, name: 'Thomas Rousseau', email: 'thomas.r@maison.com', role: 'Visualiseur', avatar: 'TR' },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState<'brand' | 'team' | 'notifications'>('brand');

  return (
    <div className="space-y-6">
      {/* Settings Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('brand')}
          className={`px-6 py-3 border-b-2 transition-colors ${
            activeTab === 'brand'
              ? 'border-[#007B8A] text-black'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Paramètres de Marque
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`px-6 py-3 border-b-2 transition-colors ${
            activeTab === 'team'
              ? 'border-[#007B8A] text-black'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Équipe & Accès
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-6 py-3 border-b-2 transition-colors ${
            activeTab === 'notifications'
              ? 'border-[#007B8A] text-black'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Notifications
        </button>
      </div>

      {/* Brand Settings */}
      {activeTab === 'brand' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3>Identité de Marque</h3>
                  <p className="text-sm text-gray-500 mt-1">Gérer le nom, le logo et les couleurs de votre marque</p>
                </div>
                <Button variant="primary" size="sm">
                  <Save size={16} />
                  Enregistrer les Modifications
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Nom de la Marque</label>
                    <input
                      type="text"
                      defaultValue="MAISON"
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Slogan</label>
                    <input
                      type="text"
                      defaultValue="Élégance Intemporelle"
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Description de la Marque</label>
                    <textarea
                      rows={4}
                      defaultValue="Une maison de haute couture dédiée à l'excellence artisanale et au design intemporel."
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Email de Contact</label>
                    <input
                      type="email"
                      defaultValue="contact@maison.com"
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Logo de la Marque</label>
                    <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center hover:border-[#007B8A] transition-colors cursor-pointer">
                      <Upload size={32} className="mx-auto mb-3 text-gray-400" strokeWidth={1.5} />
                      <p className="text-sm text-gray-600">Télécharger le Logo</p>
                      <p className="text-xs text-gray-400 mt-1">PNG ou SVG, 500x500px recommandé</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Favicon</label>
                    <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center hover:border-[#007B8A] transition-colors cursor-pointer">
                      <Upload size={32} className="mx-auto mb-3 text-gray-400" strokeWidth={1.5} />
                      <p className="text-sm text-gray-600">Télécharger le Favicon</p>
                      <p className="text-xs text-gray-400 mt-1">ICO ou PNG, 32x32px</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3>Palette de Couleurs</h3>
              <p className="text-sm text-gray-500 mt-1">Définir les couleurs principales de la marque</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Couleur Primaire</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      defaultValue="#007B8A"
                      className="w-16 h-12 border border-gray-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      defaultValue="#007B8A"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Couleur Secondaire</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      defaultValue="#000000"
                      className="w-16 h-12 border border-gray-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      defaultValue="#000000"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Couleur d'Accent</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      defaultValue="#FFFFFF"
                      className="w-16 h-12 border border-gray-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      defaultValue="#FFFFFF"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3>Médias Sociaux</h3>
              <p className="text-sm text-gray-500 mt-1">Liens vers les profils de réseaux sociaux</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Instagram</label>
                  <input
                    type="text"
                    placeholder="@votremarque"
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Facebook</label>
                  <input
                    type="text"
                    placeholder="facebook.com/votremarque"
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Twitter</label>
                  <input
                    type="text"
                    placeholder="@votremarque"
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Pinterest</label>
                  <input
                    type="text"
                    placeholder="pinterest.com/votremarque"
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Team Settings */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3>Membres de l'Équipe</h3>
                  <p className="text-sm text-gray-500 mt-1">Gérer les utilisateurs et leurs autorisations</p>
                </div>
                <Button variant="primary" size="sm">
                  <Plus size={16} />
                  Inviter un Membre
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-gray-500">Membre</th>
                    <th className="text-left px-6 py-4 text-gray-500">Email</th>
                    <th className="text-left px-6 py-4 text-gray-500">Rôle</th>
                    <th className="text-right px-6 py-4 text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#007B8A] flex items-center justify-center text-white">
                            {member.avatar}
                          </div>
                          <span>{member.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{member.email}</td>
                      <td className="px-6 py-4">
                        <select className="px-3 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#007B8A]">
                          <option selected={member.role === 'Administrateur'}>Administrateur</option>
                          <option selected={member.role === 'Éditeur'}>Éditeur</option>
                          <option selected={member.role === 'Visualiseur'}>Visualiseur</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
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

          <div className="grid grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <h3>Rôles & Autorisations</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="pb-3 border-b border-gray-100">
                  <p className="mb-1">Administrateur</p>
                  <p className="text-sm text-gray-500">Accès complet à toutes les fonctionnalités</p>
                </div>
                <div className="pb-3 border-b border-gray-100">
                  <p className="mb-1">Éditeur</p>
                  <p className="text-sm text-gray-500">Peut créer et modifier du contenu</p>
                </div>
                <div>
                  <p className="mb-1">Visualiseur</p>
                  <p className="text-sm text-gray-500">Accès en lecture seule</p>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <h3>Invitations en Attente</h3>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Aucune invitation en attente</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Notifications Settings */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3>Préférences de Notification</h3>
              <p className="text-sm text-gray-500 mt-1">Choisir quelles notifications vous souhaitez recevoir</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="mb-1">Nouvelles Commandes</p>
                  <p className="text-sm text-gray-500">Recevoir une notification pour chaque nouvelle commande</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#007B8A]" />
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="mb-1">Stock Faible</p>
                  <p className="text-sm text-gray-500">Alertes lorsque les produits sont en rupture de stock</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#007B8A]" />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="mb-1">Nouveaux Clients</p>
                  <p className="text-sm text-gray-500">Notification lorsqu'un nouveau client s'inscrit</p>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-[#007B8A]" />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="mb-1">Rapports Hebdomadaires</p>
                  <p className="text-sm text-gray-500">Recevoir un résumé hebdomadaire par email</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#007B8A]" />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="mb-1">Mises à Jour Produit</p>
                  <p className="text-sm text-gray-500">Notifications sur les modifications de produits</p>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-[#007B8A]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3>Canaux de Notification</h3>
              <p className="text-sm text-gray-500 mt-1">Choisir comment recevoir les notifications</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="mb-1">Notifications Email</p>
                  <p className="text-sm text-gray-500">Recevoir des notifications par email</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#007B8A]" />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="mb-1">Notifications Push</p>
                  <p className="text-sm text-gray-500">Notifications du navigateur en temps réel</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#007B8A]" />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="mb-1">Notifications SMS</p>
                  <p className="text-sm text-gray-500">Recevoir des alertes importantes par SMS</p>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-[#007B8A]" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
