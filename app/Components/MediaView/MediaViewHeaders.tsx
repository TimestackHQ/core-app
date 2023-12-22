import {useState} from "react";
import {HeaderButtons, HiddenItem, OverflowMenu} from "react-navigation-header-buttons";
import {ActivityIndicator, Alert, Image, TouchableOpacity, View} from "react-native";
import mediaDownload from "../../utils/mediaDownload";
import * as React from "react";
import { MediaInView } from "@api-types/public";
import FastImage from "react-native-fast-image";

export default function MediaViewHeaders(
    { media, hasPermission, deleteMedia }: {
        media: MediaInView,
        hasPermission: boolean,
        deleteMedia: (mediaId, mediaContentId) => void
    }
) {

    const [sharing, setSharing] = useState(false);
    return <HeaderButtons>
        <View>
            <ActivityIndicator color={"#4fc711"} animating={sharing} style={{ marginTop: 5 }} />
        </View>
        <TouchableOpacity onPress={async () => {
            setSharing(true);
            mediaDownload(media?.fullsize, "share").finally(() => setSharing(false));
        }}>
            <FastImage source={require("../../assets/icons/collection/share.png")} style={{ width: 30, height: 30 }} />
        </TouchableOpacity>
        {hasPermission ? <OverflowMenu
            style={{ marginHorizontal: 10, marginRight: -10 }}
            OverflowIcon={({ color }) => <TouchableOpacity onPress={() => {
            }}>
                <FastImage source={require("../../assets/icons/collection/three-dots.png")} style={{ width: 35, height: 35 }} />
            </TouchableOpacity>}
        >
            <HiddenItem title="Delete" onPress={() => {
                Alert.alert("Delete", "Are you sure you want to delete this item?", [
                    {
                        text: "Cancel",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel"
                    },
                    { text: "Yes", onPress: () => deleteMedia(media?._id, media?.contentId) }

                ]);
            }} />
        </OverflowMenu> : null}
    </HeaderButtons>
}