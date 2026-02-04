const fs = require('fs');
const path = require('path');

const filePath = 'cmclass-main/admin/components/pages/Products.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// New image add section for each color
const newImageSection = `                        <div className="text-xs text-gray-600 mb-2">
                          {color.images.length} image(s)
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {color.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="relative group">
                              <img 
                                src={img} 
                                alt={\`Color \${color.hex} view \${imgIdx + 1}\`}
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
                              data-color-add-\${idx}
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
                                const input = document.querySelector(\`[data-color-add-\${idx}]\`) as HTMLInputElement;
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
                        </div>`;

// Pattern to find and replace (the old image display section)
const oldImageSection = `                        <div className="text-xs text-gray-600">
                          {color.images.length} image(s)
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {color.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="relative">
                              <img 
                                src={img} 
                                alt={\`Color \${color.hex} view \${imgIdx + 1}\`}
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
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>`;

// Replace all occurrences
const replacementCount = (content.match(/text-xs text-gray-600>\s*\{color\.images\.length\} image\(s\)/g) || []).length;
console.log('Found', replacementCount, 'color image sections');

if (replacementCount >= 2) {
  content = content.split(oldImageSection).join(newImageSection);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('✅ Enhanced color image management added to both CREATE and EDIT forms!');
} else {
  console.log('❌ Could not find expected number of occurrences');
}
