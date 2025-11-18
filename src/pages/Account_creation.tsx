import { useState, useRef } from "react";

export default function CreateAccount() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);

  const passwordWrapperRef = useRef<HTMLDivElement | null>(null);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const nextFocused = e.relatedTarget as HTMLElement | null;

    if (
      passwordWrapperRef.current &&
      !passwordWrapperRef.current.contains(nextFocused)
    ) {
      setShowPasswordRules(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <main className="w-full flex justify-center px-16 mt-24  py-10">
        <div className="w-full max-w-xl md:max-w-4xl lg:max-w-6xl">

          
          <h2 className="text-xl font-medium mb-3">Créez votre compte</h2>

          <button className="w-full bg-gray-100 py-3 rounded-3xl flex items-center justify-center gap-3 hover:bg-gray-200 transition mb-5">
            <img
              src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
              alt="Google"
              className="w-5 h-5"
            />
            <span className="text-sm">Sign In With Google</span>
          </button>

          <p className="text-sm text-gray-700 mb-6">
            Create your account to have access to a personalized experience.
          </p>

          <p className="text-sm mb-8">
            Already have a MyLV account?{" "}
            <a className="text-blue-600 hover:underline" href="#">
              Log in here.
            </a>
          </p>

          {/* FORM */}
          <form className="space-y-8">

            {/* ---------------------------- */}
            {/* RESPONSIVE GRID START       */}
            {/* ---------------------------- */}
            <div className="grid grid-cols-1 pt-8 md:grid-cols-2  gap-6">

              {/* Email */}
              <div>
                <label className="block text-sm  font-medium">Email *</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-black focus:border-black"
                />
              </div>

              {/* Email Confirmation */}
              <div>
                <label className="block text-sm font-medium">
                  Email Confirmation *
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-black focus:border-black"
                />
              </div>
              <div ref={passwordWrapperRef}>
              <label className="block text-sm font-medium">Password *</label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-black focus:border-black"
                  onFocus={() => setShowPasswordRules(true)}
                  onBlur={handleBlur}
                />

                <button
                  type="button"
                  className="absolute right-3 top-3 text-sm text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {showPasswordRules && (
                <ul className="text-xs text-gray-500 mt-2 space-y-1 animate-fadeIn">
                  <li>• At least 8 characters</li>
                  <li>• At least 1 number</li>
                  <li>• At least 1 capital letter</li>
                  <li>• At least 1 lowercase letter</li>
                  <li>• At least one special character</li>
                </ul>
              )}
            </div>

              {/* Title */}
              

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium">First Name *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-black focus:border-black"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium">Last Name *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-black focus:border-black"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium">Phone Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="+1"
                    className="w-20 border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-black focus:border-black"
                  />
                  <input
                    type="text"
                    placeholder="XXX-XXX-XXXX"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-black focus:border-black"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium">Date of Birth</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-black focus:border-black"
                />
                <p className="text-xs text-gray-500 mt-1">
                  I confirm my date of birth is accurate.
                </p>
              </div>

            </div>
            {/* ---------------------------- */}
            {/* RESPONSIVE GRID END         */}
            {/* ---------------------------- */}


            {/* Password (Full width) */}
            

            {/* Marketing Consent */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4" />
                I consent to receive Louis Vuitton marketing communications.
              </label>

              <p className="text-sm font-medium mt-4">My Preferences:</p>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4" />
                Marketing Emails
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4" />
                Marketing Texts
              </label>

              <p className="text-xs text-gray-500 leading-relaxed">
                By entering your phone number, you agree to receive automated marketing text messages. Msg frequency varies. Text STOP to cancel.
              </p>

              <label className="flex items-center gap-2 text-sm mt-2">
                <input type="checkbox" className="w-4 h-4" />
                Targeted Advertising via Third-Party Partners
              </label>
            </div>

            <button className=" bg-black text-white py-3 px-32 rounded-3xl hover:bg-gray-900 transition">
              Suivant
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}
