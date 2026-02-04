const fs = require('fs');
const path = require('path');

const filePath = path.join('cmclass-main', 'admin', 'components', 'pages', 'Products.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

console.log('Starting fixes...');

// Fix 1: Replace both "Ajouter une Couleur" sections (in CREATE form and EDIT form)
// Look for the pattern and replace with 4-column grid including color name field

const addColorPattern = /<div className="mt-4 p-4 bg-gray-50 rounded space-y-2">\s*<p className="text-sm font-medium text-gray-700">Ajouter une Couleur<\/p>\s*<div className="grid grid-cols-3 gap-2">\s*<div>\s*<label className="block text-xs text-gray-600 mb-1">Code Hex<\/label>/g;

const addColorReplacement = `<div className="mt-4 p-4 bg-gray-50 rounded space-y-2">
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
                        <label className="block text-xs text-gray-600 mb-1">Code Hex</label>`;

content = content.replace(addColorPattern, addColorReplacement);

console.log('Fix 1 (Add color name field): ' + (content.includes('Désignation') ? 'SUCCESS' : 'FAILED'));

// Fix 2: Update validation logic to check color name
const oldValidation = `if (!newColorImageUrl.trim()) {
                              setError('Veuillez entrer une URL d\\'image');
                              return;
                            }`;

const newValidation = `if (!newColorName.trim()) {
                              setError('Veuillez entrer une désignation de couleur');
                              return;
                            }
                            if (!newColorImageUrl.trim()) {
                              setError('Veuillez entrer une URL d\\'image');
                              return;
                            }`;

content = content.replaceAll(oldValidation, newValidation);

console.log('Fix 2 (Validation logic): ' + (content.includes('désignation de couleur') ? 'SUCCESS' : 'FAILED'));

// Fix 3: Update reset logic - reset color name and hex after adding a new color (not for adding to existing)
const beforeResetSnippet = `} else {
                              setFormData({
                                ...formData,
                                colors: [...formData.colors, { name: newColorName, hex: newColorHex, images: [newColorImageUrl] }]
                              });
                            }
                            setNewColorName('');
                            setNewColorImageUrl('');
                            setError(null);`;

const afterResetSnippet = `} else {
                              setFormData({
                                ...formData,
                                colors: [...formData.colors, { name: newColorName, hex: newColorHex, images: [newColorImageUrl] }]
                              });
                              setNewColorName('');
                              setNewColorHex('#000000');
                            }
                            setNewColorImageUrl('');
                            setError(null);`;

content = content.replaceAll(beforeResetSnippet, afterResetSnippet);

console.log('Fix 3 (Reset logic): Applied');

// Fix 4: Update edit form's Images Supplémentaires textarea to drag-and-drop
const editImageArea = '<div>\n                  <label className="block text-sm mb-2 text-gray-700">Images Supplémentaires (URLs séparées par des virgules)</label>\n                  <textarea\n                    value={\'\'}\n                    onChange={() => {}}\n                    rows={3}\n                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"\n                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors text-sm"\n                  />\n                  <p className="text-xs text-gray-500 mt-1">Une URL par ligne</p>\n                </div>';

const editImageAreaNew = '<div>\n                  <label className="block text-sm mb-2 text-gray-700">Images Supplémentaires</label>\n                  <div\n                    onDragEnter={(e) => handleDrag(e, \'additional\')}\n                    onDragLeave={(e) => handleDrag(e, \'additional\')}\n                    onDragOver={(e) => handleDrag(e, \'additional\')}\n                    onDrop={(e) => handleDrop(e, \'additional\')}\n                    className={`border-2 border-dashed rounded p-6 text-center cursor-pointer transition-colors ${\n                      dragActiveType === \'additional\' ? \'border-[#007B8A] bg-blue-50\' : \'border-gray-300\'\n                    } ${uploadingImage ? \'opacity-50 pointer-events-none\' : \'\'}`}\n                  >\n                    <input\n                      type="file"\n                      accept="image/*"\n                      multiple\n                      onChange={(e) => {\n                        if (e.target.files) {\n                          Array.from(e.target.files).forEach((file) => handleImageUpload(file, \'additional\'));\n                        }\n                      }}\n                      className="hidden"\n                      id="additional-upload-edit"\n                      disabled={uploadingImage}\n                    />\n                    <label htmlFor="additional-upload-edit" className="block cursor-pointer">\n                      <div className="mb-3">\n                        <div className="text-4xl text-gray-400 mb-3">🖼️</div>\n                      </div>\n                      {uploadingImage ? (\n                        <p className="text-sm text-gray-600">Téléchargement en cours...</p>\n                      ) : (\n                        <>\n                          <p className="text-sm font-medium text-gray-700">\n                            Glissez-déposez des images ici ou cliquez pour sélectionner\n                          </p>\n                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF jusqu\'à 5MB</p>\n                        </>\n                      )}\n                    </label>\n                  </div>\n                </div>';

content = content.replace(editImageArea, editImageAreaNew);

console.log('Fix 4 (Edit form drag-drop): ' + (content.includes('additional-upload-edit') ? 'SUCCESS' : 'FAILED'));

fs.writeFileSync(filePath, content, 'utf-8');
console.log('\nAll fixes completed!');
