import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchProductsApi,
  fetchProductDetailsApi,
  fetchProductsByStatusApi,
  fetchLowStockProductsApi,
  Product,
  searchProductsApi,
  ProductFilters,
} from "../../services/apiService";

// Define the ProductDetail interface
export interface ProductDetail extends Product {
  full_description?: string;
  // Add any additional fields that might be in the product details response
}

interface ProductsState {
  products: Product[];
  productDetails: ProductDetail | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
  currentPage: number;
  currentFilter: string;
  filterCounts: {
    all: number;
    active: number;
    pending: number;
    disabled: number;
    lowStock: number;
  };
  searchTerm: string;
}

const initialState: ProductsState = {
  products: [],
  productDetails: null,
  loading: false,
  error: null,
  totalItems: 0,
  currentPage: 1,
  currentFilter: "all",
  filterCounts: {
    all: 0,
    active: 0,
    pending: 0,
    disabled: 0,
    lowStock: 0,
  },
  searchTerm: "",
};

// Enhanced fetchProducts with filters
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (
    {
      userId,
      filters,
    }: {
      userId: string;
      filters?: ProductFilters;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log("fetchProducts thunk called with:", { userId, filters });
      const response = await fetchProductsApi(userId, filters);
      return {
        products: response.products,
        totalItems: parseInt(response.total_items),
        page: filters?.page || 1,
        filter: filters?.status || "all",
      };
    } catch (error: any) {
      console.error("fetchProducts thunk error:", error);
      return rejectWithValue(error.message || "Failed to fetch products");
    }
  }
);

// New thunk for fetching products by status
export const fetchProductsByStatus = createAsyncThunk(
  "products/fetchProductsByStatus",
  async (
    {
      userId,
      status,
      page = 1,
    }: {
      userId: string;
      status: "A" | "P" | "D";
      page?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log("fetchProductsByStatus thunk called with:", {
        userId,
        status,
        page,
      });
      const response = await fetchProductsByStatusApi(userId, status, page);
      return {
        products: response.products,
        totalItems: parseInt(response.total_items),
        page,
        filter: status,
      };
    } catch (error: any) {
      console.error("fetchProductsByStatus thunk error:", error);
      return rejectWithValue(
        error.message || "Failed to fetch products by status"
      );
    }
  }
);

// New thunk for fetching low stock products
export const fetchLowStockProducts = createAsyncThunk(
  "products/fetchLowStockProducts",
  async (
    {
      userId,
      threshold = 2,
      page = 1,
    }: {
      userId: string;
      threshold?: number;
      page?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log("fetchLowStockProducts thunk called with:", {
        userId,
        threshold,
        page,
      });
      const response = await fetchLowStockProductsApi(userId, threshold, page);
      return {
        products: response.products,
        totalItems: parseInt(response.total_items),
        page,
        filter: "lowStock",
      };
    } catch (error: any) {
      console.error("fetchLowStockProducts thunk error:", error);
      return rejectWithValue(
        error.message || "Failed to fetch low stock products"
      );
    }
  }
);

// Enhanced search with filters
export const searchProducts = createAsyncThunk(
  "products/searchProducts",
  async (
    {
      userId,
      searchTerm,
      filters,
    }: {
      userId: string;
      searchTerm: string;
      filters?: ProductFilters;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log("searchProducts thunk called with:", {
        userId,
        searchTerm,
        filters,
      });
      const response = await searchProductsApi(userId, searchTerm, filters);
      return {
        products: response.products,
        totalItems: parseInt(response.total_items),
        page: filters?.page || 1,
        searchTerm,
        filter: filters?.status || "all",
      };
    } catch (error: any) {
      console.error("searchProducts thunk error:", error);
      return rejectWithValue(error.message || "Failed to search products");
    }
  }
);

