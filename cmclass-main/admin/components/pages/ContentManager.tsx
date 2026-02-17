import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from '../Card';
import { Button } from '../Button';
import { Eye, Upload, Save, MoveVertical, X } from 'lucide-react';
import { heroApi, type HeroData } from '../../services/heroApi';
import { campaignApi, type Campaign } from '../../services/campaignApi';
import { serviceApi, type AdminService } from '../../services/serviceApi';
import { catalogApi, type Category, type Product as BackendProduct } from '../../services/catalogApi';
import { brandAPI } from '../../services/api';
import { consumePendingQuickAction } from '../../services/quickActions';
import { motion } from 'motion/react';

const HERO_MEDIA_WARN_BYTES = 8 * 1024 * 1024;
const HERO_MEDIA_MAX_BYTES = 16 * 1024 * 1024;
const SERVICE_IMAGE_WARN_BYTES = 3 * 1024 * 1024;
const SERVICE_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const formatFileSizeMb = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;

const contentBlocks = [
  { id: 1, type: 'Bannière Héro', title: 'Collection Printemps 2025', active: true },
  { id: 2, type: 'Produits Vedettes', title: 'Nouveautés', active: true },
  { id: 3, type: 'Campagne', title: 'Lookbook d\'Été', active: false },
  { id: 4, type: 'Histoire de la Marque', title: 'Notre Héritage', active: true },
];

