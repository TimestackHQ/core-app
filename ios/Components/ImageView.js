import { useState, useEffect } from 'react';
import { Image, Dimensions, View, Text } from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';
import Pinchable from 'react-native-pinchable';

const { width } = Dimensions.get('window');

const ImageViewCore = ({item}) => {
    return <Image
        source={{ uri: item?.storageLocation }}
        style={{ width, height: "100%", resizeMode: "contain" }}
    />
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