// Thunk to fetch filter counts
export const fetchFilterCounts = createAsyncThunk(
  "products/fetchFilterCounts",
  async ({ userId }: { userId: string }, { rejectWithValue }) => {
    try {
      console.log("fetchFilterCounts thunk called with:", { userId });

      // Fetch counts for each filter in parallel
      const [
        allResponse,
        activeResponse,
        pendingResponse,
        disabledResponse,
        lowStockResponse,
      ] = await Promise.allSettled([
        fetchProductsApi(userId, { status: "all", page: 1, itemsPerPage: 1 }),
        fetchProductsByStatusApi(userId, "A", 1, 1),
        fetchProductsByStatusApi(userId, "P", 1, 1),
        fetchProductsByStatusApi(userId, "D", 1, 1),
        fetchLowStockProductsApi(userId, 2, 1, 1),
      ]);

      const getCounts = (response: PromiseSettledResult<any>) => {
        if (response.status === "fulfilled") {
          return parseInt(response.value.total_items) || 0;
        }
        return 0;
      };

      const counts = {
        all: getCounts(allResponse),
        active: getCounts(activeResponse),
        pending: getCounts(pendingResponse),
        disabled: getCounts(disabledResponse),
        lowStock: getCounts(lowStockResponse),
      };

      console.log("Filter counts fetched:", counts);
      return counts;
    } catch (error: any) {
      console.error("fetchFilterCounts thunk error:", error);
      return rejectWithValue(error.message || "Failed to fetch filter counts");
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  "products/fetchProductDetails",
  async (
    { userId, productId }: { userId: string; productId: string },
    { rejectWithValue }
  ) => {
    try {
      console.log("fetchProductDetails thunk called with:", {
        userId,
        productId,
      });
      const response = await fetchProductDetailsApi(userId, productId);
      return response;
    } catch (error: any) {
      console.error("fetchProductDetails thunk error:", error);
      return rejectWithValue(
        error.message || "Failed to fetch product details"
      );
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setCurrentFilter: (state, action) => {
      console.log("setCurrentFilter called with:", action.payload);
      state.currentFilter = action.payload;
      state.currentPage = 1; // Reset page when changing filter
    },
    setSearchTerm: (state, action) => {
      console.log("setSearchTerm called with:", action.payload);
      state.searchTerm = action.payload;
      state.currentPage = 1; // Reset page when searching
    },
    clearProducts: (state) => {
      console.log("clearProducts called");
      state.products = [];
      state.totalItems = 0;
      state.currentPage = 1;
    },
    resetProductsState: () => {
      console.log("resetProductsState called");
      return initialState;
    },
    updateProductStatus: (state, action) => {
      const { productId, status } = action.payload;
      const productIndex = state.products.findIndex(
        (p) => p.product_id === productId
      );
      if (productIndex !== -1) {
        state.products[productIndex].status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        console.log("fetchProducts.pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        console.log("fetchProducts.fulfilled with:", action.payload);
        state.loading = false;
        state.products = action.payload.products;
        state.totalItems = action.payload.totalItems;
        state.currentPage = action.payload.page;
        state.currentFilter = action.payload.filter;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        console.log("fetchProducts.rejected with:", action.payload);
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Products By Status
      .addCase(fetchProductsByStatus.pending, (state) => {
        console.log("fetchProductsByStatus.pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByStatus.fulfilled, (state, action) => {
        console.log("fetchProductsByStatus.fulfilled with:", action.payload);
        state.loading = false;
        state.products = action.payload.products;
        state.totalItems = action.payload.totalItems;
        state.currentPage = action.payload.page;
        state.currentFilter = action.payload.filter;
      })
      .addCase(fetchProductsByStatus.rejected, (state, action) => {
        console.log("fetchProductsByStatus.rejected with:", action.payload);
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Low Stock Products
      .addCase(fetchLowStockProducts.pending, (state) => {
        console.log("fetchLowStockProducts.pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLowStockProducts.fulfilled, (state, action) => {
        console.log("fetchLowStockProducts.fulfilled with:", action.payload);
        state.loading = false;
        state.products = action.payload.products;
        state.totalItems = action.payload.totalItems;
        state.currentPage = action.payload.page;
        state.currentFilter = action.payload.filter;
      })
      .addCase(fetchLowStockProducts.rejected, (state, action) => {
        console.log("fetchLowStockProducts.rejected with:", action.payload);
        state.loading = false;
        state.error = action.payload as string;
      })

      // Search Products
      .addCase(searchProducts.pending, (state) => {
        console.log("searchProducts.pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        console.log("searchProducts.fulfilled with:", action.payload);
        state.loading = false;
        state.products = action.payload.products;
        state.totalItems = action.payload.totalItems;
        state.currentPage = action.payload.page;
        state.searchTerm = action.payload.searchTerm;
        state.currentFilter = action.payload.filter;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        console.log("searchProducts.rejected with:", action.payload);
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Filter Counts
      .addCase(fetchFilterCounts.pending, (state) => {
        console.log("fetchFilterCounts.pending");
        // Don't set loading for filter counts as it's background operation
      })
      .addCase(fetchFilterCounts.fulfilled, (state, action) => {
        console.log("fetchFilterCounts.fulfilled with:", action.payload);
        state.filterCounts = action.payload;
      })
      .addCase(fetchFilterCounts.rejected, (state, action) => {
        console.log("fetchFilterCounts.rejected with:", action.payload);
        console.error("Failed to fetch filter counts:", action.payload);
      })

      // Fetch Product Details
      .addCase(fetchProductDetails.pending, (state) => {
        console.log("fetchProductDetails.pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        console.log("fetchProductDetails.fulfilled with:", action.payload);
        state.loading = false;
        state.productDetails = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        console.log("fetchProductDetails.rejected with:", action.payload);
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentFilter,
  setSearchTerm,
  clearProducts,
  resetProductsState,
  updateProductStatus,
} = productsSlice.actions;

export default productsSlice.reducer;
