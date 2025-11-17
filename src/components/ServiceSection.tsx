import { useState, useRef, useEffect } from "react";

interface CardItem {
  image: string;
  title: string;
  description: string;
  link: string;
}

interface ServicesProps {
  title: string;
  description: string;
  items: CardItem[];
}

export const Services = ({ title, description, items }: ServicesProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // 🔹 Met à jour l'index actif selon la position du scroll
  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const width = container.clientWidth;
      const newIndex = Math.round(scrollLeft / width);
      setActiveIndex(newIndex);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔹 Recentre automatiquement la carte la plus proche
  

  return (
    <section className="pb-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h3 className="text-xl sm:text-xl md:text-2xl font-semibold mb-2">{title}</h3>
          <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto">{description}</p>
        </div>

        {/* Cards — responsive carousel */}
        <div
          ref={carouselRef}
          className="
            flex sm:grid sm:grid-cols-3 gap-6 
            overflow-x-auto sm:overflow-visible 
            scroll-smooth snap-x sm:snap-none
            no-scrollbar
                      "
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="
                flex-shrink-0 w-[100%] sm:w-auto 
                snap-center sm:snap-none
              "
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-full aspect-[11/16] md:aspect-[3/4] overflow-hidden shadow-md  mb-4 ">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h4 className="text-sm md:text-sm lg:text-lg font-medium mb-1">{item.title}</h4>
                <a
                  href={item.link}
                  className="text-xs md:text-xs py-4 lg:text-sm underline underline-offset-4 hover:text-[#007B8A] transition-colors"
                >
                  {item.description}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation dots (mobile only) */}
        <div className="flex justify-center mt-4 gap-2 sm:hidden">
          {items.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeIndex ? "bg-gray-800 scale-110" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
