import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader } from '../Card';
import { Button } from '../Button';
import { Upload, Save, Plus, Trash2 } from 'lucide-react';
import { aboutApi, type AboutData, type AboutValue } from '../../services/aboutApi';
import { heroApi } from '../../services/heroApi';

const ABOUT_IMAGE_WARN_BYTES = 3 * 1024 * 1024;
const ABOUT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const formatFileSizeMb = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;

const DEFAULT_ABOUT: AboutData = {
  heroTitle: "L'ATELIER DE GOMA",
  heroImageUrl:
    'https://images.unsplash.com/photo-1704729105381-f579cfcefd63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYXRlbGllciUyMHdvcmtzcGFjZSUyMG1pbmltYWx8ZW58MXx8fHwxNzYyMjU1NzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
  visionTitle: 'NOTRE VISION',
  visionParagraphs: [
    "CM CLASS est né à Goma, au cœur du Nord-Kivu, avec une vision claire : créer une mode masculine qui célèbre l'artisanat congolais tout en embrassant une esthétique minimaliste et contemporaine.",
    "Nous croyons que chaque vêtement raconte une histoire. Celle de nos artisans, de leurs mains expertes qui transforment des matériaux nobles en pièces d'exception. Celle d'une ville, Goma, résiliente et créative, qui inspire notre approche du design.",
    "Notre démarche est guidée par trois piliers fondamentaux : l'excellence artisanale, la durabilité et le respect de notre héritage culturel. Chaque collection est pensée pour transcender les tendances éphémères et offrir des pièces intemporelles à l'homme moderne qui valorise l'authenticité.",
  ],
  craftTitle: 'ARTISANAT & SAVOIR-FAIRE',
  craftParagraphs: [
    'Nos ateliers à Goma perpétuent des techniques ancestrales de couture et de tissage, transmises de génération en génération. Chaque artisan apporte sa maîtrise unique au processus de création.',
    "Du choix des matières premières aux finitions minutieuses, nous accordons une attention particulière à chaque étape de fabrication. Cette exigence de qualité garantit des vêtements durables qui vieillissent avec élégance.",
    "En travaillant exclusivement avec des artisans locaux, nous soutenons l'économie de notre région et préservons un patrimoine de compétences irremplaçables.",
  ],
  craftImageUrl:
    'https://images.unsplash.com/photo-1620063224601-ead11b9737bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWlsb3JpbmclMjBzZXdpbmclMjB3b3Jrc2hvcHxlbnwxfHx8fDE3NjIyNTU3NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  valuesTitle: 'NOS VALEURS',
  values: [
    {
      title: 'EXCELLENCE',
      description:
        "Nous ne faisons aucun compromis sur la qualité. Chaque pièce est créée avec la plus grande attention aux détails et aux finitions.",
    },
    {
      title: 'DURABILITÉ',
      description:
        'Nous créons des vêtements conçus pour durer, en privilégiant des matériaux nobles et des méthodes de production responsables.',
    },
    {
      title: 'AUTHENTICITÉ',
      description:
        "Nos créations célèbrent notre identité congolaise tout en s'inscrivant dans une esthétique minimaliste et contemporaine.",
    },
  ],
  ctaTitle: 'Nous contacter',
  ctaDescription:
    "Voulez-vous prendre rendez-vous avec nous pour découvrir nos créations ? N'hésitez pas à nous contacter pour toute demande d'information ou de collaboration. Nous sommes impatients de partager notre passion pour la mode avec vous.",
  ctaButtonText: 'Nous contacter',
  ctaButtonUrl: '/contact',
  isActive: true,
};

const normalizeValues = (values: unknown): AboutValue[] => {
  if (!Array.isArray(values)) return DEFAULT_ABOUT.values;
  return values.map((value) => ({
    title: typeof (value as any)?.title === 'string' ? (value as any).title : '',
    description: typeof (value as any)?.description === 'string' ? (value as any).description : '',
  }));
};

