import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Instagram, Facebook, Twitter} from "lucide-react";

export default function Coming_soon() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => {
        setEmail("");
        setIsSubmitted(false);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-black overflow-x-hidden">
      {/* Logo */}
      
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="pt-16 px-6 flex justify-center"
      ><a href="/home">
        <img src="/cmclass.svg" alt="CM Class" className="h-14 md:h-20"  /></a>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-2xl text-center mx-auto">
          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl mb-8 mt-8 px-4 sm:px-8 md:px-12 leading-tight uppercase"
            style={{
              fontFamily: "Merriweather, serif",
              fontWeight: 700,
            }}
          >
          Le site web arrive bientôt
          </motion.h1>

          {/* Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mb-12 text-gray-600 mx-auto max-w-xl"
            style={{ fontFamily: "Candara, sans-serif" }}
          >
            CM Class est en train de construire une nouvelle expérience en ligne
            qui célèbre notre héritage, notre innovation et notre vision globale.
            La boutique sera lancée très bientôt.
          </motion.p>

          {/* Subsection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="mb-10 max-w-xl mx-auto px-4"
          >
            <h3
              className="mb-4 text-xl"
              style={{ fontFamily: "Merriweather, serif" }}
            >
              Rejoins l'aventure
            </h3>
            <p
              className="text-gray-600"
              style={{ fontFamily: "Candara, sans-serif" }}
            >
              Soyez le premier informé lorsque nous lançons nos collections et
              recevez des mises à jour exclusives de CM Class.
            </p>
          </motion.div>

          {/* Email Signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="max-w-md mx-auto w-full px-4"
          >
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[#007B8A] py-4"
                style={{ fontFamily: "Candara, sans-serif" }}
              >
                Merci ! Vous serez informé·e très bientôt.
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="relative w-full">
                <div className="flex flex-col sm:flex-row border border-gray-200 focus-within:border-[#007B8A] transition-colors duration-300 rounded-lg overflow-hidden">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre adresse email"
                    required
                    className="flex-1 px-4 py-3 focus:outline-none bg-transparent w-full"
                    style={{
                      fontFamily: "Candara, sans-serif",
                    }}
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#007B8A] text-white hover:bg-opacity-90 transition-all duration-300 hover:scale-[1.02] w-full sm:w-auto"
                    style={{
                      fontFamily: "Candara, sans-serif",
                    }}
                  >
                    Envoyer
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex justify-center gap-6 flex-wrap"
        >
          <SocialIcon icon={<Mail size={20} />} href="#" label="Email" />
          <SocialIcon icon={<Twitter size={20} />} href="https://x.com/CMclass243" label="X(twitter)" />
          <SocialIcon icon={<Instagram size={20} />} href="https://www.instagram.com/cm_class_officiel/" label="Instagram" />
          <SocialIcon icon={<Facebook size={20} />} href="https://www.facebook.com/cmclassdrc/" label="Facebook" />
        </motion.div>
      </footer>
    </div>
  );
}

/* Social Icon Component */
// eslint-disable-next-line react-refresh/only-export-components
function SocialIcon({
  icon,
  href,
  label,
}: {
  icon: React.ReactNode;
  href: string;
  label: string;
}) {
  return (
    <motion.a
      href={href}
      aria-label={label}
      className="text-black hover:text-[#007B8A] transition-colors duration-300"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
    </motion.a>
  );
}
