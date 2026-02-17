import {
  LayoutDashboard,
  FileText,
  Package,
  FolderTree,
  Image,
  ShoppingCart,
  Users,
  Settings,
  DollarSign,
  Mail,
  Info,
  LogOut,
  X
} from 'lucide-react';
import { useState } from 'react';
import { Button } from './Button';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  brand?: { name?: string; logoDarkUrl?: string } | null;
  onLogout: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
  { id: 'content', label: 'Gestion de Contenu', icon: FileText },
  { id: 'about', label: 'À propos', icon: Info },
  { id: 'products', label: 'Produits', icon: Package },
  { id: 'categories', label: 'Catégories', icon: FolderTree },
  { id: 'media', label: 'Médiathèque', icon: Image },
  { id: 'orders', label: 'Commandes', icon: ShoppingCart },
  { id: 'customers', label: 'Clients', icon: Users },
  { id: 'inbox', label: 'Boîte Mail', icon: Mail },
  { id: 'legal', label: 'Pages Légales', icon: FileText },
  { id: 'currency', label: 'Devise', icon: DollarSign },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

// Decode JWT payload without verification (for display only)
function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

function getUserFromToken() {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  if (!token) return null;
  return decodeJWT(token);
}

export function Sidebar({ currentPage, onNavigate, brand, onLogout }: SidebarProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userData, setUserData] = useState(() => getUserFromToken());
  const [editForm, setEditForm] = useState({ username: userData?.username || '' });

  const avatarColor = ['#007B8A', '#0F766E', '#0369A1', '#7C3AED', '#D97706'].at(
    (userData?.sub || 0) % 5
  );

  const handleLogout = () => {
    onLogout();
  };

  const handleProfileClick = () => {
    setEditForm({ username: userData?.username || '' });
    setShowProfileModal(true);
  };
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col">
      <div className="px-8 py-8 border-b border-gray-100">
        {brand?.logoDarkUrl ? (
          <img src={brand.logoDarkUrl} alt={brand?.name || 'Brand'} className="h-22 " />
        ) : (
          <h1 className="text-2xl tracking-tight">{brand?.name || 'MAISON'}</h1>
        )}
        <p className="text-xs text-gray-500  tracking-wide uppercase">Admin Dashboard</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors duration-200 ${isActive
                  ? 'bg-[#e6f4f6] text-[#007B8A]'
                  : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-8 py-6 border-t border-gray-100 space-y-4">
        <button
          onClick={handleProfileClick}
          className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition-colors"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {userData?.username?.substring(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userData?.username || 'User'}</p>
            <p className="text-xs text-gray-500 capitalize truncate">{userData?.role?.toLowerCase() || 'user'}</p>
          </div>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded transition-colors text-sm"
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span>Se Déconnecter</span>
        </button>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Mon Profil</h2>
              <Button
                onClick={() => setShowProfileModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-medium"
                  style={{ backgroundColor: avatarColor }}
                >
                  {userData?.username?.substring(0, 2).toUpperCase() || 'U'}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Nom d'Utilisateur</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A]"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Email</label>
                <input
                  type="email"
                  value={userData?.email || 'N/A'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Rôle</label>
                <input
                  type="text"
                  value={userData?.role || 'N/A'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded bg-gray-50 text-gray-600 capitalize"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors text-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-2 bg-[#007B8A] text-white rounded hover:bg-[#005a68] transition-colors text-sm"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
