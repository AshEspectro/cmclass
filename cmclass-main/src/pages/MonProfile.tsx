import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/authApi";

export default function MonProfile() {
    const { user, accessToken, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        title: "",
        phoneNumber: "",
        dateOfBirth: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                title: user.title || "",
                phoneNumber: user.phoneNumber || "",
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessToken) return;

        setLoading(true);
        setMessage(null);

        try {
            await authApi.updateMe(accessToken, formData);
            await refreshUser(); // Update context with new data
            setMessage({ type: "success", text: "Profil mis à jour avec succès !" });
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "Erreur lors de la mise à jour du profil" });
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

    return (
        <div className="w-full min-h-screen bg-gray-50 py-24 px-6 md:px-12 lg:px-20">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">Mon Profil</h1>
                <p className="text-gray-500 mb-10">Gérez vos informations personnelles et préférences.</p>

                {message && (
                    <div className={`p-4 mb-8 rounded-xl ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Civilité</label>
                            <select
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007B8A] transition-all"
                            >
                                <option value="">Sélectionnez</option>
                                <option value="M.">M.</option>
                                <option value="Mme.">Mme.</option>
                                <option value="Mlle.">Mlle.</option>
                            </select>
                        </div>

                        {/* Email (Readonly) */}
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">E-mail (Identifiant)</label>
                            <input
                                type="email"
                                value={user?.email || ""}
                                disabled
                                className="w-full border border-gray-200 bg-gray-100 px-4 py-3 rounded-xl text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        {/* First Name */}
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Prénom</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007B8A] transition-all"
                                placeholder="Votre prénom"
                            />
                        </div>

                        {/* Last Name */}
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Nom</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007B8A] transition-all"
                                placeholder="Votre nom"
                            />
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Téléphone</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007B8A] transition-all"
                                placeholder="Votre numéro"
                            />
                        </div>

                        {/* DOB */}
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Date de naissance</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007B8A] transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-8 py-3 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-10 py-3 rounded-full bg-[#007B8A] text-white text-sm font-semibold hover:bg-black transition-all shadow-md active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
