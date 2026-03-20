/**
 * Admin — Order Management
 * Backoffice for a store-pickup ecommerce with PAY_IN_STORE + MAXICASH flows.
 *
 * Architecture:
 *  - Left panel: searchable, filterable order list
 *  - Right panel: full order detail (customer, payment, operational, notifications, audit trail)
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '../Card';
import {
  Search, RefreshCw, Phone, Mail, MessageCircle, AlertTriangle,
  Clock, Package, Store, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  CreditCard, Banknote, History, Filter, X,
} from 'lucide-react';
import { fetchWithAuth, createFetchOptions } from '../../services/api';

const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const EXPIRY_WARN_MS = 2 * 60 * 60 * 1000; // 2 hours

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Line = { id?: number; name: string; quantity: number; price: number; size?: string; color?: string; image?: string | null };
type HistoryEntry = { id: number; fromStatus: string | null; fromStatusLabel: string | null; toStatus: string; toStatusLabel: string; changedBy: string | null; reason: string | null; createdAt: string };
type NotifEntry    = { id: number; type: string; channel: string; status: string; sentAt: string | null; errorMessage: string | null; createdAt: string };
type MaxiTx        = { id: number; reference: string; status: string; providerTxId: string | null; failureReason: string | null; completedAt: string | null; createdAt: string };

type Order = {
  id: number;
  displayId: string;
  customer: string;
  email: string;
  phone: string;
  paymentMethod: string;
  paymentMethodLabel: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  status: string;
  statusLabel: string;
  total: number;
  currency: string;
  itemsCount: number;
  pickupCode: string | null;
  reservedUntil: string | null;
  readyAt: string | null;
  pickupExpiresAt: string | null;
  cancelReason: string | null;
  whatsappStatus: string | null;
  whatsappSentAt: string | null;
  whatsappError: string | null;
  badges: string[];
  allowedActions: string[];
  createdAt: string;
  lines: Line[];
  statusHistory?: HistoryEntry[];
  notifications?: NotifEntry[];
  maxicashTransactions?: MaxiTx[];
};

type Stats = { actionNeeded: number; inProgress: number; readyForPickup: number; completed: number; issues: number };

/* ─── Label/color maps ───────────────────────────────────────────────────── */
const ORDER_STATUS_LABELS: Record<string, string> = {
  CREATED: 'Commande créée', RESERVED: 'Réservée en boutique',
  AWAITING_PAYMENT: 'En attente de paiement', CONFIRMED: 'Confirmée',
  PREPARING: 'En préparation', READY_FOR_PICKUP: 'Prête au retrait',
  PICKED_UP: 'Retirée', EXPIRED: 'Expirée', CANCELLED: 'Annulée',
};
const PAY_STATUS_LABELS: Record<string, string> = {
  UNPAID: 'Non payé', PENDING: 'Paiement en attente', PAID: 'Payé',
  FAILED: 'Paiement échoué', CANCELLED: 'Paiement annulé', CANCELLED_PAYMENT: 'Paiement annulé', REFUNDED: 'Remboursé',
};
const PAY_METHOD_LABELS: Record<string, string> = { MAXICASH: 'Mobile money', PAY_IN_STORE: 'Paiement en boutique' };
const STEPPER_MAXICASH  = ['AWAITING_PAYMENT', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP'];
const STEPPER_IN_STORE  = ['RESERVED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP'];

const ORDER_STATUS_PILL: Record<string, string> = {
  CREATED:          'bg-gray-100 text-gray-600 border border-gray-200',
  RESERVED:         'bg-amber-50  text-amber-700  border border-amber-200',
  AWAITING_PAYMENT: 'bg-amber-50  text-amber-700  border border-amber-200',
  CONFIRMED:        'bg-blue-50   text-blue-700   border border-blue-200',
  PREPARING:        'bg-blue-50   text-blue-700   border border-blue-200',
  READY_FOR_PICKUP: 'bg-teal-50   text-teal-700   border border-teal-200',
  PICKED_UP:        'bg-emerald-50 text-emerald-700 border border-emerald-200',
  EXPIRED:          'bg-gray-100  text-gray-500   border border-gray-300',
  CANCELLED:        'bg-red-50    text-red-700    border border-red-200',
};
const PAY_STATUS_PILL: Record<string, string> = {
  UNPAID:            'bg-orange-50 text-orange-700 border border-orange-200',
  PENDING:           'bg-amber-50  text-amber-700  border border-amber-200',
  PAID:              'bg-emerald-50 text-emerald-700 border border-emerald-200',
  FAILED:            'bg-red-50    text-red-700    border border-red-200',
  CANCELLED:         'bg-gray-100  text-gray-500   border border-gray-200',
  CANCELLED_PAYMENT: 'bg-gray-100  text-gray-500   border border-gray-200',
  REFUNDED:          'bg-purple-50 text-purple-700 border border-purple-200',
};

const ACTION_CONFIG: Record<string, { label: string; desc: string; danger?: boolean; icon: React.FC<any> }> = {
  PREPARING:        { label: 'Passer en préparation',             desc: 'Indique que la commande est en cours de préparation.',                        icon: Package },
  READY_FOR_PICKUP: { label: 'Marquer prête au retrait',          desc: 'WhatsApp envoyé automatiquement. Le client sera prévenu.',                    icon: Store },
  PICKED_UP:        { label: 'Confirmer le retrait en boutique',  desc: 'Le client a récupéré sa commande. Paiement enregistré si paiement boutique.', icon: CheckCircle2 },
  CANCELLED:        { label: 'Annuler la commande',               desc: 'Annulation définitive. Saisir une raison pour le suivi.',                     danger: true, icon: XCircle },
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function fmtCurr(v: number, curr = 'FC') {
  const c = (curr || 'FC').toUpperCase();
  if (c === 'EUR') return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v)} ${c}`;
}
function fmtDate(d: string | null | undefined, full = false) {
  if (!d) return '—';
  return new Date(d).toLocaleString('fr-FR', full
    ? { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function expiringSoon(d: string | null) { return !!d && new Date(d).getTime() - Date.now() < EXPIRY_WARN_MS; }
function isOverdue(d: string | null) { return !!d && new Date(d).getTime() < Date.now(); }

function normalise(o: any): Order {
  return {
    ...o,
    badges:         Array.isArray(o.badges)         ? o.badges         : [],
    allowedActions: Array.isArray(o.allowedActions) ? o.allowedActions : [],
    lines:          Array.isArray(o.lines)           ? o.lines           : [],
    statusHistory:  Array.isArray(o.statusHistory)  ? o.statusHistory  : [],
    notifications:  Array.isArray(o.notifications)  ? o.notifications  : [],
    maxicashTransactions: Array.isArray(o.maxicashTransactions) ? o.maxicashTransactions : [],
  };
}

/* ─── Pill ───────────────────────────────────────────────────────────────── */
function Pill({ label, cls }: { label: string; cls: string }) {
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>{label}</span>;
}

/* ─── Status stepper (mini dots for list) ────────────────────────────────── */
function MiniStepper({ status, paymentMethod }: { status: string; paymentMethod: string }) {
  if (['CANCELLED', 'EXPIRED'].includes(status)) return (
    <span className={`text-[10px] font-medium flex items-center gap-1 ${status === 'CANCELLED' ? 'text-red-500' : 'text-gray-400'}`}>
      {status === 'CANCELLED' ? <XCircle size={11}/> : <AlertTriangle size={11}/>}
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
  const steps = paymentMethod === 'MAXICASH' ? STEPPER_MAXICASH : STEPPER_IN_STORE;
  const idx   = steps.indexOf(status);
  return (
    <div className="flex items-center gap-0.5">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-0.5">
          <div title={ORDER_STATUS_LABELS[s]} className={`w-2 h-2 rounded-full ${i < idx ? 'bg-teal-500/60' : i === idx ? 'bg-teal-600 ring-2 ring-teal-200' : 'bg-gray-200'}`} />
          {i < steps.length - 1 && <div className={`w-3 h-0.5 rounded-full ${i < idx ? 'bg-teal-400/40' : 'bg-gray-100'}`} />}
        </div>
      ))}
      <span className="ml-1.5 text-[10px] text-gray-500 font-medium">{ORDER_STATUS_LABELS[status] ?? status}</span>
    </div>
  );
}

/* ─── Detail Stepper (full numbered) ─────────────────────────────────────── */
function DetailStepper({ status, paymentMethod }: { status: string; paymentMethod: string }) {
  if (['CANCELLED', 'EXPIRED'].includes(status)) return null;
  const steps = paymentMethod === 'MAXICASH' ? STEPPER_MAXICASH : STEPPER_IN_STORE;
  const cur   = steps.indexOf(status);
  return (
    <div className="flex items-center w-full gap-0.5 mt-1">
      {steps.map((s, i) => {
        const done = i < cur; const active = i === cur;
        return (
          <div key={s} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-0.5 shrink-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-[9px] font-bold ${active ? 'bg-teal-600 border-teal-600 text-white ring-2 ring-teal-200' : done ? 'bg-teal-500/70 border-teal-500/70 text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-[9px] text-center leading-tight max-w-[55px] mt-0.5 ${active ? 'text-teal-700 font-semibold' : done ? 'text-gray-500' : 'text-gray-300'}`}>{ORDER_STATUS_LABELS[s]}</span>
            </div>
            {i < steps.length - 1 && <div className={`h-[2px] flex-1 mx-1 rounded-full ${i < cur ? 'bg-teal-400/60' : 'bg-gray-100'}`} />}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Confirm Modal ──────────────────────────────────────────────────────── */
