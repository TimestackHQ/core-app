import { SocialProfileInterface, UserInterface } from "@shared-types/public";
import { RouteProp, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import HTTPClient from "../httpClient";
import { RootStackParamList, SocialProfileScreenNavigationProp } from "../navigation";
import ProfilePicture from "../Components/ProfilePicture";
import { FlatList, RefreshControl } from "react-native-gesture-handler";
import ConnectionStatus from "../Components/ConnectionStatus";

export default function SocialProfile({ }) {

    const route = useRoute<RouteProp<RootStackParamList, "SocialProfile">>();
    const navigator = useNavigation();
    const isFocused = useIsFocused();
    const [refreshing, setRefreshing] = useState(false);

    const [profile, setProfile] = useState<SocialProfileInterface>(null);
    const [user, setUser] = useState<UserInterface>(null);

    useEffect(() => {
        if (isFocused) {
            HTTPClient("/social-profiles/user/" + route.params?.userId, "GET").then(res => {
                setProfile(res.data);
                setUser(res.data.users[0]);
            })
                .finally(() => {
                    setRefreshing(false);
                });
        }
    }, [isFocused, refreshing]);

    useEffect(() => {
        navigator.setOptions({
            headerBackTitle: "Back",
            headerBackButtonVisible: true,
            headerShown: true,
            headerTitle: () => (
                <View style={{ flex: 1, flexDirection: "row" }}>
                    <View style={{ flex: 1, alignItems: "flex-end" }}>
                        <ProfilePicture
                            userId={String(user?._id)}
                            width={40}
                            height={40}
                            style={{ marginRight: 10 }}
                            location={user?.profilePictureSource}
                        />
                    </View>
                    <View style={{ flex: 3, alignItems: "flex-start" }}>
                        <Text style={{
                            fontSize: 18, fontFamily: "Red Hat Display Bold",
                            marginBottom: 0
                        }}>
                            {user?.firstName} {user?.lastName}
                        </Text>
                        <Text style={{
                            fontSize: 16, fontFamily: "Red Hat Display Regular", marginTop: -5
                        }}>
                            {user?.username}
                        </Text>
                    </View>
                </View>
            )
        });
    }, [profile, user]);

    const refresh = () => {
        setRefreshing(true);
    }

    return <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <FlatList
            style={{ flex: 1 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
            data={[]}
            ListHeaderComponent={() => (
                <View style={{ flex: 1 }}>
                    <ConnectionStatus refresh={refresh} profile={profile} user={user} />
                </View>
            )}
            renderItem={({ item }) => {
                return <View />
            }}
        />
    </SafeAreaView>

}