import {EventEmitter, requireNativeModule, Subscription} from 'expo-modules-core';
import { Platform } from 'react-native';

const TimeCore = Platform.OS === "android" ? {} : requireNativeModule('TimestackCore');

export function TimestackCoreNativeCompressionListener (listener): Subscription {

    const emitter = new EventEmitter(TimeCore);
    return emitter.addListener('onFetchImageProgress', listener);

}

export default TimeCore


