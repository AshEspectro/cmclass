import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Package, Heart, Settings, LogOut } from 'lucide-react';

export const Account = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginData({ email: '', password: '' });
  };

  if (isLoggedIn) {
    return (
      <div className="pt-20 sm:pt-24 min-h-screen bg-gray-50">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-between items-center mb-12">
              <h1>MON COMPTE</h1>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-[#007B8A] transition-colors duration-300"
              >
                <LogOut size={20} />
                <span>Déconnexion</span>
              </button>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <nav className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 transition-colors duration-300">
                    <User size={20} />
                    <span>Profil</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 transition-colors duration-300">
                    <Package size={20} />
                    <span>Commandes</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 transition-colors duration-300">
                    <Heart size={20} />
                    <span>Favoris</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 transition-colors duration-300">
                    <Settings size={20} />
                    <span>Paramètres</span>
                  </button>
                </nav>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="bg-white p-8">
                  <h2 className="mb-8">BIENVENUE</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="mb-4">Informations personnelles</h3>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm mb-2">PRÉNOM</label>
                            <input
                              type="text"
                              defaultValue="Jean"
                              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-[#007B8A] transition-colors duration-300"
                            />
                          </div>
                          <div>
                            <label className="block text-sm mb-2">NOM</label>
                            <input
                              type="text"
                              defaultValue="Dupont"
                              className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-[#007B8A] transition-colors duration-300"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm mb-2">EMAIL</label>
                          <input
                            type="email"
                            defaultValue="jean.dupont@email.com"
                            className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-[#007B8A] transition-colors duration-300"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      <h3 className="mb-4">Dernières commandes</h3>
                      <p className="text-gray-600">Vous n'avez pas encore passé de commande</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 sm:pt-24 min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-6 py-12 lg:py-20">
        <motion.div
          className="bg-white p-8 lg:p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 pb-4 transition-colors duration-300 ${
                activeTab === 'login'
                  ? 'border-b-2 border-[#007B8A] text-[#007B8A]'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              SE CONNECTER
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 pb-4 transition-colors duration-300 ${
                activeTab === 'signup'
                  ? 'border-b-2 border-[#007B8A] text-[#007B8A]'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              CRÉER UN COMPTE
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <motion.form
              onSubmit={handleLogin}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <label htmlFor="login-email" className="block text-sm mb-2">
                  EMAIL
                </label>
                <input
                  type="email"
                  id="login-email"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-[#007B8A] transition-colors duration-300"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm mb-2">
                  MOT DE PASSE
                </label>
                <input
                  type="password"
                  id="login-password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-[#007B8A] transition-colors duration-300"
                />
              </div>

              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Se souvenir de moi</span>
                </label>
                <a href="#" className="text-[#007B8A] hover:underline">
                  Mot de passe oublié ?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-[#007B8A] text-white py-4 hover:bg-[#006170] transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                SE CONNECTER
              </button>
            </motion.form>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <motion.form
              onSubmit={handleSignup}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm mb-2">
                    PRÉNOM
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={signupData.firstName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                    className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-[#007B8A] transition-colors duration-300"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm mb-2">
                    NOM
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={signupData.lastName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                    className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-[#007B8A] transition-colors duration-300"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-sm mb-2">
                  EMAIL
                </label>
                <input
                  type="email"
                  id="signup-email"
                  value={signupData.email}
                  onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-[#007B8A] transition-colors duration-300"
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm mb-2">
                  MOT DE PASSE
                </label>
                <input
                  type="password"
                  id="signup-password"
                  value={signupData.password}
                  onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-[#007B8A] transition-colors duration-300"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm mb-2">
                  CONFIRMER LE MOT DE PASSE
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:border-[#007B8A] transition-colors duration-300"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#007B8A] text-white py-4 hover:bg-[#006170] transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                CRÉER UN COMPTE
              </button>
            </motion.form>
          )}
        </motion.div>
      </div>
    </div>
  );
};
