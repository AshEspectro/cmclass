import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../Card';
import { Button } from '../Button';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { legalApi, type LegalContent } from '../../services/legalApi';

interface LegalEditorProps {
    type: string;
    label: string;
    initialData: LegalContent;
    onSave: (type: string, title: string, content: string) => Promise<void>;
    isSaving: boolean;
    status: { type: 'success' | 'error'; message: string } | null;
}

function LegalEditor({ type, label, initialData, onSave, isSaving, status }: LegalEditorProps) {
    const [localTitle, setLocalTitle] = useState(initialData.title);
    const [localContent, setLocalContent] = useState(initialData.content);

    useEffect(() => {
        setLocalTitle(initialData.title);
        setLocalContent(initialData.content);
    }, [initialData.title, initialData.content]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium">{label}</h3>
                        <p className="text-xs text-gray-500 mt-1">Gérer le contenu de {type}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {status && (
                            <div className={`flex items-center gap-1 text-xs ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {status.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                {status.message}
                            </div>
                        )}
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onSave(type, localTitle, localContent)}
                            disabled={isSaving}
                        >
                            <Save size={16} />
                            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Titre Affiché</label>
                    <input
                        type="text"
                        value={localTitle}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        placeholder={`Titre pour ${label}`}
                        className="w-full px-4 py-3 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007B8A] transition-all bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Contenu (HTML supporté)</label>
                    <textarea
                        rows={12}
                        value={localContent}
                        onChange={(e) => setLocalContent(e.target.value)}
                        placeholder="Écrivez le contenu ici..."
                        className="w-full px-4 py-3 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007B8A] transition-all bg-gray-50 font-mono text-sm"
                    />
                </div>
            </CardContent>
        </Card>
    );
}

export function LegalPageManager() {
    const [contents, setContents] = useState<LegalContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [status, setStatus] = useState<{ id: string; type: 'success' | 'error'; message: string } | null>(null);

    const legalTypes = [
        { id: 'mentions-legales', label: 'Mentions Légales' },
        { id: 'politique-protection-donnees', label: 'Protection des données' },
        { id: 'cgv', label: 'CGV' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await legalApi.getAll();
                setContents(data);
            } catch (err) {
                console.error('Failed to load legal contents', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleUpdate = async (type: string, title: string, content: string) => {
        setSavingId(type);
        setStatus(null);
        try {
            await legalApi.update({ type, title, content });
            setStatus({ id: type, type: 'success', message: 'Mis à jour avec succès' });
            const updated = await legalApi.getAll();
            setContents(updated);
        } catch (err: any) {
            console.error(err);
            setStatus({ id: type, type: 'error', message: err.message || 'Erreur lors de la mise à jour' });
        } finally {
            setSavingId(null);
        }
    };

    const getContent = (type: string) => {
        const c = contents.find((item) => item.type === type);
        return c || { type, title: legalTypes.find(t => t.id === type)?.label || '', content: '' };
    };

    if (loading) {
        return <div className="h-96 bg-gray-50 animate-pulse rounded-xl" />;
    }

    return (
        <div className="space-y-8">
            {legalTypes.map((legalType) => (
                <LegalEditor
                    key={legalType.id}
                    type={legalType.id}
                    label={legalType.label}
                    initialData={getContent(legalType.id)}
                    onSave={handleUpdate}
                    isSaving={savingId === legalType.id}
                    status={status?.id === legalType.id ? { type: status.type, message: status.message } : null}
                />
            ))}
        </div>
    );
}
