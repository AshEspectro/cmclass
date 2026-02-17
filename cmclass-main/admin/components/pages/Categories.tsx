import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../Card';
import { Button } from '../Button';
import { Plus, Edit, Trash2, MoveVertical, Upload, ChevronDown, ChevronRight, X } from 'lucide-react';
import { uploadWithAuth } from '../../services/api';
import { optimizeImageForUpload } from '../../services/uploadUtils';

const BACKEND_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const CATEGORY_IMAGE_WARN_BYTES = 2 * 1024 * 1024;
const CATEGORY_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const formatFileSizeMb = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;

export function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [newCategoryForm, setNewCategoryForm] = useState({ name: '', description: '', parentId: '', image: '', imageUrl: '' });
  const [newSubcategoryForm, setNewSubcategoryForm] = useState<{ [key: number]: { name: string; description: string } }>({});
  const [showSubcategoryForm, setShowSubcategoryForm] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<{ name: string; description: string; parentId: string; imageUrl: string }>({ name: '', description: '', parentId: '', imageUrl: '' });
  const [uploadingNew, setUploadingNew] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);
  const [uploadingNewProgress, setUploadingNewProgress] = useState(0);
  const [uploadingEditProgress, setUploadingEditProgress] = useState(0);

  const validateCategoryImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Veuillez sélectionner une image valide');
    }
    if (file.size > CATEGORY_IMAGE_MAX_BYTES) {
      throw new Error(`L'image dépasse la taille maximale (${formatFileSizeMb(CATEGORY_IMAGE_MAX_BYTES)})`);
    }
    if (file.size > CATEGORY_IMAGE_WARN_BYTES) {
      alert(`⚠️ Image volumineuse (${formatFileSizeMb(file.size)}). L’upload peut être plus lent.`);
    }
  };

  // Handle image upload for new category
  const handleNewCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingNew(true);
    setUploadingNewProgress(0);
    try {
      validateCategoryImage(file);
      const optimized = await optimizeImageForUpload(file);
      const formData = new FormData();
      formData.append('file', optimized);
      const data = await uploadWithAuth<{ url: string }>(`${BACKEND_URL}/admin/categories/upload`, formData, {
        onProgress: setUploadingNewProgress,
      });
      setNewCategoryForm(prev => ({ ...prev, imageUrl: data.url }));
    } catch (err) {
      alert('Erreur lors du téléchargement: ' + (err as Error).message);
    } finally {
      setUploadingNew(false);
      setUploadingNewProgress(0);
    }
  };

  // Handle image upload for editing category
  const handleEditCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingEdit(true);
    setUploadingEditProgress(0);
    try {
      validateCategoryImage(file);
      const optimized = await optimizeImageForUpload(file);
      const formData = new FormData();
      formData.append('file', optimized);
      const data = await uploadWithAuth<{ url: string }>(`${BACKEND_URL}/admin/categories/upload`, formData, {
        onProgress: setUploadingEditProgress,
      });
      setEditFormData(prev => ({ ...prev, imageUrl: data.url }));
    } catch (err) {
      alert('Erreur lors du téléchargement: ' + (err as Error).message);
    } finally {
      setUploadingEdit(false);
      setUploadingEditProgress(0);
    }
  };
  const token =
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token');

  console.log('ACCESS TOKEN:', token);

  // Fetch categories from backend
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/categories?includeInactive=true', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', response.status, errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Store all categories for reference
      setAllCategories(data.data || []);
      
      // Filter to only show top-level categories (no parent)
      const topLevelCategories = (data.data || []).filter((cat: any) => !cat.parentId);
      
      // Build children relationships
      const categoriesWithChildren = topLevelCategories.map((cat: any) => ({
        ...cat,
        children: (data.data || []).filter((sub: any) => sub.parentId === cat.id)
      }));
      
      setCategories(categoriesWithChildren);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    if (!newCategoryForm.name.trim()) {
      alert('Veuillez entrer un nom de catégorie');
      return;
    }
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCategoryForm.name,
          description: newCategoryForm.description || null,
          parentId: newCategoryForm.parentId ? Number(newCategoryForm.parentId) : null,
          imageUrl: newCategoryForm.imageUrl || null,
        }),
      });
      if (!response.ok) throw new Error('Failed to create category');
      setNewCategoryForm({ name: '', description: '', parentId: '', image: '', imageUrl: '' });
      setShowNewCategory(false);
      fetchCategories();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const createSubcategory = async (parentId: number) => {
    const subForm = newSubcategoryForm[parentId];
    if (!subForm || !subForm.name.trim()) {
      alert('Veuillez entrer un nom de sous-catégorie');
      return;
    }
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: subForm.name,
          description: subForm.description || null,
          parentId: parentId,
        }),
      });
      if (!response.ok) throw new Error('Failed to create subcategory');
      setNewSubcategoryForm(prev => ({ ...prev, [parentId]: { name: '', description: '' } }));
      setShowSubcategoryForm(null);
      fetchCategories();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie?')) return;
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + `/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete category');
      fetchCategories();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const updateCategoryStatus = async (id: number, active: boolean) => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + `/admin/categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ active }),
      });
      if (!response.ok) throw new Error('Failed to update category');
      fetchCategories();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const reorderCategories = async (orderedIds: Array<{ id: number; order: number }>) => {
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/admin/categories/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderedIds),
      });
      if (!response.ok) throw new Error('Failed to reorder categories');
      fetchCategories();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDragStart = (id: number) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: number) => {
    if (draggedId && draggedId !== targetId) {
      const draggedIndex = categories.findIndex(c => c.id === draggedId);
      const targetIndex = categories.findIndex(c => c.id === targetId);
      
      if (draggedIndex > -1 && targetIndex > -1) {
        const newCategories = [...categories];
        const [dragged] = newCategories.splice(draggedIndex, 1);
        newCategories.splice(targetIndex, 0, dragged);
        setCategories(newCategories);
        
        const orderedIds = newCategories.map((cat, idx) => ({ id: cat.id, order: idx + 1 }));
        reorderCategories(orderedIds);
      }
    }
    setDraggedId(null);
  };

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    setEditFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId ? String(category.parentId) : '',
      imageUrl: category.imageUrl || '',
    });
  };

  const saveEditedCategory = async () => {
    if (!editFormData.name.trim()) {
      alert('Le nom est requis');
      return;
    }
    try {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const response = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3000') + `/admin/categories/${editingCategory.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editFormData.name,
          description: editFormData.description || null,
          parentId: editFormData.parentId ? Number(editFormData.parentId) : null,
          imageUrl: editFormData.imageUrl || null,
        }),
      });
      if (!response.ok) throw new Error('Failed to update category');
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const closeEditModal = () => {
    setEditingCategory(null);
    setEditFormData({ name: '', description: '', parentId: '', imageUrl: '' });
  };

  return (
    <div className="space-y-6">
      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader className="flex items-center justify-between">
              <h3>Modifier la Catégorie</h3>
              <button onClick={closeEditModal} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Nom de la Catégorie</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Description</label>
                    <textarea
                      rows={3}
                      value={editFormData.description}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-700">Catégorie Parente</label>
                    <select 
                      value={editFormData.parentId}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, parentId: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors">
                      <option value="">Aucune (Catégorie de Niveau Supérieur)</option>
                      {allCategories.filter(c => c.id !== editingCategory.id).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Image de la Catégorie</label>
                  {editFormData.imageUrl && (
                    <div className="mb-4 w-full bg-gray-100 rounded overflow-hidden">
                      <img src={editFormData.imageUrl} alt={editingCategory.name} className="w-full h-32 object-cover" />
                    </div>
                  )}
                  <input 
                    type="file" 
                    id="edit-category-image"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleEditCategoryImageUpload}
                    disabled={uploadingEdit}
                    className="hidden"
                  />
                  <label htmlFor="edit-category-image" className="block border-2 border-dashed border-gray-300 rounded p-8 text-center hover:border-[#007B8A] transition-colors cursor-pointer">
                    <Upload size={32} className="mx-auto mb-3 text-gray-400" strokeWidth={1.5} />
                    <p className="text-sm text-gray-600">{uploadingEdit ? 'Téléchargement...' : 'Cliquez pour télécharger'}</p>
                    {uploadingEdit && (
                      <div className="mt-3">
                        <div className="h-2 w-full rounded bg-gray-200 overflow-hidden">
                          <div className="h-full bg-[#007B8A] transition-all" style={{ width: `${uploadingEditProgress}%` }} />
                        </div>
                        <p className="text-xs text-[#007B8A] mt-1">{uploadingEditProgress}%</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">PNG, JPG, WebP. Avertissement &gt; 2 Mo, max 5 Mo.</p>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="primary" onClick={saveEditedCategory}>Enregistrer</Button>
                <Button variant="ghost" onClick={closeEditModal}>Annuler</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">Gérer les catégories de produits et leur hiérarchie</p>
        </div>
        <Button variant="primary" onClick={() => setShowNewCategory(!showNewCategory)}>
          <Plus size={18} />
          Créer une Catégorie
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
          {error}
        </div>
      )}

      {/* New Category Form */}
      {showNewCategory && (
        <Card>
          <CardHeader>
            <h3>Nouvelle Catégorie</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Nom de la Catégorie</label>
                  <input
                    type="text"
                    placeholder="ex: Tenues de Soirée"
                    value={newCategoryForm.name}
                    onChange={(e) => setNewCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Description de la catégorie..."
                    value={newCategoryForm.description}
                    onChange={(e) => setNewCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-700">Catégorie Parente</label>
                  <select 
                    value={newCategoryForm.parentId}
                    onChange={(e) => setNewCategoryForm(prev => ({ ...prev, parentId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors">
                    <option value="">Aucune (Catégorie de Niveau Supérieur)</option>
                    {allCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">Image de la Catégorie</label>
                {newCategoryForm.imageUrl && (
                  <div className="mb-4 w-full bg-gray-100 rounded overflow-hidden">
                    <img src={newCategoryForm.imageUrl} alt="preview" className="w-full h-48 object-cover" />
                  </div>
                )}
                <input 
                  type="file" 
                  id="new-category-image"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleNewCategoryImageUpload}
                  disabled={uploadingNew}
                  className="hidden"
                />
                <label htmlFor="new-category-image" className="block border-2 border-dashed border-gray-300 rounded p-12 text-center hover:border-[#007B8A] transition-colors cursor-pointer h-64 flex flex-col items-center justify-center">
                  <Upload size={48} className="mx-auto mb-4 text-gray-400" strokeWidth={1.5} />
                  <p className="text-sm text-gray-600">{uploadingNew ? 'Téléchargement...' : 'Cliquez pour télécharger'}</p>
                  {uploadingNew && (
                    <div className="mt-3 w-full max-w-xs">
                      <div className="h-2 w-full rounded bg-gray-200 overflow-hidden">
                        <div className="h-full bg-[#007B8A] transition-all" style={{ width: `${uploadingNewProgress}%` }} />
                      </div>
                      <p className="text-xs text-[#007B8A] mt-1">{uploadingNewProgress}%</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">PNG, JPG, WebP. Avertissement &gt; 2 Mo, max 5 Mo.</p>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="primary" onClick={createCategory}>Créer la Catégorie</Button>
              <Button variant="ghost" onClick={() => setShowNewCategory(false)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <Card>
        <CardHeader>
          <h3>Toutes les Catégories</h3>
          <p className="text-sm text-gray-500 mt-1">Glisser pour réorganiser les catégories - Cliquez pour gérer les sous-catégories</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-gray-500">Chargement des catégories...</p>
          ) : categories.length === 0 ? (
            <p className="text-gray-500">Aucune catégorie trouvée</p>
          ) : (
            categories.map((category) => (
              <div key={category.id}>
                <div 
                  draggable
                  onDragStart={() => handleDragStart(category.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(category.id)}
                  className={`flex items-center justify-between p-4 border border-gray-200 rounded hover:border-[#007B8A] transition-colors cursor-move ${draggedId === category.id ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <MoveVertical size={18} className="text-gray-400" strokeWidth={1.5} />
                    {category.imageUrl ? (
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                        <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">No Image</div>
                    )}
                    <div>
                      <p className="mb-1">{category.name}</p>
                      <p className="text-sm text-gray-500">{category._count?.products || 0} produits</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={category.active}
                        onChange={(e) => updateCategoryStatus(category.id, e.target.checked)}
                        className="w-4 h-4 accent-[#007B8A]"
                      />
                      <span className="text-sm text-gray-600">Actif</span>
                    </label>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setExpandedId(expandedId === category.id ? null : category.id)}
                    >
                      {expandedId === category.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      Subs
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openEditModal(category)}
                    >
                      <Edit size={16} />
                      Modifier
                    </Button>
                    <button 
                      onClick={() => deleteCategory(category.id)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors">
                      <Trash2 size={16} className="text-red-500" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {expandedId === category.id && (
                  <div className="pl-8 mt-3 space-y-3 border-l-2 border-gray-200">
                    {category.children && category.children.length > 0 && (
                      category.children.map((sub: any) => (
                        <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-medium">{sub.name}</p>
                            <p className="text-xs text-gray-500">{sub._count?.products || 0} produits</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={sub.active}
                                onChange={(e) => updateCategoryStatus(sub.id, e.target.checked)}
                                className="w-4 h-4 accent-[#007B8A]"
                              />
                              <span className="text-xs text-gray-600">Actif</span>
                            </label>
                            <button 
                              onClick={() => openEditModal(sub)}
                              className="p-1 hover:bg-blue-50 rounded transition-colors">
                              <Edit size={14} className="text-[#007B8A]" strokeWidth={1.5} />
                            </button>
                            <button 
                              onClick={() => deleteCategory(sub.id)}
                              className="p-1 hover:bg-red-50 rounded transition-colors">
                              <Trash2 size={14} className="text-red-500" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Add Subcategory Form */}
                    {showSubcategoryForm === category.id ? (
                      <div className="p-4 bg-gray-50 rounded border border-gray-200">
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Nom de la sous-catégorie"
                            value={newSubcategoryForm[category.id]?.name || ''}
                            onChange={(e) => setNewSubcategoryForm(prev => ({
                              ...prev,
                              [category.id]: { ...(prev[category.id] || { name: '', description: '' }), name: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#007B8A]"
                          />
                          <textarea
                            rows={2}
                            placeholder="Description (optionnel)"
                            value={newSubcategoryForm[category.id]?.description || ''}
                            onChange={(e) => setNewSubcategoryForm(prev => ({
                              ...prev,
                              [category.id]: { ...(prev[category.id] || { name: '', description: '' }), description: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-[#007B8A]"
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              variant="primary"
                              onClick={() => createSubcategory(category.id)}
                            >
                              Créer
                            </Button>
                            <Button 
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowSubcategoryForm(null)}
                            >
                              Annuler
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setShowSubcategoryForm(category.id);
                          setNewSubcategoryForm(prev => ({ ...prev, [category.id]: { name: '', description: '' } }));
                        }}
                        className="p-2 text-[#007B8A] hover:bg-blue-50 rounded flex items-center gap-2 text-sm w-full"
                      >
                        <Plus size={14} />
                        Ajouter une sous-catégorie
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
