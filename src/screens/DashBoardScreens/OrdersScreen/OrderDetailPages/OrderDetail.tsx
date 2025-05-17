import React, { useState, useEffect } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  View,
  ActivityIndicator,
} from "react-native";
import Accordion from "react-native-collapsible/Accordion";
import ChevronDownIcon from "../../../../../assets/icons/ArrowDownIcon";
import ArrowLeft from "../../../../../assets/icons/ArrowLeft";
import PrintIcon from "../../../../../assets/icons/PrintIcon";
import {
  BadgeType,
  BadgeVariant,
} from "../../../../components/UserComponents/Badges/Badge.types";
import { Header } from "../../../../components/UserComponents/Header/Header";
import { Typography } from "../../../../components/UserComponents/Typography/Typography";
import { TypographyVariant } from "../../../../components/UserComponents/Typography/Typography.types";
import { ColorPalette } from "../../../../config/colorPalette";
import { Spacing } from "../../../../config/globalStyles";
import {
  getScreenHeight,
  getScreenWidth,
} from "../../../../helpers/screenSize";
import { goBack } from "../../../../navigation/utils/navigationRef";
import { styles } from "./OrderDetail.styles";
import { OrderDetailProps } from "./OrderDetail.types";
import { Badge } from "../../../../components/UserComponents/Badges/Badge";
import ArrowDownIcon from "../../../../../assets/icons/ArrowDownIcon";
import { StatusModal } from "../../../../components/MainComponents/StatusModal/StatusModal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { fetchOrderDetailsApi } from "../../../../services/apiService";

