import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { GoogleSignInButton } from "../components/GoogleSignInButton";

export default function AccountPage() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, oauthLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(loginData);
      navigate("/home");
    } catch (err: any) {
      setError(err?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    setError(null);
    setLoading(true);
    try {
      await oauthLogin({ provider: "google", token: credential });
      navigate("/home");
    } catch (err: any) {
      setError(err?.message || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const Info = () => (
    <div className="bg-gray-50 border border-none px-8 py-10 w-full max-w-lg mx-auto">
      <p className="font-regular text-xs tracking-wider uppercase text-gray-700 mb-6">
        Ce que vous trouverez dans votre compte
      </p>

      <ul className="space-y-6 text-gray-700 text-sm leading-relaxed">
        <li>Suivez vos commandes, réparations et accédez à vos factures.</li>
        <li className="pt-6 border-t border-gray-300">Gérez vos informations personnelles.</li>
        <li className="pt-6 border-t border-gray-300">Recevez les emails de Louis Vuitton.</li>
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
          <GoogleSignInButton
            className="bg-gray-100 border border-gray-300 rounded-4xl hover:bg-gray-200 transition py-3 mb-6"
            text="signin_with"
            onCredential={handleGoogleCredential}
            onError={(msg) => setError(msg)}
          />

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
                className="w-full border border-gray-300 px-4 py-3 rounded-md focus:outline-none focus:border-black text-sm"
                required
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
                  className="w-full border border-gray-300 px-4 py-3 rounded-md focus:outline-none focus:border-black text-sm"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 hover:text-black"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>

              <Link to="/forgot-password"><button type="button" className="pt-8 text-[#007B8A] text-sm hover:underline w-fit">
                Mot de passe oublié ?
              </button></Link>
            </div>

            {/* One-time login */}
            <div className="text-xs text-gray-600 leading-relaxed">
              Ou utilisez un lien de connexion unique pour vous connecter.{" "}
              <Link to="/alternative-login"><button type="button" className="underline hover:text-black">
                Envoyez-moi le lien
              </button></Link>
            </div>

            {/* Submit */}
            <div className="flex flex-col items-center md:items-end space-y-1 mt-4">
              {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="bg-[#007B8A] text-white py-3 rounded-3xl px-28 text-sm tracking-wide hover:bg-gray-900 transition disabled:bg-gray-400"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>

              {/* Create Account */}
              <div className="flex flex-col items-center justify-center md:items-start pr-0 md:pr-32 mt-4">
                <p className="font-medium text-sm">Vous n’avez pas de compte  ?</p>
                <Link to="/compte">
                  <span className="font-medium text-sm underline hover:text-black transition">
                    Créer un compte
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
