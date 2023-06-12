import { requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

// It loads the native module object from the JSI or falls back to
// the bridge module (from NativeModulesProxy) if the remote debugger is on.
// export default ;

const module = Platform.OS === "android" ? {} : requireNativeModule('TimestackCore');
export default module


