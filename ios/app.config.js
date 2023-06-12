const version = "0.23.4";
export const build = 2;

module.exports = {
  "expo": {
    "name": "Timestack",
    "slug": "timestack",
    "scheme": "timestack",
    "owner": "timestack",
    "version": version,
    "orientation": "portrait",
    "icon": "./assets/icon3.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "plugins": [
        "sentry-expo",
        [
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
            "compileSdkVersion": 33,
            "targetSdkVersion": 33,
            "minSdkVersion": 24,
            "buildToolsVersion": "31.0.0"
          }
        }
      ]],
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {

      "jsEngine": "jsc",

      "supportsTablet": false,

      "bundleIdentifier": "com.timestack.timestack",
      "config": {
        "usesNonExemptEncryption": false
      },
      "infoPlist": {
        "UIBackgroundModes": [
          "fetch"
        ],
        "NSPhotoLibraryUsageDescription": "Timestack needs access to your photos to upload them to your event.",
        "NSCameraUsageDescription": "Timestack needs access to your camera to update your profile picture.",
        "NSLocationWhenInUseUsageDescription": "Timestack needs access to your location to optimize .",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "Timestack needs access to your location to show you events near you.",
      }
    },
    "android": {

      "jsEngine": "hermes",

      "package": "com.timestack.timestack",
      "versionCode": 18,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon3.png",
        "backgroundColor": "#FFFFFF"
      },
      "permissions": [
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.READ_MEDIA_VIDEO",
        "android.permission.READ_CONTACTS",
        "android.permission.CAMERA",
          "READ_MEDIA_IMAGES",
            "READ_MEDIA_VIDEO",
            "READ_CONTACTS",
          "CAMERA"
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
      "version": "0.22.42",
    },
    "updates": {
      "url": "https://u.expo.dev/e0c26aeb-0710-4a0c-8057-e4415032c70b",
      "fallbackToCacheTimeout": 0
    },
    "runtimeVersion": {
      "policy": "sdkVersion",
    }
  },
  "hooks": {
    "postPublish": [
      {
        "file": "sentry-expo/upload-sourcemaps",
        "config": {
          "organization": "timestack",
          "project": "sentry project name, or use the `SENTRY_PROJECT` environment variable"
        }
      }
    ]
  }
}
