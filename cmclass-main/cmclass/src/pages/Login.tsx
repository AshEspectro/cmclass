import { useState, useEffect } from "react";
import { SiGoogle } from "react-icons/si";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useGoogleOAuth } from "../components/GoogleAut";

export default function AccountPage() {
  console.log("🚀 [Login] Rendering AccountPage");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { redirectToGoogle } = useGoogleOAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("📦 [Login] Component Mounted");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔑 [Login] handleLogin triggered for:", loginData.email);
    setError(null);
    setLoading(true);
    try {
      console.log("📡 [Login] Calling AuthContext.login...");
      await login(loginData.email, loginData.password, true);
      console.log("✅ [Login] Success! Navigating to /home...");
      navigate("/home");
    } catch (err: any) {
      console.error("❌ [Login] Failed:", err);
      setError(err?.message || "Échec de la connexion. Veuillez vérifier vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  const Info = () => (
    <div className="bg-gray-50 border border-none px-8 py-10 w-full max-w-lg mx-auto">
      <p className="font-regular text-xs tracking-wider uppercase text-gray-700 mb-6 font-bold">
        VOTRE COMPTE CMCLASS
      </p>

      <ul className="space-y-6 text-gray-700 text-sm leading-relaxed">
        <li>Suivez vos commandes, réparations et accédez à vos factures.</li>
        <li className="pt-6 border-t border-gray-300">Gérez vos informations personnelles.</li>
        <li className="pt-6 border-t border-gray-300">Recevez les communications exclusives de CMclass.</li>
        <li className="pt-6 border-t border-gray-300">Créez votre wishlist, parcourez les looks et partagez.</li>
      </ul>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-white py-16 px-6 md:px-12 lg:px-20 flex justify-center">
      <div className="w-full max-w-8xl mt-24 grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* LEFT COLUMN — LOGIN (2/3) */}
        <main className="col-span-1 md:col-span-2 w-full md:max-w-3xl mx-0">
          {/* Heading */}
          <h1 className="text-xl font-semibold mb-2 tracking-tight">Bienvenue</h1>
          <p className="text-sm text-gray-600 mb-10">
            Connectez-vous avec votre adresse e-mail et votre mot de passe.
          </p>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={() => {
              console.log("🔵 [Login] Google Sign-In clicked");
              redirectToGoogle();
            }}
            className="w-full bg-gray-100 py-4 rounded-4xl flex items-center justify-center gap-3 text-sm border border-gray-300 hover:bg-gray-200 transition mb-6"
          >
            <SiGoogle size={20} /> Se connecter avec Google
          </button>

          <p className="text-right text-xs text-gray-500 mb-2">Champs obligatoires*</p>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email */}
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">E-mail*</label>
              <input
                type="email"
                placeholder="Entrez votre e-mail"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full border border-gray-300 px-4 py-3 rounded-md focus:outline-none focus:border-[#007B8A] text-sm"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1">Mot de passe*</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Entrez votre mot de passe"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 rounded-md focus:outline-none focus:border-[#007B8A] text-sm"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 hover:text-black"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>

              <Link to="/forgot-password">
                <button type="button" className="pt-4 text-[#007B8A] text-sm hover:underline w-fit">
                  Mot de passe oublié ?
                </button>
              </Link>
            </div>

            {/* Submit */}
            <div className="flex flex-col items-center md:items-end space-y-4 mt-8">
              {error && (
                <p className="text-sm text-red-600 w-full md:text-right font-medium">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-[#007B8A] text-white py-3.5 rounded-3xl px-28 text-sm tracking-wide hover:bg-black transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
              >
                {loading ? "Connexion en cours..." : "Se connecter"}
              </button>

              {/* Create Account Link */}
              <div className="flex flex-col items-center md:items-end mt-6">
                <p className="text-sm text-gray-600 mb-1">Vous n’avez pas de compte ?</p>
                <Link to="/compte">
                  <span className="text-sm font-semibold underline text-[#007B8A] hover:text-black transition-colors">
                    Créer un compte CMclass
                  </span>
                </Link>
              </div>
            </div>

          </form>

          {/* Mobile Info */}
          <div className="block md:hidden mt-16">
            <Info />
          </div>
        </main>

        {/* RIGHT COLUMN — Desktop Info (1/3) */}
        <div className="hidden md:block mt-24">
          <Info />
        </div>

      </div>
    </div>
  );
}
