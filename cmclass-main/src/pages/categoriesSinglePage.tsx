import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import HeaderPage from "../components/CardLayout";
import HeroSection, { HeroProduct, ProductGrid } from "../components/Hero_cat";
import { ViewMoreButton } from "../components/ViewMoreBttn";
import { publicApi } from "../services/publicApi";
import { ProductCard, type ApiProduct } from "../components/ProductCard1";
import { Skeleton, SkeletonProductCard } from "../components/Skeleton";

type StatusError = Error & { status?: number };

const RETRY_DELAY_MS = 3000;

const createHttpError = (message: string, status?: number): StatusError => {
  const error = new Error(message) as StatusError;
  error.status = status;
  return error;
};

const isNotFoundError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "status" in error &&
  Number((error as StatusError).status) === 404;


export default function Category() {
  const location = useLocation();
  const [campaign, setCampaign] = useState<Record<string, unknown> | null>(null);
  const [singleCategory, setSingleCategory] = useState<Record<string, unknown> | null>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, ApiProduct[]>>({});
  const [campaignCategories, setCampaignCategories] = useState<Array<Record<string, unknown>>>([]);
  const [filteredCampaignCategoryIds, setFilteredCampaignCategoryIds] = useState<number[] | null>(
    null
  );
  const [isStandaloneCategory, setIsStandaloneCategory] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const campaignId = params.get("campaignId") || params.get("campaign");
    const categoryParam = params.get("categoryId") || params.get("category");
    const apiBase =
      import.meta.env.VITE_BACKEND_URL ||
      import.meta.env.VITE_API_URL ||
      "http://localhost:3000";

    let mounted = true;
    let retryTimer: number | undefined;

    const loadCategoryPage = async () => {
      if (!mounted) return;
      setLoading(true);

      try {
        if (!campaignId && categoryParam) {
          let catId = Number(categoryParam);
          let resolvedCategory: Record<string, unknown> | null = null;

          if (isNaN(catId) || catId <= 0) {
            const categorySlug = String(categoryParam).trim().toLowerCase();
            const leafCategories = await publicApi.getLeafCategories({ throwOnError: true });
            const matched = Array.isArray(leafCategories)
              ? (leafCategories as Array<Record<string, unknown>>).find(
                  (cat) => String((cat as any)?.slug || "").trim().toLowerCase() === categorySlug
                )
              : undefined;

            if (!matched) {
              setIsStandaloneCategory(false);
              setSingleCategory(null);
              setProducts([]);
              setFilteredCampaignCategoryIds(null);
              setLoading(false);
              return;
            }

            resolvedCategory = matched;
            catId = Number((matched as any)?.id);
            if (isNaN(catId) || catId <= 0) {
              setIsStandaloneCategory(false);
              setSingleCategory(null);
              setProducts([]);
              setFilteredCampaignCategoryIds(null);
              setLoading(false);
              return;
            }
          }

          setIsStandaloneCategory(true);
          setCampaign(null);
          setCampaignCategories([]);
          setProductsByCategory({});
          setFilteredCampaignCategoryIds(null);

          const categoryPromise = resolvedCategory
            ? Promise.resolve(resolvedCategory)
            : publicApi.getCategory(catId, { throwOnError: true });

          const [resp, catResp] = await Promise.all([
            publicApi.getProductsByCategory(catId, { throwOnError: true }),
            categoryPromise,
          ]);
          if (!mounted) return;

          const items: ApiProduct[] = Array.isArray(resp)
            ? resp
            : Array.isArray((resp as any).items)
              ? (resp as any).items
              : Array.isArray((resp as any).data)
                ? (resp as any).data
                : [];

          setProducts(items);
          setSingleCategory((catResp as Record<string, unknown>) || resolvedCategory || null);
          setLoading(false);
          return;
        }

        if (campaignId) {
          setIsStandaloneCategory(false);
          setSingleCategory(null);

          const resp = await fetch(`${apiBase}/campaigns/${campaignId}/categories`);
          if (!resp.ok) {
            if (resp.status === 404) {
              setCampaign(null);
              setCampaignCategories([]);
              setProductsByCategory({});
              setProducts([]);
              setFilteredCampaignCategoryIds(null);
              setLoading(false);
              return;
            }
            throw createHttpError(
              `Failed to fetch campaign categories: ${resp.status}`,
              resp.status
            );
          }

          const payload = await resp.json();
          const cats = Array.isArray(payload.data) ? payload.data : payload.data || [];
          const campaignObj = payload.campaign || null;

          const byCatMap: Record<string, ApiProduct[]> = {};
          await Promise.all(
            (cats || []).map(async (cat: any, idx: number) => {
              const pos = idx + 1;
              const detailResponse = await fetch(
                `${apiBase}/campaigns/${campaignId}/categories/${pos}`
              );

              if (!detailResponse.ok) {
                if (detailResponse.status === 404) {
                  byCatMap[Number(cat?.id)] = [];
                  return;
                }
                throw createHttpError(
                  `Failed to fetch campaign category detail: ${detailResponse.status}`,
                  detailResponse.status
                );
              }

              const detailBody = await detailResponse.json();
              const categoryData = detailBody.data || detailBody;
              const items: ApiProduct[] = Array.isArray(categoryData.products)
                ? categoryData.products
                : Array.isArray(categoryData.items)
                  ? categoryData.items
                  : Array.isArray(categoryData.data)
                    ? categoryData.data
                    : [];

              byCatMap[Number(cat?.id)] = (items || []).slice(0, 9);
            })
          );

          if (!mounted) return;
          setCampaign(campaignObj);
          setCampaignCategories(cats as Record<string, unknown>[]);
          setFilteredCampaignCategoryIds(
            (cats || [])
              .map((c: any) => Number(c?.id))
              .filter((id: number) => !isNaN(id) && id > 0)
          );
          setProductsByCategory(byCatMap);
          const firstList = Object.values(byCatMap)[0] || [];
          setProducts((firstList as ApiProduct[]).slice(0, 9));
          setLoading(false);
          return;
        }

        setIsStandaloneCategory(false);
        setCampaign(null);
        setSingleCategory(null);
        setCampaignCategories([]);
        setProductsByCategory({});
        setProducts([]);
        setFilteredCampaignCategoryIds(null);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        if (isNotFoundError(err)) {
          setLoading(false);
          return;
        }
        console.error("Failed to load category page data:", err);
        retryTimer = window.setTimeout(loadCategoryPage, RETRY_DELAY_MS);
      }
    };

    loadCategoryPage();

    return () => {
      mounted = false;
      if (retryTimer) window.clearTimeout(retryTimer);
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

  if (loading) {
    return (
      <div className="mt-8">
        <Skeleton className="w-full aspect-[21/9]" />
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonProductCard key={index} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  const visibleCampaignCategories =
    filteredCampaignCategoryIds === null
      ? campaignCategories
      : campaignCategories.filter((cat: any) =>
          filteredCampaignCategoryIds.includes(Number(cat?.id))
        );

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
          <section className="max-w-[1440px] mx-auto md:px-4 sm:px-6 lg:px-12 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 md:gap-6">
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
          <HeaderPage
            campaignCategories={campaignCategories}
            onFilteredCategoryIdsChange={setFilteredCampaignCategoryIds}
          />
          
          {/* If campaign contains categories, render one section per category */}
          {campaignCategories && campaignCategories.length > 0 ? (
            visibleCampaignCategories.length > 0 ? (
              visibleCampaignCategories.map((cat: any, idx: number) => {
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
              <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10 text-center text-gray-500">
                Aucune categorie ne correspond aux filtres selectionnes.
              </div>
            )
          ) : (
            // No categories on campaign: render campaign hero and generic products (first 9)
            <>
              <HeroSection
                image={String((campaign as any).imageUrl) || '/homme.jfif'}
                title={String((campaign as any).title || 'Collection')}
                description={String((campaign as any).description || (campaign as any).subtitle || '')}
              />

              <section className="max-w-[1440px] py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