const OrderDetail: React.FC<OrderDetailProps> = ({ route }) => {
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);

  const userId = useSelector(
    (state: RootState) => state.auth.userData?.user_id
  );

  // Important: Get data from route params
  const params = route?.params || {};
  const orderId = params.orderId;

  // Log for debugging
  useEffect(() => {
    console.log(
      "OrderDetail - Mounted with params:",
      JSON.stringify(params, null, 2)
    );
    console.log("OrderDetail - User ID:", userId);
    console.log("OrderDetail - Order ID:", orderId);
  }, [params, userId, orderId]);

  // Calculated values that will be updated with real data
  const [subTotal, setSubTotal] = useState("€0.00");
  const [shippingCost, setShippingCost] = useState("€0.00");
  const [totalPrice, setTotalPrice] = useState("€0.00");
  const [inventory, setInventory] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    // Set fallback data from route params - we'll do this immediately
    if (params && Object.keys(params).length > 0) {
      setOrderData({
        orderNumber: params.orderNumber || params.orderId,
        orderDate: params.orderDate || "",
        orderTime: params.orderTime || "",
        orderImage: params.orderImage || "https://picsum.photos/202",
        orderName: params.orderName || "Product",
        orderStatus: params.orderStatus || "Pending",
      });

      // Set customer information from params
      setCustomerInfo({
        name: params.orderName || "",
        email: params.orderEmail || "",
        phone: params.orderPhone || "",
      });

      // Set pricing information
      setTotalPrice(params.orderPrice || "€0.00");
      setCurrentStatus(params.orderStatus || "Pending");
    }

    // Fetch the detailed order info from API
    const fetchOrderDetails = async () => {
      if (!userId || !orderId) {
        console.log("OrderDetail - Missing user ID or order ID");
        setLoading(false);
        if (!orderId) {
          setError("Missing order ID");
        } else if (!userId) {
          setError("Missing user ID");
        }
        return;
      }

      try {
        console.log(
          `OrderDetail - Fetching order details for user ${userId}, order ${orderId}`
        );
        setLoading(true);
        const response = await fetchOrderDetailsApi(userId, orderId);
        console.log(
          "OrderDetail - API response:",
          JSON.stringify(response, null, 2)
        );

        // Check if response exists before accessing properties
        if (!response) {
          throw new Error("Empty response from API");
        }

        // Better property checking with more detailed error message
        if (!response.order_data) {
          console.error("OrderDetail - Response format unexpected:", response);
          throw new Error("Response missing order_data property");
        }

        const order = response.order_data;

        // Set order data
        setOrderData({
          orderNumber: order.order_number || order.order_id || orderId,
          orderDate: order.timestamp
            ? new Date(parseInt(order.timestamp) * 1000).toLocaleDateString()
            : new Date().toLocaleDateString(),
          orderTime: order.timestamp
            ? new Date(parseInt(order.timestamp) * 1000).toLocaleTimeString()
            : new Date().toLocaleTimeString(),
          orderImage:
            order.products && order.products.length > 0
              ? order.products[0].image_url || "https://picsum.photos/202"
              : "https://picsum.photos/202",
          orderName:
            order.products && order.products.length > 0
              ? order.products[0].product
              : params.orderName || "Product",
          orderStatus: order.status || params.orderStatus || "Pending",
        });

        // Set customer information
        setCustomerInfo({
          name:
            `${order.firstname || ""} ${order.lastname || ""}`.trim() ||
            order.customer?.name ||
            params.orderName ||
            "",
          email:
            order.email || order.customer?.email || params.orderEmail || "",
          phone:
            order.phone || order.customer?.phone || params.orderPhone || "",
        });

        // Set pricing information
        setTotalPrice(order.total || params.orderPrice || "€0.00");

        // Usually these would come from the API, using placeholder values
        setSubTotal(
          order.subtotal || order.total || params.orderPrice || "€0.00"
        );
        setShippingCost(order.shipping_cost || "€0.00");

        // Set inventory (placeholder)
        setInventory(
          order.products && order.products.length > 0
            ? order.products[0].amount || 1
            : 1
        );

        // Set current status
        setCurrentStatus(
          mapStatusToDisplay(order.status || params.orderStatus)
        );

        // Clear any previous errors since we succeeded
        setError(null);
      } catch (err: any) {
        console.error("OrderDetail - Error fetching order details:", err);
        setError(`Error fetching details: ${err.message || "Unknown error"}`);

        // Don't overwrite the route params data that's already set
        // This way the UI still shows something even if the API fails
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [userId, orderId, params]);

  const mapStatusToDisplay = (apiStatus: string): string => {
    const statusMap: { [key: string]: string } = {
      O: "Pending",
      P: "Accepted",
      C: "Completed",
      F: "Failed",
      I: "Canceled",
      D: "Declined",
      B: "Backordered",
      Y: "Awaiting call",
      A: "Fraud checking",
    };

    return statusMap[apiStatus] || apiStatus || "Processing";
  };

  const [activeSections, setActiveSections] = useState([]);

  // Define accordion sections data using real customer data
  const SECTIONS = [
    {
      title: "Customer Information",
      content: (
        <View style={styles.accordionContent}>
          <Typography
            text={`Name: ${customerInfo.name || "N/A"}`}
            variant={TypographyVariant.PMEDIUM_REGULAR}
            customTextStyles={{
              color: ColorPalette.GREY_TEXT_300,
              marginBottom: 8,
            }}
          />
          <Typography
            text={`Email: ${customerInfo.email || "N/A"}`}
            variant={TypographyVariant.PMEDIUM_REGULAR}
            customTextStyles={{
              color: ColorPalette.GREY_TEXT_300,
              marginBottom: 8,
            }}
          />
          <Typography
            text={`Phone: ${customerInfo.phone || "N/A"}`}
            variant={TypographyVariant.PMEDIUM_REGULAR}
            customTextStyles={{ color: ColorPalette.GREY_TEXT_300 }}
          />
        </View>
      ),
    },
    {
      title: "Billing Address",
      content: (
        <View style={styles.accordionContent}>
          <Typography
            text="Address information not available in current API response"
            variant={TypographyVariant.PMEDIUM_REGULAR}
            customTextStyles={{ color: ColorPalette.GREY_TEXT_300 }}
          />
        </View>
      ),
    },
    {
      title: "Payment Information",
      content: (
        <View style={styles.accordionContent}>
          <Typography
            text="Payment information not available in current API response"
            variant={TypographyVariant.PMEDIUM_REGULAR}
            customTextStyles={{ color: ColorPalette.GREY_TEXT_300 }}
          />
        </View>
      ),
    },
  ];

  const _renderHeader = (section, index, isActive) => {
    return (
      <View>
        {index > 0 && (
          <View
            style={{
              height: 1,
              backgroundColor: ColorPalette.GREY_200,
            }}
          />
        )}
        <View style={styles.accordionHeader}>
          <Typography
            text={section.title}
            variant={TypographyVariant.LMEDIUM_BOLD}
          />
          <ChevronDownIcon
            style={{
              transform: [{ rotate: isActive ? "180deg" : "0deg" }],
            }}
            size={24}
          />
        </View>
      </View>
    );
  };

  // Render content for accordion
  const _renderContent = (section) => {
    return section.content;
  };

  // Handle change of accordion sections
  const _updateSections = (activeSections) => {
    setActiveSections(activeSections);
  };

  // Handle print invoice action
  const handlePrintInvoice = () => {
    console.log("Print invoice clicked");
    // Add your print functionality here
  };

  // Handle status change
  const handleStatusChange = (newStatus) => {
    setCurrentStatus(newStatus);
    console.log("Status changed to:", newStatus);
    // Here you would add an API call to update the status in the backend
  };

  // Show loading spinner while initial data fetching completes
  if (loading && !orderData) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <Header
          name="Order summary"
          variant={TypographyVariant.LMEDIUM_BOLD}
          textColor={ColorPalette.AgreeTerms}
          leftIcon={<ArrowLeft style={undefined} size={16} onPress={goBack} />}
        />
        <View
          style={[
            styles.mainContainer,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator size="large" color={ColorPalette.PRIMARY_500} />
        </View>
      </SafeAreaView>
    );
  }

  // Only show error screen if there is no data at all to display
  if (error && !orderData) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <Header
          name="Order summary"
          variant={TypographyVariant.LMEDIUM_BOLD}
          textColor={ColorPalette.AgreeTerms}
          leftIcon={<ArrowLeft style={undefined} size={16} onPress={goBack} />}
        />
        <View
          style={[
            styles.mainContainer,
            { justifyContent: "center", alignItems: "center", padding: 20 },
          ]}
        >
          <Typography
            text={error || "Could not load order details"}
            variant={TypographyVariant.PMEDIUM_REGULAR}
            customTextStyles={{ color: ColorPalette.ERROR }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Header
        name="Order summary"
        variant={TypographyVariant.LMEDIUM_BOLD}
        textColor={ColorPalette.AgreeTerms}
        leftIcon={<ArrowLeft style={undefined} size={16} onPress={goBack} />}
        rightIcons={[
          {
            isBadge: true,
            text: "Print Invoice",
            badgeType: BadgeType.PRIMARY,
            badgeVariant: BadgeVariant.OUTLINE,
            onPress: handlePrintInvoice,
            customContainerStyle: {
              borderColor: ColorPalette.ProgressLine,
              borderRadius: Spacing.XXXLarge,
              paddingVertical: getScreenHeight(1.5),
              paddingHorizontal: getScreenWidth(3),
            },
            textVariant: TypographyVariant.LMEDIUM_MEDIUM,
            customTextColor: ColorPalette.PRIMARY_500,
            leftIcon: PrintIcon,
            iconSize: 16,
          },
        ]}
      />

      {/* Show warning for API errors while still displaying data */}
      {error && (
        <View
          style={{
            backgroundColor: "#FFECB3",
            padding: 12,
            marginHorizontal: 16,
            marginTop: 8,
            borderRadius: 8,
          }}
        >
          <Typography
            text={`Note: Using limited data. ${error}`}
            variant={TypographyVariant.PSMALL_MEDIUM}
            customTextStyles={{ color: "#856404" }}
          />
        </View>
      )}

      <View style={styles.mainContainer}>
        <ScrollView
          style={styles.mainContainer}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: getScreenHeight(2) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.productCard}>
            <View style={styles.headerContainer}>
              <View style={{ gap: getScreenHeight(0.5) }}>
                <Typography
                  text={`Order #${orderData.orderNumber}`}
                  variant={TypographyVariant.H5_BOLD}
                  customTextStyles={styles.orderNumberText}
                />
                <Typography
                  text={`${orderData.orderDate} • ${orderData.orderTime}`}
                  variant={TypographyVariant.LMEDIUM_REGULAR}
                  customTextStyles={styles.dateTimeText}
                />
              </View>
            </View>
            <View style={styles.productRow}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: orderData.orderImage }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.productInfo}>
                <Typography
                  text={orderData.orderName}
                  variant={TypographyVariant.PSMALL_MEDIUM}
                  customTextStyles={{
                    color: ColorPalette.GREY_TEXT_500,
                    flexWrap: "wrap",
                    width: "100%",
                  }}
                  numberOfLines={0} // Force text to break regardless of width
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: getScreenWidth(1),
                    width: "100%",
                  }}
                >
                  <Typography
                    text="Quantity: "
                    variant={TypographyVariant.PSMALL_REGULAR}
                    customTextStyles={{ color: ColorPalette.GREY_TEXT_300 }}
                  />
                  <Typography
                    text={inventory.toString()}
                    variant={TypographyVariant.LSMALL_BOLD}
                    customTextStyles={{ color: ColorPalette.GREY_TEXT_500 }}
                  />
                </View>
              </View>
            </View>

            <View style={styles.dataContainer}>
              <View style={styles.totalRow}>
                <Typography
                  text="Sub Total:"
                  variant={TypographyVariant.PMEDIUM_REGULAR}
                  customTextStyles={{ color: ColorPalette.GREY_TEXT_100 }}
                />
                <Typography
                  text={subTotal}
                  variant={TypographyVariant.PMEDIUM_REGULAR}
                  customTextStyles={{ color: ColorPalette.GREY_TEXT_300 }}
                />
              </View>

              <View style={styles.totalRow}>
                <Typography
                  text="Shipping Cost:"
                  variant={TypographyVariant.PMEDIUM_REGULAR}
                  customTextStyles={{ color: ColorPalette.GREY_TEXT_100 }}
                />
                <Typography
                  text={shippingCost}
                  variant={TypographyVariant.PMEDIUM_REGULAR}
                  customTextStyles={{ color: ColorPalette.GREY_TEXT_300 }}
                />
              </View>

              <View style={styles.totalRow}>
                <Typography
                  text="Total:"
                  variant={TypographyVariant.PMEDIUM_REGULAR}
                  customTextStyles={{ color: ColorPalette.GREY_TEXT_100 }}
                />
                <Typography
                  text={totalPrice}
                  variant={TypographyVariant.H6_BOLD}
                  customTextStyles={{ color: ColorPalette.Black }}
                />
              </View>
            </View>
          </View>

          <View style={styles.downContainer}>
            <Accordion
              sections={SECTIONS}
              activeSections={activeSections}
              renderHeader={_renderHeader}
              renderContent={_renderContent}
              onChange={_updateSections}
              expandMultiple={false}
              underlayColor="transparent"
              containerStyle={styles.accordionContainer}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Typography
              text="Order Status:"
              variant={TypographyVariant.PSMALL_MEDIUM}
              customTextStyles={ColorPalette.GREY_TEXT_100}
            />
            <Badge
              text={currentStatus}
              variant={BadgeVariant.FILLED}
              type={BadgeType.PRIMARY}
              onPress={() => setIsModalVisible(true)}
              customContainerStyle={{
                paddingVertical: getScreenHeight(1.5),
                paddingHorizontal: getScreenHeight(2),
                backgroundColor: getStatusColor(orderData.orderStatus),
              }}
              textVariant={TypographyVariant.LMEDIUM_MEDIUM}
              rightIcon={ArrowDownIcon}
            />
          </View>
        </ScrollView>
        <StatusModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSubmit={handleStatusChange}
          showSearch={false}
          initialStatus={currentStatus}
        />
      </View>
    </SafeAreaView>
  );
};

// Helper function to determine status color based on API status
const getStatusColor = (status: string): string => {
  const statusColorMap: { [key: string]: string } = {
    O: "#ff9522", // Pending
    P: "#97cf4d", // Accepted
    C: "#97cf4d", // Completed
    F: "#ff5215", // Failed
    I: "#c2c2c2", // Canceled
    D: "#ff5215", // Declined
    B: "#28abf6", // Backordered
    Y: "#cc4125", // Awaiting call
    A: "#dcdcdc", // Fraud checking
    Pending: "#ff9522",
    Accepted: "#97cf4d",
    Completed: "#97cf4d",
    Failed: "#ff5215",
    Canceled: "#c2c2c2",
    Declined: "#ff5215",
    Backordered: "#28abf6",
    Processing: "#97cf4d",
  };

  return statusColorMap[status] || ColorPalette.Green_200;
};

export default OrderDetail;
