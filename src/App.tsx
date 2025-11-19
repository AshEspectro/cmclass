// App.tsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { MenCategory } from './pages/MenCategory';
import { ProductDetail } from './pages/ProductDetail';
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

function AppWrapper() {
  const location = useLocation();
  const hideNavAndFooter = location.pathname === '/'; // Coming Soon page

  return (
    <CartProvider>
      <WishlistProvider>
        <ProtectedRoute>
          <div className="flex flex-col min-h-screen">
            {!hideNavAndFooter && <Navbar />}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Coming_soon />} />
                <Route path="/home" element={<Home />} />
                <Route path="/homme" element={<MenCategory />} />
                <Route path="/homme/:subcategory" element={<MenCategory />} />
                <Route path="/produit/:id" element={<ProductDetail />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/a-propos" element={<About />} />
                <Route path="/LoginPage" element={<AccountPage/>} />
                
                <Route path="/contact" element={<Contact />} />
                <Route path="/compte" element={<CreateAccount />} />
                <Route path="/login" element={< LoginPage />} />
                <Route path="/femme" element={<MenCategory />} />
                <Route path="/accessoires" element={<MenCategory />} />
                <Route path="/nouveautes" element={<MenCategory />} />
                <Route path="/wishlist" element={<MenCategory />} />
                {/* Catch-all route can redirect to Coming Soon or 404 */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            {!hideNavAndFooter && <Footer />}
          </div>
        </ProtectedRoute>
      </WishlistProvider>
    </CartProvider>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
