import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../Card';
import { Button } from '../Button';
import { Plus, Edit, Trash2, Search, Filter, X, Eye } from 'lucide-react';
import { productsAPI, categoriesAPI } from '../../services/api';

interface Product {
  id: number;
  name: string;
  description?: string;
  productImage?: string;
  priceCents: number;
  stock: number;
  inStock: boolean;
  category: {
    id: number;
    name: string;
  };
  label?: string;
  images?: string[];
  longDescription?: string;
  mannequinImage?: string;
  colors?: any;
  sizes?: string[];
}

interface Category {
  id: number;
  name: string;
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceCents: 0,
    stock: 0,
    inStock: true,
    label: '',
    productImage: '',
    longDescription: '',
    mannequinImage: '',
    colors: [] as { name: string; hex: string; images: string[] }[],
    sizes: [] as string[],
    categoryId: 0,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [dragActiveType, setDragActiveType] = useState<string | null>(null);
  const [newSize, setNewSize] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [newColorImageUrl, setNewColorImageUrl] = useState('');
  const [uploadingColorImage, setUploadingColorImage] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Fetch products on mount and when search/page changes
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await productsAPI.list(searchTerm, page);
      setProducts(result.data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await categoriesAPI.getAll();
      setCategories(result.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleCreateProduct = async () => {
    if (!formData.name || !formData.categoryId) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    try {
      setLoading(true);
      await productsAPI.create(formData);
      setFormData({
        name: '',
        description: '',
        priceCents: 0,
        stock: 0,
        inStock: true,
        label: '',
        productImage: '',
        longDescription: '',
        mannequinImage: '',
        colors: [],
        sizes: [],
        categoryId: 0,
      });
      setNewSize('');
      setNewColorName('');
      setNewColorHex('#000000');
      setNewColorImageUrl('');
      setIsCreating(false);
      await loadProducts();
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    try {
      setLoading(true);
      await productsAPI.update(selectedProduct.id, formData);
      setSelectedProduct(null);
      await loadProducts();
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) return;
    try {
      setLoading(true);
      await productsAPI.delete(id);
      await loadProducts();
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceCents: number) => {
    return (priceCents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const getProductStatus = (product: Product) => {
    if (!product.inStock) return 'Rupture de Stock';
    if (product.stock < 5) return 'Stock Faible';
    return 'Actif';
  };

  const handleImageUpload = async (file: File, imageType: string = 'product') => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image doit faire moins de 5MB');
      return;
    }

    try {
      if (imageType === 'colorImage') {
        setUploadingColorImage(true);
      } else {
        setUploadingImage(true);
      }
      setError(null);
      const result = await productsAPI.upload(file);
      
      switch(imageType) {
        case 'product':
          setFormData(prev => ({ ...prev, productImage: result.url }));
          break;
        case 'mannequin':
          setFormData(prev => ({ ...prev, mannequinImage: result.url }));
          break;
        case 'additional':
          // Additional images not used - colors have their own image array
          break;
        case 'colorImage':
          setNewColorImageUrl(result.url);
          break;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (imageType === 'colorImage') {
        setUploadingColorImage(false);
      } else {
        setUploadingImage(false);
      }
    }
  };

  const handleDrag = (e: React.DragEvent, type?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
      if (type) setDragActiveType(type);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
      setDragActiveType(null);
    }
  };

  const handleDrop = (e: React.DragEvent, imageType: string = 'product') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setDragActiveType(null);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageUpload(files[0], imageType);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Close error message">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Rechercher des produits..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded w-80 focus:outline-none focus:border-[#007B8A] transition-colors"
            />
          </div>
        </div>
        <Button variant="primary" onClick={() => setIsCreating(true)}>
          <Plus size={18} />
          Ajouter un Nouveau Produit
        </Button>
      </div>

      {/* Products Table */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardContent className="p-0">
            {loading && !isCreating && !selectedProduct ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Chargement des produits...</div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Aucun produit trouvé</div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-gray-500">Produit</th>
                    <th className="text-left px-6 py-4 text-gray-500">Catégorie</th>
                    <th className="text-left px-6 py-4 text-gray-500">Prix</th>
                    <th className="text-left px-6 py-4 text-gray-500">Stock</th>
                    <th className="text-left px-6 py-4 text-gray-500">Couleurs</th>
                    <th className="text-left px-6 py-4 text-gray-500">Tailles</th>
                    <th className="text-left px-6 py-4 text-gray-500">Statut</th>
                    <th className="text-right px-6 py-4 text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr 
                      key={product.id} 
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                            {product.productImage ? (
                              <img 
                                src={product.productImage} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-mono">ID: {product.id}</div>
                            <span className="block">{product.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{product.category?.name || 'N/A'}</td>
                      <td className="px-6 py-4">{formatPrice(product.priceCents)}</td>
                      <td className="px-6 py-4">{product.stock}</td>
                      <td className="px-6 py-4">
                        {product.colors && product.colors.length > 0 ? (
                          <div className="flex gap-1">
                            {product.colors.map((color: any, idx: number) => (
                              <div 
                                key={idx} 
                                className="w-6 h-6 rounded border border-gray-300 cursor-pointer hover:ring-2 hover:ring-[#007B8A] transition-all" 
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {product.sizes && product.sizes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {product.sizes.map((size, idx) => (
                              <span key={idx} className="bg-[#e6f4f6] text-[#007B8A] text-xs px-2 py-1 rounded font-medium">
                                {size}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          getProductStatus(product) === 'Actif' 
                            ? 'bg-[#e6f4f6] text-[#007B8A]' 
                            : getProductStatus(product) === 'Stock Faible'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-600'
                        }`}>
                          {getProductStatus(product)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setViewingProduct(product)}
                            className="p-2 hover:bg-blue-50 rounded-full transition-colors"
                            aria-label={`View product ${product.name}`}
                          >
                            <Eye size={16} className="text-blue-600" strokeWidth={1.5} />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedProduct(product);
                              setFormData({
                                name: product.name,
                                description: product.description || '',
                                priceCents: product.priceCents,
                                stock: product.stock,
                                inStock: product.inStock,
                                label: product.label || '',
                                productImage: product.productImage || '',
                                longDescription: product.longDescription || '',
                                mannequinImage: product.mannequinImage || '',
                                colors: (product as any).colors || [],
                                sizes: (product as any).sizes || [],
                                categoryId: product.category.id,
                              });
                              setNewSize('');
                              setNewColorName('');
                              setNewColorHex('#000000');
                              setNewColorImageUrl('');
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label={`Edit product ${product.name}`}
                          >
                            <Edit size={16} className="text-gray-600" strokeWidth={1.5} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 hover:bg-red-50 rounded-full transition-colors"
                            aria-label={`Delete product ${product.name}`}
                          >
                            <Trash2 size={16} className="text-red-500" strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Product Modal */}
      {isCreating && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3>Créer un Nouveau Produit</h3>
              <button onClick={() => setIsCreating(false)} aria-label="Close create product form">
                <X size={20} />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Nom du Produit*</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Prix (USD)</label>
                    <input
                      type="number"
                      value={formData.priceCents / 100}
                      onChange={(e) => setFormData({ ...formData, priceCents: Number(e.target.value) * 100 })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Stock</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="create-category" className="block text-sm mb-2 text-gray-700">Catégorie*</label>
                  <select 
                    id="create-category"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  >
                    <option value={0}>Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Entrez la description du produit..."
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Description Longue</label>
                  <textarea
                    value={formData.longDescription}
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                    rows={3}
                    placeholder="Entrez la description détaillée du produit..."
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Couleurs avec Hex et Images</label>
                  <div className="space-y-3">
                    {formData.colors.map((color, idx) => (
                      <div key={idx} className="border border-gray-200 rounded p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded border border-gray-300"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div><span className="text-sm font-medium block">{color.name}</span><span className="text-xs text-gray-500">{color.hex}</span></div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              colors: formData.colors.filter((_, i) => i !== idx)
                            })}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {color.images.length} image(s)
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {color.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="relative group">
                              <img 
                                src={img} 
                                alt={`Color ${color.hex} view ${imgIdx + 1}`}
                                className="w-12 h-12 rounded object-cover border border-gray-200"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                              />
                              <button
                                type="button"
                                onClick={() => setFormData({
                                  ...formData,
                                  colors: formData.colors.map((c, i) => 
                                    i === idx 
                                      ? { ...c, images: c.images.filter((_, j) => j !== imgIdx) }
                                      : c
                                  )
                                })}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Supprimer cette image"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs font-medium text-blue-900 mb-2">Ajouter des images à cette couleur</p>
                          <div className="flex gap-2 items-end">
                            <input
                              type="text"
                              placeholder="https://exemple.com/image.jpg"
                              className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                  setFormData({
                                    ...formData,
                                    colors: formData.colors.map((c, i) => 
                                      i === idx 
                                        ? { ...c, images: [...c.images, e.currentTarget.value] }
                                        : c
                                    )
                                  });
                                  e.currentTarget.value = '';
                                }
                              }}
                              onBlur={(e) => {
                                if (e.currentTarget.value.trim()) {
                                  setFormData({
                                    ...formData,
                                    colors: formData.colors.map((c, i) => 
                                      i === idx 
                                        ? { ...c, images: [...c.images, e.currentTarget.value] }
                                        : c
                                    )
                                  });
                                  e.currentTarget.value = '';
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const fileInput = document.createElement('input');
                                fileInput.type = 'file';
                                fileInput.accept = 'image/*';
                                fileInput.onchange = async (e: any) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      setUploadingImage(true);
                                      setError(null);
                                      const result = await productsAPI.upload(file);
                                      setFormData({
                                        ...formData,
                                        colors: formData.colors.map((c, i) => 
                                          i === idx 
                                            ? { ...c, images: [...c.images, result.url] }
                                            : c
                                        )
                                      });
                                    } catch (err: any) {
                                      setError(err.message);
                                    } finally {
                                      setUploadingImage(false);
                                    }
                                  }
                                };
                                fileInput.click();
                              }}
                              disabled={uploadingImage}
                              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:bg-gray-400 whitespace-nowrap"
                            >
                              {uploadingImage ? 'Upload...' : 'Télécharger'}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                                if (input && input.value.trim()) {
                                  setFormData({
                                    ...formData,
                                    colors: formData.colors.map((c, i) => 
                                      i === idx 
                                        ? { ...c, images: [...c.images, input.value] }
                                        : c
                                    )
                                  });
                                  input.value = '';
                                }
                              }}
                              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 whitespace-nowrap"
                            >
                              Ajouter
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded space-y-2">
                    <p className="text-sm font-medium text-gray-700">Ajouter une Couleur</p>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Désignation</label>
                        <input
                          type="text"
                          value={newColorName}
                          onChange={(e) => setNewColorName(e.target.value)}
                          placeholder="ex: Noir"
                          className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Code Hex</label>
                        <input
                          type="color"
                          value={newColorHex}
                          onChange={(e) => setNewColorHex(e.target.value)}
                          className="w-full h-9 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={newColorHex}
                          onChange={(e) => setNewColorHex(e.target.value)}
                          placeholder="#000000"
                          className="w-full px-2 py-1 text-xs border border-gray-200 rounded mt-1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">URL Image</label>
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={newColorImageUrl}
                            onChange={(e) => setNewColorImageUrl(e.target.value)}
                            placeholder="https://..."
                            className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const fileInput = document.createElement('input');
                              fileInput.type = 'file';
                              fileInput.accept = 'image/*';
                              fileInput.onchange = async (e: any) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  await handleImageUpload(file, 'colorImage');
                                }
                              };
                              fileInput.click();
                            }}
                            disabled={uploadingColorImage}
                            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:bg-gray-400 whitespace-nowrap"
                          >
                            {uploadingColorImage ? 'Upload...' : 'Télécharger'}
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-1 items-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (!newColorName.trim()) {
                              setError('Veuillez entrer une désignation de couleur');
                              return;
                            }
                            if (!newColorImageUrl.trim()) {
                              setError('Veuillez entrer une URL d\'image');
                              return;
                            }
                            const existingColor = formData.colors.find(c => c.hex === newColorHex);
                            if (existingColor) {
                              setFormData({
                                ...formData,
                                colors: formData.colors.map(c =>
                                  c.hex === newColorHex
                                    ? { ...c, images: [...c.images, newColorImageUrl] }
                                    : c
                                )
                              });
                            } else {
                              setFormData({
                                ...formData,
                                colors: [...formData.colors, { name: newColorName, hex: newColorHex, images: [newColorImageUrl] }]
                              });
                            }
                            setNewColorName('Noir');
                            setNewColorHex('#000000');
                            setNewColorImageUrl('');
                            setError(null);
                          }}
                          className="flex-1 px-2 py-1 bg-[#007B8A] text-white text-xs rounded hover:bg-[#006270]"
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Tailles Disponibles</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.sizes && formData.sizes.map((size, idx) => (
                      <div key={idx} className="bg-[#e6f4f6] text-[#007B8A] px-3 py-1 rounded-full flex items-center gap-2">
                        <span className="text-sm font-medium">{size}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            sizes: formData.sizes.filter((_, i) => i !== idx)
                          })}
                          className="hover:text-[#006270] font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value.toUpperCase())}
                      placeholder="e.g., S, M, L, XL"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newSize.trim() && !formData.sizes.includes(newSize)) {
                          setFormData({
                            ...formData,
                            sizes: [...formData.sizes, newSize]
                          });
                          setNewSize('');
                        }
                      }}
                      className="px-4 py-2 bg-[#007B8A] text-white rounded hover:bg-[#006270] text-sm font-medium"
                    >
                      Ajouter Taille
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Image du Produit</label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded p-8 text-center cursor-pointer transition-colors ${
                      dragActive ? 'border-[#007B8A] bg-blue-50' : 'border-gray-300'
                    } ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                      className="hidden"
                      id="image-upload"
                      disabled={uploadingImage}
                    />
                    <label htmlFor="image-upload" className="block cursor-pointer">
                      <div className="mb-3">
                        {formData.productImage ? (
                          <div className="flex items-center justify-center mb-3">
                            <img 
                              src={formData.productImage} 
                              alt="Product" 
                              className="max-h-32 rounded"
                            />
                          </div>
                        ) : (
                          <div className="text-4xl text-gray-400 mb-3">📁</div>
                        )}
                      </div>
                      {uploadingImage ? (
                        <p className="text-sm text-gray-600">Téléchargement en cours...</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-700">
                            Glissez-déposez une image ici ou cliquez pour sélectionner
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF jusqu'à 5MB</p>
                        </>
                      )}
                    </label>
                  </div>
                  {formData.productImage && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, productImage: '' })}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Supprimer l'image
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Image du Mannequin</label>
                  <div
                    onDragEnter={(e) => handleDrag(e, 'mannequin')}
                    onDragLeave={(e) => handleDrag(e, 'mannequin')}
                    onDragOver={(e) => handleDrag(e, 'mannequin')}
                    onDrop={(e) => handleDrop(e, 'mannequin')}
                    className={`border-2 border-dashed rounded p-6 text-center cursor-pointer transition-colors ${
                      dragActiveType === 'mannequin' ? 'border-[#007B8A] bg-blue-50' : 'border-gray-300'
                    } ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'mannequin')}
                      className="hidden"
                      id="mannequin-upload"
                      disabled={uploadingImage}
                    />
                    <label htmlFor="mannequin-upload" className="block cursor-pointer">
                      <div className="mb-3">
                        {formData.mannequinImage ? (
                          <div className="flex items-center justify-center mb-3">
                            <img 
                              src={formData.mannequinImage} 
                              alt="Mannequin" 
                              className="max-h-32 rounded"
                            />
                          </div>
                        ) : (
                          <div className="text-4xl text-gray-400 mb-3">👔</div>
                        )}
                      </div>
                      {uploadingImage ? (
                        <p className="text-sm text-gray-600">Téléchargement en cours...</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-700">
                            Glissez-déposez une image ici ou cliquez pour sélectionner
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF jusqu'à 5MB</p>
                        </>
                      )}
                    </label>
                  </div>
                  {formData.mannequinImage && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, mannequinImage: '' })}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Supprimer l'image
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Images Supplémentaires</label>
                  <div
                    onDragEnter={(e) => handleDrag(e, 'additional')}
                    onDragLeave={(e) => handleDrag(e, 'additional')}
                    onDragOver={(e) => handleDrag(e, 'additional')}
                    onDrop={(e) => handleDrop(e, 'additional')}
                    className={`border-2 border-dashed rounded p-6 text-center cursor-pointer transition-colors ${
                      dragActiveType === 'additional' ? 'border-[#007B8A] bg-blue-50' : 'border-gray-300'
                    } ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'additional')}
                      className="hidden"
                      id="additional-upload"
                      disabled={uploadingImage}
                    />
                    <label htmlFor="additional-upload" className="block cursor-pointer">
                      <div className="mb-3">
                        <div className="text-4xl text-gray-400 mb-3">🖼️</div>
                      </div>
                      {uploadingImage ? (
                        <p className="text-sm text-gray-600">Téléchargement en cours...</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-700">
                            Glissez-déposez des images ici ou cliquez pour sélectionner
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF jusqu'à 5MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-gray-700">En Stock</label>
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setIsCreating(false)}>
                    Annuler
                  </Button>
                  <Button variant="primary" onClick={handleCreateProduct} disabled={loading}>
                    {loading ? 'Création...' : 'Créer le Produit'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Product Modal */}
      {selectedProduct && !isCreating && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3>Modifier le Produit</h3>
              <button onClick={() => setSelectedProduct(null)} aria-label="Close edit product form">
                <X size={20} />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Nom du Produit</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Prix (USD)</label>
                    <input
                      type="number"
                      value={formData.priceCents / 100}
                      onChange={(e) => setFormData({ ...formData, priceCents: Number(e.target.value) * 100 })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Stock</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="edit-category" className="block text-sm mb-2 text-gray-700">Catégorie</label>
                  <select 
                    id="edit-category"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  >
                    <option value={0}>Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Description Longue</label>
                  <textarea
                    value={formData.longDescription}
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Couleurs avec Hex et Images</label>
                  <div className="space-y-3">
                    {formData.colors.map((color, idx) => (
                      <div key={idx} className="border border-gray-200 rounded p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded border border-gray-300"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div><span className="text-sm font-medium block">{color.name}</span><span className="text-xs text-gray-500">{color.hex}</span></div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              colors: formData.colors.filter((_, i) => i !== idx)
                            })}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {color.images.length} image(s)
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {color.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="relative group">
                              <img 
                                src={img} 
                                alt={`Color ${color.hex} view ${imgIdx + 1}`}
                                className="w-12 h-12 rounded object-cover border border-gray-200"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                              />
                              <button
                                type="button"
                                onClick={() => setFormData({
                                  ...formData,
                                  colors: formData.colors.map((c, i) => 
                                    i === idx 
                                      ? { ...c, images: c.images.filter((_, j) => j !== imgIdx) }
                                      : c
                                  )
                                })}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Supprimer cette image"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs font-medium text-blue-900 mb-2">Ajouter des images à cette couleur</p>
                          <div className="flex gap-2 items-end">
                            
                            <button
                              type="button"
                              onClick={() => {
                                const fileInput = document.createElement('input');
                                fileInput.type = 'file';
                                fileInput.accept = 'image/*';
                                fileInput.onchange = async (e: any) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      setUploadingImage(true);
                                      setError(null);
                                      const result = await productsAPI.upload(file);
                                      setFormData({
                                        ...formData,
                                        colors: formData.colors.map((c, i) => 
                                          i === idx 
                                            ? { ...c, images: [...c.images, result.url] }
                                            : c
                                        )
                                      });
                                    } catch (err: any) {
                                      setError(err.message);
                                    } finally {
                                      setUploadingImage(false);
                                    }
                                  }
                                };
                                fileInput.click();
                              }}
                              disabled={uploadingImage}
                              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:bg-gray-400 whitespace-nowrap"
                            >
                              {uploadingImage ? 'Upload...' : 'Télécharger'}
                            </button>
                            
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800">Ajouter une Nouvelle Couleur</h4>
                        <p className="text-xs text-gray-500 mt-1">Remplissez les détails et téléchargez une image</p>
                      </div>
                      {newColorHex && (
                        <div 
                          onClick={() => document.getElementById('color-picker-edit')?.click()}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div 
                            className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all"
                            style={{ backgroundColor: newColorHex }}
                          />
                          
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 lg:grid-cols-3 lg:gap-3">
                      {/* Désignation */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Désignation</label>
                        <input
                          type="text"
                          value={newColorName}
                          onChange={(e) => setNewColorName(e.target.value)}
                          placeholder="ex: Noir"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007B8A] focus:border-transparent transition-colors"
                        />
                      </div>

                      {/* Code Hex */}
                      <div className="space-y-2 mr-4">
                        <label className="block text-sm font-medium text-gray-700">Couleur</label>
                        <div className="flex gap-2">
                          <input
                            id="color-picker-edit"
                            type="color"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            className="w-16 h-10 rounded-md cursor-pointer border border-gray-300"
                          />
                          <input
                            type="text"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            placeholder="#000000"
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007B8A] focus:border-transparent font-mono"
                          />
                        </div>
                      </div>

                      {/* Image Upload */}
                      <div className="space-y-2 ">
                        <label className="block w-full text-sm font-medium text-gray-700">Image de la Couleur</label>
                        <div className="flex gap-2">
                          
                          <button
                            type="button"
                            onClick={() => {
                              const fileInput = document.createElement('input');
                              fileInput.type = 'file';
                              fileInput.accept = 'image/*';
                              fileInput.onchange = async (e: any) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  await handleImageUpload(file, 'colorImage');
                                }
                              };
                              fileInput.click();
                            }}
                            disabled={uploadingColorImage}
                            className="px-4 py-2 bg-[#007B8A] text-white text-sm font-medium rounded-md hover:bg-[#006270] disabled:bg-gray-400 transition-colors whitespace-nowrap shadow-sm hover:shadow-md"
                          >
                            {uploadingColorImage ? '⏳ Upload...' : '📁 Télécharger'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Add Button */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!newColorName.trim()) {
                            setError('Veuillez entrer une désignation de couleur');
                            return;
                          }
                          if (!newColorImageUrl.trim()) {
                            setError('Veuillez entrer une URL d\'image ou télécharger une image');
                            return;
                          }
                          const existingColor = formData.colors.find(c => c.hex === newColorHex);
                          if (existingColor) {
                            setFormData({
                              ...formData,
                              colors: formData.colors.map(c =>
                                c.hex === newColorHex
                                  ? { ...c, images: [...c.images, newColorImageUrl] }
                                  : c
                              )
                            });
                          } else {
                            setFormData({
                              ...formData,
                              colors: [...formData.colors, { name: newColorName, hex: newColorHex, images: [newColorImageUrl] }]
                            });
                          }
                          setNewColorName('');
                          setNewColorHex('#000000');
                          setNewColorImageUrl('');
                          setError(null);
                        }}
                        className="flex-1 lg:flex-none px-6 py-2 bg-[#007B8A] text-white font-semibold rounded-md hover:bg-[#006270] transition-colors shadow-sm hover:shadow-md active:scale-95"
                      >
                        ✓ Ajouter la Couleur
                      </button>
                      {(newColorName || newColorImageUrl) && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewColorName('');
                            setNewColorHex('#000000');
                            setNewColorImageUrl('');
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          Réinitialiser
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Tailles Disponibles</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.sizes && formData.sizes.map((size, idx) => (
                      <div key={idx} className="bg-[#e6f4f6] text-[#007B8A] px-3 py-1 rounded-full flex items-center gap-2">
                        <span className="text-sm font-medium">{size}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            sizes: formData.sizes.filter((_, i) => i !== idx)
                          })}
                          className="hover:text-[#006270] font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value.toUpperCase())}
                      placeholder="e.g., S, M, L, XL"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newSize.trim() && !formData.sizes.includes(newSize)) {
                          setFormData({
                            ...formData,
                            sizes: [...formData.sizes, newSize]
                          });
                          setNewSize('');
                        }
                      }}
                      className="px-4 py-2 bg-[#007B8A] text-white rounded hover:bg-[#006270] text-sm font-medium"
                    >
                      Ajouter Taille
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Image du Produit</label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded p-8 text-center cursor-pointer transition-colors ${
                      dragActive ? 'border-[#007B8A] bg-blue-50' : 'border-gray-300'
                    } ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                      className="hidden"
                      id="image-upload-edit"
                      disabled={uploadingImage}
                    />
                    <label htmlFor="image-upload-edit" className="block cursor-pointer">
                      <div className="mb-3">
                        {formData.productImage ? (
                          <div className="flex items-center justify-center mb-3">
                            <img 
                              src={formData.productImage} 
                              alt="Product" 
                              className="max-h-32 rounded"
                            />
                          </div>
                        ) : (
                          <div className="text-4xl text-gray-400 mb-3">📁</div>
                        )}
                      </div>
                      {uploadingImage ? (
                        <p className="text-sm text-gray-600">Téléchargement en cours...</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-700">
                            Glissez-déposez une image ici ou cliquez pour sélectionner
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF jusqu'à 5MB</p>
                        </>
                      )}
                    </label>
                  </div>
                  {formData.productImage && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, productImage: '' })}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Supprimer l'image
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Label</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Image du Mannequin</label>
                  <div
                    onDragEnter={(e) => handleDrag(e, 'mannequin')}
                    onDragLeave={(e) => handleDrag(e, 'mannequin')}
                    onDragOver={(e) => handleDrag(e, 'mannequin')}
                    onDrop={(e) => handleDrop(e, 'mannequin')}
                    className={`border-2 border-dashed rounded p-6 text-center cursor-pointer transition-colors ${
                      dragActiveType === 'mannequin' ? 'border-[#007B8A] bg-blue-50' : 'border-gray-300'
                    } ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'mannequin')}
                      className="hidden"
                      id="mannequin-upload-edit"
                      disabled={uploadingImage}
                    />
                    <label htmlFor="mannequin-upload-edit" className="block cursor-pointer">
                      <div className="mb-3">
                        {formData.mannequinImage ? (
                          <div className="flex items-center justify-center mb-3">
                            <img 
                              src={formData.mannequinImage} 
                              alt="Mannequin" 
                              className="max-h-32 rounded"
                            />
                          </div>
                        ) : (
                          <div className="text-4xl text-gray-400 mb-3">👔</div>
                        )}
                      </div>
                      {uploadingImage ? (
                        <p className="text-sm text-gray-600">Téléchargement en cours...</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-700">
                            Glissez-déposez une image ici ou cliquez pour sélectionner
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF jusqu'à 5MB</p>
                        </>
                      )}
                    </label>
                  </div>
                  {formData.mannequinImage && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, mannequinImage: '' })}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Supprimer l'image
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">Images Supplémentaires</label>
                  <div
                    onDragEnter={(e) => handleDrag(e, 'additional')}
                    onDragLeave={(e) => handleDrag(e, 'additional')}
                    onDragOver={(e) => handleDrag(e, 'additional')}
                    onDrop={(e) => handleDrop(e, 'additional')}
                    className={`border-2 border-dashed rounded p-6 text-center cursor-pointer transition-colors ${
                      dragActiveType === 'additional' ? 'border-[#007B8A] bg-blue-50' : 'border-gray-300'
                    } ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          Array.from(e.target.files).forEach((file) => handleImageUpload(file, 'additional'));
                        }
                      }}
                      className="hidden"
                      id="additional-upload-edit"
                      disabled={uploadingImage}
                    />
                    <label htmlFor="additional-upload-edit" className="block cursor-pointer">
                      <div className="mb-3">
                        <div className="text-4xl text-gray-400 mb-3">🖼️</div>
                      </div>
                      {uploadingImage ? (
                        <p className="text-sm text-gray-600">Téléchargement en cours...</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-700">
                            Glissez-déposez des images ici ou cliquez pour sélectionner
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF jusqu'à 5MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-gray-700">En Stock</label>
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setSelectedProduct(null)}>
                    Annuler
                  </Button>
                  <Button variant="primary" onClick={handleUpdateProduct} disabled={loading}>
                    {loading ? 'Mise à jour...' : 'Enregistrer les Modifications'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Product Modal */}
      {viewingProduct && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3>Détails du Produit</h3>
              <button onClick={() => setViewingProduct(null)} aria-label="Close view product">
                <X size={20} />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Images Section */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Image Principale</h4>
                    {viewingProduct.productImage ? (
                      <img src={viewingProduct.productImage} alt={viewingProduct.name} className="w-full rounded" />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">Pas d'image</div>
                    )}
                  </div>
                  
                  {viewingProduct.mannequinImage && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Image Mannequin</h4>
                      <img src={viewingProduct.mannequinImage} alt="Mannequin" className="w-full rounded" />
                    </div>
                  )}

                  {(viewingProduct as any).images && (viewingProduct as any).images.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Images Supplémentaires ({(viewingProduct as any).images.length})</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {(viewingProduct as any).images.map((img: string, idx: number) => (
                          <img key={idx} src={img} alt={`Additional ${idx + 1}`} className="w-full h-20 object-cover rounded" onError={(e) => e.currentTarget.style.display = 'none'} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">ID</label>
                    <p className="text-sm font-mono">{viewingProduct.id}</p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 font-semibold">NOM</label>
                    <p className="text-lg font-semibold">{viewingProduct.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 font-semibold">PRIX</label>
                    <p className="text-lg font-semibold">{formatPrice(viewingProduct.priceCents)}</p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 font-semibold">STOCK</label>
                    <p className="text-sm">{viewingProduct.stock} unités</p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 font-semibold">STATUT</label>
                    <span className={`inline-block text-xs px-3 py-1 rounded-full ${
                      getProductStatus(viewingProduct) === 'Actif' 
                        ? 'bg-[#e6f4f6] text-[#007B8A]' 
                        : getProductStatus(viewingProduct) === 'Stock Faible'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {getProductStatus(viewingProduct)}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 font-semibold">CATÉGORIE</label>
                    <p className="text-sm">{viewingProduct.category?.name || 'N/A'}</p>
                  </div>

                  {viewingProduct.label && (
                    <div>
                      <label className="text-xs text-gray-500 font-semibold">LABEL</label>
                      <p className="text-sm">{viewingProduct.label}</p>
                    </div>
                  )}

                  {viewingProduct.sizes && viewingProduct.sizes.length > 0 && (
                    <div>
                      <label className="text-xs text-gray-500 font-semibold mb-2 block">TAILLES DISPONIBLES</label>
                      <div className="flex flex-wrap gap-2">
                        {viewingProduct.sizes.map((size: string, idx: number) => (
                          <span key={idx} className="bg-[#e6f4f6] text-[#007B8A] px-3 py-1 rounded text-sm font-medium">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-gray-500 font-semibold">DESCRIPTION</label>
                <p className="text-sm text-gray-700">{viewingProduct.description || 'N/A'}</p>
              </div>

              {viewingProduct.longDescription && (
                <div>
                  <label className="text-xs text-gray-500 font-semibold">DESCRIPTION LONGUE</label>
                  <p className="text-sm text-gray-700">{viewingProduct.longDescription}</p>
                </div>
              )}

             

              {/* Couleurs */}
              {(viewingProduct as any).colors && (viewingProduct as any).colors.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500 font-semibold mb-2">COULEURS DISPONIBLES</label>
                  <div className="space-y-3">
                    {(viewingProduct as any).colors.map((color: any, idx: number) => (
                      <div key={idx} className="border border-gray-200 rounded p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <div 
                            className="w-8 h-8 rounded border border-gray-300"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div>
                            <p className="text-sm font-semibold">{color.name}</p>
                            <p className="text-xs text-gray-500">{color.hex}</p>
                          </div>
                        </div>
                        {color.images && color.images.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {color.images.map((img: string, imgIdx: number) => (
                              <img 
                                key={imgIdx} 
                                src={img} 
                                alt={`${color.name} ${imgIdx + 1}`}
                                className="w-16 h-16 rounded object-cover border border-gray-200"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="ghost" onClick={() => setViewingProduct(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
