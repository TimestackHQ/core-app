import React, { useRef, useEffect } from 'react';
import { Animated, Easing, View } from 'react-native';
import CircularProgress from "react-native-circular-progress-indicator";

const Spinner = () => {
    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        rotate();
    }, []);

    const rotate = () => {
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    };

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: 'transparent',
                    transform: [{ rotate: spin }],
                }}
            >
                <CircularProgress
                    radius={12}
                    activeStrokeWidth={4}
                    inActiveStrokeWidth={2}
                    inActiveStrokeOpacity={0}
                    circleBackgroundColor={"transparent"}
                    activeStrokeColor={"#d0d0d0"}
                    showProgressValue={false}
                    value={33}
                />
            </Animated.View>
        </View>
    );
};

export default Spinner;