const normalizeParagraphs = (paragraphs: unknown, fallback: string[]) => {
  if (!Array.isArray(paragraphs)) return fallback;
  return paragraphs.map((p) => (typeof p === 'string' ? p : String(p ?? '')));
};

const normalizeAbout = (data: Partial<AboutData> | null | undefined): AboutData => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return DEFAULT_ABOUT;
  }

  return {
    ...DEFAULT_ABOUT,
    ...data,
    heroTitle: data.heroTitle ?? DEFAULT_ABOUT.heroTitle,
    heroImageUrl: data.heroImageUrl ?? DEFAULT_ABOUT.heroImageUrl,
    visionTitle: data.visionTitle ?? DEFAULT_ABOUT.visionTitle,
    visionParagraphs: normalizeParagraphs(data.visionParagraphs, DEFAULT_ABOUT.visionParagraphs),
    craftTitle: data.craftTitle ?? DEFAULT_ABOUT.craftTitle,
    craftParagraphs: normalizeParagraphs(data.craftParagraphs, DEFAULT_ABOUT.craftParagraphs),
    craftImageUrl: data.craftImageUrl ?? DEFAULT_ABOUT.craftImageUrl,
    valuesTitle: data.valuesTitle ?? DEFAULT_ABOUT.valuesTitle,
    values: normalizeValues(data.values),
    ctaTitle: data.ctaTitle ?? DEFAULT_ABOUT.ctaTitle,
    ctaDescription: data.ctaDescription ?? DEFAULT_ABOUT.ctaDescription,
    ctaButtonText: data.ctaButtonText ?? DEFAULT_ABOUT.ctaButtonText,
    ctaButtonUrl: data.ctaButtonUrl ?? DEFAULT_ABOUT.ctaButtonUrl,
    isActive: typeof data.isActive === 'boolean' ? data.isActive : DEFAULT_ABOUT.isActive,
  };
};

