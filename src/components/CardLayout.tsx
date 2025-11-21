import { useState, type FC } from "react";
import { ChevronDown, Settings2, Check } from "lucide-react";

/** DATA */
const categoriesData = [
  { category: "Mon Monogram Personalization", image: "/images/monogram.jpg" },
  { category: "Crossbody Bags", image: "/images/crossbody.jpg" },
  { category: "Shoulder Bags", image: "/images/shoulder.jpg" },
  { category: "Totes", image: "/images/totes.jpg" },
  { category: "Mini Bags", image: "/images/mini.jpg" },
  { category: "Hobo Bags", image: "/images/hobo.jpg" },
  { category: "Bucket Bags", image: "/images/bucket.jpg" },
  { category: "Bumbags", image: "/images/bumbag.jpg" },
  { category: "Backpacks", image: "/images/backpack.jpg" },
  { category: "Top Handles", image: "/images/tophandle.jpg" },
  { category: "Trunk Bags", image: "/images/trunk.jpg" },
  { category: "Shoulder Straps", image: "/images/shoulderstrap.jpg" },
];

/** FILTER NAVBAR */
interface FilterNavbarProps {
  categories: typeof categoriesData;
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}

const FilterNavbar: FC<FilterNavbarProps> = ({ categories, selectedCategory, onSelect }) => {
  const [open, setOpen] = useState(false);

  const handleCategoryClick = (category: string) => {
    onSelect(category === selectedCategory ? null : category);
    setOpen(false);
  };

  return (
    <div className="w-full flex flex-col mt-32 mb-10 pb-4">
      <div className="w-full flex justify-between px-6 items-center gap-4">
        {/* Categories Button */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 text-xs md:text-sm bg-white transition-all duration-300 active:scale-95"
        >
          {selectedCategory || "All Handbags"}
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* FILTER BUTTON */}
        <button className="group flex items-center border rounded-3xl py-2 px-4 gap-2 text-xs transition-all duration-300 hover:border-2">
          Filters
          <Settings2 size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>

      {open && (
        <div className="w-full md:w-80 bg-white md:shadow-lg md:rounded-b-lg border-t md:border-none border-gray-200 py-4 mt-2 animate-dropdown">
          <div className="max-w-7xl mx-auto flex flex-col">
            {categories.map((item, idx) => {
              const isSelected = selectedCategory === item.category;
              return (
                <button
                  key={idx}
                  onClick={() => handleCategoryClick(item.category)}
                  className={`w-full text-left px-6 py-2 text-sm flex justify-between items-center transition-colors ${
                    !isSelected ? "hover:bg-gray-100" : ""
                  }`}
                >
                  <span>{item.category}</span>
                  {isSelected && <Check size={18} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/** CAROUSEL */
interface CardData {
  image: string;
  categories: string[];
}

interface CarouselSectionProps {
  cards: CardData[];
}

const CarouselSection: FC<CarouselSectionProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="w-full px-40 ">
      <div className="max-w-full mx-auto px-4 py-20 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="cursor-pointer flex flex-col items-start group">
    <span>Hola</span><span className="h-[1px] bg-black w-0 transition-all duration-300 group-hover:w-full"></span>


    </div>

        <div className="relative flex items-center">
          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            className="absolute left-0 z-10  bg-white rounded-full shadow-md hover:bg-gray-100 transition"
          >
            &#8592;
          </button>
          

          {/* Slides Container */}
          <div className="overflow-hidden w-full">
            <div
              className="flex transition-transform duration-500  ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {cards.map((card, idx) => (
                <div key={idx} className="flex-shrink-0 w-1/3 md:w-1/4 lg:w-1/5 ">
                  <div className="bg-white overflow-hidden flex flex-col h-30 transition-transform duration-300">
                    {/* Image */}
                    <div className="w-full h-56 relative">
                      <img src={card.image} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>

                    {/* Categories */}
                    <div className="px-4 flex flex-wrap cursor-pointer flex flex-col items-start group gap-2">
                      {card.categories.map((cat, i) => (
                        <span key={i} className="text-xs px-2 pb-0  ">
                          {cat}
                        </span>
                      ))} <span className="h-[1px] bg-black w-0 pt-0 transition-all duration-300 group-hover:w-full"></span>


                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            className="absolute right-0 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
          >
            &#8594;
          </button>
        </div>
      </div>
    </section>
  );
};

/** PARENT COMPONENT */
const HandbagsPage: FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter cards based on selected category
  const filteredCards: CardData[] = categoriesData
    .filter((item) => !selectedCategory || item.category === selectedCategory)
    .map((item) => ({
      image: item.image,
      categories: [item.category],
    }));

  return (
    <div>
      <FilterNavbar
        categories={categoriesData}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <CarouselSection cards={filteredCards} />
    </div>
  );
};

export default HandbagsPage;
















