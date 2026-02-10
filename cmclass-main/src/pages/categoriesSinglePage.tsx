import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import HeaderPage from "../components/CardLayout";
import HeroSection, { HeroProduct, ProductGrid } from "../components/Hero_cat";
import { ViewMoreButton } from "../components/ViewMoreBttn";
import { publicApi } from "../services/publicApi";
import { ProductCard, type ApiProduct } from "../components/ProductCard";


export default function Category() {
  const location = useLocation();
  const [campaign, setCampaign] = useState<Record<string, unknown> | null>(null);
  const [singleCategory, setSingleCategory] = useState<Record<string, unknown> | null>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, ApiProduct[]>>({});
  const [campaignCategories, setCampaignCategories] = useState<Array<Record<string, unknown>>>([]);
  const [isStandaloneCategory, setIsStandaloneCategory] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const campaignId = params.get("campaignId");
    const categoryId = params.get("categoryId");
    let mounted = true;
    
    // If viewing a standalone category (no campaignId but has categoryId)
    if (!campaignId && categoryId) {
      const catId = Number(categoryId);
      // Validate that categoryId is a valid number
      if (isNaN(catId) || catId <= 0) {
        console.warn('Invalid categoryId:', categoryId);
        setIsStandaloneCategory(false);
        return () => { mounted = false; };
      }
      
      setIsStandaloneCategory(true);
      (async () => {
        try {
          const resp = await publicApi.getProductsByCategory(catId);
          const items: ApiProduct[] = Array.isArray(resp) ? resp : (resp.items || resp.data || []);
          if (mounted) {
            setProducts(items);
            // Fetch category details
            const catResp = await publicApi.getCategory(catId);
            if (mounted) setSingleCategory(catResp as Record<string, unknown>);
          }
        } catch (err) {
          console.error('Failed to load standalone category', err);
        }
      })();
    }
    
    return () => { mounted = false; };
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const campaignId = params.get("campaignId");
    if (!campaignId) return;

    let mounted = true;
    (async () => {
      try {
        const apiBase = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';

        // Fetch campaign categories and campaign details from the new endpoint
        const resp = await fetch(`${apiBase}/campaigns/${campaignId}/categories`);
        if (!resp.ok) {
          console.warn('Campaign not found or has no categories, using fallback', resp.status);
          // Don't return—let the page render with fallback content (HeaderPage)
        } else {

        const payload = await resp.json();
        const cats = Array.isArray(payload.data) ? payload.data : (payload.data || []);
        const campaignObj = payload.campaign || null;

        if (mounted) setCampaign(campaignObj);

        // Save category summaries
        if (mounted) setCampaignCategories(cats as Record<string, unknown>[]);

        // For each category (in campaign order), fetch its products via the campaign-position endpoint
        const byCatMap: Record<string, ApiProduct[]> = {};
        await Promise.all(
          (cats || []).map(async (cat: any, idx: number) => {
            const pos = idx + 1; // 1-based position required by the server
            try {
              const det = await fetch(`${apiBase}/campaigns/${campaignId}/categories/${pos}`);
              if (!det.ok) {
                byCatMap[Number(cat?.id)] = [];
                return;
              }
              const detBody = await det.json();
              const catData = detBody.data || detBody;
              const items: ApiProduct[] = Array.isArray(catData.products)
                ? catData.products
                : (Array.isArray(catData.items) ? catData.items : (Array.isArray(catData.data) ? catData.data : []));

              byCatMap[Number(cat?.id)] = (items || []).slice(0, 9);
            } catch (e) {
              byCatMap[Number(cat?.id)] = [];
            }
          })
        );

        if (mounted) {
          setProductsByCategory(byCatMap);
          const firstList = Object.values(byCatMap)[0] || [];
          setProducts((firstList as ApiProduct[]).slice(0, 9));
        }
        }
      } catch (err) {
        console.error('Failed to load campaign categories', err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [location.search]);

  // Ensure we populate campaignCategories from campaign's category ids
  useEffect(() => {
    const needEnrich = !!campaign && (
      !campaignCategories || campaignCategories.length === 0 || campaignCategories.some((c: any) => !c.name && !c.title && !c.slug && !c.imageUrl)
    );
    if (!needEnrich) return;

    (async () => {
      try {
        const rawCats = (campaign as any).categories && Array.isArray((campaign as any).categories)
          ? (campaign as any).categories
          : ((campaign as any).selectedCategories && Array.isArray((campaign as any).selectedCategories))
            ? (campaign as any).selectedCategories.map((id: any) => ({ id: Number(id) }))
            : (campaign as any).category
              ? [(campaign as any).category]
              : (campaign as any).categoryId
                ? [{ id: (campaign as any).categoryId }]
                : [];

        if (rawCats.length === 0) return;

        const normalized = rawCats.map((c: any) => (typeof c === 'object' ? c : { id: Number(c) }));
        const allLeaves = await publicApi.getLeafCategories();
        const detailed = await Promise.all(
          normalized.map(async (c: any) => {
            const found = Array.isArray(allLeaves) ? (allLeaves as any[]).find((l) => Number(l.id) === Number(c.id)) : undefined;
            if (found) return { ...(found || {}), ...(c || {}) };
            if (c && c.id) {
              try {
                const single = await publicApi.getCategory(Number(c.id));
                return { ...(single || {}), ...(c || {}) };
              } catch (err) {
                // ignore
              }
            }
            return c;
          })
        );

        setCampaignCategories(detailed as Record<string, unknown>[]);
      } catch (err) {
        console.error('Failed to enrich campaign categories', err);
      }
    })();
  }, [campaign]);

  return (
    <div className=" mt-8  ">
      {/* Standalone category view (no campaign) */}
      {isStandaloneCategory && singleCategory ? (
        <>
          <HeroSection
            image={String((singleCategory as any).imageUrl) || '/homme.jfif'}
            title={String((singleCategory as any).name || 'Collection')}
            description={String((singleCategory as any).description || '')}
          />
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.length === 0 ? (
                <div className="col-span-full text-center text-gray-500">Aucun produit pour cette catégorie</div>
              ) : (
                products.map((p) => <ProductCard key={p.id} product={p} />)
              )}
            </div>
          </section>
        </>
      ) : campaign ? (
        <>
          {/* Render HeaderPage with campaign categories at the top */}
          <HeaderPage campaignCategories={campaignCategories} />
          
          {/* If campaign contains categories, render one section per category */}
          {campaignCategories && campaignCategories.length > 0 ? (
            campaignCategories.map((cat: any, idx: number) => {
              const cid = Number(cat?.id);
              const matched = campaignCategories.find((c: any) => Number((c as any).id) === cid) || cat;
              const catTitle = String(matched?.title || matched?.name || matched?.slug || (campaignCategories as any).title || 'Collection');
              const catImage = String(matched?.imageUrl || matched?.image || (campaign as any).imageUrl || '/homme.jfif');
              const catDescription = String(matched?.description || (campaign as any).description || '');
              const catSlug = String(matched?.slug || '');
              const items = productsByCategory[cid] || [];

              return (
                <><section key={`camp-cat-${cid}-${idx}`} className="mb-12">

                  <HeroSection image={String(catImage)} title={String(catTitle)} description={String(catDescription)} />
                  <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {items.length === 0 ? (
                        <div className="col-span-full text-center text-gray-500">{catTitle}</div>
                      ) : (
                        items.map((p) => <ProductCard key={p.id} product={p} />)
                      )}
                    </div>
                    {catSlug && (
                      <div className="mt-6 flex justify-center">
                        <Link to={`/${catSlug}`} className="text-sm font-medium text-[#007B8A] hover:underline">
                          View All {catTitle}
                        </Link>
                      </div>
                    )}
                  </div>
                </section></>
              );
            })
          ) : (
            // No categories on campaign: render campaign hero and generic products (first 9)
            <>
              <HeroSection
                image={String((campaign as any).imageUrl) || '/homme.jfif'}
                title={String((campaign as any).title || 'Collection')}
                description={String((campaign as any).description || (campaign as any).subtitle || '')}
              />

              <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {products.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500">Aucun produit pour cette campagne</div>
                  ) : (
                    products.map((p) => <ProductCard key={p.id} product={p} />)
                  )}
                </div>
              </section>
            </>
          )}
        </>
      ) : (
        <>
          <HeroSection
            image="/homme.jfif"
            title="Explore Our New Collection"
            description="Évoquant la douceur des fêtes et l’élégance discrète des saisons froides, cette chemise s’impose comme une pièce maîtresse d’un vestiaire pensé pour les instants partagés. Conçue dans une silhouette épurée, elle mêle lignes modernes et tradition réinventée, révélant un tissu à la fois léger, chaleureux et subtilement texturé "
          />
          <ProductGrid limit={8} />

          <HeroProduct image="/woman.jfif" />
          <ProductGrid />
          <ViewMoreButton />
        </>
      )}
    </div>
  );
}