import { BlurView } from "@react-native-community/blur";
import React, {useContext, useEffect, useState} from "react";
import { ActivityIndicator, Text, Touchable, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { UploadQueueScreenNavigationProp } from "../navigation";
import {QueueContext} from "../hooks/queue";
import TextComponent from "../Components/Library/Text";

export default function UploadQueueTracker({ holderId, holderType, variant, style }: {
    holderId: string,
    holderType: "socialProfile" | "event",
    variant: "shadow" | "outline",
    style?: any
}) {

    const navigator = useNavigation<UploadQueueScreenNavigationProp>();
    const [queueCounter] = useContext(QueueContext);

    const [visible, setVisible] = useState(true);

    useEffect(() => {

    }, [queueCounter]);

    // useEffect(() => {
    //     setVisible(false);
    // }, [holderId, holderType]);

    return queueCounter !== 0 ? <View style={{
        borderRadius: 10,
        ...(variant === "shadow" ? {
            shadowColor: "black",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 5,
        } : {
            borderWidth: 1,
            borderColor: "black"
        }),
        width: "60%",
        ...style
    }}>
        <BlurView
            style={{
                borderRadius: 10,
            }}
            blurType="xlight"
            blurAmount={10}
            reducedTransparencyFallbackColor="xwhite"
        >


            {queueCounter !== 0 ? <TouchableOpacity onPress={() => {
                navigator.navigate("UploadQueue", {
                    holderId: holderId,
                    holderType: holderType
                });
            }} style={{ width: "100%", height: "100%", paddingLeft: 10, paddingRight: 11, paddingTop: 4, paddingBottom: 4, borderRadius: 8, overflow: 'hidden', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                <View style={{ flexDirection: "row", height: "100%" }}>
                    <ActivityIndicator animating={true} style={{ marginTop: 8, marginRight: 10, height: "50%", }} color={"black"} />
                    <TextComponent
                        fontFamily={"Regular"}
                        fontSize={16}
                        style={{
                            textAlign: "right",
                            alignContent: "flex-end",
                            justifyContent: "flex-end",
                            top: 5
                        }}
                    >{queueCounter} remaining</TextComponent>
                </View>
                <Text style={{
                    fontFamily: "Red Hat Display Regular",
                    textAlign: "right",
                    alignContent: "flex-end",
                    justifyContent: "flex-end",
                    marginLeft: 5,
                    fontSize: 16
                }}>5s</Text>
            </TouchableOpacity> : <View style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: 'center' }}>
                <Text style={{
                    fontFamily: "Red Hat Display Regular",
                    textAlign: "center",
                    alignContent: "flex-end",
                    justifyContent: "flex-end",
                    marginLeft: 5,
                    fontSize: 16
                }}>Upload complete</Text>
            </View>}
        </BlurView>
    </View > : null
}