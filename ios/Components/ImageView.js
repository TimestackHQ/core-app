import { useState, useEffect } from 'react';
import { Image, Dimensions, View, Text } from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';
import FastImage from 'react-native-fast-image';
import Pinchable from 'react-native-pinchable';

const { width } = Dimensions.get('window');

const ImageViewCore = ({item}) => {
    // alert(JSON.stringify(item));
    return <View style={{ width, height: "100%", resizeMode: "contain" }}>
        <FastImage
            fadeDuration={0}
            source={{ uri: item?.storageLocation }}
            resizeMode={FastImage.resizeMode.contain}
            style={{ zIndex: 1, width, height: "100%", resizeMode: "contain" }}
        />
        <FastImage
            source={{ uri: item?.thumbnail }}
            resizeMode={FastImage.resizeMode.contain}
            style={{ width, height: "100%", resizeMode: "contain", position: "absolute", top: 0, left: 0 }}
        />
    </View>
}

export default function ImageView ({item}) {

    function imageViewer () {
        return <ImageViewCore item={item}/>
    }

    return <ErrorBoundary FallbackComponent={() => imageViewer()}>
        <Pinchable maximumZoomScale={5}>
            {imageViewer()}
        </Pinchable>
    </ErrorBoundary>
}