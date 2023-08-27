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

    if(!user || !profile) return null;

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

    const decline = () => {
        HTTPClient("/social-profiles/user/" + user._id + "/decline", "POST")
            .then(refresh)
            .catch(err => {
                console.log(err);
            });
    }


    return user ? <View style={{ flex: 1, flexDirection: "row", ...style }}>
        {profile?.status === "NONE" ? <SmallButton variant="default" onPress={add} body={"Add"} fontSize={20}  /> : null}
        {profile?.status === "PENDING" && profile.canAccept ? <SmallButton variant="positive" onPress={() => {
            Alert.alert(`Accept ${user?.firstName}'s request?`, "", [
                {
                    text: "Decline",
                    onPress: decline
                },
                {
                    text: "Accept",
                    onPress: accept,
                    style: "default"
                }
            ])
        }} body={"Respond"} fontSize={20}  /> : null}
        {profile?.status === "PENDING" && !profile.canAccept ? <SmallButton variant="pending" body={"Pending"} fontSize={20} onPress={() => {
            Alert.alert(`Cancel add request ?`, "", [
                {
                    text: "Cancel",
                },
                {
                    text: "Yes",
                    onPress: decline,
                    style: "default"
                }
            ])}
        } /> : null}
        {profile?.status === "ACTIVE" ? <SmallButton notClickable variant="added" onPress={refresh} body={Math.abs(moment.duration(moment().diff(moment(profile.activeSince))).asDays()).toFixed(0) + " days"} fontSize={20} /> : null}
    </View> : null

}