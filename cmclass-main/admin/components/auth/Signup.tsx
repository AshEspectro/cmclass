import React, { useState } from 'react';
import { Button } from '../Button';
import { Mail, Lock, User, Eye, EyeOff, Building } from 'lucide-react';

interface SignupProps {
  onSignup: () => void;
  onSwitchToLogin: () => void;
}

export function Signup({ onSignup, onSwitchToLogin }: SignupProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    brandName: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div 
        className="w-1/2 bg-gray-900 relative overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1567777301743-3b7ef158aadf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdoJTIwZW5kJTIwZmFzaGlvbiUyMG1vZGVsfGVufDF8fHx8MTc2NTI3MTY3M3ww&ixlib=rb-4.1.0&q=80&w=1080)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/30"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-16 text-white">
          <h2 className="text-4xl mb-4 text-white">Construisez Votre Héritage</h2>
          <p className="text-lg opacity-90 max-w-md">
            Rejoignez les maisons de couture les plus prestigieuses au monde. Créez, gérez et développez votre marque de luxe avec notre plateforme complète.
          </p>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-1/2 flex items-center justify-center px-16 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <h1 className="text-5xl mb-4 tracking-tight">MAISON</h1>
            <p className="text-gray-600">Tableau de Bord Administrateur</p>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl mb-2">Créer un Compte</h2>
            <p className="text-gray-600">Commencez à gérer votre marque de luxe aujourd'hui</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm mb-2 text-gray-700">Nom Complet</label>
              <div className="relative">
                <User 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  size={18} 
                  strokeWidth={1.5} 
                />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Jean Dupont"
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Adresse Email</label>
              <div className="relative">
                <Mail 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  size={18} 
                  strokeWidth={1.5} 
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="vous@entreprise.com"
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Nom de Marque</label>
              <div className="relative">
                <Building 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  size={18} 
                  strokeWidth={1.5} 
                />
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => handleChange('brandName', e.target.value)}
                  placeholder="Votre Maison de Couture"
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Mot de Passe</label>
              <div className="relative">
                <Lock 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  size={18} 
                  strokeWidth={1.5} 
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Minimum 8 caractères"
                  className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={1.5} />
                  ) : (
                    <Eye size={18} strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-700">Confirmer le Mot de Passe</label>
              <div className="relative">
                <Lock 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  size={18} 
                  strokeWidth={1.5} 
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Ressaisir le mot de passe"
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                className="w-4 h-4 mt-1 accent-[#007B8A]"
                required
              />
              <label className="text-sm text-gray-600">
                J'accepte les{' '}
                <button type="button" className="text-[#007B8A] hover:underline">
                  Conditions d'Utilisation
                </button>
                {' '}et la{' '}
                <button type="button" className="text-[#007B8A] hover:underline">
                  Politique de Confidentialité
                </button>
              </label>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full py-3.5"
            >
              Créer un Compte
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Ou s'inscrire avec</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                <span className="text-sm">GitHub</span>
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Vous avez déjà un compte ?{' '}
            <button 
              onClick={onSwitchToLogin}
              className="text-[#007B8A] hover:underline"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}