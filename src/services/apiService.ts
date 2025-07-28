import axios from "axios";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
// import {API_BASE_URL, API_AUTH_HEADER} from '@env'

const API_BASE_URL = "https://dev.surf.mt/2.0/api";
const API_AUTH_HEADER =
  "Basic YWRtaW5Ac3VyZi5tdDpOOW9aMnlXMzc3cEg1VTExNTFiY3YyZlYyNDYySTk1NA==";

export interface Product {
  product_id: string;
  product: string;
  company_name: string;
  category: string;
  product_type: string;
  price: string;
  format_price: string;
  amount: number;
  image_url: string;
  status: string;
  full_description?: string;
}

export interface ProductsResponse {
  products: Product[];
  total_items: string;
}

export interface ProductDetailsResponse {
  product_data: Product;
  sections?: any[];
  images?: any[];
  category_listing?: any[];
  currency?: {
    symbol: string;
  };
}

export interface Order {
  order_id: string;
  order_number: string;
  timestamp: string;
  status: string;
  total: string;
  customer: {
    email: string;
    phone: string;
    name?: string;
  };
  products: Array<{
    product_id: string;
    product: string;
    amount: number;
    price: string;
    image_url: string;
  }>;
}

export interface OrdersResponse {
  orders: Order[];
  total_items: string;
}

export interface OrderDetailsResponse {
  order_data: Order;
}

export interface ProfileField {
  name: string;
  field_name: string;
  main_object: string;
  field_type: string;
  field_type_desc: string;
  field_disabled: boolean;
  value: string;
  required: boolean;
  variants: any;
}

export interface ProfileBlock {
  block_name: string;
  fields: ProfileField[];
}

export interface ProfileSection {
  name: string;
  section_type: string;
  selected: boolean;
  blocks: ProfileBlock[];
}

export interface ProfileResponse {
  sections: ProfileSection[];
  message: string;
  result: boolean;
}

export interface UserProfile {
  email: string;
  firstname: string;
  lastname: string;
  phone: string;
  password?: string;
}

export interface Language {
  lang_id: string;
  lang_code: string;
  name: string;
  country_code: string;
  direction: string;
}

export interface ApplicationConfig {
  is_signup_allowed: boolean;
  is_setting_enable: boolean;
  is_booking_enable: boolean;
  is_auction_enable: boolean;
  is_change_language_enable: boolean;
  is_change_storefront_enable: boolean;
  is_seller_promotion_enable: boolean;
  is_wallet_enable: boolean;
  is_blog_enable: boolean;
  is_dark_mode_enable: boolean;
  is_dark_mode: boolean;
  is_biomatric_enable: boolean;
  is_youtube_enable: boolean;
  is_product_filter_enable: boolean;
  is_order_filter_enable: boolean;
  is_chat_enable: boolean;
  is_order_enable: boolean;
  is_product_enable: boolean;
  is_dashboard: boolean;
  is_langauge_enable: boolean;
  is_forgot_password_enable: boolean;
  is_block_enable: boolean;
  is_chat_archive_enable: boolean;
  is_chat_attachment_enable: boolean;
  is_chat_delete_enable: boolean;
  is_company_profile_enable: boolean;
}

export interface PlatformFee {
  min: string;
  max: string;
  fee: string;
}

export interface AppUpdateConfig {
  is_app_update_required: boolean;
  android_version: string;
  ios_version: string;
  android_url: string;
  ios_url: string;
}

export interface Storefront {
  // Define storefront structure if needed
  id?: string;
  name?: string;
  // Add other properties as needed
}

export interface InitializerResponse {
  languages: Language[];
  application_config: ApplicationConfig;
  storefronts: Storefront[];
  privacy_policy_page: string;
  terms_of_use_page: string;
  whatsapp_url: string;
  platform_fee: PlatformFee[];
  app_update_config: AppUpdateConfig;
  default_language: string;
  message: string;
  result: boolean;
}

// Add new interface for filter options
export interface ProductFilters {
  status?: "A" | "P" | "D" | "all";
  lowStock?: boolean;
  lowStockThreshold?: number;
  page?: number;
  itemsPerPage?: number;
}

export const fetchInitializerApi = async () => {
  try {
    const response = await apiClient.get(`/api.php`, {
      params: {
        _d: "NtSeInitializerApi",
      },
    });
    return response.data as InitializerResponse;
  } catch (error) {
    console.error("Fetch Initializer API error:", error);
    throw error;
  }
};

// Create the API client with the correct base URL and authorization
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: API_AUTH_HEADER,
  },
});

