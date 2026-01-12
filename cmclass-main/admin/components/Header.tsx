import { Search, Bell, HelpCircle } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 px-12 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl">{title}</h2>
          {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded w-80 focus:outline-none focus:border-[#007B8A] transition-colors"
            />
          </div>
          
          <button className="relative p-2 hover:bg-gray-50 rounded transition-colors">
            <Bell size={20} strokeWidth={1.5} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#007B8A] rounded-full"></span>
          </button>
          
          <button className="p-2 hover:bg-gray-50 rounded transition-colors">
            <HelpCircle size={20} strokeWidth={1.5} className="text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}