import  { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/pages/Dashboard';
import { ContentManager } from './components/pages/ContentManager';
import { Products } from './components/pages/Products';
import { Categories } from './components/pages/Categories';
import { MediaLibrary } from './components/pages/MediaLibrary';
import { Orders } from './components/pages/Orders';
import { Customers } from './components/pages/Customers';
import { Settings } from './components/pages/Settings';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';


function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [currentPage, setCurrentPage] = useState('dashboard');

  const [brand, setBrand] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const pollRef = useRef<number | null>(null);
  const lastSignupRef = useRef<{ email: string; password: string } | null>(null);

  useEffect(() => {
    // fetch public brand data (logo/name)
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/brand')
      .then(r => r.json())
      .then(b => setBrand(b))
      .catch(() => {});
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  const pageConfig = {
    dashboard: {
      title: 'Tableau de Bord',
      subtitle: 'Aperçu de votre entreprise de mode de luxe',
      component: <Dashboard />
    },
    content: {
      title: 'Gestion de Contenu',
      subtitle: 'Gérer la page d\'accueil, campagnes et contenu éditorial',
      component: <ContentManager />
    },
    products: {
      title: 'Produits',
      subtitle: 'Gérer votre catalogue de produits de luxe',
      component: <Products />
    },
    categories: {
      title: 'Catégories',
      subtitle: 'Organiser et gérer les catégories de produits',
      component: <Categories />
    },
    media: {
      title: 'Médiathèque',
      subtitle: 'Gérer les images et les ressources de campagne',
      component: <MediaLibrary />
    },
    orders: {
      title: 'Commandes',
      subtitle: 'Suivre et gérer les commandes clients',
      component: <Orders />
    },
    customers: {
      title: 'Clients',
      subtitle: 'Voir et gérer les relations clients',
      component: <Customers />
    },
    settings: {
      title: 'Paramètres',
      subtitle: 'Configurer la marque, l\'équipe et les préférences du tableau de bord',
      component: <Settings brand={brand} />
    },
  };

  const currentConfig = pageConfig[currentPage as keyof typeof pageConfig];

  // Show authentication screens if not logged in
  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <Login 
          brand={brand}
          message={message}
          onLogin={async (payload: { email: string; password: string; remember: boolean }) => {
            setMessage(null);
            try {
              const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: payload.email, password: payload.password, remember: !!payload.remember }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data?.message || data?.error || 'Login failed');

              const token = data?.access_token;
              if (token) {
                if (payload.remember) localStorage.setItem('access_token', token);
                else sessionStorage.setItem('access_token', token);
              }
              setMessage({ type: 'success', text: 'Connecté avec succès' });
              setIsAuthenticated(true);
            } catch (err: any) {
              setMessage({ type: 'error', text: err?.message || 'Login error' });
            }
          }}
          onSwitchToSignup={() => setAuthView('signup')}
        />
      );
    } else {
      return (
        <Signup 
          brand={brand}
          message={message}
          onSignup={async (payload: { name: string; email: string; brandName: string; password: string; acceptTerms: boolean }) => {
            setMessage(null);
            try {
              const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: payload.name, email: payload.email, roleRequested: 'ADMIN', message: payload.brandName, password: payload.password }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data?.message || data?.error || 'Signup failed');

              setMessage({ type: 'info', text: 'Demande enregistrée — en attente d’approbation' });

              // store credentials temporarily to attempt auto-login when approved
              lastSignupRef.current = { email: payload.email, password: payload.password };

              // start polling for approval
              let polls = 0;
              const maxPolls = 180; // ~15 minutes if interval 5s
              if (pollRef.current) window.clearInterval(pollRef.current);
              pollRef.current = window.setInterval(async () => {
                polls += 1;
                try {
                  const st = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + `/auth/signup-status?email=${encodeURIComponent(payload.email)}`);
                  const j = await st.json();
                  const status = j?.status;
                  if (status === 'APPROVED') {
                    // attempt auto-login with stored credentials
                    if (pollRef.current) { window.clearInterval(pollRef.current); pollRef.current = null; }
                    try {
                      const loginRes = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ email: payload.email, password: payload.password, remember: true }),
                      });
                      const loginData = await loginRes.json();
                      if (!loginRes.ok) {
                        setMessage({ type: 'error', text: 'Inscription approuvée mais l’authentification automatique a échoué' });
                        setAuthView('login');
                        return;
                      }
                      const token = loginData?.access_token;
                      if (token) localStorage.setItem('access_token', token);
                      setMessage({ type: 'success', text: 'Compte approuvé — connecté automatiquement' });
                      setIsAuthenticated(true);
                    } catch (e: any) {
                      setMessage({ type: 'error', text: e?.message || 'Auto-login failed' });
                    }
                  } else if (status === 'DENIED') {
                    if (pollRef.current) { window.clearInterval(pollRef.current); pollRef.current = null; }
                    setMessage({ type: 'error', text: 'Votre demande a été refusée par l’administrateur' });
                    setAuthView('login');
                  } else if (polls >= maxPolls) {
                    if (pollRef.current) { window.clearInterval(pollRef.current); pollRef.current = null; }
                    setMessage({ type: 'info', text: 'Toujours en attente — vous pouvez réessayer plus tard' });
                    setAuthView('login');
                  }
                } catch (e) {
                  // ignore transient errors
                }
              }, 5000);

            } catch (err: any) {
              setMessage({ type: 'error', text: err?.message || 'Signup error' });
            }
          }}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        brand={brand}
        onLogout={() => {
          localStorage.removeItem('access_token');
          sessionStorage.removeItem('access_token');
          setIsAuthenticated(false);
          setAuthView('login');
        }}
      />
      
      <div className="ml-64">
        <Header 
          title={currentConfig.title} 
          subtitle={currentConfig.subtitle}
        />
        
        <main className="px-12 py-8">
          {currentConfig.component}
        </main>
      </div>
    </div>
  );
}

export default Index;
