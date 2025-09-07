export default {
  expo: {
    name: "ZapStock",
    slug: "zapstock",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#1E3A8A"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.zapstock.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1E3A8A"
      },
      package: "com.zapstock.app",
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "ACCESS_WIFI_STATE"
      ],
      usesCleartextTraffic: true
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    scheme: "zapstock",
    plugins: [
      "expo-router"
    ],
    extra: {
      eas: {
        projectId: "89005133-578b-4ff1-bdb4-bce68705b2c5"
      }
    }
  }
};
