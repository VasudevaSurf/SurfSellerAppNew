import React, { useEffect } from "react";
import { Alert, Linking, Platform } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import DeviceInfo from "react-native-device-info";
import { fetchInitializer } from "@/src/redux/slices/initializerSlice";
import { RootState, AppDispatch } from "@/src/redux/store";

interface AppUpdateCheckerProps {
  children: React.ReactNode;
}

const AppUpdateChecker: React.FC<AppUpdateCheckerProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: initializerData } = useSelector(
    (state: RootState) => state.initializer
  );

  const checkForUpdate = async () => {
    if (!initializerData?.app_update_config) return;

    const { app_update_config } = initializerData;

    if (!app_update_config.is_app_update_required) return;

    try {
      const currentVersion = await DeviceInfo.getVersion();
      const isAndroid = Platform.OS === "android";
      const requiredVersion = isAndroid
        ? app_update_config.android_version
        : app_update_config.ios_version;
      const downloadUrl = isAndroid
        ? app_update_config.android_url
        : app_update_config.ios_url;

      // Simple version comparison (you might want to use a library like semver for complex versioning)
      if (currentVersion < requiredVersion) {
        Alert.alert(
          "Update Available",
          "A new version of the app is available. Please update to continue using the app.",
          [
            {
              text: "Update Now",
              onPress: () => Linking.openURL(downloadUrl),
            },
            {
              text: "Later",
              style: "cancel",
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error checking app version:", error);
    }
  };

  useEffect(() => {
    if (initializerData) {
      checkForUpdate();
    }
  }, [initializerData]);

  return <>{children}</>;
};

export default AppUpdateChecker;
