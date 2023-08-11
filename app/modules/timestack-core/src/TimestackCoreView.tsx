import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { TimestackCoreViewProps } from './TimestackCore.types';

const NativeView: React.ComponentType<TimestackCoreViewProps> =
  requireNativeViewManager('TimestackCore');

export default function TimestackCoreView(props: TimestackCoreViewProps) {
  return <NativeView {...props} />;
}
