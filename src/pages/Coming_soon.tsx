
import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Mail,
  Linkedin,
  Instagram,
  Facebook,
} from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-white text-black">
      {/* Logo at top center */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="pt-16 pb-4 px-8 flex justify-center"
      >
        <img
          src="/cmclass@.svg"
          alt="CM Class"
          className="h-16 md:h-20"
        />
      </motion.header>

      {/* Main Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="max-w-2xl w-full text-center">
          {/* H1 Title with fade-in animation */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-5xl mb-8 mt-12 px-12 md:px-24 text-transform: uppercase leading-[1.2]"
            style={{
              fontFamily: "Merriweather, serif",
              fontWeight: 700,
            }}
          >
           Le site web arrive bientôt
          </motion.h1>

          {/* Paragraph with delayed fade-in */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: "easeOut",
            }}
            className=" mb-12 text-gray-600 max-w-2xl mx-auto"
            style={{ fontFamily: "Candara, sans-serif" }}
          >
            CM Class est entrain de construire une une nouvelle experience en ligne qui célèbre notre heritage, innovation et notre vision global. La boutique sera  lancée très bientôt.
          </motion.p>

          {/* Additional Section with H3 and body copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              ease: "easeOut",
            }}
            className="mb-10 max-w-xl mx-auto"
          >
            <h3
              className="mb-4"
              style={{ fontFamily: "Merriweather, serif" }}
            >
              Rejoins l'aventure
            </h3>
            <p
              className="text-gray-600"
              style={{ fontFamily: "Candara, sans-serif" }}
            >
              Sois le premier informé lorsque nous lançons nos collections et reçois des mis à jour exclusifs de CM class
            </p>
          </motion.div>

          {/* Email Signup Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.4,
              ease: "easeOut",
            }}
            className="max-w-md mx-auto"
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
              <form
                onSubmit={handleSubmit}
                className="relative"
              >
                <div className="flex border border-gray-200 focus-within:border-[#007B8A] transition-colors duration-300">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre adresse email"
                    required
                    className="flex-1 px-6 py-4 focus:outline-none bg-transparent"
                    style={{
                      fontFamily: "Candara, sans-serif",
                    }}
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-[#007B8A] text-white hover:bg-opacity-90 transition-all duration-300 hover:scale-[1.02]"
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

      {/* Footer with Social Icons */}
      <footer className="py-8 px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex justify-center gap-6"
        >
          <SocialIcon
            icon={<Mail size={20} />}
            href="#"
            label="Email"
          />
          <SocialIcon
            icon={<Linkedin size={20} />}
            href="#"
            label="LinkedIn"
          />
          <SocialIcon
            icon={<Instagram size={20} />}
            href="#"
            label="Instagram"
          />
          <SocialIcon
            icon={<Facebook size={20} />}
            href="#"
            label="Facebook"
          />
        </motion.div>
      </footer>
    </div>
  );
}

// Social Icon Component
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