import React, { useState } from 'react';
import { Button } from '../Button';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { GoogleSignInButton } from '../../../src/components/GoogleSignInButton';

interface LoginProps {
  brand?: { name?: string; logoUrl?: string; logoLightUrl?: string; logoDarkUrl?: string } | null;
  onLogin: (payload: { email: string; password: string; remember: boolean }) => void | Promise<void>;
  onGoogleLogin?: (credential: string, remember: boolean) => void | Promise<void>;
  onGoogleError?: (message: string) => void;
  onSwitchToSignup: () => void;
}

export function Login({ brand, onLogin, onGoogleLogin, onGoogleError, onSwitchToSignup, message }: LoginProps & { message?: { type: 'success' | 'error' | 'info'; text: string } | null }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ email, password, remember });
  };

  const handleGoogleCredential = async (credential: string) => {
    if (!onGoogleLogin) return;
    await onGoogleLogin(credential, remember);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-1/2 flex items-center justify-center px-16 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-12">
            {brand?.logoLightUrl ? (
              <img src={brand.logoLightUrl} alt={brand?.name || 'Brand'} className="h-12 mb-4" />
            ) : (
              <h1 className="text-5xl mb-4 tracking-tight">MAISON</h1>
            )}
            <p className="text-gray-600">Tableau de Bord Administrateur</p>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl mb-2">Bon Retour</h2>
            <p className="text-gray-600">Connectez-vous pour accéder à votre tableau de bord</p>
          </div>

          {message && (
            <div className={`mb-4 text-sm ${message.type === 'error' ? 'text-red-600' : message.type === 'success' ? 'text-green-600' : 'text-blue-600'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@info.com"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-[#007B8A]"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="text-sm text-gray-600">Se souvenir de moi</span>
              </label>
              <button 
                type="button"
                className="text-sm text-[#007B8A] hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full py-3.5"
            >
              Se Connecter
            </Button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Ou continuer avec</span>
              </div>
            </div>

            <GoogleSignInButton
              className="w-full"
              text="signin_with"
              onCredential={handleGoogleCredential}
              onError={(msg) => onGoogleError?.(msg)}
            />
          </form>

          <p className="text-center text-sm text-gray-600 mt-8">
            Vous n'avez pas de compte ?{' '}
            <button 
              onClick={onSwitchToSignup}
              className="text-[#007B8A] hover:underline"
            >
              Créer un compte
            </button>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div 
        className="w-1/2 bg-gray-900 relative overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1719518411339-5158cea86caf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwZWRpdG9yaWFsfGVufDF8fHx8MTc2NTIwODQ4Nnww&ixlib=rb-4.1.0&q=80&w=1080)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/30"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-16 text-white">
          <h2 className="text-4xl mb-4 text-white">Élégance Intemporelle</h2>
          <p className="text-lg opacity-90 max-w-md">
            Gérez votre empire de mode de luxe avec précision et grâce. Accédez aux outils puissants conçus pour la maison moderne.
          </p>
        </div>
      </div>
    </div>
  );
}
