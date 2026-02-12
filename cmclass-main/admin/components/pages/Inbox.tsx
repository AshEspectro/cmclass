import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardContent } from '../Card';
import { Button } from '../Button';
import { Search, RefreshCw, MailOpen } from 'lucide-react';
import { inboundEmailApi } from '../../services/inboundEmailApi';
import type { InboundEmailDetail, InboundEmailSummary } from '../../services/inboundEmailApi';

const BACKEND_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

export function Inbox() {
  const [emails, setEmails] = useState<InboundEmailSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selected, setSelected] = useState<InboundEmailDetail | null>(null);
  const [meta, setMeta] = useState<{ page: number; pageSize: number; total: number }>({
    page: 1,
    pageSize: 20,
    total: 0,
  });
  const [search, setSearch] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadEmails = async (
    page = meta.page,
    pageSize = meta.pageSize,
    query = search,
    include = includeArchived,
  ) => {
    setLoading(true);
    setListError(null);
    try {
      const res = await inboundEmailApi.list(query, page, pageSize, include);
      const data = Array.isArray(res?.data) ? res.data : [];
      setEmails(data);
      setMeta(res?.meta || { page, pageSize, total: data.length });
      if (data.length && (!selectedId || !data.some((item) => item.id === selectedId))) {
        setSelectedId(data[0].id);
      }
      if (data.length === 0) {
        setSelectedId(null);
        setSelected(null);
      }
    } catch (err: any) {
      setListError(err?.message || 'Erreur lors du chargement des mails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails(1, meta.pageSize, '', includeArchived);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      loadEmails(1, meta.pageSize, search, includeArchived);
    }, 300);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, includeArchived]);

  useEffect(() => {
    if (!selectedId) {
      setSelected(null);
      return;
    }
    setDetailLoading(true);
    setDetailError(null);
    inboundEmailApi
      .get(selectedId)
      .then((data) => setSelected(data))
      .catch((err: any) => setDetailError(err?.message || 'Erreur lors du chargement du mail'))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  const formatDate = (value?: string | null) => {
    if (!value) return '-';
    return new Date(value).toLocaleString('fr-FR');
  };

  const stats = useMemo(() => {
    return {
      total: meta.total || emails.length,
      selected: selected ? 1 : 0,
    };
  }, [emails.length, meta.total, selected]);

  const canPrev = meta.page > 1;
  const canNext = meta.page * meta.pageSize < meta.total;

  const stripHtml = (html?: string | null) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const bodyText = selected?.text?.trim() || stripHtml(selected?.html);

  const handleArchive = async (archived: boolean) => {
    if (!selected) return;
    setActionLoading(true);
    setDetailError(null);
    try {
      const updated = await inboundEmailApi.archive(selected.id, archived);
      setSelected(updated);
      await loadEmails(meta.page, meta.pageSize, search, includeArchived);
    } catch (err: any) {
      setDetailError(err?.message || 'Erreur lors de la mise à jour');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const ok = window.confirm('Supprimer définitivement ce mail ?');
    if (!ok) return;
    setActionLoading(true);
    setDetailError(null);
    try {
      await inboundEmailApi.remove(selected.id);
      await loadEmails(1, meta.pageSize, search, includeArchived);
    } catch (err: any) {
      setDetailError(err?.message || 'Erreur lors de la suppression');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Mails entrants</p>
            <p className="text-2xl mb-1">{stats.total}</p>
            <p className="text-sm text-gray-500">Total stocké en base</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Sélection</p>
            <p className="text-2xl mb-1">{stats.selected}</p>
            <p className="text-sm text-gray-500">Mail ouvert</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Dernière réception</p>
            <p className="text-sm text-gray-700">
              {emails[0]?.receivedAt ? formatDate(emails[0].receivedAt) : '—'}
            </p>
            <p className="text-sm text-gray-500">Basé sur la liste actuelle</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3>Boîte Mail</h3>
                <p className="text-sm text-gray-500 mt-1">Mails entrants</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => loadEmails(1, meta.pageSize, search, includeArchived)}>
                <RefreshCw size={16} />
                Actualiser
              </Button>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Rechercher (objet, email, destinataire)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded w-full focus:outline-none focus:border-[#007B8A] transition-colors text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-500 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={includeArchived}
                  onChange={(e) => setIncludeArchived(e.target.checked)}
                  className="h-4 w-4 border-gray-300 rounded"
                />
                Afficher archivés
              </label>
            </div>
          </CardHeader>
          <CardContent className="px-0 py-0">
            {loading ? (
              <div className="p-6 text-sm text-gray-500">Chargement...</div>
            ) : listError ? (
              <div className="p-6 text-sm text-red-600">{listError}</div>
            ) : emails.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">Aucun mail entrant.</div>
            ) : (
              <div className="max-h-[540px] overflow-auto">
                {emails.map((mail) => {
                  const isActive = mail.id === selectedId;
                  const fromLabel = mail.fromName
                    ? `${mail.fromName} <${mail.fromEmail || ''}>`
                    : mail.fromEmail || 'Inconnu';
                  return (
                    <button
                      key={mail.id}
                      onClick={() => setSelectedId(mail.id)}
                      className={`w-full text-left px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        isActive ? 'bg-[#e6f4f6]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{mail.subject || '(Sans sujet)'}</p>
                        <span className="text-xs text-gray-500">{formatDate(mail.receivedAt || mail.createdAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{fromLabel}</p>
                      <p className="text-xs text-gray-600 mt-2 overflow-hidden">{mail.preview || '—'}</p>
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100">{mail.protocol || 'imap'}</span>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100">{mail.mailbox || 'INBOX'}</span>
                        {mail.archived && (
                          <span className="px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700">Archivé</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
          {!loading && !listError && emails.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 text-sm text-gray-500">
              <span>
                Page {meta.page} • {meta.total} éléments
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canPrev}
                  onClick={() => loadEmails(meta.page - 1, meta.pageSize, search, includeArchived)}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canNext}
                  onClick={() => loadEmails(meta.page + 1, meta.pageSize, search, includeArchived)}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3>Détails du Mail</h3>
                <p className="text-sm text-gray-500 mt-1">Lecture du contenu entrant</p>
              </div>
              {selected && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MailOpen size={16} />
                  <span>ID #{selected.id}</span>
                </div>
              )}
            </div>
            {selected && (
              <div className="mt-4 flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={actionLoading}
                  onClick={() => handleArchive(!selected.archived)}
                >
                  {selected.archived ? 'Restaurer' : 'Archiver'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={actionLoading}
                  className="text-red-600 border-red-200 hover:border-red-300 hover:text-red-700"
                  onClick={handleDelete}
                >
                  Supprimer
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {detailLoading ? (
              <div className="text-sm text-gray-500">Chargement du mail...</div>
            ) : detailError ? (
              <div className="text-sm text-red-600">{detailError}</div>
            ) : !selected ? (
              <div className="text-sm text-gray-500">Sélectionnez un mail pour le consulter.</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Objet</p>
                  <p className="text-lg font-semibold">
                    {selected.subject || '(Sans sujet)'}{' '}
                    {selected.archived && <span className="text-xs text-yellow-700 ml-2">(Archivé)</span>}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">De</p>
                    <p>{selected.fromName ? `${selected.fromName} <${selected.fromEmail || ''}>` : selected.fromEmail || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Reçu le</p>
                    <p>{formatDate(selected.receivedAt || selected.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Pour</p>
                    <p>{selected.toEmails?.length ? selected.toEmails.join(', ') : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Copie</p>
                    <p>{selected.ccEmails?.length ? selected.ccEmails.join(', ') : '-'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Message</p>
                  <div className="bg-gray-50 border border-gray-200 rounded p-4 text-sm text-gray-700 whitespace-pre-wrap min-h-[200px]">
                    {bodyText || '(Aucun contenu)'}
                  </div>
                </div>

                {Array.isArray(selected.attachments) && selected.attachments.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Pièces jointes</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {selected.attachments.map((att: any, index: number) => {
                        const url = att?.url
                          ? att.url.startsWith('http')
                            ? att.url
                            : `${BACKEND_URL}${att.url}`
                          : null;
                        const sizeLabel = att?.size ? `${Math.round(att.size / 1024)} KB` : '—';
                        return (
                          <li
                            key={`${selected.id}-att-${index}`}
                            className="flex items-center justify-between border border-gray-100 rounded px-3 py-2"
                          >
                            <div>
                              <p className="text-sm">{att?.filename || `Attachment ${index + 1}`}</p>
                              <p className="text-xs text-gray-500">{att?.contentType || '—'} • {sizeLabel}</p>
                            </div>
                            {url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-[#007B8A] hover:underline"
                              >
                                Télécharger
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
