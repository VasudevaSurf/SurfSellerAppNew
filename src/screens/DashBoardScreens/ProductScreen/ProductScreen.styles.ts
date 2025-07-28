import { StyleSheet } from "react-native";
import { getScreenWidth, getScreenHeight } from "../../../helpers/screenSize";
import { ColorPalette } from "../../../config/colorPalette";

export const styles = StyleSheet.create({
  searchContainer: {
    display: "flex",
    flexDirection: "row",
    padding: getScreenWidth(4),
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: ColorPalette.White,
    gap: getScreenWidth(2.5),
  },
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    paddingVertical: getScreenHeight(1),
    paddingHorizontal: getScreenWidth(4),
    marginTop: getScreenHeight(1.5),
  },
  scrollContent: {
    gap: getScreenWidth(4),
  },
  slidingBarsContainer: {
    padding: getScreenWidth(4),
    backgroundColor: ColorPalette.White,
    borderBottomWidth: 1,
    borderBottomColor: ColorPalette.GREY_100,
  },
  textStyle: {
    color: ColorPalette.TotalText,
  },
  ProductContainer: {
    display: "flex",
    flexDirection: "column",
    gap: getScreenWidth(4),
  },
  modalContainer: {
    marginTop: "auto",
    marginBottom: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: ColorPalette.PURPLE_300,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: getScreenWidth(3),
    padding: getScreenWidth(3),
    shadowColor: ColorPalette.PURPLE_300,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: getScreenWidth(5),
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: getScreenWidth(5),
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: getScreenWidth(5),
    minHeight: getScreenHeight(30),
  },
  emptyStateText: {
    color: ColorPalette.GREY_TEXT_300,
    textAlign: "center",
    marginBottom: getScreenHeight(2),
  },
  retryButton: {
    marginTop: getScreenHeight(2),
  },
  filterCount: {
    fontSize: 12,
    color: ColorPalette.GREY_TEXT_100,
    marginLeft: getScreenWidth(1),
  },
});
