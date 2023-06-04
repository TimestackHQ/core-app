import Video from 'react-native-video';

export default function VideoView ({
    source
}) {
    return <Video		
            source={source}
            muted={true}
            resizeMode="cover"
            repeat={true}
            style={{borderRadius: 0, width: "100%", height: 180, zIndex: -1}}
        />
    
}