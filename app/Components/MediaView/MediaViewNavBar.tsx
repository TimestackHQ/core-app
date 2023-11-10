import {
    ActivityIndicator,
    Button,
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import ProfilePicture from "../ProfilePicture";
import FastImage from "react-native-fast-image";
import * as React from "react";
import { MediaInView } from "@api-types/public";
import {useState} from "react";
import mediaDownload from "../../utils/mediaDownload";
import LinkContent from "./LinkContent";
import {MediaHolderTypesType} from "@shared-types/*";


export default function MediaViewNavBar ({
    media,
    holderId,
    holderType,
}: {
    media: MediaInView,
    holderId: string,
    holderType: MediaHolderTypesType
}) {

    const [downloading, setDownloading] = useState(false);
    const [isLinkContentModalOpen, setIsLinkContentModalOpen] = useState(false);


    return <View style={{
        flex: 1, padding: 10, alignContent: "center", flexDirection: "row", backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 1,
    }}>
        <View>
            <ProfilePicture userId={media?.user?._id} location={media?.user?.profilePictureSource} width={35} height={35} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "column", justifyContent: "center" }}>
                <Text style={{ fontFamily: "Red Hat Display Semi Bold", fontSize: 17, marginBottom: 40, marginLeft: 10 }}>
                    {media?.user?.firstName} {media?.user?.lastName}
                </Text>

            </View>
        </View>
        <ActivityIndicator animating={downloading} style={{ position: 'absolute', right: 40, marginTop: 5 }} color={"#4fc711"} />
        <TouchableOpacity onPress={async () => {
            setDownloading(true);
            mediaDownload(media.fullsize, "download", setDownloading, false);
        }} style={{ position: 'absolute', right: 50, marginTop: 15, marginRight: 5 }} >
            <FastImage
                source={require("../../assets/icons/download.png")}
                style={{ width: 20, height: 20, marginLeft: 10 }}
            />
        </TouchableOpacity>
        <TouchableOpacity onPress={async () => {
            setIsLinkContentModalOpen(true);
            // navigator.navigate("LinkContent", {
            // 	contentId: media?.contentId,
            // 	sourceHolderId: route.params.holderId,
            // 	holderType: route.params.holderType,
            // });

        }
        } disabled={downloading} style={{ position: 'absolute', right: 10, marginTop: 15, marginRight: 5 }} >
            <FastImage
                resizeMode={"contain"}
                source={require("../../assets/icons/peopleadd.png")}
                style={{ width: 30, height: 20, marginLeft: 10 }}
            />
        </TouchableOpacity>

        <LinkContent
            contentId={media?.contentId}
            sourceHolderId={holderId}
            holderType={holderType}
            isLinkContentModalOpen={isLinkContentModalOpen}
            setIsLinkContentModalOpen={setIsLinkContentModalOpen}
        />




    </View>
}