export const loginApi = async (email: string, password: string) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      user_login: email,
      password: password,
    });
    return response.data;
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
};

export const fetchProfileApi = async (userId: string) => {
  try {
    const response = await apiClient.get(`/api.php`, {
      params: {
        _d: "NtSeProfilesApi",
        user_id: userId,
      },
    });
    return response.data as ProfileResponse;
  } catch (error) {
    console.error("Fetch Profile API error:", error);
    throw error;
  }
};

export const updateProfileApi = async (
  userId: string,
  profileData: Partial<UserProfile>
) => {
  try {
    const response = await apiClient.post(`/api.php`, {
      _d: "NtSeProfilesApi",
      user_id: userId,
      user_data: profileData,
    });
    return response.data;
  } catch (error) {
    console.error("Update Profile API error:", error);
    throw error;
  }
};

// Updated fetchProductsApi with filter support
export const fetchProductsApi = async (
  userId: string,
  filters: ProductFilters = {}
) => {
  try {
    const {
      status = "all",
      lowStock = false,
      lowStockThreshold = 2,
      page = 1,
      itemsPerPage = 10,
    } = filters;

    // Build the URL with query parameters
    let url = `${API_BASE_URL}/api.php?_d=NtSeProductsApi&user_id=${userId}`;

    // Add status filter if not 'all'
    if (status !== "all") {
      url += `&status=${status}`;
    }

    // Add low stock filter
    if (lowStock) {
      url += `&status=A&amount_to=${lowStockThreshold}`;
    }

    // Add pagination parameters
    url += `&page=${page}&items_per_page=${itemsPerPage}`;

    console.log("Fetching products from URL:", url);

    const response = await axios({
      method: "GET",
      url: url,
      headers: {
        "Content-Type": "application/json",
        Authorization: API_AUTH_HEADER,
      },
      data: {
        user_login: "csctest@gmail.com",
        password: "Zaid@123",
      },
    });

    return response.data as ProductsResponse;
  } catch (error) {
    console.error("Fetch Products API error:", error);
    throw error;
  }
};

// New function to get products by specific status
export const fetchProductsByStatusApi = async (
  userId: string,
  status: "A" | "P" | "D",
  page: number = 1,
  itemsPerPage: number = 10
) => {
  try {
    const url = `${API_BASE_URL}/api.php?_d=NtSeProductsApi&user_id=${userId}&status=${status}&page=${page}&items_per_page=${itemsPerPage}`;

    console.log(`Fetching ${status} products from URL:`, url);

    const response = await axios({
      method: "GET",
      url: url,
      headers: {
        "Content-Type": "application/json",
        Authorization: API_AUTH_HEADER,
      },
      data: {
        user_login: "csctest@gmail.com",
        password: "Zaid@123",
      },
    });

    return response.data as ProductsResponse;
  } catch (error) {
    console.error("Fetch Products By Status API error:", error);
    throw error;
  }
};

// New function to get low stock products
export const fetchLowStockProductsApi = async (
  userId: string,
  threshold: number = 2,
  page: number = 1,
  itemsPerPage: number = 10
) => {
  try {
    const url = `${API_BASE_URL}/api.php?_d=NtSeProductsApi&user_id=${userId}&status=A&amount_to=${threshold}&page=${page}&items_per_page=${itemsPerPage}`;

    console.log("Fetching low stock products from URL:", url);

    const response = await axios({
      method: "GET",
      url: url,
      headers: {
        "Content-Type": "application/json",
        Authorization: API_AUTH_HEADER,
      },
      data: {
        user_login: "csctest@gmail.com",
        password: "Zaid@123",
      },
    });

    return response.data as ProductsResponse;
  } catch (error) {
    console.error("Fetch Low Stock Products API error:", error);
    throw error;
  }
};

export const fetchProductDetailsApi = async (
  userId: string,
  productId: string
) => {
  try {
    // Using the correct URL format as shown in the curl example
    const response = await apiClient.get(`/api.php`, {
      params: {
        _d: "NtSeProductsApi",
        user_id: userId,
        product_id: productId,
        for_product_data: true,
      },
    });
    return response.data as ProductDetailsResponse;
  } catch (error) {
    console.error("Fetch Product Details API error:", error);
    throw error;
  }
};

