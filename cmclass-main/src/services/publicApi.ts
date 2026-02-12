const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000';

type RequestOptions = {
  throwOnError?: boolean;
};

type HttpError = Error & { status?: number };

const createHttpError = (message: string, status?: number): HttpError => {
  const error = new Error(message) as HttpError;
  error.status = status;
  return error;
};

export const publicApi = {
  // Get all campaigns
  async getCampaigns() {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw createHttpError(`Failed to fetch campaigns: ${response.status}`, response.status);
      }

      const json = await response.json();
      return json.data || json;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }
  },

  // Get all categories (with hierarchy)
  async getCategories(options: RequestOptions = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw createHttpError(`Failed to fetch categories: ${response.status}`, response.status);
      }

      const json = await response.json();
      return json.data || json;
    } catch (error) {
      if (options.throwOnError) throw error;
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get all leaf categories (filtered for display)
  async getLeafCategories(options: RequestOptions = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw createHttpError(`Failed to fetch categories: ${response.status}`, response.status);
      }

      const json = await response.json();
      const categories = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.mainCategories)
          ? json.mainCategories
          : Array.isArray(json)
            ? json
            : [];

      // Extract leaf categories from the hierarchy
      const leaves: Record<string, unknown>[] = [];
      
      const extractLeaves = (cats: Record<string, unknown>[]) => {
        cats.forEach(cat => {
          const subcategories = cat.subcategories as Record<string, unknown>[] | undefined;
          if (subcategories && subcategories.length > 0) {
            subcategories.forEach((subcat: Record<string, unknown>) => {
              const children = subcat.children as Record<string, unknown>[] | undefined;
              if (children && children.length > 0) {
                leaves.push(...children);
              } else {
                leaves.push(subcat);
              }
            });
          } else {
            leaves.push(cat);
          }
        });
      };

      extractLeaves(categories);
      return leaves;
    } catch (error) {
      if (options.throwOnError) throw error;
      console.error('Error fetching leaf categories:', error);
      return [];
    }
  },

  // Get all products
  async getProducts(page = 1, pageSize = 100, search = '', options: RequestOptions = {}) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products?page=${page}&pageSize=${pageSize}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw createHttpError(`Failed to fetch products: ${response.status}`, response.status);
      }

      const json = await response.json();
      return json.data || json;
    } catch (error) {
      if (options.throwOnError) throw error;
      console.error('Error fetching products:', error);
      return { items: [], total: 0 };
    }
  },

  // Get products by category
  async getProductsByCategory(categoryId: number | string, options: RequestOptions = {}) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products?categoryId=${categoryId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw createHttpError(`Failed to fetch products: ${response.status}`, response.status);
      }

      const json = await response.json();
      return json.data || json;
    } catch (error) {
      if (options.throwOnError) throw error;
      console.error('Error fetching products:', error);
      return { items: [], total: 0 };
    }
  },

  // Get campaign catalog (products for a specific campaign)
  async getCampaignCatalog(campaignId: number | string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/campaigns/${campaignId}/catalog`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw createHttpError(`Failed to fetch campaign catalog: ${response.status}`, response.status);
      }

      const json = await response.json();
      return json.data || json;
    } catch (error) {
      console.error('Error fetching campaign catalog:', error);
      return [];
    }
  },

  // Get public services for homepage
  async getServices(options: RequestOptions = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw createHttpError(`Failed to fetch services: ${response.status}`, response.status);
      const json = await response.json();
      return json.data || [];
    } catch (error) {
      if (options.throwOnError) throw error;
      console.error('Error fetching services:', error);
      return [];
    }
  },
  // Get public brand (slogan/description)
  async getBrand(options: RequestOptions = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/brand`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw createHttpError(`Failed to fetch brand: ${response.status}`, response.status);
      const json = await response.json();
      return json || {};
    } catch (error) {
      if (options.throwOnError) throw error;
      console.error('Error fetching brand:', error);
      return {};
    }
  },
  // Get footer sections/links
  async getFooterSections() {
    try {
      const response = await fetch(`${API_BASE_URL}/footer`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw createHttpError(`Failed to fetch footer: ${response.status}`, response.status);
      const json = await response.json();
      return json.data || [];
    } catch (error) {
      console.error('Error fetching footer sections:', error);
      return [];
    }
  },
  // Get about page content
  async getAbout(options: RequestOptions = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/about`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw createHttpError(`Failed to fetch about content: ${response.status}`, response.status);
      }
      const json = await response.json();
      return json.data || json || {};
    } catch (error) {
      if (options.throwOnError) throw error;
      console.error('Error fetching about content:', error);
      return {};
    }
  },
  // Get single product by id
  async getProduct(id: number | string, options: RequestOptions = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw createHttpError(`Failed to fetch product: ${response.status}`, response.status);
      }
      const json = await response.json();
      return json.data || null;
    } catch (error) {
      if (options.throwOnError) throw error;
      console.error('Error fetching product:', error);
      return null;
    }
  },
  // Get single category by id
  async getCategory(id: number | string, options: RequestOptions = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw createHttpError(`Failed to fetch category: ${response.status}`, response.status);
      }
      const json = await response.json();
      return json.data || json || null;
    } catch (error) {
      if (options.throwOnError) throw error;
      console.error('Error fetching category:', error);
      return null;
    }
  },
};
