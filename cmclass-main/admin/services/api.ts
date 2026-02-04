const BACKEND_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';



export const getAuthToken = (): string | null => {
  // Check localStorage first
  let token = localStorage.getItem('access_token');
  if (token) {
    
    return token;
  }
  
  // Check sessionStorage
  token = sessionStorage.getItem('access_token');
  if (token) {
    
    return token;
  }
  
  // Fallback to old 'token' key for backwards compatibility
  token = localStorage.getItem('token');
  if (token) {
    
    return token;
  }
  
  
  return null;
};

export const apiHeaders = (contentType = 'application/json') => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': contentType,
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
  
  return headers;
};

// Helper function to create fetch options with auth
export const createFetchOptions = (method: string = 'GET', body?: any, contentType = 'application/json') => {
  const options: any = {
    method,
    headers: apiHeaders(contentType),
    credentials: 'include',
  };
  
  if (body) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  
  return options;
};

// Products API
export const productsAPI = {
  list: async (search = '', page = 1, pageSize = 20) => {
    const url = `${BACKEND_URL}/admin/products?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`;
    const options = createFetchOptions('GET');
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      let errorMsg = 'Failed to fetch products';
      try {
        const error = await response.json();
        errorMsg = error.message || error.error || errorMsg;
      } catch (e) {
        // Ignore JSON parse errors
      }
      throw new Error(errorMsg);
    }
    return response.json();
  },

  get: async (id: number) => {
    const response = await fetch(`${BACKEND_URL}/admin/products/${id}`, 
      createFetchOptions('GET')
    );
    if (!response.ok) {
      let errorMsg = 'Failed to fetch product';
      try {
        const error = await response.json();
        errorMsg = error.message || error.error || errorMsg;
      } catch (e) {
        // Ignore JSON parse errors
      }
      throw new Error(errorMsg);
    }
    const json = await response.json();
    return json.data || json;
  },

  create: async (data: any) => {
    // Clean up the data before sending
    const cleanData = {
      name: data.name?.trim(),
      description: data.description?.trim() || undefined,
      productImage: data.productImage?.trim() || undefined,
      label: data.label?.trim() || undefined,
      longDescription: data.longDescription?.trim() || undefined,
      mannequinImage: data.mannequinImage?.trim() || '',
      colors: data.colors || [],
      sizes: data.sizes && data.sizes.length > 0 ? data.sizes : [],
      priceCents: data.priceCents ? Number(data.priceCents) : 0,
      stock: data.stock ? Number(data.stock) : 0,
      inStock: data.inStock ?? true,
      categoryId: Number(data.categoryId),
      slug: data.slug?.trim(),
      images: data.images || [],
    };

    console.log('📦 Creating product with data:', cleanData);

    const response = await fetch(`${BACKEND_URL}/admin/products`,
      createFetchOptions('POST', cleanData)
    );
    if (!response.ok) {
      let errorMsg = 'Failed to create product';
      try {
        const error = await response.json();
        errorMsg = error.message || error.error || errorMsg;
      } catch (e) {
        // JSON parse error, use default message
      }
      throw new Error(errorMsg);
    }
    const json = await response.json();
    return json.data || json;
  },

  update: async (id: number, data: any) => {
    // Clean up the data before sending
    const cleanData: any = {};
    
    if (data.name !== undefined) cleanData.name = data.name?.trim();
    if (data.description !== undefined) cleanData.description = data.description?.trim() || undefined;
    if (data.productImage !== undefined) cleanData.productImage = data.productImage?.trim() || undefined;
    if (data.label !== undefined) cleanData.label = data.label?.trim() || undefined;
    if (data.longDescription !== undefined) cleanData.longDescription = data.longDescription?.trim() || undefined;
    if (data.mannequinImage !== undefined) cleanData.mannequinImage = data.mannequinImage?.trim() || '';
    if (data.colors !== undefined) cleanData.colors = data.colors || [];
    if (data.sizes !== undefined) cleanData.sizes = (data.sizes && data.sizes.length > 0) ? data.sizes : [];
    if (data.priceCents !== undefined) cleanData.priceCents = Number(data.priceCents);
    if (data.stock !== undefined) cleanData.stock = Number(data.stock);
    if (data.inStock !== undefined) cleanData.inStock = data.inStock;
    if (data.categoryId !== undefined) cleanData.categoryId = Number(data.categoryId);
    if (data.slug !== undefined) cleanData.slug = data.slug?.trim();
    if (data.images !== undefined) cleanData.images = data.images || [];

    console.log(`📝 Updating product ${id} with data:`, cleanData);

    const response = await fetch(`${BACKEND_URL}/admin/products/${id}`,
      createFetchOptions('PATCH', cleanData)
    );
    if (!response.ok) {
      let errorMsg = 'Failed to update product';
      try {
        const error = await response.json();
        errorMsg = error.message || error.error || errorMsg;
      } catch (e) {
        // JSON parse error, use default message
      }
      throw new Error(errorMsg);
    }
    const json = await response.json();
    return json.data || json;
  },

  delete: async (id: number) => {
    const response = await fetch(`${BACKEND_URL}/admin/products/${id}`,
      createFetchOptions('DELETE')
    );
    if (!response.ok) {
      let errorMsg = 'Failed to delete product';
      try {
        const error = await response.json();
        errorMsg = error.message || error.error || errorMsg;
      } catch (e) {
        // Ignore JSON parse errors
      }
      throw new Error(errorMsg);
    }
    return response.json();
  },

  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = getAuthToken();
    const response = await fetch(`${BACKEND_URL}/admin/products/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      credentials: 'include',
      body: formData,
    });
    if (!response.ok) {
      let errorMsg = 'Failed to upload product image';
      try {
        const error = await response.json();
        errorMsg = error.message || error.error || errorMsg;
      } catch (e) {
        // Ignore JSON parse errors
      }
      throw new Error(errorMsg);
    }
    return response.json();
  },
};

// Brand admin API (get & update singleton)
export const brandAPI = {
  get: async () => {
    const response = await fetch(`${BACKEND_URL}/admin/brand`, createFetchOptions('GET'));
    if (!response.ok) throw new Error('Failed to fetch brand');
    const json = await response.json();
    return json.data || json;
  },
  update: async (data: any) => {
    const response = await fetch(`${BACKEND_URL}/admin/brand`, createFetchOptions('PATCH', data));
    if (!response.ok) {
      let errorMsg = 'Failed to update brand';
      try { const error = await response.json(); errorMsg = error.message || error.error || errorMsg; } catch (e) {}
      throw new Error(errorMsg);
    }
    const json = await response.json();
    return json.data || json;
  }
};

// Categories API
export const categoriesAPI = {
  list: async (search = '', page = 1, pageSize = 20, includeInactive = false) => {
    const response = await fetch(
      `${BACKEND_URL}/admin/categories?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}&includeInactive=${includeInactive}`,
      createFetchOptions('GET')
    );
    if (!response.ok) {
      let errorMsg = 'Failed to fetch categories';
      try {
        const error = await response.json();
        errorMsg = error.message || error.error || errorMsg;
      } catch (e) {
        // Ignore JSON parse errors
      }
      throw new Error(errorMsg);
    }
    return response.json();
  },

  getAll: async () => {
    const response = await fetch(`${BACKEND_URL}/admin/categories?pageSize=1000`,
      createFetchOptions('GET')
    );
    if (!response.ok) {
      let errorMsg = 'Failed to fetch categories';
      try {
        const error = await response.json();
        errorMsg = error.message || error.error || errorMsg;
      } catch (e) {
        // Ignore JSON parse errors
      }
      throw new Error(errorMsg);
    }
    return response.json();
  },

  get: async (id: number) => {
    const response = await fetch(`${BACKEND_URL}/admin/categories/${id}`,
      createFetchOptions('GET')
    );
    if (!response.ok) {
      let errorMsg = 'Failed to fetch category';
      try {
        const error = await response.json();
        errorMsg = error.message || error.error || errorMsg;
      } catch (e) {
        // Ignore JSON parse errors
      }
      throw new Error(errorMsg);
    }
    return response.json();
  },

  create: async (data: any) => {
    const response = await fetch(`${BACKEND_URL}/admin/categories`,
      createFetchOptions('POST', data)
    );
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  },

  update: async (id: number, data: any) => {
    const response = await fetch(`${BACKEND_URL}/admin/categories/${id}`,
      createFetchOptions('PATCH', data)
    );
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetch(`${BACKEND_URL}/admin/categories/${id}`,
      createFetchOptions('DELETE')
    );
    if (!response.ok) throw new Error('Failed to delete category');
    return response.json();
  },
};
