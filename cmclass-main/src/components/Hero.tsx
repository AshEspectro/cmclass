import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';

interface HeroProps {
  video?: string; // optional video
  image?: string; // fallback image
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaLink: string;
}

export const Hero = ({ video, image, title, subtitle, ctaText, ctaLink }: HeroProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div
  ref={ref}
  className="relative h-[75vh] sm:h-[75vh] md:h-[85vh] lg:h-screen overflow-hidden"
>

      {/* Background Video/Image */}
      <motion.div className="absolute inset-0  "  style={{ y }}>
        {video ? (
          <video
            src={video}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
          />
        )}
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent" />
      </motion.div>

      {/* Hero Content */}
      <motion.div
        className="relative h-full flex flex-col items-center justify-end text-center px-6 md:px-12 lg:px-24"
        style={{ opacity }}
      >
       

        {subtitle && (
          <motion.p
            className="text-white/90 font-light text-sm sm:text-xl md:text-xl lg:text-xl mb-4 sm:mb-8 md:mb-16 lg:mb-2"
            style={{ letterSpacing: '0.05em' }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {subtitle}
          </motion.p>
          
        )} <motion.h1
          className="text-white font-serif text-xl sm:text-xl md:text-xl lg:text-xl tracking-wide leading-tight mb-8 md:mb-8 lg:mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          {title}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          <Link
            to={ctaLink}
            className="inline-block px-8 mb-12 py-2 lg:py-2 sm:px-10 sm:py-4 text-sm md:text-base tracking-wide font-medium text-white border border-white hover:bg-white hover:text-black transition-all duration-500"
          >
            {ctaText}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};
