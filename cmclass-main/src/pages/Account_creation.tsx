import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { GoogleSignInButton } from "../components/GoogleSignInButton";

export default function CreateAccount() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [password, setPassword] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [form, setForm] = useState({
    email: "",
    title: "",
    firstName: "",
    lastName: "",
    phoneCountryCode: "+243",
    phoneNumber: "",
    dateOfBirth: "",
    marketingOptIn: false,
    marketingEmails: false,
    marketingSms: false,
    marketingTargetedAds: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const passwordWrapperRef = useRef<HTMLDivElement | null>(null);
  const { register, oauthLogin } = useAuth();
  const navigate = useNavigate();

  const passwordRules = [
    { id: "length", label: "Au moins 8 caractères", test: (v: string) => v.length >= 8 },
    { id: "number", label: "Au moins 1 chiffre", test: (v: string) => /\d/.test(v) },
    { id: "upper", label: "Au moins 1 lettre majuscule", test: (v: string) => /[A-Z]/.test(v) },
    { id: "lower", label: "Au moins 1 lettre minuscule", test: (v: string) => /[a-z]/.test(v) },
    { id: "special", label: "Au moins un caractère spécial", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
  ];

  const unsatisfiedRules = passwordRules.filter(r => !r.test(password));

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const next = e.relatedTarget as HTMLElement | null;
    if (passwordWrapperRef.current && !passwordWrapperRef.current.contains(next)) {
      setShowPasswordRules(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!form.email || !emailConfirm || form.email !== emailConfirm) {
      setMessage({ type: "error", text: "Les e-mails ne correspondent pas." });
      return;
    }
    if (unsatisfiedRules.length > 0) {
      setMessage({ type: "error", text: "Le mot de passe ne respecte pas les exigences." });
      return;
    }
    if (!form.title || !form.firstName || !form.lastName) {
      setMessage({ type: "error", text: "Veuillez remplir tous les champs obligatoires." });
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        email: form.email,
        password,
        title: form.title,
        firstName: form.firstName,
        lastName: form.lastName,
        phoneCountryCode: form.phoneCountryCode || undefined,
        phoneNumber: form.phoneNumber || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        marketingOptIn: form.marketingOptIn,
        marketingEmails: form.marketingOptIn ? form.marketingEmails : false,
        marketingSms: form.marketingOptIn ? form.marketingSms : false,
        marketingTargetedAds: form.marketingOptIn ? form.marketingTargetedAds : false,
      });
      setMessage({
        type: "success",
        text: result?.message || "Compte créé. Vérifiez votre e-mail pour activer le compte.",
      });
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Une erreur est survenue." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    setMessage(null);
    setLoading(true);
    try {
      await oauthLogin({ provider: "google", token: credential });
      setMessage({ type: "success", text: "Compte créé avec Google." });
      navigate("/home");
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Google authentication failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <main className="w-full flex justify-center px-6 md:px-16 py-10 mt-24">
        <div className="w-full max-w-lg md:max-w-7xl">
          <h2 className="text-xl font-semibold mb-4">Créez votre compte</h2>

          {/* Google Button */}
          <GoogleSignInButton
            className="bg-gray-100 border border-gray-300 rounded-4xl hover:bg-gray-200 transition py-3 mb-6"
            text="signup_with"
            onCredential={handleGoogleCredential}
            onError={(msg) => setMessage({ type: "error", text: msg })}
          />

          <p className="text-sm text-gray-700 mb-4">
            Créez votre compte pour profiter d'une expérience personnalisée.
          </p>
          <p className="text-sm mb-8">
            Vous avez déjà un compte MyLV ?{" "}
            <Link to="/login" className="text-[#007B8A] hover:underline">
              Connectez-vous ici.
            </Link>
          </p>

          {/* FORM */}
          <form className="space-y-10" onSubmit={handleSubmit}>

            {/* TWO-COLUMN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* LEFT COLUMN */}
              <div className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium">E-mail *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md text-[13px] px-3 py-2 mt-1"
                    required
                  />
                </div>
                {/* Email confirmation */}
                <div>
                  <label className="block text-sm font-medium">Confirmation e-mail *</label>
                  <input
                    type="email"
                    value={emailConfirm}
                    onChange={(e) => setEmailConfirm(e.target.value)}
                    className="w-full border border-gray-300 rounded-md text-[13px] px-3 py-2 mt-1"
                    required
                  />
                </div>
                {/* Password */}
                <div ref={passwordWrapperRef}>
                  <label className="block text-sm font-medium">Mot de passe *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-md text-[13px] px-3 py-2 mt-1"
                      onFocus={() => setShowPasswordRules(true)}
                      onBlur={handleBlur}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-xs text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Masquer" : "Afficher"}
                    </button>
                  </div>
                  {showPasswordRules && unsatisfiedRules.length > 0 && (
                    <ul className="text-xs text-gray-600 mt-2 space-y-1">
                      {unsatisfiedRules.map(rule => (
                        <li key={rule.id}>• {rule.label}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium">Civilité *</label>
                  <select
                    className="w-full border border-gray-300 rounded-md text-[13px] px-3 py-2 mt-1 bg-white focus:ring-black focus:border-black"
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                  >
                    <option value="" disabled>Sélectionnez votre civilité</option>
                    <option value="M.">M.</option>
                    <option value="Mme.">Mme.</option>
                    <option value="Mlle.">Mlle.</option>
                    <option value="Mx.">Mx.</option>
                  </select>
                </div>
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium">Prénom *</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md text-[13px] px-3 py-2 mt-1"
                    required
                  />
                </div>
                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium">Nom *</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md text-[13px] px-3 py-2 mt-1"
                    required
                  />
                </div>
                {/* PHONE NUMBER WITH COUNTRY SELECT */}
                <div>
                  <label className="block text-sm font-medium">Numéro de téléphone</label>
                  <div className="flex gap-2 mt-1">
                    <select
                      className="w-24 border border-gray-300 rounded-md text-[13px] px-3 py-2 bg-white focus:border-black"
                      value={form.phoneCountryCode}
                      onChange={(e) => setForm(prev => ({ ...prev, phoneCountryCode: e.target.value }))}
                    >
                      <option value="+1">+1</option>
                      <option value="+33">+33</option>
                      <option value="+44">+44</option>
                      <option value="+243">+243</option>
                      <option value="+32">+32</option>
                      <option value="+39">+39</option>
                      <option value="+225">+225</option>
                      <option value="+254">+254</option>
                    </select>
                    <input
                      type="text"
                      placeholder="XXX-XXX-XXXX"
                      value={form.phoneNumber}
                      onChange={(e) => setForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="flex-1 border border-gray-300 rounded-md text-[13px] px-3 py-2"
                    />
                  </div>
                </div>
                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium">Date de naissance</label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md text-[13px] px-3 py-2 mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1 leading-5">
                    Je confirme que ma date de naissance est exacte.
                  </p>
                </div>
              </div>
            </div>

            {/* PREFERENCES */}
            <div className="border-t border-gray-200 pt-6">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={form.marketingOptIn}
                  onChange={(e) => setForm(prev => ({ ...prev, marketingOptIn: e.target.checked }))}
                />
                J’accepte de recevoir des communications marketing de Louis Vuitton.
              </label>
              <div className="pl-12">
                <p className="text-sm font-medium mt-4">Mes préférences :</p>
                <label className="flex items-center gap-2 text-sm py-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={form.marketingEmails}
                    onChange={(e) => setForm(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                    disabled={!form.marketingOptIn}
                  />
                  Emails marketing
                </label>
                <label className="flex items-center gap-2 text-sm py-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={form.marketingSms}
                    onChange={(e) => setForm(prev => ({ ...prev, marketingSms: e.target.checked }))}
                    disabled={!form.marketingOptIn}
                  />
                  SMS marketing
                </label>
                <p className="text-xs text-gray-500 leading-4 pl-6 w-full md:w-[40%]">
                  En entrant votre numéro de téléphone, vous acceptez de recevoir des SMS marketing automatisés.
                  La fréquence des messages peut varier. Envoyez STOP pour annuler.
                </p>
                <label className="flex items-center gap-2 text-sm py-2 mt-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={form.marketingTargetedAds}
                    onChange={(e) => setForm(prev => ({ ...prev, marketingTargetedAds: e.target.checked }))}
                    disabled={!form.marketingOptIn}
                  />
                  Publicité ciblée via des partenaires tiers
                </label>
              </div>
            </div>

            {message && (
              <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
                {message.text}
              </p>
            )}

            {/* CTA */}
            <div className="flex justify-end  mt-6 mb-24">
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#007B8A]  text-white py-3 px-32 rounded-3xl hover:bg-black transition disabled:bg-gray-400"
                >
                  {loading ? "Création..." : "Suivant"}
                </button>
                <p className="text-xs py-4 leading-6 w-[60%]">
                  Vous recevrez un code d’activation par e-mail pour valider la création de votre compte.
                </p>
              </div>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}

export const AccountCreationPageConfig = {
  path: "/compte",
  title: "compte",
  component: CreateAccount,
  exact: true,
  layout: false,
  auth: false,
} as const;
