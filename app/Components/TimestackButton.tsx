import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useAppSelector } from '../store/hooks';
import TimestackMedia from './TimestackMedia';

export default function TimestackButton({ color, size, focused }: { color: string, size: number, focused: boolean }) {
    const rollState = useAppSelector(state => state.rollState);
    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity of 0

    const fadeIn = () => {
        fadeAnim.setValue(0); // Reset the animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
        }).start();
    };

    // Trigger the fade-in effect with a delay when the holderImageUrl changes
    useEffect(() => {
        if (rollState.holderImageUrl) {
            const timer = setTimeout(fadeIn, 100);
            return () => clearTimeout(timer);
        }
    }, [rollState.holderImageUrl]);

    // Trigger the fade-in effect with a delay when the holderImageS3Object changes
    useEffect(() => {
        if (rollState.holderImageS3Object) {
            const timer = setTimeout(fadeIn, 100);
            return () => clearTimeout(timer);
        }
    }, [rollState.holderImageS3Object]);

    const renderAnimatedFastImage = () => (
        <Animated.View style={{ opacity: fadeAnim, zIndex: 2 }}>
            <FastImage
                resizeMode='cover'
                style={{ width: 20, height: 20, zIndex: 1, position: "absolute", right: 0, borderRadius: 20, top: -5, borderColor: "white", borderWidth: 1.5 }}
                source={{ uri: rollState.holderImageUrl }}
            />
        </Animated.View>
    );

    const renderAnimatedTimestackMedia = () => (
        <Animated.View style={{ opacity: fadeAnim, zIndex: 2 }}>
            <TimestackMedia
                style={{ width: 20, height: 25, zIndex: 1, position: "absolute", right: 0, borderRadius: 5, top: -5, borderColor: "white", borderWidth: 1.5 }}
                itemInView={true}
                source={rollState.holderImageS3Object}
            />
        </Animated.View>
    );

    if (rollState.holderType === "socialProfile") {
        return (
            <View style={{}}>
                {renderAnimatedFastImage()}
                <FastImage resizeMode='contain' style={{ width: 40, height: 40, zIndex: 0 }} source={require("../assets/icons/collection/timestack.png")} />
            </View>
        );
    } else if (rollState.holderType === "event") {
        return (
            <View style={{}}>
                {renderAnimatedTimestackMedia()}
                <FastImage resizeMode='contain' style={{ width: 40, height: 40, zIndex: 0 }} source={require("../assets/icons/collection/timestack.png")} />
            </View>
        );
    }

    if (focused) {
        return <FastImage resizeMode='contain' style={{ width: 40, height: 40 }} source={require("../assets/icons/collection/timestack.png")} />;
    }

    return <FastImage resizeMode='contain' style={{ width: 40, height: 40 }} source={require("../assets/icons/collection/timestack.png")} />;
}
