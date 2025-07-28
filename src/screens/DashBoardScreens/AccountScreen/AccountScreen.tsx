import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Image, ScrollView, View, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import ArrowRightIcon from "../../../../assets/icons/ArrowRightIcon";
import CircularEuroIcon from "../../../../assets/icons/CircularEuroIcon";
import LanguageIcon from "../../../../assets/icons/LanguageIcon";
import PackageIcon from "../../../../assets/icons/PackageIcon";
import QuestionMarkIcon from "../../../../assets/icons/QuestionMarkIcon";
import { AddModal } from "../../../components/MainComponents/AddModal/AddModal";
import { MenuItem } from "../../../components/MainComponents/MenuItem/MenuItem";
import {
  ButtonSize,
  ButtonState,
  ButtonType,
  ButtonVariant,
} from "../../../components/UserComponents/Button";
import { Header } from "../../../components/UserComponents/Header/Header";
import { Typography } from "../../../components/UserComponents/Typography/Typography";
import { TypographyVariant } from "../../../components/UserComponents/Typography/Typography.types";
import { ColorPalette } from "../../../config/colorPalette";
import { getScreenHeight } from "../../../helpers/screenSize";
import {
  navigate,
  navigateToAuth,
} from "../../../navigation/utils/navigationRef";
import { logoutUser } from "../../../redux/slices/authSlice";
import { fetchProfile } from "../../../redux/slices/profileSlice";
import { fetchInitializer } from "../../../redux/slices/initializerSlice";
import { useAppConfig } from "../../../hooks/useAppConfig";
import { styles } from "./AccountScreen.styles";
import { RootState, AppDispatch } from "../../../redux/store";

