import React, { useState } from "react";
import {
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  View,
} from "react-native";
import ToggleSwitch from "toggle-switch-react-native";
import MoreVerticalIcon from "../../../../assets/icons/MoreVerticalIcon";
import { ColorPalette } from "../../../config/colorPalette";
import { getFigmaDimension } from "../../../helpers/screenSize";
import {
  ButtonSize,
  ButtonState,
  ButtonType,
  ButtonVariant,
} from "../../UserComponents/Button";
import { Typography } from "../../UserComponents/Typography/Typography";
import { TypographyVariant } from "../../UserComponents/Typography/Typography.types";
import { AddModal, ButtonConfig } from "../AddModal/AddModal";
import { styles } from "./ProductInfo.styles";
import { ProductInfoProps } from "./ProductInfo.types";
import { navigate } from "../../../navigation/utils/navigationRef";

const DefaultProduct = require("../../../../assets/images/defaultProduct.png");

export const ProductInfo: React.FC<ProductInfoProps> = ({
  productId,
  orderImage,
  productName,
  sellerPrice,
  platformFee,
  stock,
  active = false,
  style,
  onActiveChange,
  onShare,
  onMoreOptions,
  // Add new optional props for edit mode
  productData,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  const handlePress = () => {
    // Navigate to AddProduct with pre-filled data for editing
    navigate("Dashboard", {
      screen: "Product",
      params: {
        screen: "AddProduct",
        params: {
          productId,
          editMode: true,
          productData: productData || {
            productId,
            productName,
            price: sellerPrice.replace("€", ""), // Remove currency symbol
            category: "", // Will be fetched from API
            subcategory: "",
            description: "",
            images: orderImage ? [orderImage] : [],
            productCode: "",
            quantity: stock,
            minQuantity: "",
            maxQuantity: "",
            trackInventory: false,
            taxType: "VAT",
            brand: "",
            color: "",
            size: "",
            weight: "",
            manufacturer: "",
            countryOfOrigin: "",
            status: active ? "A" : "D",
          },
        },
      },
    });
  };

  const handlePreview = () => {
    // Navigate to ProductDetailsScreen for preview
    navigate("Dashboard", {
      screen: "Product",
      params: {
        screen: "ProductDetails",
        params: { productId },
      },
    });
    setShowModal(false);
  };

  const handleDelete = () => {
    console.log("Delete product:", productId);
    setShowModal(false);
    // TODO: Implement delete functionality
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  const buttonsTwo: ButtonConfig[] = [
    {
      text: "Preview",
      onPress: handlePreview,
      variant: ButtonVariant.PRIMARY,
      state: ButtonState.DEFAULT,
      size: ButtonSize.MEDIUM,
      textVariant: TypographyVariant.LMEDIUM_EXTRASEMIBOLD,
    },
    {
      text: "Delete",
      onPress: handleDelete,
      variant: ButtonVariant.PRIMARY,
      state: ButtonState.DEFAULT,
      type: ButtonType.OUTLINED,
      size: ButtonSize.MEDIUM,
      customStyles: { borderWidth: 1, borderColor: ColorPalette.GREY_TEXT_400 },
      customTextStyles: { color: ColorPalette.GREY_TEXT_400 },
      textVariant: TypographyVariant.LMEDIUM_EXTRASEMIBOLD,
    },
    {
      text: "Cancel",
      onPress: handleCancel,
      variant: ButtonVariant.PRIMARY,
      state: ButtonState.DEFAULT,
      type: ButtonType.OUTLINED,
      size: ButtonSize.MEDIUM,
      customStyles: { borderWidth: 1 },
      textVariant: TypographyVariant.LMEDIUM_EXTRASEMIBOLD,
    },
  ];

  const getImageSource = (): ImageSourcePropType => {
    if (!orderImage || orderImage.trim() === "" || imageLoadError) {
      return DefaultProduct;
    }
    return { uri: orderImage };
  };

  const handleImageError = () => {
    console.log("Image load error, falling back to default");
    setImageLoadError(true);
  };

  // Calculate dimensions for the toggle switch
  const trackWidth = getFigmaDimension(40);
  const trackHeight = getFigmaDimension(24);
  const thumbDiameter = getFigmaDimension(18);

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.container, style]}>
      <View style={styles.imageContainer}>
        <Image
          source={getImageSource()}
          style={styles.productImage}
          resizeMode="cover"
          onError={handleImageError}
        />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoContainerOne}>
          <View style={styles.productNameWrapper}>
            <Typography
              variant={TypographyVariant.LMEDIUM_MEDIUM}
              text={productName}
              customTextStyles={styles.productNameText}
              numberOfLines={2}
            />
          </View>
          <View style={styles.iconContainer}>
            <MoreVerticalIcon
              onPress={() => setShowModal(true)}
              style={undefined}
            />
          </View>
        </View>

        <View style={styles.infoContainerTwo}>
          <View style={styles.sellerContainer}>
            <Typography
              variant={TypographyVariant.LSMALL_REGULAR}
              text="Seller Price :"
              customTextStyles={styles.labelText}
            />
            <Typography
              variant={TypographyVariant.H5_SEMIBOLD}
              text={sellerPrice}
              customTextStyles={styles.valueText}
            />
          </View>
          <View style={styles.platFormContainer}>
            <Typography
              variant={TypographyVariant.LSMALL_REGULAR}
              text="Platform fee :"
              customTextStyles={styles.labelText}
            />
            <Typography
              variant={TypographyVariant.H5_SEMIBOLD}
              text={platformFee}
              customTextStyles={styles.valueText}
            />
          </View>
        </View>

        <View style={styles.infoContainerThree}>
          <View style={styles.stockContainer}>
            <Typography
              variant={TypographyVariant.LSMALL_REGULAR}
              text="Stock :"
              customTextStyles={styles.labelText}
            />
            <Typography
              variant={TypographyVariant.LSMALL_MEDIUM}
              text={stock}
              customTextStyles={styles.valueText}
            />
          </View>
          <View style={styles.toggleContainer}>
            <ToggleSwitch
              isOn={active}
              onColor={ColorPalette.Success}
              offColor={ColorPalette.Gray}
              label={active ? "Active" : "Hidden"}
              labelStyle={styles.toggleLabel}
              size="small"
              onToggle={(isOn) => onActiveChange?.(isOn)}
              thumbOnStyle={{
                backgroundColor: ColorPalette.White,
                elevation: 0,
                shadowOpacity: 0,
                shadowColor: "transparent",
                shadowOffset: { height: 0, width: 0 },
                shadowRadius: 0,
                width: thumbDiameter,
                height: thumbDiameter,
                borderRadius: thumbDiameter / 2,
                margin: (trackHeight - thumbDiameter) / 2,
              }}
              thumbOffStyle={{
                backgroundColor: ColorPalette.White,
                elevation: 0,
                shadowOpacity: 0,
                shadowColor: "transparent",
                shadowOffset: { height: 0, width: 0 },
                shadowRadius: 0,
                width: thumbDiameter,
                height: thumbDiameter,
                borderRadius: thumbDiameter / 2,
                margin: (trackHeight - thumbDiameter) / 2,
              }}
              trackOnStyle={{
                width: trackWidth,
                height: trackHeight,
                borderRadius: trackHeight / 2,
                padding: 0,
              }}
              trackOffStyle={{
                width: trackWidth,
                height: trackHeight,
                borderRadius: trackHeight / 2,
                padding: 0,
              }}
              containerStyle={{
                padding: 0,
                margin: 0,
              }}
            />
          </View>
        </View>

        <AddModal
          isVisible={showModal}
          onClose={() => setShowModal(false)}
          buttons={buttonsTwo}
        />
      </View>
    </TouchableOpacity>
  );
};
