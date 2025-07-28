import React, { useState, useEffect } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import ArrowLeftIcon from "../../../../../assets/icons/ArrowLeftIcon";
import {
  Button,
  ButtonSize,
  ButtonState,
  ButtonVariant,
} from "../../../../components/UserComponents/Button";
import { Header } from "../../../../components/UserComponents/Header/Header";
import { TypographyVariant } from "../../../../components/UserComponents/Typography/Typography.types";
import { ColorPalette } from "../../../../config/colorPalette";
import { getScreenHeight } from "../../../../helpers/screenSize";
import { goBack } from "../../../../navigation/utils/navigationRef";
import { styles } from "./AddProduct.styles";
import FeaturesStep from "./ProgressStepperPages/FeaturesStepPages/FeaturesStep";
import InventoryStep from "./ProgressStepperPages/InventoryStepPages/InventoryStep";
import ProductInfoStep from "./ProgressStepperPages/ProductInfoPages/ProductInfoStep";
import ProgressStepper from "./ProgressStepperPages/ProgressStepper";
import UploadMediaStep from "./ProgressStepperPages/UploadMediaPages/UploadMediaStep";
import ArrowLeft from "../../../../../assets/icons/ArrowLeft";

const STEPS = [
  { id: 1, label: "Product Info" },
  { id: 2, label: "Upload Media" },
  { id: 3, label: "Inventory" },
  { id: 4, label: "Variant(s)" },
];

interface RouteParams {
  productId?: string;
  editMode?: boolean;
  productData?: {
    productId?: string;
    productName: string;
    price: string;
    category: string;
    subcategory?: string;
    description: string;
    images: string[];
    productCode: string;
    quantity: string;
    minQuantity: string;
    maxQuantity: string;
    trackInventory: boolean;
    taxType: string;
    brand: string;
    color: string;
    size: string;
    weight: string;
    manufacturer: string;
    countryOfOrigin: string;
    status?: string;
  };
}

type AddProductRouteProp = RouteProp<{ AddProduct: RouteParams }, "AddProduct">;

const AddProduct = () => {
  const route = useRoute<AddProductRouteProp>();
  const { productId, editMode = false, productData } = route.params || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    category: "",
    subcategory: "",
    description: "",
    images: [],
    productCode: "",
    quantity: "",
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
  });

  // Pre-fill form data if in edit mode
  useEffect(() => {
    if (editMode && productData) {
      setFormData({
        productName: productData.productName || "",
        price: productData.price || "",
        category: productData.category || "",
        subcategory: productData.subcategory || "",
        description: productData.description || "",
        images: productData.images || [],
        productCode: productData.productCode || "",
        quantity: productData.quantity || "",
        minQuantity: productData.minQuantity || "",
        maxQuantity: productData.maxQuantity || "",
        trackInventory: productData.trackInventory || false,
        taxType: productData.taxType || "VAT",
        brand: productData.brand || "",
        color: productData.color || "",
        size: productData.size || "",
        weight: productData.weight || "",
        manufacturer: productData.manufacturer || "",
        countryOfOrigin: productData.countryOfOrigin || "",
      });
    }
  }, [editMode, productData]);

  const updateFormData = (newData) => {
    setFormData((prevData) => ({ ...prevData, ...newData }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      goBack();
    }
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    console.log("Edit mode:", editMode);
    console.log("Product ID:", productId);

    // For now, just go back to product screen
    // TODO: Implement actual API call for create/update
    goBack();
  };

  const handleStepPress = (stepId) => {
    // Navigate to the selected step
    setCurrentStep(stepId);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProductInfoStep
            formData={formData}
            updateFormData={updateFormData}
            editMode={editMode}
          />
        );
      case 2:
        return (
          <UploadMediaStep
            formData={formData}
            updateFormData={updateFormData}
            editMode={editMode}
          />
        );
      case 3:
        return (
          <InventoryStep
            formData={formData}
            updateFormData={updateFormData}
            editMode={editMode}
          />
        );
      case 4:
        return (
          <FeaturesStep
            formData={formData}
            updateFormData={updateFormData}
            editMode={editMode}
          />
        );
      default:
        return null;
    }
  };

  const getHeaderTitle = () => {
    return editMode ? "Edit Product" : "Add Product";
  };

  const getSubmitButtonText = () => {
    if (editMode) {
      return currentStep === STEPS.length ? "Update Product" : "Continue";
    }
    return currentStep === STEPS.length ? "Save Product" : "Continue";
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Header
        name={getHeaderTitle()}
        variant={TypographyVariant.H6_SMALL_SEMIBOLD}
        textColor={ColorPalette.AgreeTerms}
        leftIcon={
          <ArrowLeft
            style={undefined}
            size={15}
            onPress={handleBack}
            color={ColorPalette.GREY_TEXT_400}
          />
        }
      />

      <ProgressStepper
        steps={STEPS}
        currentStep={currentStep}
        onStepPress={handleStepPress}
      />

      <View
        style={[styles.mainContainer, { paddingBottom: getScreenHeight(9) }]}
      >
        <ScrollView
          style={styles.mainContainer}
          contentContainerStyle={[styles.scrollContent]}
          showsVerticalScrollIndicator={false}
        >
          <View>{renderStep()}</View>
        </ScrollView>
      </View>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "white",
        }}
      >
        <Button
          text={getSubmitButtonText()}
          onPress={currentStep === STEPS.length ? handleSubmit : handleNext}
          variant={ButtonVariant.PRIMARY}
          state={ButtonState.DEFAULT}
          size={ButtonSize.MEDIUM}
          withShadow
        />
      </View>
    </SafeAreaView>
  );
};

export default AddProduct;
