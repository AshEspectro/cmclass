import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="pt-20 sm:pt-24">
      {/* Header */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-32 border-b border-gray-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="mb-4 sm:mb-6">CONTACTEZ-NOUS</h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed px-4">
              Nous sommes à votre écoute. Que ce soit pour une question, une collaboration ou simplement
              pour échanger, n'hésitez pas à nous contacter.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 md:gap-16">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-8">INFORMATIONS</h2>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <MapPin size={24} className="flex-shrink-0 text-[#007B8A]" />
                  <div>
                    <h4 className="mb-2">ADRESSE</h4>
                    <p className="text-gray-600">
                      Avenue de la Révolution<br />
                      Goma, Nord-Kivu<br />
                      République Démocratique du Congo
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Phone size={24} className="flex-shrink-0 text-[#007B8A]" />
                  <div>
                    <h4 className="mb-2">TÉLÉPHONE</h4>
                    <p className="text-gray-600">
                      <a href="tel:+243" className="hover:text-[#007B8A] transition-colors duration-300">
                        +243 XXX XXX XXX
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Mail size={24} className="flex-shrink-0 text-[#007B8A]" />
                  <div>
                    <h4 className="mb-2">EMAIL</h4>
                    <p className="text-gray-600">
                      <a href="mailto:contact@cmclass.cd" className="hover:text-[#007B8A] transition-colors duration-300">
                        contact@cmclass.cd
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="mt-12 pt-12 border-t border-gray-200">
                <h4 className="mb-4">HORAIRES D'OUVERTURE</h4>
                <div className="space-y-2 text-gray-600">
                  <p>Lundi - Vendredi : 9h00 - 18h00</p>
                  <p>Samedi : 10h00 - 16h00</p>
                  <p>Dimanche : Fermé</p>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-12">
                <h4 className="mb-4">SUIVEZ-NOUS</h4>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="w-12 h-12 border flex items-center justify-center hover:border-[#007B8A] hover:bg-[#007B8A] hover:text-white transition-all duration-300"
                    aria-label="Instagram"
                  >
                    <Instagram size={20} />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 border  flex items-center justify-center hover:border-[#007B8A] hover:bg-[#007B8A] hover:text-white transition-all duration-300"
                    aria-label="Facebook"
                  >
                    <Facebook size={20} />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 border  flex items-center justify-center hover:border-[#007B8A] hover:bg-[#007B8A] hover:text-white transition-all duration-300"
                    aria-label="Twitter"
                  >
                    <Twitter size={20} />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-8">ENVOYEZ-NOUS UN MESSAGE</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm mb-2">
                    NOM COMPLET *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 px-4 py-3 rounded-xs focus:outline-none focus:border-[#007B8A] transition-colors duration-300"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm mb-2">
                    EMAIL *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#007B8A] transition-colors duration-300"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm mb-2">
                    SUJET *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#007B8A] transition-colors duration-300"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="commande">Question sur une commande</option>
                    <option value="produit">Information produit</option>
                    <option value="collaboration">Proposition de collaboration</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm mb-2">
                    MESSAGE *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:border-[#007B8A] transition-colors duration-300 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#007B8A] text-white py-4 hover:bg-[#006170] rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  ENVOYER
                </button>

                {submitted && (
                  <motion.p
                    className="text-[#007B8A] text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.
                  </motion.p>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};
