import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to TimestackCore.web.ts
// and on native platforms to TimestackCore.ts
import TimestackCoreModule from './src/TimestackCoreModule';
import TimestackCoreView from './src/TimestackCoreView';
import { ChangeEventPayload, TimestackCoreViewProps } from './src/TimestackCore.types';

// Get the native constant value.
export const Name = TimestackCoreModule.Name;

export function hello(): string {
  return TimestackCoreModule.hello();
}

export async function fetchImages(page: number, pageSize: number) {
  return await TimestackCoreModule.fetchImages(page, pageSize);
}

export { TimestackCoreView, TimestackCoreViewProps, ChangeEventPayload };
