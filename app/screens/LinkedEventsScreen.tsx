import { TouchableOpacity, View } from "react-native";
import { EventScreenNavigationProp, RootStackParamList } from "../navigation";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useQuery } from "react-query";
import { getLinkedEvents } from "../queries/events";
import { FlatList } from "react-native-gesture-handler";
import TextComponent from "../Components/Library/Text";
import TimestackMedia from "../Components/TimestackMedia";
import { useEffect } from "react";

export default function LinkedEvents() {

    const route = useRoute<RouteProp<RootStackParamList, "LinkedEvents">>();
    const navigator = useNavigation<EventScreenNavigationProp>();

    const { data: linkedEvents, refetch: refetchLinkedEvents } = useQuery(["linkedEvents", { eventId: route.params.eventId }], getLinkedEvents);

    useEffect(() => {
        navigator.setOptions({
            headerBackTitleVisible: true,
            headerBackTitle: route.params.eventName,
        });
    }, [route.params.eventName]);
    return <View style={{
        flex: 1,
        flexDirection: "row",
        backgroundColor: "white",
    }}>
        <FlatList
            style={{
                flex: 1,
                width: "100%",
                marginHorizontal: 10,
            }}

            numColumns={2}
            data={linkedEvents}
            renderItem={({ item }) => {
                return <TouchableOpacity style={{
                    width: "50%",
                    borderRadius: 15,
                    overflow: 'hidden',
                    height: 230,
                }} onPress={() => {
                    // navigator.goBack();
                    navigator.push("Event", {
                        eventId: item._id,
                        eventName: item.name,
                    })
                }}>
                    <TextComponent
                        fontFamily="Semi Bold"
                        fontSize={20}
                        style={{
                            zIndex: 2,
                            width: "100%",
                            textAlign: "center",
                            marginTop: 10,
                            marginBottom: 15,
                            color: "white",
                            position: "absolute",
                            shadowColor: "black",
                            shadowOpacity: 1,
                            shadowOffset: {},
                            shadowRadius: 10,
                        }}
                    >{item.name}
                    </TextComponent>

                    <TimestackMedia
                        itemInView
                        source={item.storageLocation}
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            zIndex: 1
                        }}
                    />
                </TouchableOpacity>
            }
            }
        />
    </View>
}