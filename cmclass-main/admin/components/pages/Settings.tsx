import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../Card';
import { Button } from '../Button';
import { Upload, Save, Plus, Trash2 } from 'lucide-react';

const roleMap: { [key: string]: string } = {
  SUPER_ADMIN: 'Administrateur',
  ADMIN: 'Administrateur',
  MODERATOR: 'Éditeur',
  SUPPORT: 'Support',
  USER: 'Visualiseur',
};

const roleBackendMap: { [key: string]: string } = {
  'Administrateur': 'ADMIN',
  'Éditeur': 'MODERATOR',
  'Support': 'SUPPORT',
  'Visualiseur': 'USER',
};

interface SettingsProps {
  brand?: { 
    id?: number;
    name?: string;
    slogan?: string;
    description?: string;
    contactEmail?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
  } | null;
}

export function Settings({ brand }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'brand' | 'team' | 'notifications'>('brand');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandForm, setBrandForm] = useState({
    name: brand?.name || 'MAISON',
    slogan: brand?.slogan || 'Élégance Intemporelle',
    description: brand?.description || 'Une maison de haute couture dédiée à l\'excellence artisanale et au design intemporel.',
    contactEmail: brand?.contactEmail || 'contact@maison.com',
    primaryColor: brand?.primaryColor || '#007B8A',
    secondaryColor: brand?.secondaryColor || '#000000',
    accentColor: brand?.accentColor || '#FFFFFF',
  });
  const [brandSaving, setBrandSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [brandLogo, setBrandLogo] = useState(brand?.logoUrl || '');

  // Sync brand data when it changes
  useEffect(() => {
    if (brand) {
      setBrandForm({
        name: brand.name || 'MAISON',
        slogan: brand.slogan || 'Élégance Intemporelle',
        description: brand.description || 'Une maison de haute couture dédiée à l\'excellence artisanale et au design intemporel.',
        contactEmail: brand.contactEmail || 'contact@maison.com',
        primaryColor: brand.primaryColor || '#007B8A',
        secondaryColor: brand.secondaryColor || '#000000',
        accentColor: brand.accentColor || '#FFFFFF',
      });
      setBrandLogo(brand.logoUrl || '');
    }
  }, [brand]);

  // Handle brand form input changes
  const handleBrandInputChange = (field: keyof typeof brandForm, value: string) => {
    setBrandForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/brand/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload logo');
      const data = await response.json();
      setBrandLogo(data.url);
    } catch (error) {
      alert('Erreur lors du téléchargement du logo: ' + (error as Error).message);
    } finally {
      setLogoUploading(false);
    }
  };

  // Handle favicon upload
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFaviconUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/brand/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload favicon');
      alert('Favicon téléchargé avec succès');
    } catch (error) {
      alert('Erreur lors du téléchargement du favicon: ' + (error as Error).message);
    } finally {
      setFaviconUploading(false);
    }
  };

  // Save brand settings
  const handleBrandSave = async () => {
    setBrandSaving(true);
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/brand', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...brandForm,
          logoUrl: brandLogo,
        }),
      });
      
      if (response.ok) {
        alert('Paramètres de marque mis à jour avec succès');
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour: ' + (error as Error).message);
    } finally {
      setBrandSaving(false);
    }
  };

  // Fetch team members from backend
  useEffect(() => {
    if (activeTab === 'team') {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      // Fetch team members
      Promise.all([
        fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }).then(r => r.json()),
        // Fetch pending signup requests
        fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/signup-requests', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }).then(r => r.json()).catch(() => ({ data: [] })), // ignore errors if not admin
      ])
        .then(([usersData, requestsData]) => {
          const members = (usersData?.data || []).map((u: any) => ({
            id: u.id,
            name: u.username,
            email: u.email,
            role: roleMap[u.role] || u.role,
            backendRole: u.role,
            avatar: u.username?.substring(0, 2).toUpperCase() || 'U',
          }));
          setTeamMembers(members);
          
          const requests = (requestsData?.data || []).map((r: any) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            roleRequested: r.roleRequested,
            message: r.message,
            createdAt: r.createdAt,
          }));
          setPendingRequests(requests);
          setLoading(false);
        })
        .catch(err => {
          setError(err?.message || 'Failed to load data');
          setLoading(false);
        });
    }
  }, [activeTab]);

  const handleRoleChange = (memberId: number, newRole: string) => {
    const backendRole = roleBackendMap[newRole] || newRole;
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + `/admin/users/${memberId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ role: backendRole }),
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to update role');
        return r.json();
      })
      .then(() => {
        setTeamMembers(prev =>
          prev.map(m => m.id === memberId ? { ...m, role: newRole, backendRole } : m)
        );
      })
      .catch(err => {
        setError(err?.message || 'Error updating role');
      });
  };

  const handleDeleteMember = (memberId: number) => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + `/admin/users/${memberId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to delete member');
        setTeamMembers(prev => prev.filter(m => m.id !== memberId));
      })
      .catch(err => {
        setError(err?.message || 'Error deleting member');
      });
  };

  const handleApproveRequest = (requestId: number, roleRequested: string) => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + `/admin/signup-requests/${requestId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ role: roleBackendMap[roleRequested] || roleRequested }),
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to approve request');
        return r.json();
      })
      .then(() => {
        setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      })
      .catch(err => {
        setError(err?.message || 'Error approving request');
      });
  };

  const handleDenyRequest = (requestId: number) => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + `/admin/signup-requests/${requestId}/deny`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ reason: 'Declined by admin' }),
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to deny request');
        setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      })
      .catch(err => {
        setError(err?.message || 'Error denying request');
      });
  };

  const handleDeleteRequest = (requestId: number) => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + `/admin/signup-requests/${requestId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to delete request');
        setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      })
      .catch(err => {
        setError(err?.message || 'Error deleting request');
      });
  };

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
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={handleBrandSave}
                  disabled={brandSaving}
                >
                  <Save size={16} />
                  {brandSaving ? 'Enregistrement...' : 'Enregistrer les Modifications'}
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
                      value={brandForm.name}
                      onChange={(e) => handleBrandInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Slogan</label>
                    <input
                      type="text"
                      value={brandForm.slogan}
                      onChange={(e) => handleBrandInputChange('slogan', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Description de la Marque</label>
                    <textarea
                      rows={4}
                      value={brandForm.description}
                      onChange={(e) => handleBrandInputChange('description', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Email de Contact</label>
                    <input
                      type="email"
                      value={brandForm.contactEmail}
                      onChange={(e) => handleBrandInputChange('contactEmail', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Logo de la Marque</label>
                  {brandLogo && (
                    <div className="mb-4 w-full bg-gray-100 rounded overflow-hidden">
                      <img src={brandLogo} alt="Logo" className="w-full h-32 object-contain p-2" />
                    </div>
                  )}
                  <input 
                    type="file" 
                    id="brand-logo"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    disabled={logoUploading}
                    className="hidden"
                  />
                  <label htmlFor="brand-logo" className="block border-2 border-dashed border-gray-300 rounded p-8 text-center hover:border-[#007B8A] transition-colors cursor-pointer">
                    <Upload size={32} className="mx-auto mb-3 text-gray-400" strokeWidth={1.5} />
                    <p className="text-sm text-gray-600">{logoUploading ? 'Téléchargement...' : 'Télécharger le Logo'}</p>
                    <p className="text-xs text-gray-400 mt-1">PNG ou SVG, 500x500px recommandé</p>
                  </label>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Favicon</label>
                    <input 
                      type="file" 
                      id="brand-favicon"
                      accept="image/x-icon,image/png,image/jpeg,image/webp"
                      onChange={handleFaviconUpload}
                      disabled={faviconUploading}
                      className="hidden"
                    />
                    <label htmlFor="brand-favicon" className="block border-2 border-dashed border-gray-300 rounded p-8 text-center hover:border-[#007B8A] transition-colors cursor-pointer">
                      <Upload size={32} className="mx-auto mb-3 text-gray-400" strokeWidth={1.5} />
                      <p className="text-sm text-gray-600">{faviconUploading ? 'Téléchargement...' : 'Télécharger le Favicon'}</p>
                      <p className="text-xs text-gray-400 mt-1">ICO ou PNG, 32x32px</p>
                    </label>
                  </div>
                </div>
              </div>
              </div>
            </CardContent>

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
                      value={brandForm.primaryColor}
                      onChange={(e) => handleBrandInputChange('primaryColor', e.target.value)}
                      className="w-16 h-12 border border-gray-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandForm.primaryColor}
                      onChange={(e) => handleBrandInputChange('primaryColor', e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Couleur Secondaire</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={brandForm.secondaryColor}
                      onChange={(e) => handleBrandInputChange('secondaryColor', e.target.value)}
                      className="w-16 h-12 border border-gray-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandForm.secondaryColor}
                      onChange={(e) => handleBrandInputChange('secondaryColor', e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Couleur d'Accent</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={brandForm.accentColor}
                      onChange={(e) => handleBrandInputChange('accentColor', e.target.value)}
                      className="w-16 h-12 border border-gray-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandForm.accentColor}
                      onChange={(e) => handleBrandInputChange('accentColor', e.target.value)}
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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}
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
              {loading ? (
                <div className="px-6 py-8 text-center text-gray-500">Chargement...</div>
              ) : teamMembers.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">Aucun membre trouvé</div>
              ) : (
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
                            <div className="w-10 h-10 rounded-full bg-[#007B8A] flex items-center justify-center text-white text-sm font-medium">
                              {member.avatar}
                            </div>
                            <span>{member.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{member.email}</td>
                        <td className="px-6 py-4">
                          <select 
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                            className="px-3 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#007B8A]"
                          >
                            <option>Administrateur</option>
                            <option>Éditeur</option>
                            <option>Support</option>
                            <option>Visualiseur</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleDeleteMember(member.id)}
                              className="p-2 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <Trash2 size={16} className="text-red-500" strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Aucune invitation en attente</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((req) => (
                      <div key={req.id} className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">{req.name}</p>
                            <p className="text-xs text-gray-500">{req.email}</p>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {roleMap[req.roleRequested] || req.roleRequested}
                          </span>
                        </div>
                        {req.message && (
                          <p className="text-xs text-gray-600 mb-3 italic">{req.message}</p>
                        )}
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDenyRequest(req.id)}
                            className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                          >
                            Refuser
                          </button>
                          <button
                            onClick={() => handleApproveRequest(req.id, req.roleRequested)}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Approuver
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
