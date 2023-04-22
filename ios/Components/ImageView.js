import { Image, Dimensions } from 'react-native';
import Pinchable from 'react-native-pinchable';

const { width } = Dimensions.get('window');

export default function ImageView ({item}) {
    return <Pinchable maximumZoomScale={5}>
    <Image
        source={{ uri: item?.storageLocation }}
        style={{ width, height: "100%", resizeMode: "contain" }}
    />
</Pinchable>
}