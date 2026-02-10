import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../Card';
import { Button } from '../Button';
import { Upload, Save, Plus, Trash2 } from 'lucide-react';
import { footerApi, type FooterSection as AdminFooterSection, type FooterLink as AdminFooterLink } from '../../services/footerApi';
import { serviceApi, type AdminService } from '../../services/serviceApi';
import { notificationApi, type AdminNotification } from '../../services/notificationApi';

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
    instagramUrl?: string;
    facebookUrl?: string;
    twitterUrl?: string;
    pinterestUrl?: string;
    footerText?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
    logoLightUrl?: string;
    logoDarkUrl?: string;
    faviconUrl?: string;
  } | null;
}

export function Settings({ brand }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'brand' | 'team' | 'notifications' | 'footer'>('brand');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandForm, setBrandForm] = useState({
    name: brand?.name || 'MAISON',
    slogan: brand?.slogan || 'Élégance Intemporelle',
    description: brand?.description || 'Une maison de haute couture dédiée à l\'excellence artisanale et au design intemporel.',
    contactEmail: brand?.contactEmail || 'contact@maison.com',
    instagramUrl: brand?.instagramUrl || '',
    facebookUrl: brand?.facebookUrl || '',
    twitterUrl: brand?.twitterUrl || '',
    pinterestUrl: brand?.pinterestUrl || '',
    footerText: brand?.footerText || '',
    primaryColor: brand?.primaryColor || '#007B8A',
    secondaryColor: brand?.secondaryColor || '#000000',
    accentColor: brand?.accentColor || '#FFFFFF',
  });
  const [brandSaving, setBrandSaving] = useState(false);
  const [logoLightUploading, setLogoLightUploading] = useState(false);
  const [logoDarkUploading, setLogoDarkUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [brandLogoLight, setBrandLogoLight] = useState(brand?.logoLightUrl || '');
  const [brandLogoDark, setBrandLogoDark] = useState(brand?.logoDarkUrl || '');
  const [footerSections, setFooterSections] = useState<AdminFooterSection[]>([]);
  const [footerLoading, setFooterLoading] = useState(false);
  const [footerError, setFooterError] = useState<string | null>(null);
  const [servicesCache, setServicesCache] = useState<AdminService[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [notifForm, setNotifForm] = useState({ title: '', message: '', type: 'INFO' });

  const normalizeSocialUrl = (
    platform: 'instagram' | 'facebook' | 'twitter' | 'pinterest',
    value: string,
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

    let normalized = trimmed;
    if (normalized.startsWith('@')) normalized = normalized.slice(1);
    if (normalized.startsWith('www.')) normalized = normalized.slice(4);

    const domainMap: Record<typeof platform, string> = {
      instagram: 'instagram.com',
      facebook: 'facebook.com',
      twitter: 'twitter.com',
      pinterest: 'pinterest.com',
    };
    const domain = domainMap[platform];
    if (normalized.toLowerCase().includes(domain)) {
      return `https://${normalized}`;
    }
    return `https://${domain}/${normalized}`;
  };

  // Sync brand data when it changes
  useEffect(() => {
    if (brand) {
      setBrandForm({
        name: brand.name || 'MAISON',
        slogan: brand.slogan || 'Élégance Intemporelle',
        description: brand.description || 'Une maison de haute couture dédiée à l\'excellence artisanale et au design intemporel.',
        contactEmail: brand.contactEmail || 'contact@maison.com',
        instagramUrl: brand.instagramUrl || '',
        facebookUrl: brand.facebookUrl || '',
        twitterUrl: brand.twitterUrl || '',
        pinterestUrl: brand.pinterestUrl || '',
        footerText: brand.footerText || '',
        primaryColor: brand.primaryColor || '#007B8A',
        secondaryColor: brand.secondaryColor || '#000000',
        accentColor: brand.accentColor || '#FFFFFF',
      });
      const fallbackLogo = brand.logoUrl || '';
      setBrandLogoLight(brand.logoLightUrl || fallbackLogo);
      setBrandLogoDark(brand.logoDarkUrl || fallbackLogo);
    }
  }, [brand]);

  // Handle brand form input changes
  const handleBrandInputChange = (field: keyof typeof brandForm, value: string) => {
    setBrandForm(prev => ({ ...prev, [field]: value }));
  };

  const uploadBrandAsset = async (file: File) => {
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
    if (!response.ok) throw new Error('Failed to upload asset');
    const data = await response.json();
    return data.url as string;
  };

  const loadFooterSections = async () => {
    setFooterLoading(true);
    setFooterError(null);
    try {
      const [sections, services] = await Promise.all([
        footerApi.listSections(),
        serviceApi.getServices().catch(() => []),
      ]);
      setFooterSections(sections || []);
      setServicesCache(services || []);
    } catch (e: any) {
      setFooterError(e?.message || 'Impossible de charger le footer');
    } finally {
      setFooterLoading(false);
    }
  };

  // Handle light logo upload
  const handleLogoLightUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoLightUploading(true);
    try {
      const url = await uploadBrandAsset(file);
      setBrandLogoLight(url);
    } catch (error) {
      alert('Erreur lors du téléchargement du logo clair: ' + (error as Error).message);
    } finally {
      setLogoLightUploading(false);
    }
  };

  // Handle dark logo upload
  const handleLogoDarkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoDarkUploading(true);
    try {
      const url = await uploadBrandAsset(file);
      setBrandLogoDark(url);
    } catch (error) {
      alert('Erreur lors du téléchargement du logo sombre: ' + (error as Error).message);
    } finally {
      setLogoDarkUploading(false);
    }
  };

  // Handle favicon upload
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFaviconUploading(true);
    try {
      await uploadBrandAsset(file);
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
      const normalizedBrandForm = {
        ...brandForm,
        instagramUrl: normalizeSocialUrl('instagram', brandForm.instagramUrl),
        facebookUrl: normalizeSocialUrl('facebook', brandForm.facebookUrl),
        twitterUrl: normalizeSocialUrl('twitter', brandForm.twitterUrl),
        pinterestUrl: normalizeSocialUrl('pinterest', brandForm.pinterestUrl),
      };
      const logoLightUrl = brandLogoLight.trim();
      const logoDarkUrl = brandLogoDark.trim();
      const fallbackLogo = logoDarkUrl || logoLightUrl || brand?.logoUrl || '';
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/brand', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...normalizedBrandForm,
          logoUrl: fallbackLogo || null,
          logoLightUrl: logoLightUrl || null,
          logoDarkUrl: logoDarkUrl || null,
        }),
      });
      
      if (response.ok) {
        setBrandForm(normalizedBrandForm);
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

  useEffect(() => {
    if (activeTab === 'footer') {
      loadFooterSections();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'notifications') {
      loadNotifications();
    }
  }, [activeTab]);

  const loadNotifications = async () => {
    setNotifLoading(true);
    setNotifError(null);
    try {
      const data = await notificationApi.list(false);
      setNotifications(data);
    } catch (e: any) {
      setNotifError(e?.message || 'Impossible de charger les notifications');
    } finally {
      setNotifLoading(false);
    }
  };

  const createNotification = async () => {
    if (!notifForm.title || !notifForm.message) return;
    setNotifLoading(true);
    try {
      const created = await notificationApi.create(notifForm);
      setNotifications((prev) => [created, ...prev]);
      setNotifForm({ title: '', message: '', type: notifForm.type });
    } catch (e: any) {
      setNotifError(e?.message || 'Creation impossible');
    } finally {
      setNotifLoading(false);
    }
  };

  const setNotificationRead = async (id: number, read: boolean) => {
    setNotifLoading(true);
    try {
      const updated = await notificationApi.markRead(id, read);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, ...updated } : n)));
    } catch (e: any) {
      setNotifError(e?.message || 'Mise a jour impossible');
    } finally {
      setNotifLoading(false);
    }
  };

  const deleteNotification = async (id: number) => {
    setNotifLoading(true);
    try {
      await notificationApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e: any) {
      setNotifError(e?.message || 'Suppression impossible');
    } finally {
      setNotifLoading(false);
    }
  };

  const isServicesSection = (title?: string) =>
    (title || '').trim().toLowerCase().includes('service');

  const handleSectionChange = (id: number, patch: Partial<AdminFooterSection>) => {
    setFooterSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  const saveSection = async (section: AdminFooterSection) => {
    if (!section.id) return;
    setFooterLoading(true);
    try {
      const updated = await footerApi.updateSection(section.id, {
        title: section.title,
        order: section.order,
        isActive: section.isActive,
      });
      setFooterSections((prev) => prev.map((s) => (s.id === section.id ? { ...s, ...updated } : s)));
    } catch (e: any) {
      setFooterError(e?.message || 'Mise a jour impossible');
    } finally {
      setFooterLoading(false);
    }
  };

  const addSection = async () => {
    setFooterLoading(true);
    try {
      const created = await footerApi.createSection({
        title: 'Nouvelle section',
        order: (footerSections?.length || 0) + 1,
        isActive: true,
      });
      setFooterSections((prev) => [...prev, created]);
    } catch (e: any) {
      setFooterError(e?.message || 'Creation impossible');
    } finally {
      setFooterLoading(false);
    }
  };

  const removeSection = async (id?: number) => {
    if (!id) return;
    setFooterLoading(true);
    try {
      await footerApi.deleteSection(id);
      setFooterSections((prev) => prev.filter((s) => s.id !== id));
    } catch (e: any) {
      setFooterError(e?.message || 'Suppression impossible');
    } finally {
      setFooterLoading(false);
    }
  };

  const addLink = async (sectionId?: number) => {
    if (!sectionId) return;
    setFooterLoading(true);
    try {
      const created = await footerApi.createLink(sectionId, {
        label: 'Nouveau lien',
        url: '/',
        order: 1,
        isActive: true,
      });
      setFooterSections((prev) =>
        prev.map((s) =>
          s.id === sectionId ? { ...s, links: [...(s.links || []), created] } : s
        )
      );
    } catch (e: any) {
      setFooterError(e?.message || 'Creation de lien impossible');
    } finally {
      setFooterLoading(false);
    }
  };

  const updateLink = async (sectionId: number, link: AdminFooterLink) => {
    if (!link.id) return;
    setFooterLoading(true);
    try {
      const updated = await footerApi.updateLink(link.id, {
        label: link.label,
        url: link.url,
        order: link.order,
        isActive: link.isActive,
      });
      setFooterSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                links: (s.links || []).map((l) => (l.id === link.id ? { ...l, ...updated } : l)),
              }
            : s
        )
      );
    } catch (e: any) {
      setFooterError(e?.message || 'Mise a jour de lien impossible');
    } finally {
      setFooterLoading(false);
    }
  };

  const deleteLink = async (sectionId: number, linkId?: number) => {
    if (!linkId) return;
    setFooterLoading(true);
    try {
      await footerApi.deleteLink(linkId);
      setFooterSections((prev) =>
        prev.map((s) =>
          s.id === sectionId ? { ...s, links: (s.links || []).filter((l) => l.id !== linkId) } : s
        )
      );
    } catch (e: any) {
      setFooterError(e?.message || 'Suppression de lien impossible');
    } finally {
      setFooterLoading(false);
    }
  };

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
        <button
          onClick={() => setActiveTab('footer')}
          className={`px-6 py-3 border-b-2 transition-colors ${
            activeTab === 'footer'
              ? 'border-[#007B8A] text-black'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Footer
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

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Texte du Footer</label>
                  <textarea
                    rows={3}
                    value={brandForm.footerText}
                    onChange={(e) => handleBrandInputChange('footerText', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    placeholder="Texte affiché en bas du footer"
                  />
                </div>
              </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Logo Clair (Navbar)</label>
                  {brandLogoLight && (
                    <div className="mb-4 w-full bg-gray-100 rounded overflow-hidden">
                      <img src={brandLogoLight} alt="Logo clair" className="w-full h-32 object-contain p-2" />
                    </div>
                  )}
                  <input 
                    type="file" 
                    id="brand-logo-light"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoLightUpload}
                    disabled={logoLightUploading}
                    className="hidden"
                  />
                  <label htmlFor="brand-logo-light" className="block border-2 border-dashed border-gray-300 rounded p-8 text-center hover:border-[#007B8A] transition-colors cursor-pointer">
                    <Upload size={32} className="mx-auto mb-3 text-gray-400" strokeWidth={1.5} />
                    <p className="text-sm text-gray-600">{logoLightUploading ? 'Téléchargement...' : 'Télécharger le Logo Clair'}</p>
                    <p className="text-xs text-gray-400 mt-1">PNG ou SVG, 500x500px recommandé</p>
                  </label>
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Logo Sombre (Footer)</label>
                  {brandLogoDark && (
                    <div className="mb-4 w-full bg-gray-100 rounded overflow-hidden">
                      <img src={brandLogoDark} alt="Logo sombre" className="w-full h-32 object-contain p-2" />
                    </div>
                  )}
                  <input 
                    type="file" 
                    id="brand-logo-dark"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoDarkUpload}
                    disabled={logoDarkUploading}
                    className="hidden"
                  />
                  <label htmlFor="brand-logo-dark" className="block border-2 border-dashed border-gray-300 rounded p-8 text-center hover:border-[#007B8A] transition-colors cursor-pointer">
                    <Upload size={32} className="mx-auto mb-3 text-gray-400" strokeWidth={1.5} />
                    <p className="text-sm text-gray-600">{logoDarkUploading ? 'Téléchargement...' : 'Télécharger le Logo Sombre'}</p>
                    <p className="text-xs text-gray-400 mt-1">PNG ou SVG, 500x500px recommandé</p>
                  </label>
                  </div>
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
                    value={brandForm.instagramUrl}
                    onChange={(e) => handleBrandInputChange('instagramUrl', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Facebook</label>
                  <input
                    type="text"
                    placeholder="facebook.com/votremarque"
                    value={brandForm.facebookUrl}
                    onChange={(e) => handleBrandInputChange('facebookUrl', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Twitter</label>
                  <input
                    type="text"
                    placeholder="@votremarque"
                    value={brandForm.twitterUrl}
                    onChange={(e) => handleBrandInputChange('twitterUrl', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Pinterest</label>
                  <input
                    type="text"
                    placeholder="pinterest.com/votremarque"
                    value={brandForm.pinterestUrl}
                    onChange={(e) => handleBrandInputChange('pinterestUrl', e.target.value)}
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
          {notifError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {notifError}
            </div>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3>Centre de notifications</h3>
                  <p className="text-sm text-gray-500 mt-1">Creer et suivre les alertes admin.</p>
                </div>
                {notifLoading && <p className="text-xs text-gray-400">Chargement...</p>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-sm text-gray-600 mb-1">Titre</label>
                  <input
                    type="text"
                    value={notifForm.title}
                    onChange={(e) => setNotifForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A]"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm text-gray-600 mb-1">Type</label>
                  <select
                    value={notifForm.type}
                    onChange={(e) => setNotifForm((p) => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A]"
                  >
                    <option value="INFO">INFO</option>
                    <option value="ORDER">ORDER</option>
                    <option value="STOCK">STOCK</option>
                    <option value="CONTENT">CONTENT</option>
                  </select>
                </div>
                <div className="col-span-1 flex items-end">
                  <Button variant="primary" size="sm" onClick={createNotification} disabled={notifLoading}>
                    <Plus size={14} /> Publier
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Message</label>
                <textarea
                  rows={3}
                  value={notifForm.message}
                  onChange={(e) => setNotifForm((p) => ({ ...p, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3>Notifications recents</h3>
              <p className="text-sm text-gray-500 mt-1">Marquez comme lues ou supprimez.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-gray-500 text-sm">Aucune notification.</div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="border border-gray-100 rounded p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{n.type || 'INFO'}</span>
                          {!n.read && <span className="text-xs text-[#007B8A]">Non lu</span>}
                        </div>
                        <p className="font-medium">{n.title}</p>
                        <p className="text-sm text-gray-700">{n.message}</p>
                        <p className="text-xs text-gray-400">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setNotificationRead(n.id!, !n.read)}
                          disabled={notifLoading}
                        >
                          {n.read ? 'Marquer non lu' : 'Marquer lu'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(n.id!)}
                          disabled={notifLoading}
                        >
                          <Trash2 size={14} /> Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'footer' && (
        <div className="space-y-6">
          {footerError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {footerError}
            </div>
          )}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Sections du footer</h3>
            <Button variant="primary" size="sm" onClick={addSection} disabled={footerLoading}>
              <Plus size={16} /> Ajouter une section
            </Button>
          </div>

          {footerLoading && footerSections.length === 0 ? (
            <div className="text-gray-500">Chargement...</div>
          ) : footerSections.length === 0 ? (
            <div className="text-gray-500">Aucune section. Ajoutez-en une.</div>
          ) : (
            footerSections
              .slice()
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((section) => {
                const servicesMode = isServicesSection(section.title);
                const effectiveLinks = servicesMode
                  ? (servicesCache || []).map((svc, idx) => ({
                      id: idx + 1,
                      label: svc.title || 'Service',
                      url: svc.link || '/contact',
                      order: idx + 1,
                      isActive: svc.isActive ?? true,
                    }))
                  : section.links || [];

                return (
                  <Card key={section.id} className="border border-gray-200">
                    <CardHeader className="flex items-start justify-between gap-4">
                      <div className="space-y-3 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="md:col-span-2">
                            <label className="block text-sm text-gray-600 mb-1">Titre</label>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => handleSectionChange(section.id!, { title: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Ordre</label>
                            <input
                              type="number"
                              value={section.order ?? 0}
                              onChange={(e) =>
                                handleSectionChange(section.id!, { order: Number(e.target.value) || 0 })
                              }
                              className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A]"
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={section.isActive ?? true}
                                onChange={(e) => handleSectionChange(section.id!, { isActive: e.target.checked })}
                              />
                              Actif
                            </label>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => saveSection(section)}
                            disabled={footerLoading}
                          >
                            <Save size={14} /> Enregistrer
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSection(section.id)}
                            disabled={footerLoading}
                          >
                            <Trash2 size={14} /> Supprimer
                          </Button>
                        </div>
                        {servicesMode && (
                          <div className="text-xs text-gray-500">
                            Cette section affiche automatiquement les services actifs (API services).
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {!servicesMode && (
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium">Liens</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addLink(section.id)}
                            disabled={footerLoading}
                          >
                            <Plus size={14} /> Ajouter un lien
                          </Button>
                        </div>
                      )}

                      {effectiveLinks.length === 0 ? (
                        <div className="text-gray-400 text-sm">
                          {servicesMode ? 'Aucun service actif' : 'Aucun lien'}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {effectiveLinks
                            .slice()
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((link) => (
                              <div
                                key={link.id}
                                className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center border border-gray-100 rounded p-3"
                              >
                                <div className="md:col-span-2">
                                  <label className="block text-xs text-gray-500 mb-1">Label</label>
                                  <input
                                    type="text"
                                    value={link.label}
                                    disabled={servicesMode}
                                    onChange={(e) =>
                                      setFooterSections((prev) =>
                                        prev.map((s) =>
                                          s.id === section.id
                                            ? {
                                                ...s,
                                                links: (s.links || []).map((l) =>
                                                  l.id === link.id ? { ...l, label: e.target.value } : l
                                                ),
                                              }
                                            : s
                                        )
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A]"
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-xs text-gray-500 mb-1">URL</label>
                                  <input
                                    type="text"
                                    value={link.url}
                                    disabled={servicesMode}
                                    onChange={(e) =>
                                      setFooterSections((prev) =>
                                        prev.map((s) =>
                                          s.id === section.id
                                            ? {
                                                ...s,
                                                links: (s.links || []).map((l) =>
                                                  l.id === link.id ? { ...l, url: e.target.value } : l
                                                ),
                                              }
                                            : s
                                        )
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 mb-1">Ordre</label>
                                  <input
                                    type="number"
                                    value={link.order ?? 0}
                                    disabled={servicesMode}
                                    onChange={(e) =>
                                      setFooterSections((prev) =>
                                        prev.map((s) =>
                                          s.id === section.id
                                            ? {
                                                ...s,
                                                links: (s.links || []).map((l) =>
                                                  l.id === link.id ? { ...l, order: Number(e.target.value) || 0 } : l
                                                ),
                                              }
                                            : s
                                        )
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A]"
                                  />
                                </div>
                                {!servicesMode && (
                                  <div className="flex items-center gap-2 justify-end">
                                    <label className="flex items-center gap-2 text-xs">
                                      <input
                                        type="checkbox"
                                        checked={link.isActive ?? true}
                                        onChange={(e) =>
                                          setFooterSections((prev) =>
                                            prev.map((s) =>
                                              s.id === section.id
                                                ? {
                                                    ...s,
                                                    links: (s.links || []).map((l) =>
                                                      l.id === link.id ? { ...l, isActive: e.target.checked } : l
                                                    ),
                                                  }
                                                : s
                                            )
                                          )
                                        }
                                      />
                                      Actif
                                    </label>
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => updateLink(section.id!, link)}
                                      disabled={footerLoading}
                                    >
                                      <Save size={14} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteLink(section.id!, link.id)}
                                      disabled={footerLoading}
                                    >
                                      <Trash2 size={14} />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
          )}
        </div>
      )}
    </div>
  );
}