export function ContentManager() {
  const [heroText, setHeroText] = useState('Découvrez l\'Essence du Luxe');
  const [heroSubtext, setHeroSubtext] = useState('Explorez notre collection raffinée d\'élégance intemporelle');
  const [heroCtaText, setHeroCtaText] = useState('Découvrir');
  const [heroCtaUrl, setHeroCtaUrl] = useState('/collections/nouveautes');
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);
  const selectedBlockObj = contentBlocks.find(b => b.id === selectedBlock) ?? null;
  const [hero, setHero] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Campaign editor state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<number | null>(null);
  const campaignFileRef = useRef<HTMLInputElement | null>(null);

  // Services editor state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceForm, setServiceForm] = useState<AdminService>({ title: '', description: '', imageUrl: '', link: '', order: 0, isActive: true });
  const serviceFileRef = useRef<HTMLInputElement | null>(null);
  const [serviceImageUploading, setServiceImageUploading] = useState(false);
  const [serviceUploadProgress, setServiceUploadProgress] = useState(0);
  const [serviceDragActive, setServiceDragActive] = useState(false);
  const [serviceImagePreview, setServiceImagePreview] = useState<string | null>(null);
  // Services header (editable block in Content Manager)
  const [servicesHeaderTitle, setServicesHeaderTitle] = useState('les services CMClass');
  const [servicesHeaderDescription, setServicesHeaderDescription] = useState(
    "La marque CMClass offre une mode sur mesure, avec pièces exclusives et services personnalisés. Chaque vêtement reflète l’excellence artisanale et un style contemporain affirmé.."
  );

  function loadServicesHeader() {
    // Prefer server-stored brand header when available
    (async () => {
      try {
        const b = await brandAPI.get();
        if (b && (b.servicesHeaderTitle || b.servicesHeaderDescription)) {
          if (b.servicesHeaderTitle) setServicesHeaderTitle(b.servicesHeaderTitle);
          if (b.servicesHeaderDescription) setServicesHeaderDescription(b.servicesHeaderDescription);
          return;
        }
      } catch (err) {
        // ignore - fallback to localStorage
      }

      try {
        const raw = localStorage.getItem('cmclass_services_header');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed.title) setServicesHeaderTitle(parsed.title);
        if (parsed.description) setServicesHeaderDescription(parsed.description);
      } catch (err) {
        console.error('Failed to load services header', err);
      }
    })();
  }

  function saveServicesHeader() {
    (async () => {
      try {
        const payload = {
          servicesHeaderTitle: servicesHeaderTitle,
          servicesHeaderDescription: servicesHeaderDescription,
        };
        await brandAPI.update(payload);
        // also mirror to localStorage for immediate read in same browser
        localStorage.setItem('cmclass_services_header', JSON.stringify({ title: servicesHeaderTitle, description: servicesHeaderDescription }));
        // Notify other parts of the app in the same window
        try { window.dispatchEvent(new Event('cmclass_services_header_updated')); } catch (e) {}
        alert('✅ En-tête des services enregistrée (persisted)');
      } catch (err) {
        console.error('Failed to persist services header, saving locally', err);
        try {
          const payload = { title: servicesHeaderTitle, description: servicesHeaderDescription };
          localStorage.setItem('cmclass_services_header', JSON.stringify(payload));
          try { window.dispatchEvent(new Event('cmclass_services_header_updated')); } catch (e) {}
          alert('✅ En-tête enregistrée localement (offline)');
        } catch (e) {
          console.error(e);
          alert('❌ Erreur lors de l\'enregistrement');
        }
      }
    })();
  }

  function deleteServicesHeader() {
    if (!confirm('Supprimer l\'en-tête des services ?')) return;
    try {
      localStorage.removeItem('cmclass_services_header');
      setServicesHeaderTitle('les services CMClass');
      setServicesHeaderDescription('La marque CMClass offre une mode sur mesure, avec pièces exclusives et services personnalisés. Chaque vêtement reflète l’excellence artisanale et un style contemporain affirmé..');
      alert('✅ En-tête supprimée');
    } catch (err) {
      console.error(err);
      alert('❌ Erreur lors de la suppression');
    }
  }
  
  // Backend data
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [campaignLoading, setCampaignLoading] = useState(false);
  
  const [campaignForm, setCampaignForm] = useState({
    id: undefined as number | undefined,
    imageUrl: '',
    imagePreview: '',
    imageFile: null as File | null,
    genreText: '',
    title: '',
    buttonText: '',
    selectedCategories: [] as number[],
    selectedProductIds: [] as number[],
    status: 'Brouillon',
  });

  const filteredProducts: BackendProduct[] = products.filter((p) => {
    if (campaignForm.selectedCategories.length === 0) return true;
    return campaignForm.selectedCategories.includes(p.categoryId);
  }).slice(0, 40);

  function openCampaignModal(campaignId?: number) {
    if (typeof campaignId === 'number') {
      const c = campaigns.find(x => x.id === campaignId);
      if (c) {
        setEditingCampaignId(campaignId);
        setCampaignForm(prev => ({
          ...prev,
          id: c.id,
          title: c.title || '',
          imageUrl: c.imageUrl || '',
          imagePreview: c.imageUrl || '',
          genreText: c.genreText || '',
          buttonText: c.buttonText || '',
          selectedCategories: c.selectedCategories || [],
          selectedProductIds: c.selectedProductIds || [],
          status: c.status || 'Brouillon'
        }));
      }
    } else {
      setEditingCampaignId(null);
      setCampaignForm({
        id: undefined, imageUrl: '', imagePreview: '', imageFile: null, genreText: '', title: '', buttonText: '', selectedCategories: [], selectedProductIds: [], status: 'Brouillon'
      });
    }
    setIsCampaignModalOpen(true);
  }

  // Services management functions
  function openServiceModal(serviceId?: number) {
    if (typeof serviceId === 'number') {
      const s = services.find(x => x.id === serviceId);
      if (s) {
        setEditingServiceId(serviceId);
        setServiceForm({
          id: s.id,
          title: s.title || '',
          description: s.description || '',
          imageUrl: s.imageUrl || '',
          link: s.link || '',
          order: s.order || 0,
          isActive: s.isActive ?? true,
        });
        setServiceImagePreview(s.imageUrl || null);
      }
    } else {
      setEditingServiceId(null);
      setServiceForm({
        title: '',
        description: "La marque CMClass offre une mode sur mesure, avec pièces exclusives et services personnalisés. Chaque vêtement reflète l’excellence artisanale et un style contemporain affirmé.",
        imageUrl: 'https://images.unsplash.com/photo-1520975918311-7ce9d52f67e4?auto=format&fit=crop&w=800&q=80',
        link: '',
        order: 0,
        isActive: true
      });
      setServiceImagePreview('https://images.unsplash.com/photo-1520975918311-7ce9d52f67e4?auto=format&fit=crop&w=800&q=80');
    }
    setIsServiceModalOpen(true);
  }

  function closeServiceModal() {
    setIsServiceModalOpen(false);
    setEditingServiceId(null);
  }

  async function saveService() {
    try {
      setServiceLoading(true);
      const payload = { ...serviceForm } as AdminService;
      if (editingServiceId) {
        const updated = await serviceApi.updateService(editingServiceId, payload as any);
        setServices(prev => prev.map(s => s.id === updated.id ? updated : s));
      } else {
        const created = await serviceApi.createService(payload as any);
        setServices(prev => [created, ...prev]);
      }
      closeServiceModal();
      alert('✅ Service sauvegardé avec succès!');
    } catch (error) {
      console.error(error);
      alert('❌ Erreur lors de la sauvegarde du service');
    } finally {
      setServiceLoading(false);
    }
  }

  async function deleteService(id: number) {
    if (!confirm('Supprimer ce service ?')) return;
    try {
      await serviceApi.deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
      alert('✅ Service supprimé');
    } catch (error) {
      console.error(error);
      alert('❌ Erreur lors de la suppression');
    }
  }

  function closeCampaignModal() {
    setIsCampaignModalOpen(false);
    setEditingCampaignId(null);
  }

  function handleCampaignImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCampaignForm(prev => ({ ...prev, imageFile: file, imagePreview: url }));
  }

  async function handleServiceFileSelect(e: React.ChangeEvent<HTMLInputElement> | File) {
    let file: File | undefined;
    if ((e as any).target && (e as any).target.files) {
      file = (e as any).target.files[0];
    } else if (e instanceof File) {
      file = e;
    }
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('❌ Veuillez sélectionner une image valide pour ce service.');
      return;
    }
    if (file.size > SERVICE_IMAGE_MAX_BYTES) {
      alert(`❌ Image trop volumineuse (max ${formatFileSizeMb(SERVICE_IMAGE_MAX_BYTES)}).`);
      return;
    }
    if (file.size > SERVICE_IMAGE_WARN_BYTES) {
      alert(`⚠️ Image volumineuse (${formatFileSizeMb(file.size)}). L’upload peut être plus lent.`);
    }

    const preview = URL.createObjectURL(file);
    setServiceImagePreview(preview);
    setServiceImageUploading(true);
    setServiceUploadProgress(0);
    try {
      // reuse hero upload endpoint for images
      const uploadedUrl = await heroApi.uploadBackgroundImage(file, setServiceUploadProgress);
      setServiceForm(prev => ({ ...prev, imageUrl: uploadedUrl }));
    } catch (err) {
      console.error('Service image upload failed', err);
      alert('Erreur lors du téléchargement de l\'image');
    } finally {
      setServiceImageUploading(false);
      setServiceUploadProgress(0);
    }
  }

  const handleServiceDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setServiceDragActive(true);
    } else if (e.type === 'dragleave') {
      setServiceDragActive(false);
    }
  };

  const handleServiceDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setServiceDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    handleServiceFileSelect(file);
  };

  function toggleCategory(categoryId: number) {
    setCampaignForm(prev => {
      const exists = prev.selectedCategories.includes(categoryId);
      const nextCategories = exists ? prev.selectedCategories.filter(c => c !== categoryId) : [...prev.selectedCategories, categoryId];
      // Filter selected products to only those in the selected categories (up to 4 max)
      const nextProducts = prev.selectedProductIds
        .filter(pid => {
          const p = products.find(x => x.id === pid);
          return p && nextCategories.length ? nextCategories.includes(p.categoryId) : true;
        })
        .slice(0, 4);
      return { ...prev, selectedCategories: nextCategories, selectedProductIds: nextProducts };
    });
  }

  function toggleProduct(productId: number) {
    setCampaignForm(prev => {
      const exists = prev.selectedProductIds.includes(productId);
      if (exists) {
        return { ...prev, selectedProductIds: prev.selectedProductIds.filter(id => id !== productId) };
      }
      // Only allow adding if less than 4 products are selected
      if (prev.selectedProductIds.length >= 5) {
        alert('Vous pouvez sélectionner jusqu\'à 4 roduits seulement.');
        return prev;
      }
      return { ...prev, selectedProductIds: [...prev.selectedProductIds, productId] };
    });
  }

  async function saveCampaign() {
    try {
      setCampaignLoading(true);
      const payload: Campaign = {
        title: campaignForm.title,
        imageUrl: campaignForm.imagePreview || campaignForm.imageUrl,
        buttonText: campaignForm.buttonText,
        genreText: campaignForm.genreText,
        selectedCategories: campaignForm.selectedCategories,
        selectedProductIds: campaignForm.selectedProductIds,
        status: campaignForm.status,
      };

      if (campaignForm.id) {
        // Update existing campaign
        await campaignApi.updateCampaign(campaignForm.id, payload);
        setCampaigns(prev => prev.map(c => c.id === campaignForm.id ? { ...c, ...payload } : c));
      } else {
        // Create new campaign
        const newCampaign = await campaignApi.createCampaign(payload);
        setCampaigns(prev => [newCampaign, ...prev]);
      }

      closeCampaignModal();
      alert('✅ Campagne sauvegardée avec succès!');
    } catch (error) {
      alert('❌ Erreur lors de la sauvegarde de la campagne');
      console.error(error);
    } finally {
      setCampaignLoading(false);
    }
  }

  useEffect(() => {
    const shouldOpenCampaignModal = consumePendingQuickAction('new-campaign') === 'new-campaign';
    const shouldFocusHomepageEditor = consumePendingQuickAction('edit-homepage') === 'edit-homepage';

    if (shouldOpenCampaignModal) {
      openCampaignModal();
    }

    if (shouldFocusHomepageEditor) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch hero data
        const heroData = await heroApi.getHero();
        setHero(heroData);
        if (heroData.mainText) setHeroText(heroData.mainText);
        if (heroData.subtext) setHeroSubtext(heroData.subtext);
        if (heroData.ctaButtonText) setHeroCtaText(heroData.ctaButtonText);
        if (heroData.ctaButtonUrl) setHeroCtaUrl(heroData.ctaButtonUrl);

        // Fetch campaigns, services, categories, and products
        const [campaignsData, servicesData, categoriesData, productsData] = await Promise.all([
          campaignApi.getCampaigns(),
          serviceApi.getServices(),
          catalogApi.getCategories(),
          catalogApi.getProducts(),
        ]);

        setCampaigns(campaignsData);
        setServices(servicesData);
        setCategories(categoriesData);
        setProducts(productsData);
        // load saved header from localStorage
        loadServicesHeader();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveHero = async () => {
    setSaving(true);
    try {
      const updateData = {
        mainText: heroText,
        subtext: heroSubtext,
        ctaButtonText: heroCtaText,
        ctaButtonUrl: heroCtaUrl,
      };
      
      const updatedHero = await heroApi.updateHero(updateData);
      
      setHero(updatedHero);
      alert('✅ Les modifications ont été publiées avec succès!');
    } catch (error) {
      alert('❌ Erreur lors de la sauvegarde. Vérifiez la console pour plus de détails.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      alert('❌ Veuillez sélectionner une image ou une vidéo valide.');
      return;
    }
    if (file.size > HERO_MEDIA_MAX_BYTES) {
      alert(`❌ Fichier trop volumineux (max ${formatFileSizeMb(HERO_MEDIA_MAX_BYTES)}).`);
      return;
    }
    if (file.size > HERO_MEDIA_WARN_BYTES) {
      alert(`⚠️ Fichier volumineux (${formatFileSizeMb(file.size)}). L’upload peut être plus lent.`);
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      let uploadedUrl: string;

      if (isVideo) {
        uploadedUrl = await heroApi.uploadBackgroundVideo(file, setUploadProgress);
      } else {
        uploadedUrl = await heroApi.uploadBackgroundImage(file, setUploadProgress);
      }

      // Update hero with new media URL
      const mediaType = isVideo ? 'video' : 'image';
      const updateField = isVideo ? 'backgroundVideoUrl' : 'backgroundImageUrl';
      
      const updatedHero = await heroApi.updateHero({
        ...hero,
        [updateField]: uploadedUrl,
        mediaType: mediaType,
      } as any);

      setHero(updatedHero);
      alert(`✅ ${isVideo ? 'Vidéo' : 'Image'} téléchargée avec succès!`);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      alert('❌ Erreur lors du téléchargement du fichier.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Create synthetic event for handleFileSelect
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    
    const event = new Event('change', { bubbles: true }) as any;
    event.target = { files: dataTransfer.files } as any;
    handleFileSelect(event);
  };

  if (loading) {
    return (
      <div className="h-96 bg-gray-900 animate-pulse rounded" />
    );
  }

  if (!hero || !hero.isActive) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Hero Text Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3>Section Héro de la Page d'Accueil</h3>
              <p className="text-sm text-gray-500 mt-1">Modifier le texte et l'imagerie de la bannière héro</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant={showPreview ? "primary" : "ghost"}
                size="sm"
                onClick={() => {
                  setShowPreview(!showPreview);
                }}
              >
                <Eye size={16} />
                {showPreview ? 'Masquer l\'Aperçu' : 'Afficher l\'Aperçu'}
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleSaveHero}
                disabled={saving}
              >
                <Save size={16} />
                {saving ? 'Sauvegarde...' : 'Publier les Modifications'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-8`}>
            {/* Editor */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Titre Principal</label>
                <input
                  type="text"
                  value={heroText}
                  onChange={(e) => setHeroText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2 text-gray-700">Sous-titre</label>
                <textarea
                  value={heroSubtext}
                  onChange={(e) => setHeroSubtext(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Image de Fond Héro</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded p-8 text-center transition-all cursor-pointer ${
                    dragActive 
                      ? 'border-[#007B8A] bg-blue-50' 
                      : 'border-gray-300 hover:border-[#007B8A] hover:bg-gray-50'
                  }`}
                >
                  <Upload size={32} className="mx-auto mb-3 text-gray-400" strokeWidth={1.5} />
                  <p className="text-sm text-gray-600">Cliquez pour télécharger ou glisser-déposer</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP, MP4, WebM. Avertissement &gt; 8 Mo, max 16 Mo.</p>
                  {uploading && (
                    <div className="mt-3">
                      <p className="text-xs text-[#007B8A]">Téléchargement en cours... {uploadProgress}%</p>
                      <div className="h-2 w-full rounded bg-gray-200 overflow-hidden mt-1">
                        <div className="h-full bg-[#007B8A] transition-all" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}
                  {dragActive && <p className="text-xs text-[#007B8A] mt-2 font-semibold">Relâchez le fichier ici</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Appel à l'Action</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Texte du Bouton"
                    value={heroCtaText}
                    onChange={(e) => setHeroCtaText(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="URL du Lien"
                    value={heroCtaUrl}
                    onChange={(e) => setHeroCtaUrl(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Live Preview */}
            {showPreview && (
            <div className="bg-gray-50 rounded p-6 border border-gray-200">
              <p className="text-xs text-gray-500 mb-4 uppercase tracking-wide">Aperçu en Direct</p>
              <div 
                className="relative h-96 rounded overflow-hidden bg-gray-900 flex items-center justify-center"
                style={{
                  backgroundImage: hero?.mediaType === 'image' && hero?.backgroundImageUrl 
                    ? `url(${hero.backgroundImageUrl})`
                    : 'url(https://images.unsplash.com/photo-1719518411339-5158cea86caf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBmYXNoaW9uJTIwZWRpdG9yaWFsfGVufDF8fHx8MTc2NTIwODQ4Nnww&ixlib=rb-4.1.0&q=80&w=1080)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {hero?.mediaType === 'video' && hero?.backgroundVideoUrl && (
                  <video
                    className="absolute inset-0 w-full h-full object-cover"
                    src={hero.backgroundVideoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                )}
                <div className="absolute inset-0 bg-black/5"></div>
                {/* Hero Content */}
      <motion.div
        className="relative h-full flex flex-col items-center justify-end text-center px-6 md:px-12 lg:px-24"
        
      >
                  <motion.p
            className="text-white/90 font-light text-sm sm:text-xl md:text-xl lg:text-xl mb-4 sm:mb-8 md:mb-16 lg:mb-2"
            style={{ letterSpacing: '0.05em' }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >{heroSubtext}</motion.p>
                  
                  <motion.h1
          className="text-white font-serif text-xl sm:text-xl md:text-xl lg:text-xl tracking-wide leading-tight mb-8 md:mb-8 lg:mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        > {heroText}</motion.h1>
                  
                  
                  <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.7 }}
                          ><button  className="inline-block px-8 mb-12 py-2 lg:py-2 sm:px-10 sm:py-4 text-sm md:text-base tracking-wide font-medium text-white border border-white hover:bg-white hover:text-black transition-all duration-500"
          >
                    {hero?.ctaButtonText || 'Découvrir'}
                  </button></motion.div>
                  
                </motion.div>
              </div>
            </div>
            )}
          </div>
        </CardContent>
      </Card>

        {/* Services Editor */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3>Gestionnaire de Services</h3>
                <p className="text-sm text-gray-500 mt-1">Gérer les éléments affichés dans la section Services de la page d'accueil</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => openServiceModal()}>
                <Upload size={16} />
                Nouveau Service
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 border p-4 rounded bg-white">
              <div className="flex items-start justify-between">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">Titre (En-tête Services)</label>
                  <input type="text" value={servicesHeaderTitle} onChange={(e) => setServicesHeaderTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded mt-1" />
                  <label className="block text-sm font-medium text-gray-700 mt-3">Description</label>
                  <textarea value={servicesHeaderDescription} onChange={(e) => setServicesHeaderDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded mt-1" />
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  <Button variant="ghost" size="sm" onClick={() => loadServicesHeader()}>Charger</Button>
                  <Button variant="primary" size="sm" onClick={() => saveServicesHeader()}>Enregistrer</Button>
                  <Button variant="outline" size="sm" onClick={() => deleteServicesHeader()}>Supprimer</Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {services.map((s) => (
                <div key={s.id} className="group border border-gray-200 rounded overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-40 bg-gray-100">
                    <img src={s.imageUrl || 'https://images.unsplash.com/photo-1503342452485-86f7a7c6c1d6?auto=format&fit=crop&w=800&q=80'} alt={s.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h4 className="mb-2">{s.title}</h4>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="flex-1" onClick={() => openServiceModal(s.id)}>Modifier</Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => deleteService(s.id!)}>Supprimer</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Service Modal */}
            {isServiceModalOpen && (
              <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
                <div className="absolute inset-0 bg-black/40" onClick={() => closeServiceModal()} />
                <div className="relative w-[95%] md:w-3/4 lg:w-2/3 bg-white rounded shadow-lg p-6 z-10 max-h-[80vh] overflow-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg">Éditeur de Service</h4>
                    <Button variant="ghost" size="sm" onClick={() => closeServiceModal()}><X size={16} /></Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1 text-gray-700">Image (URL) / Glisser-déposer</label>
                        <input type="file" ref={serviceFileRef} accept="image/*" onChange={(e) => handleServiceFileSelect(e)} className="hidden" />
                        <div
                          onClick={() => serviceFileRef.current?.click()}
                          onDragEnter={handleServiceDrag}
                          onDragLeave={handleServiceDrag}
                          onDragOver={handleServiceDrag}
                          onDrop={handleServiceDrop}
                          className={`border-2 border-dashed rounded p-4 text-center transition-all cursor-pointer ${serviceDragActive ? 'border-[#007B8A] bg-blue-50' : 'border-gray-300 hover:border-[#007B8A] hover:bg-gray-50'}`}>
                          <Upload size={28} className="mx-auto mb-2 text-gray-400" strokeWidth={1.5} />
                          <p className="text-sm text-gray-600">Cliquez ou glissez-déposez une image</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP. Avertissement &gt; 3 Mo, max 8 Mo.</p>
                          {serviceImageUploading && (
                            <div className="mt-2">
                              <p className="text-xs text-[#007B8A]">Téléchargement... {serviceUploadProgress}%</p>
                              <div className="h-2 w-full rounded bg-gray-200 overflow-hidden mt-1">
                                <div className="h-full bg-[#007B8A] transition-all" style={{ width: `${serviceUploadProgress}%` }} />
                              </div>
                            </div>
                          )}
                          {serviceDragActive && <p className="text-xs text-[#007B8A] mt-2 font-semibold">Relâchez pour télécharger</p>}
                          {serviceImagePreview && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={serviceImagePreview} alt="preview" className="w-full h-36 object-cover rounded mt-3" />
                          )}
                        </div>

                        <div className="mt-3">
                          <label className="block text-xs text-gray-500 mb-1">Ou collez une URL d'image</label>
                          <input type="text" value={serviceForm.imageUrl} onChange={(e) => setServiceForm(prev => ({ ...prev, imageUrl: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded" />
                        </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-gray-700">Titre</label>
                      <input type="text" value={serviceForm.title} onChange={(e) => setServiceForm(prev => ({ ...prev, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-gray-700">Description</label>
                      <textarea value={serviceForm.description} onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-gray-700">Lien</label>
                      <input type="text" value={serviceForm.link} onChange={(e) => setServiceForm(prev => ({ ...prev, link: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm mb-1 text-gray-700">Ordre d'affichage</label>
                        <input type="number" value={serviceForm.order} onChange={(e) => setServiceForm(prev => ({ ...prev, order: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-200 rounded" />
                      </div>
                      <div>
                        <label className="block text-sm mb-1 text-gray-700">Actif</label>
                        <div className="mt-2">
                          <label className={`px-3 py-2 border rounded cursor-pointer ${serviceForm.isActive ? 'bg-[#007B8A] text-white' : 'bg-white text-gray-700'}`}>
                            <input type="checkbox" checked={serviceForm.isActive} onChange={(e) => setServiceForm(prev => ({ ...prev, isActive: e.target.checked }))} className="hidden" />
                            {serviceForm.isActive ? 'Actif' : 'Inactif'}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6">
                    <Button variant="outline" size="sm" onClick={() => closeServiceModal()}>Annuler</Button>
                    <Button variant="primary" size="sm" onClick={() => saveService()} disabled={serviceLoading}><Save size={14} /> Enregistrer</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      {/* Campaign Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3>Gestionnaire de Campagnes</h3>
              <p className="text-sm text-gray-500 mt-1">Créer et modifier les campagnes saisonnières</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => openCampaignModal()}>
              <Upload size={16} />
              Nouvelle Campagne
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="group border border-gray-200 rounded overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative h-48 bg-gray-200">
                  <img src={campaign.imageUrl || 'https://images.unsplash.com/photo-1567777301743-3b7ef158aadf?ixlib=rb-4.0.0&q=80&w=1080'} alt={campaign.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      campaign.status === 'Actif' ? 'bg-[#007B8A] text-white' :
                      campaign.status === 'Brouillon' ? 'bg-gray-200 text-gray-700' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="mb-2">{campaign.title}</h4>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => openCampaignModal(campaign.id)}>Modifier</Button>
                    <Button variant="outline" size="sm" className="flex-1">Aperçu</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Campaign Editor Modal */}
          {isCampaignModalOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
              <div className="absolute inset-0 bg-black/40" onClick={() => closeCampaignModal()} />
              <div className="relative w-[95%] md:w-3/4 lg:w-2/3 bg-white rounded shadow-lg p-6 z-10 max-h-[80vh] overflow-auto">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg">Éditeur de Campagne</h4>
                  <Button variant="ghost" size="sm" onClick={() => closeCampaignModal()}><X size={16} /></Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-1 text-gray-700">Image de la Campagne</label>
                      <input type="file" accept="image/*" onChange={handleCampaignImageSelect} className="hidden" ref={campaignFileRef} />
                      <div onClick={() => campaignFileRef.current?.click()} className="border border-dashed p-4 rounded cursor-pointer text-center">
                        {campaignForm.imagePreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={campaignForm.imagePreview} alt="preview" className="w-full h-44 object-cover rounded" />
                        ) : (
                          <p className="text-sm text-gray-500">Cliquez pour télécharger une image de campagne</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm mb-1 text-gray-700">Genre (texte)</label>
                      <input type="text" value={campaignForm.genreText} onChange={(e) => setCampaignForm(prev => ({...prev, genreText: e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded" />
                    </div>

                    <div>
                      <label className="block text-sm mb-1 text-gray-700">Nom de la Campagne</label>
                      <input type="text" value={campaignForm.title} onChange={(e) => setCampaignForm(prev => ({...prev, title: e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded" />
                    </div>

                    <div>
                      <label className="block text-sm mb-1 text-gray-700">Texte du Bouton CTA</label>
                      <input type="text" value={campaignForm.buttonText} onChange={(e) => setCampaignForm(prev => ({...prev, buttonText: e.target.value}))} className="w-full px-3 py-2 border border-gray-200 rounded" />
                    </div>

                    <div>
                      <label className="block text-sm mb-2 text-gray-700">Statut de la Campagne</label>
                      <div className="flex gap-2">
                        {['Brouillon', 'Suspendu', 'Actif'].map((status) => (
                          <label key={status} className={`flex-1 px-3 py-2 border rounded cursor-pointer text-center text-sm font-medium transition-colors ${
                            campaignForm.status === status 
                              ? 'bg-[#007B8A] text-white border-[#007B8A]' 
                              : 'bg-white text-gray-700 border-gray-300 hover:border-[#007B8A]'
                          }`}>
                            <input 
                              type="radio" 
                              className="hidden" 
                              name="campaign-status"
                              checked={campaignForm.status === status} 
                              onChange={() => setCampaignForm(prev => ({...prev, status}))} 
                            />
                            {status}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2 text-gray-700">Sélectionner des catégories (affiche les produits)</label>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((c) => (
                          <label key={c.id} className={`px-3 py-1 border rounded cursor-pointer ${campaignForm.selectedCategories.includes(c.id) ? 'bg-[#007B8A] text-white' : 'bg-white'}`}>
                            <input type="checkbox" className="hidden" checked={campaignForm.selectedCategories.includes(c.id)} onChange={() => toggleCategory(c.id)} />
                            {c.name}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm mb-2 text-gray-700">Choisir jusqu'à 4 produits</label>
                      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                        {filteredProducts.map((p) => (
                          <div key={p.id} className={`border rounded p-2 flex items-center gap-2 ${campaignForm.selectedProductIds.includes(p.id) ? 'ring-2 ring-[#007B8A]' : ''}`}>
                            <input type="checkbox" checked={campaignForm.selectedProductIds.includes(p.id)} onChange={() => toggleProduct(p.id)} />
                            <img src={p.productImage || '/public/homme.jfif'} alt={p.name} className="w-12 h-12 object-cover rounded" />
                            <div className="text-xs">
                              <div className="font-medium line-clamp-1">{p.name}</div>
                              <div className="text-gray-500">{(p.priceCents / 100).toFixed(2)} €</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Sélectionnez jusqu'à 4 produits pour afficher dans la campagne.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <Button variant="outline" size="sm" onClick={() => closeCampaignModal()}>Annuler</Button>
                  <Button variant="primary" size="sm" onClick={() => saveCampaign()}><Save size={14} /> Enregistrer</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Homepage Block Manager */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3>Gestionnaire de Blocs de la Page d'Accueil</h3>
              <p className="text-sm text-gray-500 mt-1">Organiser et personnaliser les sections de la page d'accueil</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contentBlocks.map((block) => (
              <div 
                key={block.id}
                onClick={() => setSelectedBlock(block.id)}
                className={`flex items-center justify-between p-4 rounded hover:border-[#007B8A] transition-colors cursor-move ${selectedBlock === block.id ? 'border-[#007B8A] bg-white/50' : 'border-gray-200'}`}
              >
                <div className="flex items-center gap-4">
                  <MoveVertical size={18} className="text-gray-400" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm">{block.title}</p>
                    <p className="text-xs text-gray-500">{block.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      defaultChecked={block.active}
                      className="w-4 h-4 accent-[#007B8A]"
                    />
                    <span className="text-sm text-gray-600">Actif</span>
                  </label>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); /* edit action */ }}>Modifier</Button>
                  <Button className="p-2 hover:bg-gray-100 rounded-full" onClick={(e) => { e.stopPropagation(); setSelectedBlock(null); }}>
                    <X size={16} className="text-gray-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">
            Ajouter un Nouveau Bloc
          </Button>
          {selectedBlockObj && (
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4>Détails du Bloc Sélectionné</h4>
                      <p className="text-xs text-gray-500">Modifier les propriétés du bloc</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedBlock(null)}>Fermer</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm mb-1 text-gray-700">Titre</label>
                      <input type="text" value={selectedBlockObj.title} readOnly className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-gray-700">Type</label>
                      <input type="text" value={selectedBlockObj.type} readOnly className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-50" />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={selectedBlockObj.active} readOnly className="w-4 h-4 accent-[#007B8A]" />
                        <span className="text-sm text-gray-600">Actif</span>
                      </label>
                      <Button variant="primary" size="sm">Enregistrer les Modifications</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
