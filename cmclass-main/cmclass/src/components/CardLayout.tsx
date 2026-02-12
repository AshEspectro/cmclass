import { useEffect, useState, type FC, useMemo } from "react";
import { ChevronDown, Settings2, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import ResponsiveFilter from "./Filter_wrapper";
import { publicApi } from "../services/publicApi";
import { campaignsApi } from "../services/campaignsApi";
import { Skeleton, SkeletonCircle } from "./Skeleton";

interface FilterOption {
  label: string;
  type?: string;
  options?: string[];
}

interface FilterNavbarProps {
  categories: any[];
  selectedCategory: string | null;
  onSelect: (category: string | null, id: number | null) => void;
  filters: any[];
}

const FilterNavbar: FC<FilterNavbarProps> = ({ categories, selectedCategory, onSelect, filters }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCount, setFilterCount] = useState(0);

  const handleCategoryClick = (category: string, id: number) => {
    onSelect(category === selectedCategory ? null : category, category === selectedCategory ? null : id);
    setDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#filter-navbar")) setDropdownOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div
      id="filter-navbar"
      className="w-full z-40 fixed top-12 md:top-18 bg-white md:px-4 sm:px-6 md:px-12 lg:px-16 xl:px-8 shadow-b-sm"
    >
      <div className="w-full flex justify-between px-6 py-4 items-center gap-4">
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 text-sm md:text-sm bg-white transition-all duration-300 active:scale-95"
        >
          {selectedCategory || "Toutes les catégories"}
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        <button
          onClick={() => setFilterOpen(true)}
          className="group flex items-center border rounded-3xl py-2 pl-4 pr-3 gap-2 text-sm transition-all duration-300 hover:border-2"
        >
          Filtrer
          {filterCount > 0 && <span className="text-black font-medium">({filterCount})</span>}
          <Settings2 size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>

      {dropdownOpen && (
        <div className="w-full md:w-80 bg-white shadow-lg rounded-b-lg border-t border-gray-200 py-2 animate-dropdown">
          <div className="max-w-7xl mx-auto flex flex-col">
            {categories.map((item, idx) => {
              const catTitle = item.title || item.name;
              const isSelected = selectedCategory === catTitle;
              return (
                <button
                  key={idx}
                  onClick={() => handleCategoryClick(catTitle, item.id)}
                  className={`w-full text-left px-6 py-2 text-sm flex justify-between items-center transition-colors ${!isSelected ? "hover:bg-gray-100" : "bg-gray-50"
                    }`}
                >
                  <span>{catTitle}</span>
                  {isSelected && <Check size={18} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <ResponsiveFilter
        filters={filters}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(selected) => console.log("Applied dynamic filters:", selected)}
        onCountChange={setFilterCount}
      />
    </div>
  );
};

interface CardData {
  id: number;
  image: string;
  title: string;
}

interface CarouselSectionProps {
  cards: CardData[];
  onSelect: (id: number, title: string) => void;
  selectedId: number | null;
}

const CarouselSection: FC<CarouselSectionProps> = ({ cards, onSelect, selectedId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleSlides, setVisibleSlides] = useState(4);

  const getVisibleSlides = () => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth >= 1280) return 5;
    if (window.innerWidth >= 1024) return 4;
    return 3;
  };

  useEffect(() => {
    const handleResize = () => setVisibleSlides(getVisibleSlides());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, cards.length - visibleSlides);
  const prevSlide = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
  const nextSlide = () => setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));

  const stepPercent = 100 / visibleSlides;
  const translatePercent = currentIndex * stepPercent;

  return (
    <section className="w-full px-8 md:px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 ">
      <div className="max-w-full md:w-1/2 mx-auto py-4 mt-32 relative">
        {currentIndex > 0 && (
          <button onClick={prevSlide} className="absolute left-0 top-1/2 -translate-y-1/2 z-20">
            <ChevronLeft size={24} />
          </button>
        )}

        <div className="overflow-hidden w-full px-8">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${translatePercent}%)` }}
          >
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex-shrink-0 px-2 cursor-pointer"
                style={{ width: `${100 / visibleSlides}%` }}
                onClick={() => onSelect(card.id, card.title)}
              >
                <div className={`flex flex-col items-center transition-all duration-300 ${selectedId === card.id ? 'scale-110' : ''}`}>
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-transparent hover:border-[#007B8A] transition-all bg-gray-100 flex items-center justify-center">
                    <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[9px] md:text-[10px] mt-2 text-center font-medium uppercase tracking-tighter">
                    {card.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {currentIndex < maxIndex && (
          <button onClick={nextSlide} className="absolute right-0 top-1/2 -translate-y-1/2 z-20">
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </section>
  );
};

const HandbagsPage: FC<{ onCategoriesLoaded?: (cats: any[]) => void }> = ({ onCategoriesLoaded }) => {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("campaign");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const { mainCategories } = await publicApi.getCategories();
        let filtered = mainCategories;

        if (campaignId) {
          const camp = await campaignsApi.getCampaignById(Number(campaignId));
          if (camp && camp.selectedCategories) {
            const flat = mainCategories.reduce((acc: any[], curr: any) => {
              acc.push(curr);
              if (curr.subcategories) acc.push(...curr.subcategories);
              return acc;
            }, []);
            filtered = flat.filter((c: any) => camp.selectedCategories?.includes(Number(c.id)));
          }
        }

        setCategories(filtered);
        if (onCategoriesLoaded) onCategoriesLoaded(filtered);
      } catch (err) {
        console.error("Failed to load categories for CardLayout", err);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, [campaignId, onCategoriesLoaded]);

  // Dynamically build filters based on loaded categories
  const dynamicFilters = useMemo(() => {
    const filters: FilterOption[] = [
      { label: "Disponible en ligne", type: "toggle" }
    ];

    if (categories.length > 0) {
      filters.push({
        label: "Catégories",
        options: categories.map(c => c.title || c.name)
      });
    }

    filters.push({ label: "Trier par", options: ["Prix croissant", "Prix décroissant", "Nouveautés"] });
    filters.push({ label: "Gamme de prix", options: ["0 - 50,000 FC", "50,000 - 150,000 FC", "150,000 FC +"] });

    return filters;
  }, [categories]);

  if (loading) {
    return (
      <section className="w-full px-8 md:px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24">
        <div className="max-w-full md:w-1/2 mx-auto py-4 mt-32 relative">
          <div className="flex justify-center gap-8 px-8 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <SkeletonCircle size="16 md:w-20 md:h-20" />
                <Skeleton className="h-2 w-10" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length <= 1) return null;

  const carouselCards: CardData[] = categories.map((c) => ({
    id: c.id,
    image: c.imageUrl || "/placeholder.jpg",
    title: c.title || c.name,
  }));

  const handleSelect = (title: string | null, id: number | null) => {
    setSelectedCategory(title);
    setSelectedId(id);
    if (id) {
      const element = document.getElementById(`category-section-${id}`);
      if (element) {
        const yOffset = -120; // sticky header offset
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <FilterNavbar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={handleSelect}
        filters={dynamicFilters}
      />
      <CarouselSection
        cards={carouselCards}
        onSelect={(id, title) => handleSelect(title, id)}
        selectedId={selectedId}
      />
    </>
  );
};

export default HandbagsPage;
