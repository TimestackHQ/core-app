import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to TimestackCore.web.ts
// and on native platforms to TimestackCore.ts
import TimestackCoreModule, { TimestackCoreNativeCompressionListener } from './src/TimestackCoreModule';
import TimestackCoreView from './src/TimestackCoreView';
import { ChangeEventPayload, TimestackCoreViewProps } from './src/TimestackCore.types';

// Get the native constant value.
export const Name = TimestackCoreModule.Name;

export const NativeClientVersion = TimestackCoreModule.NativeClientVersion;

export async function fetchImage(itemId: string, assetIdentifier: string, mediaTypeString: string, maxWidth?: number, maxHeight?: number, videoLength?: number) {
  return await TimestackCoreModule.fetchImage(itemId, assetIdentifier, mediaTypeString, maxWidth, maxHeight, videoLength);
}

export async function uploadFile(files: { [key: string]: string }, urlLocation: string, httpMethod: string, headers: {
  "Authorization": string,
}, urlParams: { [key: string]: string } = {}) {
  return await TimestackCoreModule.uploadFile(files, urlLocation, httpMethod, headers, urlParams);
}

export { TimestackCoreView, TimestackCoreViewProps, ChangeEventPayload, TimestackCoreNativeCompressionListener };
