import * as FileSystem from "expo-file-system";
import { Request } from "aws4";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { Alert } from "react-native";
import Share from "react-native-share";

export default async function (networkLocation: Request, action: "download" | "share") {
    try {

        const itemUrl = "https://" + networkLocation.host + "/" +networkLocation.path;
        const fileName = networkLocation.path.split("/").pop();
        const locationUrl = FileSystem.documentDirectory + fileName

        console.log(itemUrl, locationUrl);
        await FileSystem.downloadAsync(itemUrl, FileSystem.documentDirectory + fileName, {
            // @ts-ignore
            headers: networkLocation.headers
        })

        if (action === "download") {
            await CameraRoll.save(locationUrl);
            Alert.alert("Saved", "");
        }
        else if (action === "share") {
            try {
                await Share.open({
                    url: locationUrl,
                });
            } catch (err) {
                console.log(err);
            }
            await FileSystem.deleteAsync(locationUrl);
        }

    } catch (err) {
        console.log(err);
        Alert.alert("Failed to save", "");
    }
}