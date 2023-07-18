import { SocialProfileInterface, UserInterface } from "@shared-types/*";
import { View, Alert } from "react-native";
import SmallButton from "./Library/SmallButton";
import moment from "moment";
import HTTPClient from "../httpClient";

export default function ConnectionStatus({ profile, user, refresh, style }: {
    profile: SocialProfileInterface,
    user: UserInterface
    refresh: () => void,
    style?: any
}) {

    const add = () => {
        HTTPClient("/social-profiles/user/" + user._id + "/add", "POST")
            .then(refresh)
            .catch(err => {
                console.log(err);
            });
    }


    const accept = () => {
        HTTPClient("/social-profiles/user/" + user._id + "/accept", "POST")
            .then(refresh)
            .catch(err => {
                console.log(err);
            });
    }


    return <View style={{ flex: 1, flexDirection: "row", ...style }}>
        {profile?.status === "NONE" ? <SmallButton variant="default" onPress={add} body={"Add"} fontSize={20} width={"100%"} /> : null}
        {profile?.status === "PENDING" && profile.canAccept ? <SmallButton variant="positive" onPress={() => {
            Alert.alert(`Accept ${user?.firstName}'s request?`, "", [
                {
                    text: "Decline",
                },
                {
                    text: "Accept",
                    onPress: accept,
                    style: "default"
                }
            ])
        }} body={"Respond"} fontSize={20} width={"40%"} /> : null}
        {profile?.status === "PENDING" && !profile.canAccept ? <SmallButton variant="pending" onPress={refresh} body={"Pending"} fontSize={20} width={"100%"} /> : null}
        {profile?.status === "ACTIVE" ? <SmallButton variant="added" onPress={refresh} body={moment.duration(moment().diff(moment(profile.activeSince))).asDays().toFixed(0) + " days"} fontSize={20} width={"100%"} /> : null}
    </View>

}