export function AboutPage() {
  const [form, setForm] = useState<AboutData>(DEFAULT_ABOUT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const [craftUploading, setCraftUploading] = useState(false);
  const [heroUploadProgress, setHeroUploadProgress] = useState(0);
  const [craftUploadProgress, setCraftUploadProgress] = useState(0);
  const heroFileRef = useRef<HTMLInputElement | null>(null);
  const craftFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;
    const fetchAbout = async () => {
      try {
        const data = await aboutApi.getAbout();
        if (!active) return;
        setForm(normalizeAbout(data));
      } catch (error) {
        console.error('Error loading about content:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAbout();
    return () => {
      active = false;
    };
  }, []);

  const updateField = <K extends keyof AboutData>(key: K, value: AboutData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateParagraph = (section: 'visionParagraphs' | 'craftParagraphs', index: number, value: string) => {
    setForm((prev) => {
      const next = [...prev[section]];
      next[index] = value;
      return { ...prev, [section]: next };
    });
  };

  const addParagraph = (section: 'visionParagraphs' | 'craftParagraphs') => {
    setForm((prev) => ({ ...prev, [section]: [...prev[section], ''] }));
  };

  const removeParagraph = (section: 'visionParagraphs' | 'craftParagraphs', index: number) => {
    setForm((prev) => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));
  };

  const updateValue = (index: number, field: keyof AboutValue, value: string) => {
    setForm((prev) => {
      const nextValues = prev.values.map((item, i) => (i === index ? { ...item, [field]: value } : item));
      return { ...prev, values: nextValues };
    });
  };

  const addValue = () => {
    setForm((prev) => ({ ...prev, values: [...prev.values, { title: '', description: '' }] }));
  };

  const removeValue = (index: number) => {
    setForm((prev) => ({ ...prev, values: prev.values.filter((_, i) => i !== index) }));
  };

  const validateAboutImage = (file: File, label: string) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Veuillez sélectionner une image valide');
    }
    if (file.size > ABOUT_IMAGE_MAX_BYTES) {
      throw new Error(`${label} dépasse la limite (${formatFileSizeMb(ABOUT_IMAGE_MAX_BYTES)})`);
    }
    if (file.size > ABOUT_IMAGE_WARN_BYTES) {
      alert(`⚠️ ${label} est volumineuse (${formatFileSizeMb(file.size)}). L’upload peut être plus lent.`);
    }
  };

  const handleHeroImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setHeroUploading(true);
    setHeroUploadProgress(0);
    try {
      validateAboutImage(file, 'L’image héros');
      const url = await heroApi.uploadBackgroundImage(file, setHeroUploadProgress);
      updateField('heroImageUrl', url);
    } catch (error) {
      console.error('Hero image upload failed:', error);
      alert('❌ Erreur lors du téléchargement de l’image héros');
    } finally {
      setHeroUploading(false);
      setHeroUploadProgress(0);
      if (heroFileRef.current) heroFileRef.current.value = '';
    }
  };

  const handleCraftImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCraftUploading(true);
    setCraftUploadProgress(0);
    try {
      validateAboutImage(file, 'L’image artisanat');
      const url = await heroApi.uploadBackgroundImage(file, setCraftUploadProgress);
      updateField('craftImageUrl', url);
    } catch (error) {
      console.error('Craft image upload failed:', error);
      alert('❌ Erreur lors du téléchargement de l’image artisanat');
    } finally {
      setCraftUploading(false);
      setCraftUploadProgress(0);
      if (craftFileRef.current) craftFileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, createdAt, updatedAt, ...payload } = form;
      const updated = await aboutApi.updateAbout(payload);
      setForm(normalizeAbout(updated));
      alert('✅ Page À propos mise à jour');
    } catch (error) {
      console.error('Failed to save about content:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-96 bg-gray-900 animate-pulse rounded" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3>Page À propos</h3>
              <p className="text-sm text-gray-500 mt-1">Modifier le contenu affiché sur la page À propos</p>
            </div>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
              <Save size={16} />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700">Actif</label>
            <label className={`px-3 py-2 border rounded cursor-pointer ${form.isActive ? 'bg-[#007B8A] text-white' : 'bg-white text-gray-700'}`}>
              <input
                type="checkbox"
                checked={!!form.isActive}
                onChange={(e) => updateField('isActive', e.target.checked)}
                className="hidden"
              />
              {form.isActive ? 'Actif' : 'Inactif'}
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3>Section Héro</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Titre</label>
                <input
                  type="text"
                  value={form.heroTitle}
                  onChange={(e) => updateField('heroTitle', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Image (URL)</label>
                <input
                  type="text"
                  value={form.heroImageUrl || ''}
                  onChange={(e) => updateField('heroImageUrl', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded"
                />
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  ref={heroFileRef}
                  className="hidden"
                  onChange={handleHeroImageSelect}
                />
                <Button variant="outline" size="sm" onClick={() => heroFileRef.current?.click()} disabled={heroUploading}>
                  <Upload size={16} />
                  {heroUploading ? 'Téléchargement...' : 'Télécharger une image'}
                </Button>
                {heroUploading && (
                  <div className="mt-2 max-w-xs">
                    <div className="h-2 w-full rounded bg-gray-200 overflow-hidden">
                      <div className="h-full bg-[#007B8A] transition-all" style={{ width: `${heroUploadProgress}%` }} />
                    </div>
                    <p className="text-xs text-[#007B8A] mt-1">{heroUploadProgress}%</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">Avertissement &gt; 3 Mo, max 5 Mo.</p>
              </div>
            </div>
            <div className="bg-gray-100 rounded overflow-hidden">
              {form.heroImageUrl ? (
                <img src={form.heroImageUrl} alt="Hero preview" className="w-full h-64 object-cover" />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Aperçu indisponible</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3>Section Vision</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-gray-700">Titre</label>
            <input
              type="text"
              value={form.visionTitle}
              onChange={(e) => updateField('visionTitle', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded"
            />
          </div>
          <div className="space-y-3">
            {form.visionParagraphs.map((paragraph, index) => (
              <div key={`vision-${index}`} className="border border-gray-200 rounded p-3">
                <textarea
                  rows={3}
                  value={paragraph}
                  onChange={(e) => updateParagraph('visionParagraphs', index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded"
                />
                <div className="flex justify-end mt-2">
                  <Button variant="outline" size="sm" onClick={() => removeParagraph('visionParagraphs', index)}>
                    <Trash2 size={14} />
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addParagraph('visionParagraphs')}>
              <Plus size={16} />
              Ajouter un paragraphe
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3>Section Artisanat</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">Titre</label>
                <input
                  type="text"
                  value={form.craftTitle}
                  onChange={(e) => updateField('craftTitle', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded"
                />
              </div>
              <div className="space-y-3">
                {form.craftParagraphs.map((paragraph, index) => (
                  <div key={`craft-${index}`} className="border border-gray-200 rounded p-3">
                    <textarea
                      rows={3}
                      value={paragraph}
                      onChange={(e) => updateParagraph('craftParagraphs', index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded"
                    />
                    <div className="flex justify-end mt-2">
                      <Button variant="outline" size="sm" onClick={() => removeParagraph('craftParagraphs', index)}>
                        <Trash2 size={14} />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addParagraph('craftParagraphs')}>
                  <Plus size={16} />
                  Ajouter un paragraphe
                </Button>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Image (URL)</label>
                <input
                  type="text"
                  value={form.craftImageUrl || ''}
                  onChange={(e) => updateField('craftImageUrl', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded"
                />
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  ref={craftFileRef}
                  className="hidden"
                  onChange={handleCraftImageSelect}
                />
                <Button variant="outline" size="sm" onClick={() => craftFileRef.current?.click()} disabled={craftUploading}>
                  <Upload size={16} />
                  {craftUploading ? 'Téléchargement...' : 'Télécharger une image'}
                </Button>
                {craftUploading && (
                  <div className="mt-2 max-w-xs">
                    <div className="h-2 w-full rounded bg-gray-200 overflow-hidden">
                      <div className="h-full bg-[#007B8A] transition-all" style={{ width: `${craftUploadProgress}%` }} />
                    </div>
                    <p className="text-xs text-[#007B8A] mt-1">{craftUploadProgress}%</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">Avertissement &gt; 3 Mo, max 5 Mo.</p>
              </div>
            </div>
            <div className="bg-gray-100 rounded overflow-hidden">
              {form.craftImageUrl ? (
                <img src={form.craftImageUrl} alt="Craft preview" className="w-full h-64 object-cover" />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Aperçu indisponible</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3>Section Valeurs</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-gray-700">Titre</label>
            <input
              type="text"
              value={form.valuesTitle}
              onChange={(e) => updateField('valuesTitle', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded"
            />
          </div>
          <div className="space-y-4">
            {form.values.map((value, index) => (
              <div key={`value-${index}`} className="border border-gray-200 rounded p-4 space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Titre</label>
                  <input
                    type="text"
                    value={value.title}
                    onChange={(e) => updateValue(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={value.description}
                    onChange={(e) => updateValue(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded"
                  />
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => removeValue(index)}>
                    <Trash2 size={14} />
                    Supprimer
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addValue}>
              <Plus size={16} />
              Ajouter une valeur
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3>Section Appel à l’action</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-gray-700">Titre</label>
            <input
              type="text"
              value={form.ctaTitle}
              onChange={(e) => updateField('ctaTitle', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-700">Description</label>
            <textarea
              rows={3}
              value={form.ctaDescription || ''}
              onChange={(e) => updateField('ctaDescription', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm mb-2 text-gray-700">Texte du bouton</label>
              <input
                type="text"
                value={form.ctaButtonText}
                onChange={(e) => updateField('ctaButtonText', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded"
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700">Lien du bouton</label>
              <input
                type="text"
                value={form.ctaButtonUrl}
                onChange={(e) => updateField('ctaButtonUrl', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