function ConfirmModal({ action, orderId, onConfirm, onCancel }: { action: string; orderId: number; onConfirm: (r?: string) => void; onCancel: () => void }) {
  const [reason, setReason] = useState('');
  const cfg = ACTION_CONFIG[action];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className={`h-1 ${cfg.danger ? 'bg-red-500' : 'bg-teal-600'}`} />
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${cfg.danger ? 'bg-red-50' : 'bg-teal-50'}`}>
              <Icon size={18} className={cfg.danger ? 'text-red-600' : 'text-teal-700'} />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">{cfg.label}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{cfg.desc}</p>
              <p className="text-[10px] text-gray-400 mt-1">Commande #{orderId}</p>
            </div>
          </div>
          {cfg.danger && (
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Raison de l'annulation <span className="text-gray-400">(optionnel)</span></label>
              <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} placeholder="Ex : manque de stock, demande client…" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-100 resize-none" />
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button onClick={onCancel} className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50">Annuler</button>
            <button onClick={() => onConfirm(cfg.danger ? reason || undefined : undefined)} className={`flex-1 px-4 py-2 text-sm rounded-lg font-semibold text-white ${cfg.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-600 hover:bg-teal-700'}`}>Confirmer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Section Block ──────────────────────────────────────────────────────── */
function Section({ title, icon: Icon, children, defaultOpen = true, accent }: { title: string; icon: React.FC<any>; children: React.ReactNode; defaultOpen?: boolean; accent?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <button onClick={() => setOpen(p => !p)} className={`w-full flex items-center justify-between px-4 py-3 text-left ${open ? 'bg-gray-50/80' : 'bg-white hover:bg-gray-50'} transition-colors`}>
        <span className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${accent ?? 'text-gray-500'}`}>
          <Icon size={13} />{title}
        </span>
        {open ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
      </button>
      {open && <div className="bg-white px-4 py-3 space-y-2 text-sm">{children}</div>}
    </div>
  );
}

function KV({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 text-xs">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className={`font-medium text-gray-800 text-right ${mono ? 'font-mono tracking-wider' : ''}`}>{value ?? '—'}</span>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export function Orders() {
  // List state
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders]       = useState<Order[]>([]);
  const [stats, setStats]         = useState<Stats | null>(null);
  const [query, setQuery]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  // Quick filters
  const [filterMethod, setFilterMethod]   = useState('');   // '' | 'MAXICASH' | 'PAY_IN_STORE'
  const [filterPayStatus, setFilterPayStatus] = useState(''); // '' | 'UNPAID' | 'FAILED'
  const [filterUrgent, setFilterUrgent]   = useState(false);
  const [showFilters, setShowFilters]     = useState(false);
  // Detail state
  const [selected, setSelected]   = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  // Action state
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  /* ── Fetch list ── */
  const fetchList = useCallback(async (tab: string) => {
    setLoading(true); setError(null);
    try {
      const qs = tab === 'all' ? '' : `?tab=${tab}`;
      const res = await fetchWithAuth(`${API}/admin/orders${qs}`, createFetchOptions('GET'));
      if (!res.ok) throw new Error('Impossible de charger les commandes.');
      const data = await res.json();
      const list: Order[] = (data?.orders ?? []).map(normalise);
      setOrders(list);
      if (data?.stats) setStats(data.stats);
      setSelected(prev => {
        if (!prev) return list[0] ?? null;
        return list.find(o => o.id === prev.id) ?? list[0] ?? null;
      });
    } catch (e: any) { setError(e?.message ?? 'Erreur.'); }
    finally { setLoading(false); }
  }, []);

  /* ── Fetch detail (with audit trail) ── */
  const fetchDetail = useCallback(async (id: number) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setDetailLoading(true);
    try {
      const res = await fetchWithAuth(`${API}/admin/orders/${id}`, createFetchOptions('GET'));
      if (!res.ok) return;
      const data = await res.json();
      const full = normalise(data?.data ?? data);
      setSelected(full);
    } catch (_) {}
    finally { setDetailLoading(false); }
  }, []);

  useEffect(() => { fetchList(activeTab); }, [activeTab, fetchList]);

  /* ── Execute action ── */
  const executeAction = async (toStatus: string, reason?: string) => {
    if (!selected) return;
    setPendingAction(null); setActionLoading(true);
    try {
      const res = await fetchWithAuth(`${API}/admin/orders/${selected.id}/status`, {
        ...createFetchOptions('PATCH'),
        body: JSON.stringify({ status: toStatus, reason }),
      });
      if (!res.ok) {
        const pl = await res.json().catch(() => null);
        throw new Error(pl?.message ?? 'Erreur lors de la mise à jour.');
      }
      setActionSuccess(`Statut mis à jour : ${ORDER_STATUS_LABELS[toStatus]}`);
      setTimeout(() => setActionSuccess(null), 3500);
      await fetchList(activeTab);
      await fetchDetail(selected.id);
    } catch (e: any) { setError(e?.message); }
    finally { setActionLoading(false); }
  };

  /* ── Retry WhatsApp ── */
  const retryWhatsapp = async () => {
    if (!selected) return;
    try {
      const res = await fetchWithAuth(`${API}/admin/orders/${selected.id}/notify/retry`, createFetchOptions('POST'));
      if (!res.ok) { const pl = await res.json().catch(() => null); throw new Error(pl?.message ?? 'Erreur'); }
      setActionSuccess('Notification WhatsApp renvoyée.');
      setTimeout(() => setActionSuccess(null), 3500);
      await fetchDetail(selected.id);
    } catch (e: any) { setError(e?.message); }
  };

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    let list = orders;
    // search
    const term = query.trim().toLowerCase();
    if (term) list = list.filter(o =>
      o.displayId.toLowerCase().includes(term) ||
      o.customer.toLowerCase().includes(term) ||
      (o.phone || '').includes(term) ||
      (o.pickupCode || '').toLowerCase().includes(term) ||
      (o.email || '').toLowerCase().includes(term)
    );
    // quick filters
    if (filterMethod)    list = list.filter(o => o.paymentMethod === filterMethod);
    if (filterPayStatus) list = list.filter(o => o.paymentStatus === filterPayStatus);
    if (filterUrgent)    list = list.filter(o =>
      expiringSoon(o.reservedUntil) || expiringSoon(o.pickupExpiresAt) ||
      (o.badges ?? []).includes('whatsapp_failed')
    );
    return list;
  }, [orders, query, filterMethod, filterPayStatus, filterUrgent]);

  const tabs = [
    { id: 'all',        label: 'Toutes' },
    { id: 'action',     label: 'Action requise', count: stats?.actionNeeded },
    { id: 'in_progress',label: 'En cours',        count: stats?.inProgress },
    { id: 'ready',      label: 'Prêt au retrait', count: stats?.readyForPickup },
    { id: 'completed',  label: 'Terminées',        count: stats?.completed },
    { id: 'issues',     label: 'Problèmes',        count: stats?.issues },
  ];

  const activeFilters = [filterMethod, filterPayStatus, filterUrgent ? 'urgent' : ''].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Confirm Modal */}
      {pendingAction && selected && (
        <ConfirmModal
          action={pendingAction}
          orderId={selected.id}
          onConfirm={r => executeAction(pendingAction, r)}
          onCancel={() => setPendingAction(null)}
        />
      )}

      {/* Success toast */}
      {actionSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-teal-600 text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle2 size={15}/>{actionSuccess}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm flex justify-between items-center">
          <span className="flex items-center gap-2"><AlertTriangle size={14}/>{error}</span>
          <button onClick={() => setError(null)} className="ml-4 font-bold text-lg leading-none opacity-60 hover:opacity-100">×</button>
        </div>
      )}

      {/* Tabs + refresh */}
      <div className="flex items-center gap-0 border-b border-gray-200 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === t.id ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'}`}>
            {t.label}
            {!!t.count && t.count > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-semibold ${activeTab === t.id ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'}`}>{t.count}</span>
            )}
          </button>
        ))}
        <button onClick={() => fetchList(activeTab)} disabled={loading} title="Rafraîchir" className="ml-auto mr-2 p-1.5 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-40">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 min-h-0">

        {/* ── LEFT: List ── */}
        <div className="flex flex-col gap-3 min-h-0">
          {/* Search + Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher : nom, téléphone, #ID, code retrait…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors"
              />
              {query && <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X size={13}/></button>}
            </div>
            <button
              onClick={() => setShowFilters(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${showFilters || activeFilters > 0 ? 'bg-teal-50 border-teal-200 text-teal-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <Filter size={13}/> Filtres {activeFilters > 0 && <span className="bg-teal-600 text-white text-[10px] px-1 rounded-full">{activeFilters}</span>}
            </button>
          </div>

          {/* Quick filters panel */}
          {showFilters && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-3">
              <div className="flex flex-wrap gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Paiement</label>
                  <div className="flex gap-1">
                    {['', 'MAXICASH', 'PAY_IN_STORE'].map(m => (
                      <button key={m} onClick={() => setFilterMethod(m)}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${filterMethod === m ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'}`}>
                        {m === '' ? 'Tous' : m === 'MAXICASH' ? 'Mobile money' : 'Boutique'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">Statut paiement</label>
                  <div className="flex gap-1">
                    {['', 'UNPAID', 'FAILED'].map(s => (
                      <button key={s} onClick={() => setFilterPayStatus(s)}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${filterPayStatus === s ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'}`}>
                        {s === '' ? 'Tous' : s === 'UNPAID' ? 'Non payé' : 'Paiement échoué'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="self-end">
                  <button onClick={() => setFilterUrgent(p => !p)}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border transition-colors ${filterUrgent ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}>
                    <Clock size={11}/> Urgents seulement
                  </button>
                </div>
              </div>
              {activeFilters > 0 && (
                <button onClick={() => { setFilterMethod(''); setFilterPayStatus(''); setFilterUrgent(false); }} className="text-[11px] text-gray-400 hover:text-gray-600 underline">
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          )}

          {/* Order rows */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-3 py-2.5 text-gray-400 font-medium">Commande</th>
                    <th className="text-left px-3 py-2.5 text-gray-400 font-medium">Client</th>
                    <th className="text-left px-3 py-2.5 text-gray-400 font-medium">Progression</th>
                    <th className="text-left px-3 py-2.5 text-gray-400 font-medium">Paiement</th>
                    <th className="text-right px-3 py-2.5 text-gray-400 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => {
                    const badges = order.badges ?? [];
                    const urgent = expiringSoon(order.reservedUntil) || expiringSoon(order.pickupExpiresAt)
                                || isOverdue(order.reservedUntil) || isOverdue(order.pickupExpiresAt);
                    return (
                      <tr
                        key={order.id}
                        onClick={() => { setSelected(order); fetchDetail(order.id); }}
                        className={`border-b border-gray-50 cursor-pointer transition-colors ${selected?.id === order.id ? 'bg-teal-50/60 border-teal-100' : urgent ? 'bg-orange-50/40 hover:bg-orange-50' : 'hover:bg-gray-50/80'}`}
                      >
                        <td className="px-3 py-2.5">
                          <span className="font-semibold text-teal-700">{order.displayId}</span>
                          <div className="text-gray-400 mt-0.5">{fmtDate(order.createdAt)}</div>
                          {badges.includes('reservation_expiring_soon') && <div className="text-[10px] text-orange-600 font-medium flex items-center gap-0.5 mt-0.5"><Clock size={9}/>Réservation expire bientôt</div>}
                          {badges.includes('pickup_expiring_soon')      && <div className="text-[10px] text-orange-600 font-medium flex items-center gap-0.5 mt-0.5"><Clock size={9}/>Retrait expire bientôt</div>}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-medium text-gray-900">{order.customer}</div>
                          <div className="text-gray-400">{order.phone || order.email || '—'}</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <MiniStepper status={order.status} paymentMethod={order.paymentMethod} />
                          {badges.includes('whatsapp_failed') && <div className="text-[10px] text-red-500 flex items-center gap-0.5 mt-0.5"><MessageCircle size={9}/>WhatsApp échoué</div>}
                          {badges.includes('whatsapp_sent')   && <div className="text-[10px] text-emerald-600 flex items-center gap-0.5 mt-0.5"><MessageCircle size={9}/>WhatsApp envoyé</div>}
                        </td>
                        <td className="px-3 py-2.5">
                          <Pill label={order.paymentStatusLabel} cls={PAY_STATUS_PILL[order.paymentStatus] ?? 'bg-gray-100 text-gray-600'} />
                          <div className="text-gray-400 mt-0.5">{order.paymentMethodLabel}</div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-gray-800">{fmtCurr(order.total, order.currency)}</td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">{loading ? <span className="flex items-center justify-center gap-2"><RefreshCw size={13} className="animate-spin"/>Chargement…</span> : 'Aucune commande dans cette vue.'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* ── RIGHT: Detail ── */}
        {selected ? (
          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-220px)] pr-0.5">
            {detailLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-400 justify-end animate-pulse"><RefreshCw size={11} className="animate-spin"/>Actualisation…</div>
            )}

            {/* === Header card: status + stepper === */}
            <Card>
              <div className={`h-1 ${['CANCELLED','EXPIRED'].includes(selected.status) ? 'bg-red-400' : selected.status === 'PICKED_UP' ? 'bg-emerald-500' : 'bg-teal-600'}`} />
              <CardContent className="pt-4 pb-4 px-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-gray-900">{selected.displayId}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Créée le {fmtDate(selected.createdAt, true)}</div>
                  </div>
                  <Pill label={selected.statusLabel} cls={ORDER_STATUS_PILL[selected.status] ?? 'bg-gray-100 text-gray-500'} />
                </div>

                {['CANCELLED','EXPIRED'].includes(selected.status) ? (
                  <div className={`flex items-start gap-2 text-xs p-2 rounded-lg ${selected.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                    {selected.status === 'CANCELLED' ? <XCircle size={13} className="shrink-0 mt-0.5"/> : <AlertTriangle size={13} className="shrink-0 mt-0.5"/>}
                    <span>{selected.status === 'CANCELLED' ? 'Commande annulée' : 'Délai expiré'}{selected.cancelReason ? ` — ${selected.cancelReason}` : ''}</span>
                  </div>
                ) : (
                  <DetailStepper status={selected.status} paymentMethod={selected.paymentMethod} />
                )}

                {/* Deadline pills */}
                {selected.status === 'RESERVED' && selected.reservedUntil && (
                  <div className={`text-xs p-2 rounded-lg flex items-center gap-1.5 ${isOverdue(selected.reservedUntil) ? 'bg-red-50 text-red-700 border border-red-100' : expiringSoon(selected.reservedUntil) ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                    <Clock size={11}/><span>Réservation jusqu'au <strong>{fmtDate(selected.reservedUntil, true)}</strong></span>
                  </div>
                )}
                {selected.status === 'READY_FOR_PICKUP' && selected.pickupExpiresAt && (
                  <div className={`text-xs p-2 rounded-lg flex items-center gap-1.5 ${isOverdue(selected.pickupExpiresAt) ? 'bg-red-50 text-red-700 border border-red-100' : expiringSoon(selected.pickupExpiresAt) ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-teal-50 text-teal-700 border border-teal-100'}`}>
                    <Clock size={11}/><span>Retrait avant le <strong>{fmtDate(selected.pickupExpiresAt, true)}</strong></span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* === Admin actions === */}
            {(selected.allowedActions ?? []).length > 0 && (
              <Card>
                <CardContent className="px-4 py-3 space-y-2">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Actions disponibles</p>
                  {(selected.allowedActions ?? []).map(action => {
                    const cfg = ACTION_CONFIG[action]; if (!cfg) return null;
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={action}
                        disabled={actionLoading}
                        onClick={() => setPendingAction(action)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all disabled:opacity-50 ${cfg.danger ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-gray-200 text-gray-700 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700'}`}
                      >
                        <Icon size={15} className="shrink-0"/><span className="flex-1">{cfg.label}</span>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* === A — Customer === */}
            <Section title="Client" icon={Phone}>
              <KV label="Nom" value={selected.customer} />
              <KV label="Téléphone" value={selected.phone ? <a href={`tel:${selected.phone}`} className="text-teal-700 underline">{selected.phone}</a> : null} />
              <KV label="Email" value={selected.email ? <a href={`mailto:${selected.email}`} className="text-teal-700 underline">{selected.email}</a> : null} />
            </Section>

            {/* === B — Order summary === */}
            <Section title="Résumé de commande" icon={Package}>
              <KV label="Code de retrait" value={<span className="font-mono text-sm font-bold tracking-widest bg-gray-100 px-2 py-0.5 rounded">{selected.pickupCode || '—'}</span>} />
              <KV label="Total" value={<span className="font-bold text-gray-900">{fmtCurr(selected.total, selected.currency)}</span>} />
              <KV label="Fulfillment" value="Retrait en boutique" />
              <KV label="Prête depuis" value={selected.readyAt ? fmtDate(selected.readyAt, true) : null} />
              {/* Items list */}
              <div className="mt-2 space-y-2 border-t border-gray-50 pt-2">
                {(selected.lines ?? []).map((l, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {l.image ? <img src={l.image} alt="" className="w-full h-full object-cover"/> : <Package size={14} className="m-auto mt-2.5 text-gray-300"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-800 truncate">{l.name}</div>
                      <div className="text-[10px] text-gray-400">Qté {l.quantity}{l.size ? ` · ${l.size}` : ''}{l.color ? ` · ${l.color}` : ''}</div>
                    </div>
                    <div className="text-xs font-semibold text-gray-700 shrink-0">{fmtCurr(l.price * l.quantity, selected.currency)}</div>
                  </div>
                ))}
              </div>
            </Section>

            {/* === C — Payment === */}
            <Section title="Paiement" icon={selected.paymentMethod === 'MAXICASH' ? CreditCard : Banknote}>
              <div className="flex items-center justify-between">
                <KV label="Méthode" value={selected.paymentMethodLabel} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">Statut</span>
                <Pill label={selected.paymentStatusLabel} cls={PAY_STATUS_PILL[selected.paymentStatus] ?? 'bg-gray-100 text-gray-600'} />
              </div>
              {/* MaxiCash transactions */}
              {(selected.maxicashTransactions ?? []).length > 0 && (
                <div className="mt-2 space-y-1.5 border-t border-gray-50 pt-2">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Transactions MaxiCash</p>
                  {(selected.maxicashTransactions ?? []).map(tx => (
                    <div key={tx.id} className="bg-gray-50 rounded-lg px-3 py-2 space-y-1">
                      <KV label="Référence" value={tx.reference} mono />
                      <KV label="Statut"    value={tx.status} />
                      {tx.providerTxId  && <KV label="ID fournisseur" value={tx.providerTxId} mono />}
                      {tx.failureReason && <KV label="Raison échec"   value={<span className="text-red-600">{tx.failureReason}</span>} />}
                      {tx.completedAt   && <KV label="Complété"        value={fmtDate(tx.completedAt, true)} />}
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* === E — WhatsApp Notification === */}
            <Section title="Notification WhatsApp" icon={MessageCircle}>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">Statut</span>
                <span className={`font-semibold text-xs ${selected.whatsappStatus === 'SENT' ? 'text-emerald-600' : selected.whatsappStatus === 'FAILED' ? 'text-red-500' : selected.whatsappStatus === 'PENDING' ? 'text-amber-500' : 'text-gray-400'}`}>
                  {selected.whatsappStatus === 'SENT' ? '✓ Envoyé' : selected.whatsappStatus === 'FAILED' ? '✗ Échoué' : selected.whatsappStatus === 'PENDING' ? '⏳ En attente' : 'Non envoyé'}
                </span>
              </div>
              {selected.whatsappSentAt && <KV label="Envoyé le" value={fmtDate(selected.whatsappSentAt, true)} />}
              {selected.whatsappError  && <KV label="Erreur"    value={<span className="text-red-500 text-[10px] break-all">{selected.whatsappError}</span>} />}
              {(selected.status === 'READY_FOR_PICKUP') && (
                <button
                  onClick={retryWhatsapp}
                  disabled={actionLoading}
                  className="w-full mt-1 text-xs text-teal-700 border border-teal-200 bg-teal-50 hover:bg-teal-100 rounded-lg py-2 font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <MessageCircle size={11}/>
                  {selected.whatsappStatus === 'SENT' ? 'Renvoyer le message WhatsApp' : 'Envoyer le message WhatsApp'}
                </button>
              )}
              {/* Full notification log */}
              {(selected.notifications ?? []).length > 0 && (
                <div className="mt-2 space-y-1.5 border-t border-gray-50 pt-2">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Historique envois</p>
                  {(selected.notifications ?? []).map(n => (
                    <div key={n.id} className="flex items-start justify-between text-[11px] bg-gray-50 px-2 py-1.5 rounded">
                      <span className={`font-medium ${n.status === 'SENT' ? 'text-emerald-600' : n.status === 'FAILED' ? 'text-red-500' : 'text-amber-500'}`}>{n.status}</span>
                      <span className="text-gray-400">{fmtDate(n.sentAt ?? n.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* === F — Audit trail === */}
            <Section title="Historique des statuts" icon={History} defaultOpen={false}>
              {(selected.statusHistory ?? []).length === 0
                ? <p className="text-xs text-gray-400 py-1">Aucun historique disponible.</p>
                : (selected.statusHistory ?? []).map(h => (
                  <div key={h.id} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-800">
                        {h.fromStatusLabel ? `${h.fromStatusLabel} → ` : ''}<span className="text-teal-700">{h.toStatusLabel}</span>
                      </div>
                      {h.reason    && <div className="text-[10px] text-gray-500 italic mt-0.5">{h.reason}</div>}
                      {h.changedBy && <div className="text-[10px] text-gray-400 mt-0.5">{h.changedBy.startsWith('ADMIN:') ? `Admin #${h.changedBy.replace('ADMIN:','')}` : h.changedBy} · {fmtDate(h.createdAt)}</div>}
                    </div>
                  </div>
                ))
              }
            </Section>

          </div>
        ) : (
          <div className="hidden lg:flex items-center justify-center border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm min-h-[300px]">
            Sélectionnez une commande pour voir le détail
          </div>
        )}
      </div>
    </div>
  );
}