const AccountScreen = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const userData = useSelector((state: RootState) => state.auth.userData);
  const { profileData, loading: profileLoading } = useSelector(
    (state: RootState) => state.profile
  );

  // Use the app config hook (URLs are now cleaned)
  const {
    termsUrl,
    privacyUrl,
    whatsappUrl,
    isCompanyProfileEnabled,
    loading: configLoading,
  } = useAppConfig();

  // Use profile data if available, fallback to auth userData
  const currentUserData = profileData || userData;

  const fullName = currentUserData
    ? `${currentUserData.firstname || ""} ${
        currentUserData.lastname || ""
      }`.trim()
    : "User Profile";

  // Fetch profile data and app config when component mounts
  useEffect(() => {
    if (userData?.user_id) {
      dispatch(fetchProfile(userData.user_id));
    }
    dispatch(fetchInitializer());
  }, [dispatch, userData?.user_id]);

  // Handle logout functionality
  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logoutUser());
      setShowLogoutModal(false);
      navigateToAuth();
    } catch (error) {
      console.error("Logout failed:", error);
      setShowLogoutModal(false);
    }
  }, [dispatch]);

  // Helper function to open URL with error handling
  const openUrl = useCallback(async (url: string, fallbackMessage: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Error",
          `Cannot open ${fallbackMessage}. Please try again later.`
        );
      }
    } catch (error) {
      console.error(`Error opening ${fallbackMessage}:`, error);
      Alert.alert(
        "Error",
        `Failed to open ${fallbackMessage}. Please try again later.`
      );
    }
  }, []);

  const headerIcons = useMemo(
    () => [
      {
        icon: LanguageIcon,
        onPress: () => console.log("Language icon pressed"),
        size: 24,
        color: ColorPalette.Black,
        strokeWidth: 2,
      },
      {
        icon: QuestionMarkIcon,
        onPress: () => {
          if (whatsappUrl) {
            openUrl(whatsappUrl, "WhatsApp support");
          }
        },
        size: 24,
        color: ColorPalette.Black,
        strokeWidth: 2,
      },
    ],
    [whatsappUrl, openUrl]
  );

  // Handle Terms and Conditions navigation - Open in browser
  // const handleTermsPress = useCallback(() => {
  //   if (termsUrl) {
  //     console.log("Opening Terms URL:", termsUrl); // Debug log
  //     openUrl(termsUrl, "Terms and Conditions");
  //   } else {
  //     Alert.alert("Error", "Terms and Conditions not available at the moment.");
  //   }
  // }, [termsUrl, openUrl]);

  // Handle Privacy Policy navigation - Open in browser
  // const handlePrivacyPress = useCallback(() => {
  //   if (privacyUrl) {
  //     console.log("Opening Privacy URL:", privacyUrl); // Debug log
  //     openUrl(privacyUrl, "Privacy Policy");
  //   } else {
  //     Alert.alert("Error", "Privacy Policy not available at the moment.");
  //   }
  // }, [privacyUrl, openUrl]);

  const handleTermsPress = useCallback(() => {
    navigate("Dashboard", {
      screen: "Account",
      params: { screen: "TermsAndConditions" },
    });
  }, []);

  // Handle Privacy Policy navigation - Navigate to internal screen
  const handlePrivacyPress = useCallback(() => {
    navigate("Dashboard", {
      screen: "Account",
      params: { screen: "PrivacyPolicy" },
    });
  }, []);

  // Memoize modal buttons with updated logout functionality
  const logoutButtons = useMemo(
    () => [
      {
        text: "LOGOUT",
        onPress: handleLogout,
        variant: ButtonVariant.PRIMARY,
        type: ButtonType.PRIMARY,
        state: ButtonState.DEFAULT,
        size: ButtonSize.MEDIUM,
        bgColor: ColorPalette.RED_100,
        customStyles: styles.customButton,
      },
      {
        text: "Cancel",
        onPress: () => setShowLogoutModal(false),
        variant: ButtonVariant.PRIMARY,
        type: ButtonType.OUTLINED,
        state: ButtonState.DEFAULT,
        size: ButtonSize.MEDIUM,
        customStyles: styles.customButton,
        customTextStyles: styles.customText,
      },
    ],
    [handleLogout]
  );

  const deleteButtons = useMemo(
    () => [
      {
        text: "Delete Account",
        onPress: () => setShowDeleteModal(false),
        variant: ButtonVariant.PRIMARY,
        type: ButtonType.PRIMARY,
        state: ButtonState.DEFAULT,
        size: ButtonSize.MEDIUM,
        bgColor: ColorPalette.RED_100,
        customStyles: styles.customButton,
      },
      {
        text: "Cancel",
        onPress: () => setShowDeleteModal(false),
        variant: ButtonVariant.PRIMARY,
        type: ButtonType.OUTLINED,
        state: ButtonState.DEFAULT,
        size: ButtonSize.MEDIUM,
        customStyles: styles.customButton,
        customTextStyles: styles.customText,
      },
    ],
    []
  );

  // Memoize menu items configuration
  const menuItems = useMemo(() => {
    const items = [
      {
        label: "Personal Info",
        rightIcon: <ArrowRightIcon style={undefined} />,
        onPress: () => {
          navigate("Dashboard", {
            screen: "Account",
            params: { screen: "PersonalInfo" },
          });
        },
        show: true,
      },
      {
        label: "Company Profile",
        rightIcon: <ArrowRightIcon style={undefined} />,
        onPress: () => {
          navigate("Dashboard", {
            screen: "Account",
            params: { screen: "CompanyProfile" },
          });
        },
        show: isCompanyProfileEnabled,
      },
      {
        label: "Bank Details",
        rightIcon: <ArrowRightIcon style={undefined} />,
        onPress: () => {
          navigate("Dashboard", {
            screen: "Account",
            params: { screen: "BankDetails" },
          });
        },
        show: true,
      },
      {
        label: "Payments",
        rightIcon: <ArrowRightIcon style={undefined} />,
        onPress: () => {
          navigate("Dashboard", {
            screen: "Account",
            params: { screen: "PaymentInfo" },
          });
        },
        show: true,
      },
      {
        label: "Strip Account",
        rightIcon: <ArrowRightIcon style={undefined} />,
        onPress: () => {},
        show: true,
      },
      {
        label: "Notifications",
        rightIcon: <ArrowRightIcon style={undefined} />,
        onPress: () => {
          navigate("Dashboard", {
            screen: "Account",
            params: { screen: "NotificationScreen" },
          });
        },
        show: true,
      },
      {
        label: "Terms and Conditions",
        rightIcon: <ArrowRightIcon style={undefined} />,
        onPress: handleTermsPress,
        // show: !!termsUrl,
        show: true,
      },
      {
        label: `FAQ'S`,
        rightIcon: <ArrowRightIcon style={undefined} />,
        onPress: () => {
          navigate("Dashboard", {
            screen: "Account",
            params: { screen: "FAQScreen" },
          });
        },
        show: true,
      },
      {
        label: "Privacy Policy",
        rightIcon: <ArrowRightIcon style={undefined} />,
        onPress: handlePrivacyPress,
        // show: !!privacyUrl,
        show: true,
      },
      {
        label: "Logout",
        rightIcon: null,
        onPress: () => setShowLogoutModal(true),
        show: true,
      },
      {
        label: "Delete Account",
        rightIcon: null,
        onPress: () => setShowDeleteModal(true),
        show: true,
      },
    ];

    // Filter out items that shouldn't be shown
    return items.filter((item) => item.show);
  }, [
    isCompanyProfileEnabled,
    // termsUrl,
    // privacyUrl,
    handleTermsPress,
    handlePrivacyPress,
  ]);

  // Memoize the profile section
  const ProfileSection = useCallback(
    () => (
      <View style={styles.profileContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: "https://i.pinimg.com/564x/93/d3/e3/93d3e31639a4d07613de9dccdc8bd5e8.jpg",
            }}
            style={styles.orderImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.dataContainer}>
          <Typography
            text={fullName}
            variant={TypographyVariant.H6_SEMIBOLD}
            customTextStyles={styles.profileName}
          />
          <Typography
            text="Triq San Pawl, Valett, Malta"
            variant={TypographyVariant.LSMALL_REGULAR}
            customTextStyles={styles.profileCaption}
          />
        </View>
      </View>
    ),
    [fullName]
  );

  // Memoize the sales section
  const SalesSection = useCallback(
    () => (
      <View style={styles.salesContainer}>
        <View style={styles.twoContainer}>
          <View style={styles.iconBack}>
            <CircularEuroIcon style={undefined} />
          </View>
          <View style={styles.salesTwo}>
            <Typography
              variant={TypographyVariant.H5_SEMIBOLD}
              text="€47,125.34"
              customTextStyles={styles.countValue}
            />
            <Typography
              variant={TypographyVariant.LSMALL_REGULAR}
              text="Total Sales"
              customTextStyles={styles.countCaption}
            />
          </View>
        </View>
        <View style={styles.twoContainer}>
          <View style={styles.iconBackOne}>
            <PackageIcon style={undefined} />
          </View>
          <View style={styles.salesTwo}>
            <Typography
              variant={TypographyVariant.H5_SEMIBOLD}
              text="1529"
              customTextStyles={styles.countValue}
            />
            <Typography
              variant={TypographyVariant.LSMALL_REGULAR}
              text="Total Orders"
              customTextStyles={styles.countCaption}
            />
          </View>
        </View>
      </View>
    ),
    []
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <Header
        name="Account"
        variant={TypographyVariant.H6_BOLD}
        textColor={ColorPalette.AgreeTerms}
        rightIcons={headerIcons}
      />
      <ProfileSection />
      <ScrollView
        style={styles.mainContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: getScreenHeight(2) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SalesSection />
        <View style={styles.profileOptionsContainer}>
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              label={item.label}
              leftIcon={item.leftIcon}
              rightIcon={item.rightIcon}
              onPress={item.onPress}
              textStyle={{ color: ColorPalette.GREY_TEXT_500 }}
              variant={TypographyVariant.LMEDIUM_MEDIUM}
            />
          ))}
        </View>

        <AddModal
          isVisible={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          headerText="Are you sure you want to logout?"
          buttons={logoutButtons}
          showCloseIcon={false}
        />

        <AddModal
          isVisible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          headerText="Are you sure? Deleting your account is permanent."
          buttons={deleteButtons}
          showCloseIcon={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountScreen;
