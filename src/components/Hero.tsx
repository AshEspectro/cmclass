import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';

interface HeroProps {
  image: string;
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaLink: string;
}

export const Hero = ({ image, title, subtitle, ctaText, ctaLink }: HeroProps) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={ref} className="relative h-[70vh] sm:h-[80vh] md:h-[90vh] lg:h-screen overflow-hidden">
      {/* Parallax Background */}
      <motion.div
        className="absolute inset-0 bg-gray-200"
        style={{ y }}
      >
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-black/20" />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative h-full flex items-center justify-center text-center px-4 sm:px-6"
        style={{ opacity }}
      >
        <div className="max-w-4xl">
          <motion.h1
            className="text-white mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              className="text-white/90 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {subtitle}
            </motion.p>
          )}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link
              to={ctaLink}
              className="inline-block bg-[#007B8A] text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-sm sm:text-base hover:bg-[#006170] transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              {ctaText}
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
