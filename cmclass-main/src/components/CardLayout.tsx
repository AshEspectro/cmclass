import { useEffect, useState, type FC } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronDown, Settings2, Check, ChevronRight } from "lucide-react";
import { ChevronLeft ,} from "lucide-react";

/** DATA */

/** CATEGORIES DATA FOR FILTER NAVBAR */


// pages/HomeWithAltNavbar.tsx
//import { AltNavbarOnScroll } from "./AltNavbarOnScroll";



import ResponsiveFilter from "./Filter_wrapper";
import { categoriesData, filtersData } from "../data/products";
//import { ViewMoreButton } from "./ViewMoreBttn";

type SelectedFilters = Record<string, unknown>;

interface CategoryItem {
  category: string;
  image: string;
  categoryId?: number;
  description?: string;
  slug?: string;
  productCount?: number;
}

const mapCampaignCategory = (c: Record<string, unknown>): CategoryItem => ({
  category: String(c.name || c.title || c.label || "Collection"),
  image: String(c.imageUrl || c.image || "/homme.jfif"),
  categoryId: typeof c.id === "number" ? c.id : undefined,
  description: c.description ? String(c.description) : undefined,
  slug: c.slug ? String(c.slug) : undefined,
  productCount: typeof c.productCount === "number" ? c.productCount : undefined,
});

interface FilterNavbarProps {
  categories: CategoryItem[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
  onApplyFilters: (selected: SelectedFilters) => void;
}

const FilterNavbar: FC<FilterNavbarProps> = ({
  categories,
  selectedCategory,
  onSelect,
  onApplyFilters,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCount, setFilterCount] = useState(0);

  const handleCategoryClick = (category: string) => {
    onSelect(category === selectedCategory ? null : category);
    setDropdownOpen(false);
  };

  // Close dropdown if clicked outside
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
      className="w-full  z-40 fixed top-12 md:top-18  bg-white md:px-4 sm:px-6 md:px-12 lg:px-16 xl:px-8 shadow-b-sm"
    >
      <div className="w-full flex justify-between px-6 py-4 items-center gap-4">
        {/* Categories Dropdown */}
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 text-sm md:text-sm bg-white transition-all duration-300 active:scale-95"
        >
          {selectedCategory || "All categories"}
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Filter Button */}
        <button
          onClick={() => setFilterOpen(true)}
          className="group flex items-center border rounded-3xl py-2 pl-4 pr-3 gap-2 text-sm transition-all duration-300 hover:border-2"
        >
          Filtrer
          {filterCount > 0 && (
            <span className="text-black font-medium">({filterCount})</span>
          )}
          <Settings2 size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>

