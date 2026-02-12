import { useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import HandbagsPage from "../components/CardLayout";
import HeroSection, { ProductGrid } from "../components/Hero_cat";
import { ViewMoreButton } from "../components/ViewMoreBttn";
import { Skeleton, SkeletonProductCard } from "../components/Skeleton";
import { publicApi } from "../services/publicApi";
import { campaignsApi } from "../services/campaignsApi";

export default function Category() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const campaignId = searchParams.get("campaign");
  const categorySlug = searchParams.get("category") || location.pathname.split('/').pop();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { mainCategories } = await publicApi.getCategories();

        // Flat list for searching
        const flatCategories = mainCategories.reduce((acc: any[], curr: any) => {
          acc.push(curr);
          if (curr.subcategories) acc.push(...curr.subcategories);
          return acc;
        }, []);

        if (campaignId) {
          const campaign = await campaignsApi.getCampaignById(Number(campaignId));
          if (campaign && campaign.selectedCategories) {
            const filtered = flatCategories.filter((c: any) =>
              campaign.selectedCategories?.includes(Number(c.id))
            );
            setCategories(filtered);
          }
        } else if (categorySlug && categorySlug !== 'category') {
          const found = flatCategories.filter((c: any) => c.slug === categorySlug);
          if (found.length > 0) {
            setCategories(found);
          } else {
            // Fallback or maybe search by title
            const foundByTitle = flatCategories.filter((c: any) => c.title?.toLowerCase() === categorySlug.toLowerCase());
            setCategories(foundByTitle);
          }
        } else if (location.pathname === '/nouveautes') {
          // Special case for nouveautes if not in slug
          setCategories(mainCategories.slice(0, 1));
        } else {
          setCategories(mainCategories.slice(0, 4));
        }
      } catch (err) {
        console.error("Error loading Category page data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campaignId, categorySlug, location.pathname]);

  if (loading) {
    return (
      <div className="mt-8 space-y-12">
        <Skeleton className="w-full h-[60vh] lg:h-[70vh] xl:h-[100vh]" />
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonProductCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {categories.length > 1 && <HandbagsPage />}

      {categories.map((cat, index) => (
        <div key={cat.id} id={`category-section-${cat.id}`} className="mb-20">
          <HeroSection
            image={cat.imageUrl || "/placeholder.jpg"}
            title={cat.title || cat.name}
            description={cat.description || "Découvrez notre sélection exclusive CMClass."}
          />
          <div className="max-w-[1440px] mx-auto">
            <ProductGrid categoryId={cat.id} limit={9} />
          </div>

          {categories.length > 1 && index < categories.length - 1 && (
            <div className="my-10" />
          )}
        </div>
      ))}

      {categories.length === 0 && (
        <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 pt-24">
          <h2 className="text-xl font-light mb-4">La collection arrive bientôt</h2>
          <p className="text-gray-500 text-center max-w-md">
            Nous préparons actuellement nos nouvelles créations. Revenez très prochainement pour découvrir la suite de l'aventure CMClass.
          </p>
        </div>
      )}

      <ViewMoreButton />
    </div>
  );
}