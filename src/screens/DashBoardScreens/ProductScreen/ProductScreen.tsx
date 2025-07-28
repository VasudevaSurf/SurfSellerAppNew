import QuestionMarkIcon from "../../../../assets/icons/QuestionMarkIcon";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import BellIcon from "../../../../assets/icons/BellIcon";
import PlusIcon from "../../../../assets/icons/PlusIcon";
import TrashIcon from "@/assets/icons/NewProductIcons/TrashIcon";
import CheckIcon from "../../../../assets/icons/CheckIcon";
import {
  AddModal,
  ButtonConfig,
} from "../../../components/MainComponents/AddModal/AddModal";
import { ProductInfo } from "../../../components/MainComponents/ProductInfo/ProductInfo";
import { SlidingBar } from "../../../components/MainComponents/SlidingBar/SlidingBar";
import {
  Button,
  ButtonSize,
  ButtonState,
  ButtonType,
  ButtonVariant,
} from "../../../components/UserComponents/Button";
import { Header } from "@/src/components/UserComponents/Header/Header";
import { SearchBox } from "../../../components/UserComponents/SearchBox/SearchBox";
import { Typography } from "../../../components/UserComponents/Typography/Typography";
import { TypographyVariant } from "../../../components/UserComponents/Typography/Typography.types";
import { ColorPalette } from "../../../config/colorPalette";
import { getScreenHeight, getScreenWidth } from "../../../helpers/screenSize";
import { navigate } from "../../../navigation/utils/navigationRef";
import {
  fetchProducts,
  fetchProductsByStatus,
  fetchLowStockProducts,
  searchProducts,
  fetchFilterCounts,
  setCurrentFilter,
  setSearchTerm,
  updateProductStatus,
  deleteMultipleProducts,
  clearDeleteError,
} from "../../../redux/slices/productsSlice";
import { AppDispatch, RootState } from "../../../redux/store";
import { styles } from "./ProductScreen.styles";

const ProductScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchText, setSearchText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // NEW: Multi-select state
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  const userId = useSelector(
    (state: RootState) => state.auth.userData?.user_id
  );

  const {
    products = [],
    loading,
    error,
    totalItems,
    currentFilter,
    filterCounts,
    searchTerm,
    deletingProducts,
    deleteError,
  } = useSelector((state: RootState) => state.products);

  console.log("ProductScreen - User ID:", userId);
  console.log("ProductScreen - Current state:", {
    productsCount: products.length,
    loading,
    error,
    totalItems,
    currentFilter,
    filterCounts,
    searchTerm,
    deletingProducts,
    deleteError,
  });

  // Create filter options with dynamic counts
  const filterOptions = [
    {
      id: "all",
      label: `All${filterCounts.all > 0 ? ` ${filterCounts.all}` : ""}`,
    },
    {
      id: "active",
      label: `Active${
        filterCounts.active > 0 ? ` ${filterCounts.active}` : ""
      }`,
    },
    {
      id: "lowStock",
      label: `Low Stock${
        filterCounts.lowStock > 0 ? ` ${filterCounts.lowStock}` : ""
      }`,
    },
    {
      id: "pending",
      label: `Pending${
        filterCounts.pending > 0 ? ` ${filterCounts.pending}` : ""
      }`,
    },
    {
      id: "disabled",
      label: `Hidden${
        filterCounts.disabled > 0 ? ` ${filterCounts.disabled}` : ""
      }`,
    },
  ];

  const [selectedFilter, setSelectedFilter] = useState(
    filterOptions.find((option) => option.id === currentFilter) ||
      filterOptions[0]
  );

  // Update selected filter when currentFilter changes
  useEffect(() => {
    const newSelectedFilter = filterOptions.find(
      (option) => option.id === currentFilter
    );
    if (newSelectedFilter) {
      setSelectedFilter(newSelectedFilter);
    }
  }, [currentFilter, filterCounts]);

  // NEW: Clear selected products when switching filters or search
  useEffect(() => {
    if (isMultiSelectMode) {
      setSelectedProducts([]);
    }
  }, [currentFilter, searchTerm]);

  // NEW: Clear delete error when component mounts
  useEffect(() => {
    if (deleteError) {
      dispatch(clearDeleteError());
    }
  }, [dispatch, deleteError]);

  // Function to fetch products based on current filter
  const fetchProductsForFilter = (filterId: string, search: string = "") => {
    if (!userId) return;

    console.log(
      `Fetching products for filter: ${filterId}, search: "${search}"`
    );

    if (search.trim()) {
      // If there's a search term, use search API with filter
      const statusMap: { [key: string]: "A" | "P" | "D" | "all" } = {
        all: "all",
        active: "A",
        pending: "P",
        disabled: "D",
        lowStock: "A", // Low stock is subset of active
      };

      dispatch(
        searchProducts({
          userId,
          searchTerm: search,
          filters: {
            status: statusMap[filterId] || "all",
            lowStock: filterId === "lowStock",
            page: 1,
          },
        })
      );
    } else {
      // No search term, use appropriate filter API
      switch (filterId) {
        case "active":
          dispatch(fetchProductsByStatus({ userId, status: "A" }));
          break;
        case "pending":
          dispatch(fetchProductsByStatus({ userId, status: "P" }));
          break;
        case "disabled":
          dispatch(fetchProductsByStatus({ userId, status: "D" }));
          break;
        case "lowStock":
          dispatch(fetchLowStockProducts({ userId, threshold: 2 }));
          break;
        case "all":
        default:
          dispatch(fetchProducts({ userId, filters: { status: "all" } }));
          break;
      }
    }
  };

  // Fetch filter counts on component mount
  useEffect(() => {
    if (userId) {
      console.log("Fetching filter counts for userId:", userId);
      dispatch(fetchFilterCounts({ userId }));
    }
  }, [dispatch, userId]);

  // Initial load
  useEffect(() => {
    if (userId && products.length === 0 && !loading && !error) {
      console.log("Initial products load");
      fetchProductsForFilter("all");
    }
  }, [userId]);

  // Handle filter selection
  const handleFilterSelect = (option: any) => {
    console.log("Filter selected:", option);
    setSelectedFilter(option);
    dispatch(setCurrentFilter(option.id));
    fetchProductsForFilter(option.id, searchText);

    // Exit multi-select mode when filter changes
    if (isMultiSelectMode) {
      setIsMultiSelectMode(false);
      setSelectedProducts([]);
    }
  };

  // Handle search with debouncing
  const handleSearch = (text: string) => {
    console.log("Search text changed:", text);
    setSearchText(text);
    dispatch(setSearchTerm(text));

    // Simple debouncing
    setTimeout(() => {
      fetchProductsForFilter(selectedFilter.id, text);
    }, 300);
  };

  // Handle refresh
  const handleRefresh = async () => {
    console.log("Refresh triggered");
    setIsRefreshing(true);
    try {
      if (userId) {
        // Refresh both products and filter counts
        await Promise.all([
          dispatch(fetchFilterCounts({ userId })),
          fetchProductsForFilter(selectedFilter.id, searchText),
        ]);
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddManually = () => {
    console.log("Add manually pressed");
    setShowAddModal(false);
    setTimeout(() => {
      navigate("Dashboard", {
        screen: "Product",
        params: { screen: "AddProduct" },
      });
    }, 300);
  };

  const handleUploadCsv = () => {
    console.log("Upload CSV pressed");
    setShowAddModal(false);
  };

  // NEW: Multi-select functions
  const activateMultiSelectMode = (productId: string) => {
    console.log("Activating multi-select mode with product:", productId);
    setIsMultiSelectMode(true);
    setSelectedProducts([productId]);

    // Optional: Add haptic feedback
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const exitMultiSelectMode = () => {
    console.log("Exiting multi-select mode");
    setIsMultiSelectMode(false);
    setSelectedProducts([]);
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) => {
      const isSelected = prev.includes(productId);
      const newSelection = isSelected
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];

      console.log("Product selection toggled:", {
        productId,
        isSelected,
        newSelection,
      });

      // If no products selected, exit multi-select mode
      if (newSelection.length === 0) {
        setIsMultiSelectMode(false);
      }

      return newSelection;
    });
  };

  const selectAllProducts = () => {
    const allProductIds = products.map((p) => p.product_id);
    setSelectedProducts(allProductIds);
    console.log("All products selected:", allProductIds);
  };

  const deselectAllProducts = () => {
    setSelectedProducts([]);
    console.log("All products deselected");
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) {
      Alert.alert("No Selection", "Please select products to delete.");
      return;
    }

    setShowDeleteConfirmModal(true);
  };

  const confirmBulkDelete = async () => {
    setShowDeleteConfirmModal(false);

    if (!userId) {
      Alert.alert("Error", "Unable to delete products. Please try again.");
      return;
    }

    if (selectedProducts.length === 0) {
      return;
    }

    try {
      console.log("Deleting multiple products:", selectedProducts);

      const result = await dispatch(
        deleteMultipleProducts({
          userId,
          productIds: selectedProducts,
        })
      ).unwrap();

      console.log("Products deleted successfully:", result);

      // Reset multi-select state
      setSelectedProducts([]);
      setIsMultiSelectMode(false);

      // Refresh filter counts after deletion
      setTimeout(() => {
        if (userId) {
          dispatch(fetchFilterCounts({ userId }));
        }
      }, 500);

      // Show success message
      Alert.alert(
        "Success",
        `${selectedProducts.length} product${
          selectedProducts.length > 1 ? "s" : ""
        } deleted successfully`,
        [{ text: "OK", style: "default" }]
      );
    } catch (error: any) {
      console.error("Failed to delete products:", error);

      Alert.alert(
        "Delete Failed",
        error.message || "Failed to delete products. Please try again.",
        [
          { text: "OK", style: "default" },
          {
            text: "Retry",
            onPress: () => confirmBulkDelete(),
            style: "default",
          },
        ]
      );
    }
  };

  const buttons: ButtonConfig[] = [
    {
      text: "Upload CSV file",
      onPress: () => handleUploadCsv(),
      variant: ButtonVariant.PRIMARY,
      state: ButtonState.DEFAULT,
      size: ButtonSize.MEDIUM,
      textVariant: TypographyVariant.LMEDIUM_EXTRASEMIBOLD,
    },
    {
      text: "Add product Manually",
      onPress: () => handleAddManually(),
      variant: ButtonVariant.PRIMARY,
      state: ButtonState.DEFAULT,
      type: ButtonType.OUTLINED,
      size: ButtonSize.MEDIUM,
      customStyles: { borderWidth: 1 },
      textVariant: TypographyVariant.LMEDIUM_EXTRASEMIBOLD,
    },
  ];

  // NEW: Delete confirmation modal buttons
  const deleteConfirmButtons: ButtonConfig[] = [
    {
      text: `Delete ${selectedProducts.length} Product${
        selectedProducts.length > 1 ? "s" : ""
      }`,
      onPress: confirmBulkDelete,
      variant: ButtonVariant.PRIMARY,
      state: ButtonState.DEFAULT,
      size: ButtonSize.MEDIUM,
      customStyles: { backgroundColor: ColorPalette.RED_100 },
      textVariant: TypographyVariant.LMEDIUM_EXTRASEMIBOLD,
    },
    {
      text: "Cancel",
      onPress: () => setShowDeleteConfirmModal(false),
      variant: ButtonVariant.PRIMARY,
      state: ButtonState.DEFAULT,
      type: ButtonType.OUTLINED,
      size: ButtonSize.MEDIUM,
      customStyles: { borderWidth: 1 },
      textVariant: TypographyVariant.LMEDIUM_EXTRASEMIBOLD,
    },
  ];

  const searchBarHeight = getScreenHeight(6);

  // Enhanced toggle status function
  const handleToggleProductStatus = async (
    productId: string,
    isActive: boolean
  ) => {
    if (!userId) {
      console.error("No userId available for status update");
      Alert.alert(
        "Error",
        "Unable to update product status. Please try again."
      );
      return;
    }

    console.log("Toggling product status:", { productId, isActive, userId });

    // Prevent multiple simultaneous updates
    if (updatingStatus === productId) {
      console.log("Status update already in progress for product:", productId);
      return;
    }

    setUpdatingStatus(productId);

    try {
      // Update local state immediately for better UX
      dispatch(
        updateProductStatus({
          productId,
          status: isActive ? "A" : "D",
        })
      );

      // TODO: Add actual API call here
      // await toggleProductStatusApi(userId, productId, isActive);

      console.log(
        `Product ${productId} status successfully updated to ${
          isActive ? "Active" : "Hidden"
        }`
      );

      // Refresh filter counts after status change
      setTimeout(() => {
        if (userId) {
          dispatch(fetchFilterCounts({ userId }));
        }
      }, 500);
    } catch (error) {
      console.error("Failed to update product status:", error);

      // Revert local state change on error
      dispatch(
        updateProductStatus({
          productId,
          status: isActive ? "D" : "A", // Revert to previous state
        })
      );

      Alert.alert(
        "Update Failed",
        "Failed to update product status. Please try again.",
        [
          {
            text: "OK",
            style: "default",
          },
          {
            text: "Retry",
            onPress: () => handleToggleProductStatus(productId, isActive),
            style: "default",
          },
        ]
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getEmptyStateMessage = () => {
    if (searchText.trim()) {
      return `No products found for "${searchText}"`;
    }

    switch (selectedFilter.id) {
      case "active":
        return "No active products found";
      case "pending":
        return "No pending products found";
      case "disabled":
        return "No hidden products found";
      case "lowStock":
        return "No low stock products found";
      case "all":
      default:
        return "No products found";
    }
  };

  const getEmptyStateAction = () => {
    return selectedFilter.id === "all" && !searchText.trim();
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <Header
        name={
          isMultiSelectMode ? `${selectedProducts.length} Selected` : "Products"
        }
        variant={TypographyVariant.H6_SMALL_SEMIBOLD}
        textColor={ColorPalette.AgreeTerms}
        leftIcon={
          isMultiSelectMode ? (
            <TouchableOpacity onPress={exitMultiSelectMode}>
              <Typography
                text="Cancel"
                variant={TypographyVariant.LMEDIUM_MEDIUM}
                customTextStyles={{ color: ColorPalette.PURPLE_300 }}
              />
            </TouchableOpacity>
          ) : undefined
        }
        rightIcons={[
          {
            icon: BellIcon,
            onPress: () => console.log("Bell icon pressed"),
            size: 20,
            color: ColorPalette.IconColor,
            strokeWidth: 1.5,
          },
          {
            icon: QuestionMarkIcon,
            onPress: () => console.log("Info icon pressed"),
            size: 24,
            color: ColorPalette.IconColor,
            strokeWidth: 1.5,
          },
        ]}
      />

      <View style={styles.searchContainer}>
        <SearchBox
          value={searchText}
          onChangeText={handleSearch}
          placeholder="Search products..."
          customContainerStyle={{
            flex: 1,
            height: searchBarHeight,
          }}
        />

        {isMultiSelectMode ? (
          <View style={{ flexDirection: "row", gap: getScreenWidth(2) }}>
            {selectedProducts.length > 0 && (
              <Button
                text={`Delete (${selectedProducts.length})`}
                type={ButtonType.PRIMARY}
                variant={ButtonVariant.PRIMARY}
                size={ButtonSize.MEDIUM}
                state={ButtonState.DEFAULT}
                customStyles={{
                  height: searchBarHeight,
                  paddingHorizontal: getScreenWidth(3),
                  backgroundColor: ColorPalette.RED_100,
                }}
                IconComponent={() => (
                  <TrashIcon
                    color={ColorPalette.White}
                    strokeWidth={2}
                    size={20}
                  />
                )}
                iconPosition="left"
                onPress={handleBulkDelete}
                textVariant={TypographyVariant.PMEDIUM_SEMIBOLD}
              />
            )}

            <Button
              text={
                selectedProducts.length === products.length
                  ? "Deselect All"
                  : "Select All"
              }
              type={ButtonType.OUTLINED}
              variant={ButtonVariant.PRIMARY}
              size={ButtonSize.MEDIUM}
              state={ButtonState.DEFAULT}
              customStyles={{
                height: searchBarHeight,
                paddingHorizontal: getScreenWidth(3),
                borderColor: ColorPalette.PURPLE_300,
              }}
              onPress={
                selectedProducts.length === products.length
                  ? deselectAllProducts
                  : selectAllProducts
              }
              textVariant={TypographyVariant.PMEDIUM_SEMIBOLD}
            />
          </View>
        ) : (
          <Button
            text="Add"
            type={ButtonType.PRIMARY}
            variant={ButtonVariant.PRIMARY}
            size={ButtonSize.MEDIUM}
            state={ButtonState.DEFAULT}
            customStyles={{
              height: searchBarHeight,
              paddingHorizontal: getScreenWidth(3),
            }}
            IconComponent={() => (
              <PlusIcon color={ColorPalette.White} strokeWidth={2} size={24} />
            )}
            iconPosition="right"
            withShadow
            onPress={() => setShowAddModal(true)}
            textVariant={TypographyVariant.PMEDIUM_SEMIBOLD}
          />
        )}
      </View>

      <View style={styles.slidingBarsContainer}>
        <SlidingBar
          options={filterOptions}
          selectedOption={selectedFilter}
          onOptionSelect={handleFilterSelect}
        />
      </View>

      {loading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ColorPalette.PURPLE_300} />
          <Typography
            text="Loading products..."
            variant={TypographyVariant.LMEDIUM_REGULAR}
            customTextStyles={{
              color: ColorPalette.GREY_TEXT_300,
              marginTop: getScreenHeight(1),
            }}
          />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Typography
            text={error}
            variant={TypographyVariant.LMEDIUM_REGULAR}
            customTextStyles={{
              color: ColorPalette.RED_100,
              textAlign: "center",
              marginBottom: getScreenHeight(2),
            }}
          />
          <Button
            text="Retry"
            variant={ButtonVariant.PRIMARY}
            state={ButtonState.DEFAULT}
            size={ButtonSize.MEDIUM}
            onPress={handleRefresh}
            customStyles={styles.retryButton}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.mainContainer}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: getScreenHeight(4) },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[ColorPalette.PURPLE_300]}
              tintColor={ColorPalette.PURPLE_300}
            />
          }
        >
          <View style={styles.ProductContainer}>
            {products && products.length > 0 ? (
              products.map((product) => {
                const isUpdatingThisProduct =
                  updatingStatus === product.product_id;
                const isSelected = selectedProducts.includes(
                  product.product_id
                );
                const isBeingDeleted = deletingProducts.includes(
                  product.product_id
                );

                // Create enhanced product data using complete API response
                const productData = {
                  productId: product.product_id,
                  productName: product.product,
                  price: product.price, // Use raw price without currency symbol
                  category: product.category || "",
                  subcategory: "", // API doesn't provide subcategory in list
                  description:
                    product.full_description || product.short_description || "",
                  images: product.image_url ? [product.image_url] : [],
                  productCode: product.product_id, // Using product_id as product code
                  quantity: product.amount.toString(),
                  minQuantity: product.min_qty?.toString() || "",
                  maxQuantity: product.max_qty?.toString() || "",
                  trackInventory: product.amount > 0, // Assume tracking if has stock
                  taxType: "VAT", // Default value
                  brand: product.company_name || "",
                  color: "",
                  size: "",
                  weight: "",
                  manufacturer: product.company_name || "",
                  countryOfOrigin: "",
                  status: product.status,
                  // Additional data from API
                  listPrice: product.list_price,
                  formatListPrice: product.format_list_price,
                  productType: product.product_type,
                  companyId: product.company_id,
                  isReturnable: product.is_returnable,
                  returnPeriod: product.return_period,
                  averageRating: product.average_rating,
                  ageVerification: product.age_verification,
                  ageLimit: product.age_limit,
                  statusDetails: product.status_details,
                };

                return (
                  <View
                    key={product.product_id}
                    style={{ position: "relative" }}
                  >
                    {/* Multi-select overlay */}
                    {isMultiSelectMode && (
                      <TouchableOpacity
                        style={{
                          position: "absolute",
                          top: getScreenWidth(2),
                          left: getScreenWidth(2),
                          zIndex: 10,
                          width: getScreenWidth(8),
                          height: getScreenWidth(8),
                          borderRadius: getScreenWidth(4),
                          backgroundColor: isSelected
                            ? ColorPalette.PURPLE_300
                            : ColorPalette.White,
                          borderWidth: 2,
                          borderColor: isSelected
                            ? ColorPalette.PURPLE_300
                            : ColorPalette.GREY_200,
                          justifyContent: "center",
                          alignItems: "center",
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                          elevation: 3,
                        }}
                        onPress={() =>
                          toggleProductSelection(product.product_id)
                        }
                      >
                        {isSelected && (
                          <CheckIcon size={16} color={ColorPalette.White} />
                        )}
                      </TouchableOpacity>
                    )}

                    <ProductInfo
                      productId={product.product_id}
                      orderImage={product.image_url}
                      productName={product.product}
                      sellerPrice={product.format_price}
                      platformFee="€0.00"
                      stock={product.amount.toString()}
                      active={product.status === "A"}
                      productData={productData}
                      onActiveChange={(isActive) =>
                        !isMultiSelectMode &&
                        handleToggleProductStatus(product.product_id, isActive)
                      }
                      onShare={() => console.log(`Share ${product.product}`)}
                      onMoreOptions={() =>
                        console.log(`More options for ${product.product}`)
                      }
                      onLongPress={activateMultiSelectMode} // NEW: Add long press handler
                      style={[
                        isUpdatingThisProduct || isBeingDeleted
                          ? { opacity: 0.7 }
                          : undefined,
                        isSelected
                          ? {
                              borderColor: ColorPalette.PURPLE_300,
                              borderWidth: 2,
                              marginHorizontal: getScreenWidth(1),
                            }
                          : undefined,
                      ]}
                    />
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyStateContainer}>
                <Typography
                  text={getEmptyStateMessage()}
                  variant={TypographyVariant.LMEDIUM_REGULAR}
                  customTextStyles={styles.emptyStateText}
                />
                {getEmptyStateAction() && (
                  <Button
                    text="Add Your First Product"
                    variant={ButtonVariant.PRIMARY}
                    state={ButtonState.DEFAULT}
                    size={ButtonSize.MEDIUM}
                    onPress={() => setShowAddModal(true)}
                  />
                )}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Add Product Modal */}
      <AddModal
        isVisible={showAddModal}
        onClose={() => setShowAddModal(false)}
        buttons={buttons}
      />

      {/* Delete Confirmation Modal */}
      <AddModal
        isVisible={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        headerText="Delete Products"
        buttons={deleteConfirmButtons}
      />

      {/* Floating Add Button (hidden in multi-select mode) */}
      {!isMultiSelectMode && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <PlusIcon
            size={24}
            color={ColorPalette.White}
            style={undefined}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};
export default ProductScreen;
