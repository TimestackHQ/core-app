import {SafeAreaView, TouchableOpacity, View} from "react-native";
import {RouteProp, useRoute} from "@react-navigation/native";
import {RootStackParamList} from "../navigation";
import ProfilePicture from "../Components/ProfilePicture";
import TextComponent from "../Components/Library/Text";

export default function SocialProfileSettingsScreen () {

    const route = useRoute<RouteProp<RootStackParamList, "SocialProfileSettings">>();

    const {
        user,
        profile,
    } = route.params;

    return <SafeAreaView style={{
        flex: 1,
        backgroundColor: "white",
    }}>


        <View style={{
            flex: 2,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
        }}>

            <ProfilePicture style={{
                borderColor: "black",
                borderWidth: 2,
            }} width={125} height={125} userId={user._id} location={user?.profilePictureSource} />
            <TextComponent numberOfLines={2} fontFamily={"Athelas"} style={{
                fontSize: 30,
                fontWeight: 100,
                marginTop: 20,
                letterSpacing: -1,
                textAlign: "center",
            }}>{user?.firstName} {user?.lastName}</TextComponent>

        </View>

        <View style={{
            flex: 3,
            marginBottom: 40
        }}>
            <View style={{
                margin: 20,
                padding: 15,
                paddingTop: 10,
                borderColor: "#A6A6A6",
                borderRadius: 20,
                borderWidth: 1,
                height: "100%"
            }}>
                <TextComponent fontFamily={"Bold"} style={{
                    fontSize: 30,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingBottom: 10,
                    borderBottomWidth: 1,
                    borderColor: "#A6A6A6",
                }}>Profile</TextComponent>


                <TouchableOpacity style={{
                    flexDirection: "row",
                    width: "100%",
                    height: 60,
                    borderBottomWidth: 1,
                    borderColor: "#A6A6A6",
                }}>
                    <TextComponent fontFamily={"Semi Bold"} style={{
                        flex: 1,
                        fontSize: 18,
                        padding: 10,
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "center",
                    }}>Edit Profile</TextComponent>
                </TouchableOpacity>

            </View>
        </View>



    </SafeAreaView>
}