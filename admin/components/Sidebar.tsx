import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  FolderTree, 
  Image, 
  ShoppingCart, 
  Users, 
  Settings 
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
  { id: 'content', label: 'Gestion de Contenu', icon: FileText },
  { id: 'products', label: 'Produits', icon: Package },
  { id: 'categories', label: 'Catégories', icon: FolderTree },
  { id: 'media', label: 'Médiathèque', icon: Image },
  { id: 'orders', label: 'Commandes', icon: ShoppingCart },
  { id: 'customers', label: 'Clients', icon: Users },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col">
      <div className="px-8 py-8 border-b border-gray-100">
        <h1 className="text-2xl tracking-tight">MAISON</h1>
        <p className="text-xs text-gray-500 mt-1 tracking-wide uppercase">Admin Dashboard</p>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors duration-200 ${
                isActive 
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
      
      <div className="px-8 py-6 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs">AD</span>
          </div>
          <div>
            <p className="text-sm">Admin User</p>
            <p className="text-xs text-gray-500">admin@maison.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}