      {/* Categories Dropdown Menu */}
      {dropdownOpen && (
        <div className="w-full md:w-80 bg-white shadow-lg rounded-b-lg border-t border-gray-200 py-2 animate-dropdown">
          <div className="max-w-7xl mx-auto flex flex-col">
            {categories.map((item, idx) => {
              const isSelected = selectedCategory === item.category;
              return (
                <button
                  key={idx}
                  onClick={() => handleCategoryClick(item.category)}
                  className={`w-full text-left px-6 py-2 text-sm flex justify-between items-center transition-colors ${
                    !isSelected ? "hover:bg-gray-100" : "bg-gray-50"
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

      {/* Responsive Filter Modal */}
      <ResponsiveFilter
        filters={filtersData}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(selected) => onApplyFilters(selected)}
        onCountChange={setFilterCount} // updates filter count badge
      />
    </div>
  );
};



/** CAROUSEL */


interface CardData {
  image: string;
  categories: string[];
  categoryId?: number;
}

interface CarouselSectionProps {
  cards: CardData[];
}

const CarouselSection: FC<CarouselSectionProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleSlides, setVisibleSlides] = useState(4); // default

  // Determine how many cards are visible based on viewport width
  const getVisibleSlides = () => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth >= 1280) return 5; // xl
    if (window.innerWidth >= 1024) return 4; // lg
    if (window.innerWidth >= 768) return 4; // md
    if (window.innerWidth >= 640) return 4;
    if (window.innerWidth >= 360) return 3; // sm
    return 2; // mobile default
  };

  // Update visibleSlides on resize
  useEffect(() => {
    const handleResize = () => setVisibleSlides(getVisibleSlides());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Clamp currentIndex to valid range
  const maxIndex = Math.max(0, cards.length - visibleSlides);
  useEffect(() => {
    if (currentIndex > maxIndex) setCurrentIndex(maxIndex);
  }, [visibleSlides, cards.length, maxIndex, currentIndex]);

  // Navigation
  const prevSlide = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
  const nextSlide = () => setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));

  // Transform calculation
  const stepPercent = 100 / visibleSlides;
  const translatePercent = currentIndex * stepPercent;

  return (
    <section className="w-full px-8 md:px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 ">
      <div className="max-w-full md:w-1/2 mx-auto py-4 mt-32 relative">
        {/* Left Arrow */}
        {currentIndex > 0 && (
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 "
            aria-label="previous"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Slides Container */}
        <div className="overflow-hidden w-full">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${translatePercent}%)`,
            }}
          >
            {cards.map((card, idx) => (
              <div
                key={idx}
                className={`flex-shrink-0 `}
                style={{ width: `${100 / visibleSlides}%` }}
              >
                {/* Image */}
                <div className="flex flex-col h-full w-24  transition-transform duration-300">
                  <div className="w-full h-28 relative flex items-center justify-center overflow-hidden ">
                    <img
                      src={card.image}
                      alt={`Slide ${idx + 1}`}
                      className="w-full h-full object-cover bg-black/10 transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  {/* Categories */}
                  {card.categoryId ? (
                    <Link to={`/category?categoryId=${card.categoryId}`} className="block">
                      <div className="flex flex-col items-start mt-2 cursor-pointer group gap-1">
                        {card.categories.map((cat, i) => (
                          <span key={i} className="text-xs w-6 px-1">
                            {cat}
                          </span>
                        ))}
                        <span className="h-[1px] bg-black w-0 transition-all duration-300 group-hover:w-full" />
                      </div>
                    </Link>
                  ) : (
                    <div className="flex flex-col items-start mt-2 cursor-pointer group gap-1">
                      {card.categories.map((cat, i) => (
                        <span key={i} className="text-xs w-6 px-1">
                          {cat}
                        </span>
                      ))}
                      <span className="h-[1px] bg-black w-0 transition-all duration-300 group-hover:w-full" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        {currentIndex < maxIndex && (
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 "
            aria-label="next"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </section>
  );
};




interface HeaderPageProps {
  campaignCategories?: Array<Record<string, unknown>>;
  onFilteredCategoryIdsChange?: (categoryIds: number[]) => void;
}

/** PARENT COMPONENT */
const HeaderPage: FC<HeaderPageProps> = ({
  campaignCategories: propCampaignCategories,
  onFilteredCategoryIdsChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({});
  const location = useLocation();
  const [remoteCategories, setRemoteCategories] = useState<CategoryItem[] | null>(null);

  const categoryMatchesFilters = (category: CategoryItem, applied: SelectedFilters) => {
    const searchText = `${category.category} ${category.description || ""} ${category.slug || ""}`
      .toLowerCase()
      .trim();

    const activeEntries = Object.entries(applied).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value === true;
    });

    if (activeEntries.length === 0) return true;

    for (const [label, value] of activeEntries) {
      const normalizedLabel = label.toLowerCase();

      if (Array.isArray(value)) {
        // "Sort by" affects ordering, not inclusion.
        if (normalizedLabel.includes("sort")) continue;

        const matchesAnyOption = value.some((option) =>
          searchText.includes(String(option).toLowerCase())
        );
        if (!matchesAnyOption) return false;
        continue;
      }

      if (value === true && normalizedLabel.includes("available")) {
        // If explicit availability metadata exists on category, enforce it.
        const availability = (category as Record<string, unknown>).availableOnline;
        if (typeof availability === "boolean" && !availability) return false;
      }
    }

    return true;
  };

  useEffect(() => {
    // If campaign categories are passed as props, use them directly
    if (propCampaignCategories && propCampaignCategories.length > 0) {
      setRemoteCategories(null);
      return;
    }

    const params = new URLSearchParams(location.search);
    const campaignId = params.get('campaignId') || import.meta.env.VITE_CAMPAIGN_ID;
    if (!campaignId) return;

    let mounted = true;
    (async () => {
      try {
        const apiBase = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const resp = await fetch(`${apiBase}/campaigns/${campaignId}/categories`);
        if (!resp.ok) {
          // Campaign not found, fall back to local categories
          console.warn('Campaign not found, using local categories', resp.status);
        } else {
          const body = await resp.json();
          const cats = Array.isArray(body.data) ? body.data : (body.data || []);

const mapped = cats.map(mapCampaignCategory);

        if (mounted) setRemoteCategories(mapped);
        }
      } catch {
        // ignore and keep fallback
      }
    })();

    return () => { mounted = false; };
  }, [location.search, propCampaignCategories]);

  // Determine source categories (remote when available)
  const propMappedCategories = Array.isArray(propCampaignCategories)
    ? propCampaignCategories.map(mapCampaignCategory)
    : [];

  const sourceCategories: CategoryItem[] =
    (propMappedCategories.length > 0 ? propMappedCategories : remoteCategories) ||
    categoriesData.map((item) => ({
      category: item.category,
      image: item.image,
    }));

  // If a single category is requested via query, hide the FilterNavbar.
  const params = new URLSearchParams(location.search);
  const singleCategoryRequested = !!params.get('categoryId');
  const showFilterNavbar = !singleCategoryRequested && sourceCategories.length > 0;

  const filteredSourceCategories = sourceCategories
    .filter((item) => !selectedCategory || item.category === selectedCategory)
    .filter((item) => categoryMatchesFilters(item, selectedFilters));

  useEffect(() => {
    if (!onFilteredCategoryIdsChange) return;
    const ids = filteredSourceCategories
      .map((item) => item.categoryId)
      .filter((id): id is number => typeof id === "number");
    onFilteredCategoryIdsChange(ids);
  }, [filteredSourceCategories, onFilteredCategoryIdsChange]);

  // Filter cards based on selected category
  const filteredCards: CardData[] = filteredSourceCategories
    .map((item) => ({
      image: item.image,
      categories: [item.category],
      categoryId: item.categoryId,
    }));

  return (
    
       <>
      {showFilterNavbar && (
        <FilterNavbar
          categories={sourceCategories}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
          onApplyFilters={setSelectedFilters}
        />
      )}
    <CarouselSection cards={filteredCards} />
   
</>
    
  );
};

export default HeaderPage;
















