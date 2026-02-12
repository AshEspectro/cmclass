import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function LegalPage() {
    const { type: paramType } = useParams();
    const type = paramType || 'mentions-legales';
    const [data, setData] = useState<{ title: string; content: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLegal = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${BACKEND_URL}/public/legal/${type}`);
                if (res.ok) {
                    setData(await res.json());
                } else {
                    setData(null);
                }
            } catch (err) {
                console.error("Failed to fetch legal content", err);
                setData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchLegal();
    }, [type]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-[#007B8A] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-20 lg:px-40">
            <div className="max-w-4xl mx-auto">
                <nav className="flex gap-4 mb-12 text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-4">
                    <Link to="/legal/mentions-legales" className={`hover:text-[#007B8A] transition-colors ${type === 'mentions-legales' ? 'text-[#007B8A] font-bold' : ''}`}>Mentions Légales</Link>
                    <Link to="/legal/politique-protection-donnees" className={`hover:text-[#007B8A] transition-colors ${type === 'politique-protection-donnees' ? 'text-[#007B8A] font-bold' : ''}`}>Protection des données</Link>
                    <Link to="/legal/cgv" className={`hover:text-[#007B8A] transition-colors ${type === 'cgv' ? 'text-[#007B8A] font-bold' : ''}`}>CGV</Link>
                </nav>

                <h1 className="text-3xl md:text-4xl font-light mb-12 uppercase tracking-[0.2em] text-gray-900 border-l-4 border-[#007B8A] pl-6">
                    {data?.title || (type === 'mentions-legales' ? 'Mentions Légales' : type === 'cgv' ? 'Conditions Générales de Vente' : 'Politique de protection des données')}
                </h1>

                <div className="prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed space-y-6">
                    {data?.content ? (
                        <div dangerouslySetInnerHTML={{ __html: data.content.replace(/\n/g, '<br/>') }} />
                    ) : (
                        <p className="italic text-gray-400">Le contenu de cette section est en cours de rédaction.</p>
                    )}
                </div>

                <div className="mt-20 pt-8 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 uppercase tracking-widest">
                    <span>CMClass © 2024</span>
                    <button onClick={() => window.print()} className="hover:text-[#007B8A] transition-colors">Version imprimable</button>
                </div>
            </div>
        </div>
    );
}
