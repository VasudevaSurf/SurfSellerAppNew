// src/types/product.ts

export type ProductStatus = "A" | "P" | "D";
export type FilterType = "all" | "active" | "pending" | "disabled" | "lowStock";

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
  status: ProductStatus;
  full_description?: string;
}

export interface ProductFilters {
  status?: ProductStatus | "all";
  lowStock?: boolean;
  lowStockThreshold?: number;
  page?: number;
  itemsPerPage?: number;
}

export interface ProductsResponse {
  products: Product[];
  total_items: string;
  result: boolean;
  message?: string;
}

export interface FilterCounts {
  all: number;
  active: number;
  pending: number;
  disabled: number;
  lowStock: number;
}

export interface ProductsState {
  products: Product[];
  productDetails: Product | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
  currentPage: number;
  currentFilter: FilterType;
  filterCounts: FilterCounts;
  searchTerm: string;
}

export interface ProductFilterOption {
  id: FilterType;
  label: string;
  count?: number;
}

// API Request/Response types
export interface ProductStatusUpdateRequest {
  _d: string;
  user_id: string;
  product_id: string;
  status: ProductStatus;
  user_login: string;
  password: string;
}

export interface ProductStatusUpdateResponse {
  result: boolean;
  message: string;
}

// Hook return type
export interface UseProductFiltersReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  currentFilter: FilterType;
  filterCounts: FilterCounts;
  searchTerm: string;
  filterOptions: ProductFilterOption[];
  selectedFilter: ProductFilterOption;
  handleFilterSelect: (option: ProductFilterOption) => void;
  handleSearch: (text: string) => void;
  refreshProducts: () => Promise<void>;
  refreshFilterCounts: () => void;
  loadNextPage: (page: number) => void;
  fetchProductsForFilter: (
    filterId: string,
    search?: string,
    page?: number
  ) => void;
}
