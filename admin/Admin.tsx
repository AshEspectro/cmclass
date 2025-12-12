import  { useState } from 'react';
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
      component: <Settings />
    },
  };

  const currentConfig = pageConfig[currentPage as keyof typeof pageConfig];

  // Show authentication screens if not logged in
  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <Login 
          onLogin={() => setIsAuthenticated(true)}
          onSwitchToSignup={() => setAuthView('signup')}
        />
      );
    } else {
      return (
        <Signup 
          onSignup={() => setIsAuthenticated(true)}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      
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
