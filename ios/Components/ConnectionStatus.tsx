import { SocialProfileInterface, UserInterface } from "@shared-types/*";
import { Touchable, View, Text, Alert } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import SmallButton from "./Library/SmallButton";
import { useState } from "react";
import HTTPClient from "../httpClient";

export default function ConnectionStatus({ profile, user, refresh }: {
    profile: SocialProfileInterface,
    user: UserInterface
    refresh: () => void
}) {

    const accept = () => {
        HTTPClient("/social-profiles/user/" + user._id + "/accept", "POST")
            .then(refresh)
            .catch(err => {
                console.log(err);
            });
    }


    return <View style={{ flex: 1, flexDirection: "row", margin: 10 }}>
        {profile?.status === "NONE" ? <SmallButton variant="default" onPress={refresh} body={"Add"} fontSize={20} width={"40%"} /> : null}
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
        {profile?.status === "PENDING" && !profile.canAccept ? <SmallButton variant="pending" onPress={refresh} body={"Pending"} fontSize={20} width={"40%"} /> : null}
        {profile?.status === "ACTIVE" ? <SmallButton variant="added" onPress={refresh} body={"XXX days"} fontSize={20} width={"40%"} /> : null}
    </View>

}