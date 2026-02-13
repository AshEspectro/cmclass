import { useEffect, useState } from 'react';
import { Bell, Check, Trash2, X, Info, Package, AlertTriangle, UserPlus, Settings } from 'lucide-react';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
}

interface NotificationDropdownProps {
    onClose: () => void;
    onUpdate: () => void;
}

const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `Il y a ${Math.floor(interval)} ans`;
    interval = seconds / 2592000;
    if (interval > 1) return `Il y a ${Math.floor(interval)} mois`;
    interval = seconds / 86400;
    if (interval > 1) return `Il y a ${Math.floor(interval)} jours`;
    interval = seconds / 3600;
    if (interval > 1) return `Il y a ${Math.floor(interval)} heures`;
    interval = seconds / 60;
    if (interval > 1) return `Il y a ${Math.floor(interval)} min`;
    return "À l'instant";
};

export function NotificationDropdown({ onClose, onUpdate }: NotificationDropdownProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('auth_token');

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markRead = async (id: number) => {
        try {
            await fetch(`${API_BASE}/admin/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ read: true })
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            onUpdate();
        } catch (err) {
            console.error('Failed to mark read', err);
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            await fetch(`${API_BASE}/admin/notifications/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.filter(n => n.id !== id));
            onUpdate();
        } catch (err) {
            console.error('Failed to delete', err);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'ORDER': return <Package size={16} className="text-blue-500" />;
            case 'STOCK': return <AlertTriangle size={16} className="text-orange-500" />;
            case 'SIGNUP_REQUEST': return <UserPlus size={16} className="text-green-500" />;
            case 'ADMIN_UPDATE':
            case 'BRAND_UPDATE':
            case 'CAMPAIGN_UPDATE':
            case 'PRODUCT_UPDATE': return <Settings size={16} className="text-purple-500" />;
            default: return <Info size={16} className="text-gray-500" />;
        }
    };

    return (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <h4 className="font-semibold text-gray-900">Notifications</h4>
                <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                    <X size={16} className="text-gray-500" />
                </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Chargement...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 italic">Aucune notification</div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((n) => (
                            <div key={n.id} className={`p-4 hover:bg-gray-50 transition-colors group relative ${!n.read ? 'bg-blue-50/30' : ''}`}>
                                <div className="flex gap-3 text-left">
                                    <div className="mt-1 shrink-0">{getTypeIcon(n.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                            {n.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                        <p className="text-[10px] text-gray-400 mt-1 capitalize leading-none">
                                            {timeAgo(n.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        {!n.read && (
                                            <button
                                                onClick={() => markRead(n.id)}
                                                className="p-1.5 hover:bg-green-100 rounded-full text-green-600 transition-colors"
                                                title="Marquer comme lu"
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(n.id)}
                                            className="p-1.5 hover:bg-red-100 rounded-full text-red-500 transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="px-4 py-2 border-t border-gray-50 text-center bg-gray-50/50">
                <button
                    onClick={() => { }}
                    className="text-xs text-[#007B8A] font-medium hover:underline"
                >
                    Voir tout l'historique
                </button>
            </div>
        </div>
    );
}
