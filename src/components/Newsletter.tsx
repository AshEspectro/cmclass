import React, { useState } from 'react';
import { motion } from 'motion/react';

export const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 3000);
    }
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            className="mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            REJOIGNEZ NOTRE CERCLE
          </motion.h2>
          <motion.p
            className="text-sm sm:text-base text-gray-600 mb-8 sm:mb-10 px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Recevez en avant-première nos nouvelles collections, événements exclusifs et histoires d'artisanat.
          </motion.p>

          <motion.form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <input
              type="email"
              placeholder="Votre adresse e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base border border-gray-300 focus:outline-none focus:border-[#007B8A] transition-colors duration-300"
            />
            <button
              type="submit"
              className="bg-[#007B8A] text-white px-6 sm:px-10 py-3 sm:py-4 text-sm sm:text-base hover:bg-[#006170] transition-all duration-300 hover:scale-105 hover:shadow-lg whitespace-nowrap"
            >
              S'INSCRIRE
            </button>
          </motion.form>

          {subscribed && (
            <motion.p
              className="mt-4 text-sm sm:text-base text-[#007B8A]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Merci de votre inscription !
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
};
