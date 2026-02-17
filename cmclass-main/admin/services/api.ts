import { optimizeImageForUpload } from './uploadUtils';

const BACKEND_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const TOKEN_REFRESH_SKEW_MS = 2 * 60 * 1000;
export type UploadProgressCallback = (progress: number) => void;



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

export const setAuthToken = (token: string) => {
  if (localStorage.getItem('access_token') !== null) {
    localStorage.setItem('access_token', token);
    return;
  }
  if (sessionStorage.getItem('access_token') !== null) {
    sessionStorage.setItem('access_token', token);
    return;
  }
  if (localStorage.getItem('token') !== null) {
    localStorage.setItem('access_token', token);
    return;
  }
  if (sessionStorage.getItem('token') !== null) {
    sessionStorage.setItem('access_token', token);
    return;
  }

  // Default to session storage to avoid forcing "remember me"
  sessionStorage.setItem('access_token', token);
};

const decodeTokenPayload = (token: string): Record<string, unknown> | null => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const tokenExpiresSoon = (token: string) => {
  const payload = decodeTokenPayload(token);
  const exp = payload?.exp;
  if (typeof exp !== 'number') return false;
  const expiryMs = exp * 1000;
  return Date.now() >= expiryMs - TOKEN_REFRESH_SKEW_MS;
};

const notifyUnauthorized = () => {
  try {
    window.dispatchEvent(new Event('cmclass:unauthorized'));
  } catch (e) {
    // ignore
  }
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

let refreshPromise: Promise<string | null> | null = null;

export const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) return null;
      const json = await response.json();
      const token = json?.access_token;
      if (!token) return null;
      setAuthToken(token);
      return token as string;
    } catch (e) {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  try {
    return await refreshPromise;
  } catch (e) {
    return null;
  }
};

const getUsableToken = async () => {
  const token = getAuthToken() || undefined;
  if (!token) return undefined;
  if (!tokenExpiresSoon(token)) return token;
  const refreshed = await refreshAccessToken();
  return refreshed || token;
};

const toProgressPercent = (loaded: number, total: number) => {
  if (!Number.isFinite(loaded) || !Number.isFinite(total) || total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((loaded / total) * 100)));
};

const parseJsonSafe = (raw: string) => {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getResponseErrorMessage = (status: number, payload: any) => {
  const fromPayload = payload?.message || payload?.error;
  if (typeof fromPayload === 'string' && fromPayload.trim()) return fromPayload;
  return `Request failed (${status})`;
};

const xhrUpload = (
  url: string,
  formData: FormData,
  token?: string,
  onProgress?: UploadProgressCallback,
  method: string = 'POST',
): Promise<{ status: number; body: string }> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.withCredentials = true;
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (!onProgress) return;
      if (!event.lengthComputable) return;
      onProgress(toProgressPercent(event.loaded, event.total));
    };

    xhr.onload = () => {
      resolve({
        status: xhr.status,
        body: xhr.responseText || '',
      });
    };
    xhr.onerror = () => reject(new Error('Upload failed due to a network error'));
    xhr.onabort = () => reject(new Error('Upload was aborted'));

    try {
      xhr.send(formData);
    } catch (error) {
      reject(error);
    }
  });

export const uploadWithAuth = async <T = any>(
  url: string,
  formData: FormData,
  options: { onProgress?: UploadProgressCallback; method?: string } = {},
): Promise<T> => {
  const { onProgress, method = 'POST' } = options;
  onProgress?.(0);

  const token = await getUsableToken();
  let result = await xhrUpload(url, formData, token, onProgress, method);

  if (result.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      notifyUnauthorized();
    } else {
      result = await xhrUpload(url, formData, refreshed, onProgress, method);
    }
  }

  if (result.status === 401) {
    notifyUnauthorized();
  }

  const payload = parseJsonSafe(result.body);
  if (result.status < 200 || result.status >= 300) {
    throw new Error(getResponseErrorMessage(result.status, payload));
  }

  onProgress?.(100);
  return (payload ?? ({} as T)) as T;
};

