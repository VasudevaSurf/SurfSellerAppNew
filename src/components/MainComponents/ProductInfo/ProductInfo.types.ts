import { StyleProp, ViewStyle } from "react-native";

export interface ProductInfoProps {
  productId: string; // Add this line
  orderImage: string;
  productName: string;
  sellerPrice: string;
  platformFee: string;
  stock: string;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
  onActiveChange?: (isActive: boolean) => void;
  onShare?: () => void;
  onMoreOptions?: () => void;
}
