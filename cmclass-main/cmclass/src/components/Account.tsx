import React, { useState } from "react";
import { motion } from "motion/react";
import { User, LogOut } from "lucide-react";
import { createPortal } from "react-dom";
import { SiGoogle } from "react-icons/si";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useGoogleOAuth } from "./GoogleAut";

// WRAPPER (User icon trigger)
export const UserAccountOverlayWrapper = () => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOverlayOpen(true)}
        aria-label="Compte"
        className="hover:text-[#007B8A] transition-colors duration-300"
      >
        <User size={22} />
      </button>

      {isOverlayOpen &&
        createPortal(
          <Account onClose={() => setIsOverlayOpen(false)} />,
          document.body
        )}
    </>
  );
};

// ACCOUNT PANEL
interface AccountProps {
  onClose: () => void;
}

export const Account = ({ onClose }: AccountProps) => {
  const { user, isAuthenticated, login, logout, loading: authLoading } = useAuth();
  const { redirectToGoogle } = useGoogleOAuth({
    onSuccess: () => onClose(),
    onError: (msg) => setError(msg),
  });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔑 [Account Overlay] handleLogin triggered for:", loginData.email);
    setError(null);
    setLoading(true);
    try {
      console.log("📡 [Account Overlay] Calling login...");
      await login(loginData.email, loginData.password, true);
      console.log("✅ [Account Overlay] Login success");
    } catch (err: any) {
      console.error("❌ [Account Overlay] Login failed:", err);
      setError(err?.message || "Échec de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  // INFO BLOCK
  const MyCMInfo = () => (
    <div className=" mt-8 py-8 px-8 bg-gray-100 style-none rounded-md text-sm text-gray-700 space-y-2">
      <p className="font-medium text-xs">Ce que vous trouverez dans votre compte CMClass :</p>
      <ul className="list-disc list-inside space-y-2 pl-8">
        <li className=" py-2 text-xs" >Accéder à votre historique de commandes</li>
        <li className="border-t border-gray-200 py-2 text-xs" >Gérer vos informations personnelles</li>
        <li className="border-t border-gray-200 py-2 text-xs" >Recevoir les communications digitales</li>
        <li className="border-t border-gray-200 py-2 text-xs" >Enregistrer votre wishlist</li>
      </ul>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Sliding Panel */}
      <motion.div
        className="ml-auto relative bg-white w-full md:w-1/2 lg:w-1/2 h-full py-6 pt-10 overflow-auto shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 md:px-16 lg:px-32">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-8 top-8 text-gray-500 hover:text-black transition"
            >
              ✕
            </button>
          )}

          {isAuthenticated ? (
            // ------------------------------------------------------------------
            // LOGGED IN
            // ------------------------------------------------------------------
            <div className="min-h-full flex flex-col">
              <div className="flex justify-between items-center mb-6 mt-4">
                <h2 className="text-xl font-semibold uppercase tracking-tight">Mon Compte</h2>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-[#007B8A] transition-colors"
                >
                  <LogOut size={20} />
                  <span>Déconnexion</span>
                </button>
              </div>

              <div className="py-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Bienvenue,</p>
                <p className="text-lg font-medium">
                  {user?.name || user?.username || user?.email}
                </p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-8">
                <Link to="/wishlist" onClick={onClose} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                  <p className="font-medium text-sm">Ma Wishlist</p>
                  <p className="text-xs text-gray-500">Voir vos articles enregistrés</p>
                </Link>
                <Link to="/panier" onClick={onClose} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                  <p className="font-medium text-sm">Mon Panier</p>
                  <p className="text-xs text-gray-500">Finaliser vos achats</p>
                </Link>
                {user?.role === 'ADMIN' && (
                  <a href="/admin" className="p-4 border border-[#007B8A]/20 bg-[#007B8A]/5 rounded-lg hover:bg-[#007B8A]/10 transition">
                    <p className="font-medium text-sm text-[#007B8A]">Interface Admin</p>
                    <p className="text-xs text-gray-500">Gérer la boutique</p>
                  </a>
                )}
              </div>
            </div> 
          ) : (
            // ------------------------------------------------------------------
            // LOGIN
            // ------------------------------------------------------------------
            <div>
              <h2 className="font-medium text-sm py-6">IDENTIFICATION</h2>

              <p className="py-6 font-medium text-xs">J'ai déjà un compte.</p>

              {/* Google Login */}
              <button
                type="button"
                onClick={() => {
                  redirectToGoogle();
                }}
                
              >
                <SiGoogle size={22} />
                Se connecter avec Google
              </button>

              <div className="flex items-center my-4">
                <span className="flex-1 border-b border-gray-300" />
                <span className="px-2 my-6 text-gray-500 text-xs">OU</span>
                <span className="flex-1 border-b border-gray-300" />
              </div>

              <form onSubmit={handleLogin}>
                <p className="font-regular flex justify-end text-[10px] text-gray-400 mb-2">Champs obligatoires*</p>

                <div className="space-y-4">
                  <div>
                    <p className="font-regular pb-2 text-xs">E-mail*</p>
                    <input
                      type="email"
                      placeholder="E-mail"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="w-full border border-gray-300 px-4 py-3 rounded-md focus:border-[#007B8A] focus:outline-none"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <p className="font-regular pb-2 text-xs">Mot de passe*</p>
                    <input
                      type="password"
                      placeholder="Mot de passe"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      className="w-full border border-gray-300 px-4 py-3 rounded-md focus:border-[#007B8A] focus:outline-none"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

                <button
                  type="button"
                  className="text-[#007B8A] hover:underline my-4 text-xs block"
                >
                  Mot de passe oublié ?
                </button>

                <p className="text-xs text-gray-500 mt-2">
                  Ou utilisez un lien de connexion unique pour vous connecter. Envoyez-moi le lien.
                </p>

                <button
                  type="submit"
                  disabled={loading || authLoading}
                  className="w-full bg-[#000000] text-sm text-white py-4 mt-6 rounded-3xl hover:bg-gray-800 disabled:opacity-50 transition-all font-medium tracking-wide"
                >
                  {loading ? "Connexion..." : "SE CONNECTER"}
                </button>
              </form>
            </div>
          )}
        </div>

        {!isAuthenticated && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="px-8 md:px-16 lg:px-32">
              <p className="font-medium text-md my-6">Je n'ai pas de compte.</p>
              <p className="text-gray-500 font-medium text-xs mb-6 leading-relaxed">
                Créez un compte MyCM pour découvrir votre wishlist et votre historique de commandes.
              </p>
              <Link to="/compte" onClick={onClose}>
                <button className="w-full border border-[#007B8A] text-[#007B8A] py-3 rounded-3xl hover:bg-[#f0fafa] transition font-medium text-sm">
                  CRÉER UN COMPTE
                </button>
              </Link>
            </div>
          </div>
        )}

        <div className="px-8 md:px-16 lg:px-32 mt-4 pb-12">
          <MyCMInfo />
        </div>
      </motion.div>
    </div>
  );
};
