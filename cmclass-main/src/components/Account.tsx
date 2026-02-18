import React, { useState } from "react";
import { motion } from "motion/react";
import { User, LogOut } from "lucide-react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { GoogleSignInButton } from "./GoogleSignInButton";

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
  const { isAuthenticated, user, login, logout, oauthLogin } = useAuth();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(loginData);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setLoginData({ email: "", password: "" });
  };

  const handleGoogleCredential = async (credential: string) => {
    setError(null);
    setLoading(true);
    try {
      await oauthLogin({ provider: "google", token: credential });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // INFO BLOCK
  const MyLVInfo = () => (
    <div className=" mt-8 py-8 px-8 bg-gray-100 style-none rounded-md text-sm text-gray-700 space-y-2">
      <p className="font-medium text-xs">Ce que vous allez trouver dans votre compte Cmclass</p>
      <ul className="list-disc list-inside space-y-2 pl-8">
        <li className=" py-2 text-xs">Accès à votre historique de commandes</li>
        <li className="border-t border-gray-200 py-2 text-xs">Gérer vos informations personnelles</li>
        <li className="border-t border-gray-200 py-2 text-xs">Récevoir des communications digitales de Cmclass</li>
        <li className="border-t border-gray-200 py-2 text-xs">Enregitrer votre liste d'envies</li>
      </ul>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Sliding Panel */}
      <motion.div
        className="ml-auto relative bg-white w-full md:w-1/2 lg:w-1/2 h-full py-6 pt-10    overflow-auto"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 md:px-16 lg:px-32">
          {isAuthenticated ? (
            // ------------------------------------------------------------------
            // LOGGED IN
            // ------------------------------------------------------------------
            <div className="min-h-full flex  flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">MON COMPTE</h2>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-[#007B8A] transition-colors"
                >
                  <LogOut size={20} />
                  <span>Déconnexion</span>
                </button>
              </div>

              <p className="text-gray-600">
                Bienvenue {user?.firstName || user?.email || ""} dans votre espace personnel.
              </p>
            </div>
          ) : (
            // ------------------------------------------------------------------
            // LOGIN ONLY (NO SIGNUP TAB, NO MULTIPLE SECTIONS)
            // ------------------------------------------------------------------
            <div>
              {/* Close Button */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="absolute right-8 top-8 text-gray-500 hover:text-black transition"
                >
                  ✕
                </button>
              )}
              <h2 className="t font-medium text-sm py-6">Identification</h2>

              <p className="py-6 font-medium text-xs">J'ai déja un compte</p>

              {/* Google Login */}
              <GoogleSignInButton
                className=" hover:bg-gray-200 transition py-3 mb-4"
                text="signin_with"
                onCredential={handleGoogleCredential}
                onError={(msg) => setError(msg)}
              />

              <div className="flex items-center my-4">
                <span className="flex-1 border-b border-gray-300" />
                <span className="px-2 my-6 text-gray-500">OU</span>
                <span className="flex-1 border-b border-gray-300" />
              </div>

              <form onSubmit={handleLogin}>
                <p className="font-regular flex justify-end text-xs ">champs obligatoires*</p>
                <p className="font-regular pb-2 text-xs ">adresse mail*</p>
                <input
                  type="email"
                  placeholder="Login*"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full border border-gray-300 px-4 py-3 mb-6 rounded-md focus:border-[#007B8A]"
                  required
                />
                <p className="font-regular pb-2 text-xs ">Mot de passe*</p>
                <input
                  type="password"
                  placeholder="Password*"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="w-full border border-gray-300 px-4 py-3  rounded-md focus:border-[#007B8A]"
                  required
                />

                <div className="flex items-center justify-between mt-4">
                  <Link
                    to="/forgot-password"
                    onClick={onClose}
                    className="text-[#007B8A] hover:underline text-xs"
                  >
                    J'ai oublier mon mot de passe?
                  </Link>
                  <Link
                    to="/alternative-login"
                    onClick={onClose}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    M'envoyer le lien
                  </Link>
                </div>

                {error && <p className="text-red-500 text-xs mt-4">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#000000] text-md text-white py-3 my-4 rounded-3xl hover:bg-[#006170] disabled:bg-gray-400"
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </button>
              </form>

              {/* LOWER SECTION */}
            </div>
          )}
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6 ">
          <div className="px-8 md:px-16 lg:px-32">
            
            {isAuthenticated ? (
              <div className="space-y-3">
                <Link to="/mes-commandes" onClick={onClose}>
                  <button className="w-full border-2 border-[#007B8A] py-2 rounded-3xl hover:bg-[#f0fafa] transition">
                    Voir mes commandes
                  </button>
                </Link>
                <Link to="/monprofil" onClick={onClose}>
                  <button className="w-full border-2 border-[#007B8A] py-2 rounded-3xl hover:bg-[#f0fafa] transition">
                    Consulter mon profil CMclass
                  </button>
                </Link>
              </div>
            ) : (
              <Link to="/compte" onClick={onClose}>
                <button className="w-full border-2 border-[#007B8A] py-2 rounded-3xl hover:bg-[#f0fafa] transition">
                  Créer un compte
                </button>
              </Link>
            )}
          </div>
        </div>
        <div className="block md:hidden">
          <MyLVInfo />
        </div>
      </motion.div>
    </div>
  );
};
