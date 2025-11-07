import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { MenCategory } from './pages/MenCategory';
import { ProductDetail } from './pages/ProductDetail';
import { Stories } from './pages/Stories';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Account } from './pages/Account';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import './globals.css';

export default function App() {
  return (
    <Router>
      <CartProvider>
        <WishlistProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/homme" element={<MenCategory />} />
                <Route path="/homme/:subcategory" element={<MenCategory />} />
                <Route path="/produit/:id" element={<ProductDetail />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/a-propos" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/compte" element={<Account />} />
                <Route path="/femme" element={<MenCategory />} />
                <Route path="/accessoires" element={<MenCategory />} />
                <Route path="/nouveautes" element={<MenCategory />} />
                <Route path="/wishlist" element={<MenCategory />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </WishlistProvider>
      </CartProvider>
    </Router>
  );
}
