// components/ProtectedRoute.tsx
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

const PASSWORD = 'cmclass123'; // Replace with your desired password

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  // Allow access automatically for Coming Soon page
  if (location.pathname === '/') return <>{children}</>;

  const hasAccess = sessionStorage.getItem('hasAccess') === 'true';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PASSWORD) {
      sessionStorage.setItem('hasAccess', 'true');
      setError(false);
      window.location.reload(); // Refresh so access applies
    } else {
      setError(true);
    }
  };

  if (hasAccess) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      {/* Logo on top center */}
      <img
        src="/cmclass@.svg"
        alt="CM Class Logo"
        className="w-40 mb-8"
      />

      {/* Headline */}
      <h1 className="text-3xl font-bold mb-4 text-black text-center">
        Accès restreint
      </h1>

      {/* Subtext */}
      <p className="text-center text-gray-700 mb-6 max-w-md">
        Cette section du site est protégée. Veuillez entrer le mot de passe pour continuer et accéder à l'intégralité du site.
      </p>

      {/* Password form */}
      <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-xs">
        <input
          type="password"
          placeholder="Mot de passe"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#007B8A] transition"
        />
        <button
          type="submit"
          className="w-full bg-[#007B8A] text-white font-semibold py-2 rounded hover:bg-[#005f6b] transition"
        >
          Valider
        </button>
        {error && <p className="text-red-600 mt-2">Mot de passe incorrect</p>}
      </form>
    </div>
  );
}
