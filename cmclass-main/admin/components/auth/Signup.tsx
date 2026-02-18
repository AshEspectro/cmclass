import React, { useState } from 'react';
import { Button } from '../Button';
import { Mail, Lock, User, Eye, EyeOff, Building } from 'lucide-react';
import { GoogleSignInButton } from '../../../src/components/GoogleSignInButton';

interface SignupProps {
  brand?: { name?: string; logoUrl?: string; logoLightUrl?: string; logoDarkUrl?: string } | null;
  onSignup: (payload: { name: string; email: string; brandName: string; password: string; acceptTerms: boolean }) => void | Promise<void>;
  onGoogleLogin?: (credential: string, remember: boolean) => void | Promise<void>;
  onGoogleError?: (message: string) => void;
  onSwitchToLogin: () => void;
}

export function Signup({ brand, onSignup, onGoogleLogin, onGoogleError, onSwitchToLogin, message }: SignupProps & { message?: { type: 'success' | 'error' | 'info'; text: string } | null }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    brandName: '',
    password: '',
    confirmPassword: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup({ name: formData.name, email: formData.email, brandName: formData.brandName, password: formData.password, acceptTerms });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoogleCredential = async (credential: string) => {
    if (!onGoogleLogin) return;
    await onGoogleLogin(credential, true);
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
            {brand?.logoLightUrl ? (
              <img src={brand.logoLightUrl} alt={brand?.name || 'Brand'} className="h-12 mb-4" />
            ) : (
              <h1 className="text-5xl mb-4 tracking-tight">CM class</h1>
            )}
            <p className="text-gray-600">Tableau de Bord Administrateur</p>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl mb-2">Créer un Compte</h2>
            
          </div>

          {message && (
            <div className={`mb-4 text-sm ${message.type === 'error' ? 'text-red-600' : message.type === 'success' ? 'text-green-600' : 'text-blue-600'}`}>
              {message.text}
            </div>
          )}

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
              <label className="block text-sm mb-2 text-gray-700">Role dans l'entreprise</label>
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
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
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

            <GoogleSignInButton
              className="w-full"
              text="signup_with"
              onCredential={handleGoogleCredential}
              onError={(msg) => onGoogleError?.(msg)}
            />
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
