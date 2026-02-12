import { useState, useRef } from "react";
import { useGoogleOAuth } from "../components/GoogleAut";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function CreateAccount() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // New fields state
  const [title, setTitle] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+243");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [marketingSms, setMarketingSms] = useState(false);
  const [marketingTargetedAds, setMarketingTargetedAds] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordWrapperRef = useRef<HTMLDivElement | null>(null);
  const { redirectToGoogle } = useGoogleOAuth({
    onSuccess: () => navigate("/home"),
    onError: (msg) => setError(msg),
  });
  const { register } = useAuth();
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

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    console.log("🚀 Submit process started", { email, title, firstName, lastName });
    setError(null);

    // Basic validation
    if (!email || !emailConfirm) {
      setError("Veuillez renseigner et confirmer votre e-mail.");
      return;
    }
    if (email !== emailConfirm) {
      setError("Les e-mails ne correspondent pas.");
      return;
    }
    if (!title || !firstName || !lastName || title === "") {
      setError("Veuillez renseigner votre civilité, prénom et nom.");
      return;
    }
    if (unsatisfiedRules.length > 0) {
      setError("Veuillez respecter les règles du mot de passe.");
      setShowPasswordRules(true);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email,
        password,
        title,
        firstName,
        lastName,
        phoneCountryCode,
        phoneNumber: phone,
        dateOfBirth: dateOfBirth || undefined,
        marketingOptIn,
        marketingEmails,
        marketingSms,
        marketingTargetedAds,
      };

      console.log("📦 Sending register payload to AuthContext", payload);
      await register(payload);

      console.log("✅ Registration successful response received");
      setSuccess(true);

      // Wait 3.5 seconds before redirecting
      setTimeout(() => {
        console.log("↪️ Redirecting to /home");
        navigate("/home");
      }, 3500);
    } catch (err: any) {
      console.error("❌ Registration error caught in handleSubmit:", err);
      if (Array.isArray(err?.message)) {
        setError(err.message.join(", "));
      } else {
        setError(err?.message || "Échec de la création du compte.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 bg-[#007B8A] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 leading-tight">Compte créé avec succès !</h2>
          <p className="text-gray-600 leading-relaxed">
            Bienvenue chez CMclass, {firstName}. Votre compte a été activé.
            Vous allez être redirigé vers la page d'accueil dans quelques instants.
          </p>
          <div className="pt-4">
            <Link to="/home" className="text-[#007B8A] font-medium hover:underline">
              Cliquer ici si la redirection ne fonctionne pas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      
      <main className="w-full flex justify-center px-6 md:px-16 py-10 mt-24">
        <div className="w-full max-w-7xl">
          <h2 className="text-xl font-semibold mb-4 text-[#007B8A]">Créez votre compte</h2>

          {/* Google Button */}
          <button
            type="button"
            onClick={redirectToGoogle}
            className="w-full bg-black py-3 rounded-4xl flex items-center justify-center gap-3 hover:bg-gray-200 transition mb-6"
          >
            <img
              src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
              alt="Google"
              className="w-8 h-8"
            />
            <span className="text-sm">Se connecter avec Google</span>
          </button>

          <p className="text-sm text-gray-700 mb-4">
            Créez votre compte pour profiter d'une expérience personnalisée.
          </p>
          <p className="text-sm mb-8">
            Vous avez déjà un compte CMclass ?{" "}
            <Link to="/login" className="text-[#007B8A] hover:underline">
              Connectez-vous ici.
            </Link>
          </p>

          {/* Error Message at Top */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* FORM - We use a div instead of a form to avoid any default submission issues */}
          <div className="space-y-10">

            {/* TWO-COLUMN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* LEFT COLUMN */}
              <div className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium">E-mail *</label>
                  <input
                    type="email"
                    value={email}
                    name="email"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-md text-[13px] px-3 py-2 mt-1 focus:ring-1 focus:ring-[#007B8A] focus:border-[#007B8A] outline-none"
                    required
                    autoComplete="email"
                  />
                </div>
                {/* Email confirmation */}
                <div>
                  <label className="block text-sm font-medium">Confirmation e-mail *</label>
                  <input
                    type="email"
                    value={emailConfirm}
                    name="emailConfirm"
                    onChange={(e) => setEmailConfirm(e.target.value)}
                    className="w-full border border-gray-300 rounded-md text-[13px] px-3 py-2 mt-1 focus:ring-1 focus:ring-[#007B8A] focus:border-[#007B8A] outline-none"
                    required
                    autoComplete="email"
                  />
                </div>
                {/* Password */}
                <div ref={passwordWrapperRef}>
                  <label className="block text-sm font-medium">Mot de passe *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      name="password"
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-md text-[13px] px-3 py-2 mt-1 focus:ring-1 focus:ring-[#007B8A] focus:border-[#007B8A] outline-none"
                      onFocus={() => setShowPasswordRules(true)}
                      onBlur={handleBlur}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-xs text-gray-600 hover:text-black transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Masquer" : "Afficher"}
                    </button>
                  </div>
                  {showPasswordRules && (
                    <div className="bg-gray-50 p-3 mt-2 rounded border border-gray-200">
                      <p className="text-[11px] font-bold text-gray-500 uppercase mb-2 tracking-wider">Sécurité du mot de passe :</p>
                      <ul className="text-xs space-y-1">
                        {passwordRules.map(rule => {
                          const met = rule.test(password);
                          return (
                            <li key={rule.id} className={`flex items-center gap-2 transition-colors duration-300 ${met ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] border shrink-0 transition-colors ${met ? 'bg-green-100 border-green-500 text-green-700' : 'border-gray-300 bg-white'}`}>
                                {met && "✓"}
                              </span>
                              {rule.label}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium">Civilité *</label>
                  <select
                    value={title}
                    name="title"
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-md text-[13px] px-3 py-2 mt-1 bg-white focus:ring-1 focus:ring-[#007B8A] focus:border-[#007B8A] outline-none cursor-pointer"
                    required
                    autoComplete="honorific-prefix"
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
                    value={firstName}
                    name="firstName"
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md text-[13px] px-3 py-2 mt-1 focus:ring-1 focus:ring-[#007B8A] focus:border-[#007B8A] outline-none"
                    required
                    autoComplete="given-name"
                  />
                </div>
                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium">Nom *</label>
                  <input
                    type="text"
                    value={lastName}
                    name="lastName"
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md text-[13px] px-3 py-2 mt-1 focus:ring-1 focus:ring-[#007B8A] focus:border-[#007B8A] outline-none"
                    required
                    autoComplete="family-name"
                  />
                </div>
                {/* PHONE NUMBER WITH COUNTRY SELECT */}
                <div>
                  <label className="block text-sm font-medium">Numéro de téléphone</label>
                  <div className="flex gap-2 mt-1">
                    <select
                      value={phoneCountryCode}
                      name="phoneCountryCode"
                      onChange={(e) => setPhoneCountryCode(e.target.value)}
                      className="w-24 border border-gray-300 rounded-md text-[13px] px-3 py-2 bg-white focus:border-[#007B8A] outline-none cursor-pointer"
                      autoComplete="tel-country-code"
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
                      value={phone}
                      name="phoneNumber"
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md text-[13px] px-3 py-2 focus:ring-1 focus:ring-[#007B8A] focus:border-[#007B8A] outline-none"
                      autoComplete="tel-local"
                    />
                  </div>
                </div>
                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium">Date de naissance</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    name="dateOfBirth"
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full border border-gray-300 rounded-md text-[13px] px-3 py-2 mt-1 focus:ring-1 focus:ring-[#007B8A] focus:border-[#007B8A] outline-none"
                    autoComplete="bday"
                  />
                  <p className="text-xs text-gray-500 mt-1 leading-5 italic">
                    Je confirme que ma date de naissance est exacte.
                  </p>
                </div>
              </div>
            </div>

            {/* PREFERENCES */}
            <div className="border-t border-gray-200 pt-6">
              <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-[#007B8A] transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#007B8A] cursor-pointer"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                />
                J’accepte de recevoir des communications marketing de CMclass.
              </label>
              <div className="pl-12">
                <p className="text-sm font-medium mt-4 mb-2">Mes préférences :</p>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm py-1 cursor-pointer hover:text-[#007B8A] transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#007B8A] cursor-pointer"
                      checked={marketingEmails}
                      onChange={(e) => setMarketingEmails(e.target.checked)}
                    />
                    Emails marketing
                  </label>
                  <label className="flex items-center gap-2 text-sm py-1 cursor-pointer hover:text-[#007B8A] transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#007B8A] cursor-pointer"
                      checked={marketingSms}
                      onChange={(e) => setMarketingSms(e.target.checked)}
                    />
                    SMS marketing
                  </label>
                </div>
                <p className="text-[11px] text-gray-500 leading-4 mt-2 max-w-sm">
                  En entrant votre numéro de téléphone, vous acceptez de recevoir des SMS marketing automatisés.
                  La fréquence des messages peut varier. Envoyez STOP pour annuler.
                </p>
                <label className="flex items-center gap-2 text-sm py-2 mt-2 cursor-pointer hover:text-[#007B8A] transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#007B8A] cursor-pointer"
                    checked={marketingTargetedAds}
                    onChange={(e) => setMarketingTargetedAds(e.target.checked)}
                  />
                  Publicité ciblée via des partenaires tiers
                </label>
              </div>
            </div>

            {/* CTA */}
            <div className="flex justify-end mt-6 mb-24 border-t border-gray-100 pt-8">
              <div className="flex flex-col items-end">
                <button
                  type="button"
                  onClick={(e) => {
                    console.log("🖱️ Suivant button clicked", { loading });
                    // forward the click event to the handler so it can preventDefault if needed
                    handleSubmit(e as unknown as React.MouseEvent);
                  }}
                  disabled={loading}
                  className="bg-[#007B8A] text-white py-3.5 px-32 rounded-3xl hover:bg-black transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                  {loading && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span className="font-semibold tracking-wide">{loading ? "Création..." : "Suivant"}</span>
                </button>
                <div className="mt-4 flex flex-col items-end text-right">
                  <p className="text-xs leading-6 text-gray-500 max-w-sm">
                    En cliquant sur "Suivant", vous acceptez nos Conditions Générales d'Utilisation.
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1 max-w-sm">
                    Vous recevrez un code d’activation par e-mail pour valider la création de votre compte.
                  </p>
                </div>
              </div>
            </div>

          </div>
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
