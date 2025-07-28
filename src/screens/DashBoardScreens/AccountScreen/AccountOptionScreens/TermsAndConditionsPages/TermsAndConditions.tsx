import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSelector, useDispatch } from "react-redux";
import { Header } from "../../../../../components/UserComponents/Header/Header";
import { TypographyVariant } from "../../../../../components/UserComponents/Typography/Typography.types";
import { ColorPalette } from "../../../../../config/colorPalette";
import { goBack } from "../../../../../navigation/utils/navigationRef";
import { fetchInitializer } from "../../../../../redux/slices/initializerSlice";
import { RootState, AppDispatch } from "../../../../../redux/store";
import ArrowLeft from "../../../../../../assets/icons/ArrowLeft";

const TermsAndConditions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: initializerData, loading } = useSelector(
    (state: RootState) => state.initializer
  );
  const [webViewLoading, setWebViewLoading] = useState(true);

  useEffect(() => {
    if (!initializerData) {
      dispatch(fetchInitializer());
    }
  }, [dispatch, initializerData]);

  const termsUrl = initializerData?.terms_of_use_page || "";

  // More conservative JavaScript injection
  const injectedJavaScript = `
    (function() {
      function cleanPage() {
        try {
          // Add CSS to style the page
          const style = document.createElement('style');
          style.textContent = \`
            /* Hide specific navigation elements but preserve content */
            nav, .nav, .navbar, .navigation, header, .header,
            .breadcrumb, .breadcrumbs, .breadcrumb-trail,
            footer, .footer, .sidebar, .side-nav,
            .menu, .main-menu, .top-menu, .bottom-menu,
            .social-share, .share-buttons, .advertisement, .ads {
              display: none !important;
            }
            
            /* Hide elements with navigation text */
            a[href*="home" i], a[href*="search" i], a[href*="cart" i],
            a[href*="account" i], a[href*="wishlist" i] {
              display: none !important;
            }
            
            /* Basic styling for content */
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
              margin: 0 !important;
              padding: 16px !important;
              background-color: #ffffff !important;
              color: #333333 !important;
              line-height: 1.6 !important;
              font-size: 16px !important;
            }
            
            h1, h2, h3, h4, h5, h6 {
              color: #2c3e50 !important;
              margin-top: 20px !important;
              margin-bottom: 12px !important;
            }
            
            h1 {
              font-size: 24px !important;
              border-bottom: 2px solid #3498db !important;
              padding-bottom: 8px !important;
            }
            
            p {
              margin-bottom: 16px !important;
              font-size: 16px !important;
              line-height: 1.6 !important;
            }
            
            ul, ol {
              margin-bottom: 16px !important;
              padding-left: 20px !important;
            }
            
            li {
              margin-bottom: 8px !important;
            }
            
            a {
              color: #3498db !important;
              text-decoration: none !important;
            }
            
            /* Remove fixed positioning */
            * {
              position: static !important;
            }
            
            /* Mobile responsive */
            @media (max-width: 768px) {
              body {
                padding: 12px !important;
                font-size: 15px !important;
              }
              h1 { font-size: 22px !important; }
              p { font-size: 15px !important; }
            }
          \`;
          
          if (document.head) {
            document.head.appendChild(style);
          }

          // Remove specific elements after a short delay
          setTimeout(() => {
            // Remove navigation elements
            const navSelectors = [
              'nav', 'header', '.header', '.navigation', '.nav', '.navbar',
              '.breadcrumb', '.breadcrumbs', '.breadcrumb-trail',
              'footer', '.footer', '.sidebar', '.side-nav',
              '.menu', '.main-menu', '.bottom-nav', '.tab-bar'
            ];
            
            navSelectors.forEach(selector => {
              const elements = document.querySelectorAll(selector);
              elements.forEach(el => {
                if (el && el.parentNode) {
                  el.style.display = 'none';
                }
              });
            });

            // Hide elements containing navigation text
            const allLinks = document.querySelectorAll('a');
            allLinks.forEach(link => {
              const text = link.textContent.toLowerCase().trim();
              if (['home', 'search', 'cart', 'account', 'wishlist', 'wish list'].includes(text)) {
                // Hide the parent container if it looks like a navigation
                let parent = link.parentElement;
                if (parent && parent.children.length <= 5) {
                  parent.style.display = 'none';
                }
              }
            });

            // Remove any fixed positioned elements
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
              const styles = window.getComputedStyle(el);
              if (styles.position === 'fixed' || styles.position === 'sticky') {
                el.style.position = 'static';
              }
            });
          }, 100);

          // Handle external links
          document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.href) {
              try {
                const currentDomain = window.location.hostname;
                const linkDomain = new URL(e.target.href).hostname;
                
                if (linkDomain !== currentDomain) {
                  e.preventDefault();
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'externalLink', 
                    url: e.target.href
                  }));
                }
              } catch (err) {
                // Ignore URL parsing errors
              }
            }
          });

        } catch (error) {
          console.log('Error in cleanPage:', error);
        }
      }

      // Run cleanup
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cleanPage);
      } else {
        cleanPage();
      }

      // Run again after page loads
      setTimeout(cleanPage, 1000);

      return true;
    })();
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "externalLink") {
        Alert.alert(
          "External Link",
          "This link leads to an external website. Would you like to open it?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open",
              onPress: () => Linking.openURL(data.url),
            },
          ]
        );
      }
    } catch (error) {
      console.log("Error parsing WebView message:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <Header
        name="Terms and Conditions"
        variant={TypographyVariant.LMEDIUM_BOLD}
        textColor={ColorPalette.AgreeTerms}
        leftIcon={<ArrowLeft style={undefined} size={16} onPress={goBack} />}
        rightIcons={null}
      />

      {loading || !termsUrl ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={ColorPalette.PRIMARY} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {webViewLoading && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: ColorPalette.WHITE,
                zIndex: 1,
              }}
            >
              <ActivityIndicator size="large" color={ColorPalette.PRIMARY} />
            </View>
          )}
          <WebView
            source={{ uri: termsUrl }}
            style={{ flex: 1 }}
            onLoadStart={() => setWebViewLoading(true)}
            onLoadEnd={() => setWebViewLoading(false)}
            onError={(error) => {
              console.log("WebView error:", error);
              setWebViewLoading(false);
            }}
            injectedJavaScript={injectedJavaScript}
            onMessage={handleMessage}
            scalesPageToFit={false}
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            bounces={false}
            onShouldStartLoadWithRequest={(request) => {
              return request.url === termsUrl;
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            // Add error handling
            onHttpError={(error) => {
              console.log("HTTP error:", error);
            }}
            renderError={(errorName) => (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text>Error loading page: {errorName}</Text>
              </View>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default TermsAndConditions;
