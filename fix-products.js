const fs = require('fs');

const filePath = 'cmclass-main/admin/components/pages/Products.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Fix 1: Update color display to show name + hex (all occurrences)
content = content.replace(
  /<span className="text-sm font-medium">\{color\.hex\}<\/span>/g,
  '<div><span className="text-sm font-medium block">{color.name}</span><span className="text-xs text-gray-500">{color.hex}</span></div>'
);

// Fix 2: Change grid from 3 to 4 columns and add color name field for 'Ajouter une Couleur'
const oldColorGrid = '<div className="grid grid-cols-3 gap-2">\n                      <div>\n                        <label className="block text-xs text-gray-600 mb-1">Code Hex</label>';

const newColorGrid = '<div className="grid grid-cols-4 gap-2">\n                      <div>\n                        <label className="block text-xs text-gray-600 mb-1">Désignation</label>\n                        <input\n                          type="text"\n                          value={newColorName}\n                          onChange={(e) => setNewColorName(e.target.value)}\n                          placeholder="ex: Noir"\n                          className="w-full px-2 py-1 text-xs border border-gray-200 rounded"\n                        />\n                      </div>\n                      <div>\n                        <label className="block text-xs text-gray-600 mb-1">Code Hex</label>';

// Replace both occurrences (create and edit forms)
content = content.split(oldColorGrid).join(newColorGrid);

// Fix 3: Update the color picker height
content = content.replace(
  /className="w-full h-10 rounded cursor-pointer"/g,
  'className="w-full h-9 rounded cursor-pointer"'
);

// Fix 4: Fix button validation to check color name first
const oldValidation = 'if (!newColorImageUrl.trim()) {\n                              setError(\'Veuillez entrer une URL d\\\'image\');';
const newValidation = 'if (!newColorName.trim()) {\n                              setError(\'Veuillez entrer une désignation de couleur\');\n                              return;\n                            }\n                            if (!newColorImageUrl.trim()) {\n                              setError(\'Veuillez entrer une URL d\\\'image\');';

content = content.replace(new RegExp(oldValidation, 'g'), newValidation);

// Fix 5: Reset color state properly after adding (only reset name/hex for new colors, not for adding images to existing)
const oldReset = 'setNewColorName(\'\');\n                            setNewColorImageUrl(\'\');';
const newReset = 'setNewColorName(\'\');\n                              setNewColorHex(\'#000000\');\n                            }\n                            setNewColorImageUrl(\'\');';

content = content.replace(oldReset, newReset);

// Fix 6: Update Images Supplémentaires textarea to drag-and-drop in EDIT FORM
const editTextarea = '<div>\n                  <label className="block text-sm mb-2 text-gray-700">Images Supplémentaires (URLs séparées par des virgules)</label>\n                  <textarea\n                    value={\'\'}\n                    onChange={() => {}}\n                    rows={3}\n                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"\n                    className="w-full px-4 py-3 border border-gray-200 rounded focus:outline-none focus:border-[#007B8A] transition-colors text-sm"\n                  />\n                  <p className="text-xs text-gray-500 mt-1">Une URL par ligne</p>\n                </div>';

const editDragDrop = '<div>\n                  <label className="block text-sm mb-2 text-gray-700">Images Supplémentaires</label>\n                  <div\n                    onDragEnter={(e) => handleDrag(e, \'additional\')}\n                    onDragLeave={(e) => handleDrag(e, \'additional\')}\n                    onDragOver={(e) => handleDrag(e, \'additional\')}\n                    onDrop={(e) => handleDrop(e, \'additional\')}\n                    className={`border-2 border-dashed rounded p-6 text-center cursor-pointer transition-colors ${\n                      dragActiveType === \'additional\' ? \'border-[#007B8A] bg-blue-50\' : \'border-gray-300\'\n                    } ${uploadingImage ? \'opacity-50 pointer-events-none\' : \'\'}`}\n                  >\n                    <input\n                      type="file"\n                      accept="image/*"\n                      multiple\n                      onChange={(e) => {\n                        if (e.target.files) {\n                          Array.from(e.target.files).forEach((file) => handleImageUpload(file, \'additional\'));\n                        }\n                      }}\n                      className="hidden"\n                      id="additional-upload-edit"\n                      disabled={uploadingImage}\n                    />\n                    <label htmlFor="additional-upload-edit" className="block cursor-pointer">\n                      <div className="mb-3">\n                        <div className="text-4xl text-gray-400 mb-3">🖼️</div>\n                      </div>\n                      {uploadingImage ? (\n                        <p className="text-sm text-gray-600">Téléchargement en cours...</p>\n                      ) : (\n                        <>\n                          <p className="text-sm font-medium text-gray-700">\n                            Glissez-déposez des images ici ou cliquez pour sélectionner\n                          </p>\n                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF jusqu\'à 5MB</p>\n                        </>\n                      )}\n                    </label>\n                  </div>\n                </div>';

content = content.replace(editTextarea, editDragDrop);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('All fixes applied successfully!');
