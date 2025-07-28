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
} from "../../../redux/slices/productsSlice";
import { AppDispatch, RootState } from "../../../redux/store";
import { styles } from "./ProductScreen.styles";

const ProductScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchText, setSearchText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

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
        name="Products"
        variant={TypographyVariant.H6_SMALL_SEMIBOLD}
        textColor={ColorPalette.AgreeTerms}
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
                  <ProductInfo
                    key={product.product_id}
                    productId={product.product_id}
                    orderImage={product.image_url}
                    productName={product.product}
                    sellerPrice={product.format_price}
                    platformFee="€0.00"
                    stock={product.amount.toString()}
                    active={product.status === "A"}
                    productData={productData} // Pass the enhanced product data
                    onActiveChange={(isActive) =>
                      handleToggleProductStatus(product.product_id, isActive)
                    }
                    onShare={() => console.log(`Share ${product.product}`)}
                    onMoreOptions={() =>
                      console.log(`More options for ${product.product}`)
                    }
                    style={isUpdatingThisProduct ? { opacity: 0.7 } : undefined}
                  />
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

      <AddModal
        isVisible={showAddModal}
        onClose={() => setShowAddModal(false)}
        buttons={buttons}
      />

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
    </SafeAreaView>
  );
};

export default ProductScreen;
