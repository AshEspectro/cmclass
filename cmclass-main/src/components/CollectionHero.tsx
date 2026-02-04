import { useEffect, useState } from 'react';
import { publicApi } from '../services/publicApi';

interface CategoryHeroProps {
  categoryTitle: string;
  subCategoryIndex?: number;
  campaignId?: number;
}

interface CampaignData {
  heroImg: string;
  categoryTitle: string;
  subCategoryName: string;
}

// Component
export const CategoryHero = ({
  categoryTitle,
  campaignId,
}: CategoryHeroProps) => {
  const [data, setData] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        setLoading(true);
        
        // If campaignId is provided, fetch specific campaign
        if (campaignId) {
          const campaigns = await publicApi.getCampaigns();
          const campaign = Array.isArray(campaigns) 
            ? campaigns.find((c: Record<string, unknown>) => c.id === campaignId)
            : null;
          
          if (campaign) {
            setData({
              heroImg: campaign.imageUrl || '',
              categoryTitle: campaign.title || categoryTitle,
              subCategoryName: campaign.genreText || '',
            });
          } else {
            setData({
              heroImg: '',
              categoryTitle: categoryTitle,
              subCategoryName: '',
            });
          }
        } else {
          // Fallback if no campaignId provided
          setData({
            heroImg: '',
            categoryTitle: categoryTitle,
            subCategoryName: '',
          });
        }
      } catch (error) {
        console.error('Error fetching campaign data:', error);
        setData({
          heroImg: '',
          categoryTitle: categoryTitle,
          subCategoryName: '',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignData();
  }, [campaignId, categoryTitle]);

  if (loading || !data) {
    return (
      <div className="relative w-full h-[75vh] sm:h-[75vh] md:h-[85vh] lg:h-screen overflow-hidden bg-gray-200" />
    );
  }

  return (
    <>
      <div className="relative w-full h-[75vh] sm:h-[75vh] md:h-[85vh] lg:h-screen overflow-hidden">
        {data.heroImg && (
          <img
            src={data.heroImg}
            alt={data.categoryTitle}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent" />
      </div>

      <div className="relative  pt-12  pb-6 px-4 sm:px-6 lg:px-12 h-full flex flex-col items-center justify-center text-center">
        <p className="uppercase text-[0.625rem] sm:text-xs md:text-xs lg:text-xs sm:text-base tracking-widest">
          {data.subCategoryName}
        </p>
        <div className="mt-2 sm:mt-3">
          <h3 className="text-xl sm:text-3xl md:text-3xl lg:text-3xl font-semibold hover:text-[#007B8A] transition-colors duration-300 cursor-pointer">
            {data.categoryTitle}
          </h3>
        </div>
      </div>
    </>
  );
};
