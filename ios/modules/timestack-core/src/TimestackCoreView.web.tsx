import * as React from 'react';

import { TimestackCoreViewProps } from './TimestackCore.types';

export default function TimestackCoreView(props: TimestackCoreViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
