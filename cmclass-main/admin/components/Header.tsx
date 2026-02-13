import { Search, Bell, HelpCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NotificationDropdown } from './NotificationDropdown';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const res = await fetch(`${API_BASE}/admin/notifications/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unread);
      }
    } catch (err) {
      console.error('Failed to fetch notification summary', err);
    }
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-gray-100 px-12 py-6 relative z-[50]">
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

          <div className="relative">
            <button
              className={`relative p-2 hover:bg-gray-50 rounded transition-colors group ${showNotifications ? 'bg-gray-50' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} strokeWidth={1.5} className={showNotifications ? 'text-[#007B8A]' : 'text-gray-600'} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#007B8A] text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <NotificationDropdown
                onClose={() => setShowNotifications(false)}
                onUpdate={fetchSummary}
              />
            )}
          </div>

          <button className="p-2 hover:bg-gray-50 rounded transition-colors">
            <HelpCircle size={20} strokeWidth={1.5} className="text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}