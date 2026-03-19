import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Phone, MessageCircle, HeadphonesIcon, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { publicApi } from '../services/publicApi';

interface ContactPanelProps {
  onClose: () => void;
}

export const ContactPanel = ({ onClose }: ContactPanelProps) => {
  const [brand, setBrand] = useState<any>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [phoneUrl, setPhoneUrl] = useState<string | null>(null);

  useEffect(() => {
    publicApi.getBrand().then(setBrand).catch(console.error);
    publicApi.getFooterSections().then(sections => {
      const links = sections.flatMap((s: any) => s.links || []);
      const phoneLink = links.find((l: any) => l.url?.startsWith('tel:'));
      if (phoneLink) {
        setPhone(phoneLink.label);
        setPhoneUrl(phoneLink.url);
      }
    }).catch(console.error);
  }, []);
  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/50 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Panel - Desktop: Right Side Slide-in */}
      <motion.div
        className="fixed top-0 right-0 bottom-0 w-full md:w-1/2  bg-white display-flex  z-50 overflow-y-auto"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="px-6 sm:px-6 py-16 w-full max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between   mb-8">
            <h3 className="text-xl font-light tracking-wider">Contactez-nous</h3>
            <button
              onClick={onClose}
              className="hover:text-[#007B8A] transition-colors duration-300"
              aria-label="Fermer"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-8">
            <p className="text-sm text-gray-700 leading-relaxed">
              Où que vous soyez, les conseillers clientèle CM Class seront ravis de vous aider.
            </p>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            {phone && (
              <a href={phoneUrl || `tel:${phone}`} className="flex items-center gap-4 text-gray-800 hover:text-[#007B8A] transition-colors group">
                <Phone size={20} className="text-gray-400 group-hover:text-[#007B8A]" />
                <span className="text-sm tracking-wide">{phone}</span>
              </a>
            )}

            {brand?.contactEmail && (
              <a href={`mailto:${brand.contactEmail}`} className="flex items-center gap-4 text-gray-800 hover:text-[#007B8A] transition-colors group">
                <Mail size={20} className="text-gray-400 group-hover:text-[#007B8A]" />
                <span className="text-sm tracking-wide">{brand.contactEmail}</span>
              </a>
            )}
            
            {brand?.pinterestUrl && (
              <a href={brand.pinterestUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-gray-800 hover:text-[#007B8A] transition-colors group">
                <MessageCircle size={20} className="text-gray-400 group-hover:text-[#007B8A]" />
                <span className="text-sm tracking-wide">WhatsApp</span>
              </a>
            )}
            
            {brand?.facebookUrl && (
              <a href={brand.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-gray-800 hover:text-[#007B8A] transition-colors group">
                <MessageCircle size={20} className="text-gray-400 group-hover:text-[#007B8A]" />
                <span className="text-sm tracking-wide">Facebook</span>
              </a>
            )}
            
            
          </div>

          {/* Divider */}
          <div className="my-10 border-t border-gray-200" />

          {/* Need Help Section */}
          <div className="mb-6">
            <div className="space-y-6">

              <Link to="/contact" onClick={onClose} className="flex items-center gap-4 text-gray-800 hover:text-[#007B8A] transition-colors group">
                
                <span className="text-sm tracking-wide">Besoin d'aide ?</span>
              </Link>

              <Link to="/faq" onClick={onClose} className="flex items-center gap-4 text-gray-800 hover:text-[#007B8A] transition-colors group">
                
                <span className="text-sm tracking-wide">Vos questions</span>
              </Link>
              
              <Link to="/a-propos" onClick={onClose} className="flex items-center gap-4 text-gray-800 hover:text-[#007B8A] transition-colors group">
                
                <span className="text-sm tracking-wide">Magasins</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
