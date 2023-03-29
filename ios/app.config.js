module.exports = {
  "expo": {
    "name": "Timestack",
    "slug": "timestack",
    "scheme": "timestack",
    "version": "0.20.1",
    "orientation": "portrait",
    "icon": "./assets/icon3.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "plugins": [ [
      "@config-plugins/ffmpeg-kit-react-native",
      {
        "package": "min-gpl",
        "ios": {
          "package": "min-gpl",
        }
      }
    ],
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 31,
            "targetSdkVersion": 31,
            "minSdkVersion": 24,
            "buildToolsVersion": "31.0.0",
            "packagingOptions": {
              "pickFirst": [
                "lib/arm64-v8a/libc++_shared.so",
                "lib/armeabi-v7a/libc++_shared.so",
                "lib/x86/libc++_shared.so",
                "lib/x86_64/libc++_shared.so"
              ]
            }
          }
        }
      ]],
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.timestack.timestack",
      "config": {
        "usesNonExemptEncryption": false
      },
      "infoPlist": {
        "UIBackgroundModes": [
          "location",
          "fetch"
        ],
        "NSPhotoLibraryUsageDescription": "Timestack needs access to your photos to upload them to your event.",
        "NSCameraUsageDescription": "Timestack needs access to your camera to update your profile picture."
      }
    },
    "android": {
      "package": "com.timestack.timestack",
      "versionCode": 12,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "permissions": [
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "frontendUrl": process.env.FRONTEND_URL ? process.env.FRONTEND_URL : "https://timestack.world",
      "apiUrl": process.env.API_URL ? process.env.API_URL : "https://edge.timestack.world",
      "eas": {
        "projectId": "e0c26aeb-0710-4a0c-8057-e4415032c70b"
      },
    },
    "updates": {
      "url": "https://u.expo.dev/e0c26aeb-0710-4a0c-8057-e4415032c70b",
      "fallbackToCacheTimeout": 0
    },
    "runtimeVersion": {
      "policy": "sdkVersion",
    }
  }
}
