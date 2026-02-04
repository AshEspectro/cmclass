const fs = require('fs');
const path = require('path');

const filePath = 'cmclass-main/admin/components/pages/Products.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Fix 1: Add hex reset after setNewColorName in CREATE form (first occurrence)
const searchPattern1 = `setNewColorName('');
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
                  <label className="block text-sm mb-2 text-gray-700">Tailles Disponibles</label>`;

const replacePattern1 = `setNewColorName('');
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
                  <label className="block text-sm mb-2 text-gray-700">Tailles Disponibles</label>`;

// Replace only first occurrence (CREATE form)
if (content.includes(searchPattern1)) {
  content = content.replace(searchPattern1, replacePattern1);
  console.log('✅ CREATE form hex reset added');
} else {
  console.log('❌ CREATE form pattern not found');
}

// Fix 2: Add hex reset after setNewColorName in EDIT form (second occurrence)
// The EDIT form doesn't have "Tailles Disponibles", it has "Label" instead
const searchPattern2 = `setNewColorName('');
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
                    <label className="block text-sm mb-2 text-gray-700">Label</label>`;

const replacePattern2 = `setNewColorName('');
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
                    <label className="block text-sm mb-2 text-gray-700">Label</label>`;

if (content.includes(searchPattern2)) {
  content = content.replace(searchPattern2, replacePattern2);
  console.log('✅ EDIT form hex reset added');
} else {
  console.log('❌ EDIT form pattern not found');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ All hex resets applied successfully!');
