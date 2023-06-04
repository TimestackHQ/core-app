export type ChangeEventPayload = {
  value: string;
};

export type TimestackCoreViewProps = {
  onMediaPicked: (event: ChangeEventPayload) => void;
  style?: any;
};