export const fetchWithAuth = async (input: RequestInfo | URL, init: RequestInit = {}) => {
  const makeInit = (token?: string) => {
    const headers = new Headers(init.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    const hasContentType = headers.has('Content-Type');
    const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
    if (!hasContentType && !isFormData) {
      headers.set('Content-Type', 'application/json');
    }

    return {
      ...init,
      headers,
      credentials: init.credentials ?? 'include',
    };
  };

  const token = await getUsableToken();
  let response = await fetch(input, makeInit(token));
  if (response.status !== 401) return response;

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    notifyUnauthorized();
    return response;
  }

  response = await fetch(input, makeInit(refreshed));
  if (response.status === 401) {
    notifyUnauthorized();
  }
  return response;
};

// Products API
export const productsAPI = {
  list: async (search = '', page = 1, pageSize = 20) => {
    const url = `${BACKEND_URL}/admin/products?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`;
    const options = createFetchOptions('GET');
    
    const response = await fetchWithAuth(url, options);
    
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
    const response = await fetchWithAuth(`${BACKEND_URL}/admin/products/${id}`, createFetchOptions('GET'));
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

    const response = await fetchWithAuth(`${BACKEND_URL}/admin/products`, createFetchOptions('POST', cleanData));
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

    const response = await fetchWithAuth(`${BACKEND_URL}/admin/products/${id}`, createFetchOptions('PATCH', cleanData));
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
    const response = await fetchWithAuth(`${BACKEND_URL}/admin/products/${id}`, createFetchOptions('DELETE'));
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

  upload: async (file: File, onProgress?: UploadProgressCallback) => {
    const optimized = await optimizeImageForUpload(file);
    const formData = new FormData();
    formData.append('file', optimized);
    return uploadWithAuth<{ url: string }>(`${BACKEND_URL}/admin/products/upload`, formData, {
      onProgress,
    });
  },
};

// Brand admin API (get & update singleton)
export const brandAPI = {
  get: async () => {
    const response = await fetchWithAuth(`${BACKEND_URL}/admin/brand`, createFetchOptions('GET'));
    if (!response.ok) throw new Error('Failed to fetch brand');
    const json = await response.json();
    return json.data || json;
  },
  update: async (data: any) => {
    const response = await fetchWithAuth(`${BACKEND_URL}/admin/brand`, createFetchOptions('PATCH', data));
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
    const response = await fetchWithAuth(
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
    const response = await fetchWithAuth(`${BACKEND_URL}/admin/categories?pageSize=1000`, createFetchOptions('GET'));
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
    const response = await fetchWithAuth(`${BACKEND_URL}/admin/categories/${id}`, createFetchOptions('GET'));
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
    const response = await fetchWithAuth(`${BACKEND_URL}/admin/categories`, createFetchOptions('POST', data));
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  },

  update: async (id: number, data: any) => {
    const response = await fetchWithAuth(`${BACKEND_URL}/admin/categories/${id}`, createFetchOptions('PATCH', data));
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetchWithAuth(`${BACKEND_URL}/admin/categories/${id}`, createFetchOptions('DELETE'));
    if (!response.ok) throw new Error('Failed to delete category');
    return response.json();
  },
};

// Clients API
export const clientsAPI = {
  list: async (search = '') => {
    const response = await fetchWithAuth(
      `${BACKEND_URL}/admin/users/clients?search=${encodeURIComponent(search)}`,
      createFetchOptions('GET')
    );
    if (!response.ok) {
      let errorMsg = 'Failed to fetch clients';
      try {
        const error = await response.json();
        errorMsg = error.message || error.error || errorMsg;
      } catch (e) {
        // ignore
      }
      throw new Error(errorMsg);
    }
    return response.json();
  },
};
