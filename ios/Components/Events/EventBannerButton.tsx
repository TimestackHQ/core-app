import { useNavigation } from "@react-navigation/native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { EventScreenNavigationProp, RootStackParamList } from "../../navigation";
import { View, Text, StyleSheet } from "react-native";
import TimestackMedia from "../TimestackMedia";
import { dateFormatter } from "../../utils/time";
import FastImage from "react-native-fast-image";
import ProfilePicture from "../ProfilePicture";

const iconWidth = 25;


export function EventBannerButton({ event }) {

    const navigation = useNavigation<EventScreenNavigationProp>();

    return <TouchableWithoutFeedback onPress={() => navigation.navigate("Event", {
        eventId: event.publicId,
        eventName: event.name,
        eventLocation: event.location,
    })}>
        <View style={{ flexDirection: "row", flex: 1, ...styles.shadow, margin: 10, borderRadius: 15, height: 125 }}>
            <View style={{ flex: 3 }}>
                <TimestackMedia style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 15,
                    objectFit: "cover",
                    borderColor: "black",
                    borderWidth: 1,
                }} source={event?.thumbnailUrl} />
            </View>
            <View style={{ flex: 8, paddingLeft: 10, paddingTop: 10, zIndex: 10 }}>
                <Text style={{
                    fontSize: 15,
                    fontFamily: "Red Hat Display Semi Bold",
                    marginRight: 5
                }}>{event.name}</Text>
                <View style={{ justifyContent: "flex-end", flex: 1 }}>
                    <Text style={{ fontSize: 12, fontFamily: "Red Hat Display Regular", marginTop: 5 }}>{event.location}</Text>
                    <Text style={{ fontSize: 12, fontFamily: "Red Hat Display Regular", marginTop: 0 }}>{dateFormatter(new Date(event?.startsAt), event?.endsAt ? new Date(event?.endsAt) : null)}</Text>
                </View>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 5,
                }}>

                    {event?.people ? [...event?.people].map((user, i) => {
                        if (i === 6 && event?.peopleCount > 7) {
                            return (
                                <View style={{ marginRight: 5 }}>
                                    <View style={{
                                        backgroundColor: "black",
                                        opacity: 0.6,
                                        zIndex: 1,
                                        position: "absolute",
                                        right: 0,
                                        bottom: 0,
                                    }}>
                                        <Text>{event.peopleCount - 6}</Text>
                                    </View>
                                    <ProfilePicture
                                        userId={user.id}
                                        key={i}
                                        width={iconWidth}
                                        height={iconWidth}
                                        location={user.profilePictureSource}
                                    />
                                </View>
                            );
                        } else {
                            return (
                                <ProfilePicture
                                    userId={user.id}
                                    key={i}
                                    style={{ marginRight: 5 }}
                                    width={iconWidth}
                                    height={iconWidth}
                                    location={user.profilePictureSource}
                                />
                            );
                        }
                    }) : null}

                </View>
            </View>
            <View style={{ flex: 2, paddingTop: 15, flexDirection: "row", justifyContent: 'flex-end' }}>
                <Text style={{ fontSize: 12, fontFamily: "Red Hat Display Semi Bold", paddingTop: -10 }}>{event?.mediaCount}</Text>
                <FastImage style={{ width: 10, height: 10, marginTop: 3, marginLeft: 2, marginRight: 15 }} source={require("../../assets/icons/collection/picture.png")} />

            </View>
        </View>
    </TouchableWithoutFeedback>
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shadow: {
        backgroundColor: 'white',
        shadowColor: 'black',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 0,
    },
});