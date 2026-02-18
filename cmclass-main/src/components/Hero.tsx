import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { heroApi, type HeroData } from '../../admin/services/heroApi';

interface HeroProps {
  video?: string;
  image?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

export const Hero = (props: HeroProps = {}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const data = await heroApi.getHero();
        console.log('Hero data fetched');
        setHeroData(data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch hero data:', error);
        setError('Failed to load hero section');
      } finally {
        setLoading(false);
      }
    };
    fetchHero();
  }, []);

  // Determine which data to use: API data takes precedence, fallback to props
  const displayVideo = heroData?.backgroundVideoUrl || props.video;
  const displayImage = heroData?.backgroundImageUrl || props.image;
  const displayTitle = heroData?.mainText || props.title;
  const displaySubtitle = heroData?.subtext || props.subtitle;
  const displayCtaText = heroData?.ctaButtonText || props.ctaText;
  const displayCtaLink = heroData?.ctaButtonUrl || props.ctaLink;

  // Determine which media to display based on mediaType field and availability
  // Priority: mediaType field > check if both exist and use video preference > single media type
  const shouldUseVideo = () => {
    if (heroData?.mediaType === 'video' && displayVideo) return true;
    if (heroData?.mediaType === 'image' && displayImage) return false;
    // If mediaType not set, prefer video if available, otherwise use image
    return !!displayVideo;
  };

  const showVideo = shouldUseVideo();

  // Use scroll hook only when data is loaded
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Show loading state
  if (loading) {
    return (
      <div ref={ref} className="relative h-[75vh] sm:h-[75vh] md:h-[85vh] lg:h-screen overflow-hidden bg-gray-200 animate-pulse" />
    );
  }

  // Show error state but try to use props if available
  if (error && !props.title) {
    return null;
  }

  return (
    <div
  ref={ref}
  className="relative h-[80vh] sm:h-[75vh] md:h-[85vh] mt-20 lg:h-screen overflow-hidden"
>

      {/* Background Video/Image */}
      <motion.div className="absolute inset-0  "  style={{ y }}>
        {showVideo && displayVideo ? (
          <video
            src={displayVideo}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : displayImage ? (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${displayImage})` }}
          />
        ) : null}
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent" />
      </motion.div>

      {/* Hero Content */}
      <motion.div
        className="relative h-full flex flex-col items-center justify-end text-center px-6 md:px-12 lg:px-24"
        style={{ opacity }}
      >
       

        {displaySubtitle && (
          <motion.p
            className="text-white/90 font-light uppercase text-[0.8rem] sm:text-xs md:text-xs lg:text-xs mb-4 sm:mb-8 md:mb-16 lg:mb-2"
            style={{ letterSpacing: '0.05em' }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {displaySubtitle}
          </motion.p>
          
        )} <motion.h1
          className="text-white font-serif text-xl sm:text-xl md:text-xl lg:text-xl tracking-wide leading-tight mb-8 md:mb-8 lg:mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          {displayTitle}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          <Link
            to={displayCtaLink || '/'}
            className="inline-block underline  underline-offset-6 px-8 mb-12 py-2 lg:py-2 sm:px-10 sm:py-4 text-sm md:text-base tracking-wide font-regular text-white hover:bg-white hover:text-black transition-all duration-500"
          >
            {displayCtaText}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};
