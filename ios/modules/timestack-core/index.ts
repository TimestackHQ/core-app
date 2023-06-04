import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to TimestackCore.web.ts
// and on native platforms to TimestackCore.ts
import TimestackCoreModule from './src/TimestackCoreModule';
import TimestackCoreView from './src/TimestackCoreView';
import { ChangeEventPayload, TimestackCoreViewProps } from './src/TimestackCore.types';

// Get the native constant value.
export const Name = TimestackCoreModule.Name;

export const NativeClientVersion = TimestackCoreModule.NativeClientVersion;

export async function fetchImage(assetIdentifier: string, mediaTypeString: string, maxWidth?: number, maxHeight?: number, videoLength?: number) {
  return await TimestackCoreModule.fetchImage(assetIdentifier, mediaTypeString, maxWidth, maxHeight, videoLength);
}

export { TimestackCoreView, TimestackCoreViewProps, ChangeEventPayload };
