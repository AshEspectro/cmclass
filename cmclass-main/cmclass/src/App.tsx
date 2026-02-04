// App.tsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { BrandProvider } from '../admin/context/BrandContext';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
//import { MenCategory } from './pages/MenCategory';
import { Stories } from './pages/Stories';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import CreateAccount from './pages/Account_creation';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import Coming_soon from './pages/Coming_soon';
import { ProtectedRoute } from './components/ProtectedRoute';
import './globals.css';
import LoginPage from './pages/Login';
import AccountPage from './pages/Login';
import AccountPage_A from './pages/EmailIdentifying';
import ForgotPwd from './pages/forgot-password';
import BagsPage from './pages/Bags';
import Index from '../admin/Admin';

//import { useConditionalNavbar } from './hooks/useConditionalNavbar';


import { SingleProductPage } from "./pages/Single_productpage";
import { useConditionalNavbar } from './hooks/useConditionalNavbar';
import Category from './pages/categoriesSinglePage';
import Cartpage from './pages/Cartpage';
import WishlistPage from './pages/Wishlist';
import { AuthProvider } from './contexts/AuthContext';
import UsersDemo from './components/UsersDemo';
import { CampaignPage } from './pages/CampaignPage';

function AppWrapper() {
  const location = useLocation();
  const hideNavAndFooter = ['/','/admin'].includes(location.pathname);
 // Coming Soon page

// Exemple : cacher navbar sur /homme et /bagsPage avec scroll
  useConditionalNavbar({
    routesWithHide: ['/homme', '/bagsPage'],
    enableScrollHide: true,
    scrollTrigger: 80,
  });

  return (
    <BrandProvider>
    <CartProvider>
      <AuthProvider>
      <WishlistProvider>
        <ProtectedRoute>
          <div className="flex flex-col min-h-screen">
            {/* Navbar par défaut */}
            {!hideNavAndFooter && <Navbar />}

            {/* Contenu */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Coming_soon />} />
                <Route path="/home" element={<Home />} />
                <Route path="/homme" element={<Category />} />
                <Route path="/homme/:subcategory" element={<BagsPage/>} />
                <Route path="/produit/:id" element={<SingleProductPage />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/alternative-login" element={<AccountPage_A />} />
                <Route path="/a-propos" element={<About />} />
                <Route path="/LoginPage" element={<AccountPage/>} />
                <Route path="/bagsPage" element={<BagsPage/>} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/compte" element={<CreateAccount />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/category" element={<Category/>} />
                <Route path="/panier" element={<Cartpage />} />
                <Route path="/femme" element={<Category />} />
                <Route path="/accessoires" element={<Category />} />
                <Route path="/nouveautes" element={<Category />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/forgot-password" element={<ForgotPwd/>} />
                <Route path="/campaigns" element={<CampaignPage />} />
                <Route path="*" element={<Home />} />
                
               <Route path="/admin" element={<Index />} />
                <Route path="/users-test" element={<UsersDemo />} />

                <Route path="/product/:id" element={<SingleProductPage />} />
              </Routes>
            </main>

            {/* Footer */}
            {!hideNavAndFooter && <Footer />}
          </div>
        </ProtectedRoute>
      </WishlistProvider>
      </AuthProvider>
    </CartProvider>
    </BrandProvider>
  );
}


export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