// Update existing searchProductsApi to include filters
export const searchProductsApi = async (
  userId: string,
  searchTerm: string,
  filters: ProductFilters = {}
) => {
  try {
    const {
      status = "all",
      lowStock = false,
      lowStockThreshold = 2,
      page = 1,
      itemsPerPage = 10,
    } = filters;

    // Build the URL with query parameters
    let url = `${API_BASE_URL}/api.php?_d=NtSeProductsApi&user_id=${userId}&search=${encodeURIComponent(
      searchTerm
    )}`;

    // Add status filter if not 'all'
    if (status !== "all") {
      url += `&status=${status}`;
    }

    // Add low stock filter
    if (lowStock) {
      url += `&status=A&amount_to=${lowStockThreshold}`;
    }

    // Add pagination parameters
    url += `&page=${page}&items_per_page=${itemsPerPage}`;

    console.log("Searching products from URL:", url);

    const response = await axios({
      method: "GET",
      url: url,
      headers: {
        "Content-Type": "application/json",
        Authorization: API_AUTH_HEADER,
      },
      data: {
        user_login: "csctest@gmail.com",
        password: "Zaid@123",
      },
    });

    return response.data as ProductsResponse;
  } catch (error) {
    console.error("Search Products API error:", error);
    throw error;
  }
};

// New Orders API Functions
export const fetchOrdersApi = async (
  userId: string,
  page: number = 1,
  itemsPerPage: number = 10,
  status?: string
) => {
  try {
    const params: any = {
      _d: "NtSeOrdersApi",
      user_id: userId,
      page,
      items_per_page: itemsPerPage,
    };

    if (status && status !== "all") {
      params.status = status;
    }

    const response = await apiClient.get(`/api.php`, { params });
    return response.data as OrdersResponse;
  } catch (error) {
    console.error("Fetch Orders API error:", error);
    throw error;
  }
};

export const fetchOrderDetailsApi = async (userId: string, orderId: string) => {
  try {
    const response = await apiClient.get(`/api.php`, {
      params: {
        _d: "NtSeOrdersApi",
        user_id: userId,
        order_id: orderId,
        for_order_data: true,
      },
    });

    if (response.data && response.data.order_info) {
      const orderInfo = response.data.order_info;

      const products = orderInfo.products
        ? orderInfo.products.map((product: any) => ({
            product_id: product.product_id,
            product: product.product,
            amount: parseInt(product.amount || "1"),
            price: product.price_format || `€${product.price}`,
            image_url: product.image_url || "",
          }))
        : [];

      const orderData = {
        order_id: orderInfo.order_id,
        order_number: orderInfo.order_id,
        timestamp: orderInfo.timestamp || orderInfo.updated_at,
        status: orderInfo.status,
        total: orderInfo.total ? `€${orderInfo.total}` : "€0.00",
        firstname: orderInfo.firstname,
        lastname: orderInfo.lastname,
        email: orderInfo.email,
        phone: orderInfo.phone,
        customer: {
          email: orderInfo.email,
          phone: orderInfo.phone,
          name: `${orderInfo.firstname || ""} ${
            orderInfo.lastname || ""
          }`.trim(),
        },
        products: products,
        shipping_cost: orderInfo.shipping_cost || "0.00",
        subtotal: orderInfo.subtotal || orderInfo.total || "0.00",
      };

      return {
        order_data: orderData,
        result: response.data.result,
        message: response.data.message,
      } as OrderDetailsResponse;
    }

    throw new Error("Response missing order_info property");
  } catch (error) {
    console.error("Fetch Order Details API error:", error);
    throw error;
  }
};

export const searchOrdersApi = async (
  userId: string,
  searchTerm: string,
  page: number = 1
) => {
  try {
    const response = await apiClient.get(`/api.php`, {
      params: {
        _d: "NtSeOrdersApi",
        user_id: userId,
        search: searchTerm,
        page,
      },
    });
    return response.data as OrdersResponse;
  } catch (error) {
    console.error("Search Orders API error:", error);
    throw error;
  }
};

export default apiClient;

export const updateProductStatusApi = async (
  userId: string,
  productId: string,
  status: "A" | "P" | "D"
) => {
  try {
    const response = await apiClient.post(`/api.php`, {
      _d: "NtSeProductsApi",
      user_id: userId,
      product_id: productId,
      status: status,
      user_login: "csctest@gmail.com",
      password: "Zaid@123",
    });

    console.log("Update product status response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Update Product Status API error:", error);
    throw error;
  }
};

// Product Toggle Status Helper
export const toggleProductStatusApi = async (
  userId: string,
  productId: string,
  isActive: boolean
) => {
  const status = isActive ? "A" : "D"; // A = Active, D = Disabled/Hidden
  return await updateProductStatusApi(userId, productId, status);
};
