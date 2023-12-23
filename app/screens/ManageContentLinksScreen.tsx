import {ActivityIndicator, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import ListOfPeople from "../Components/People/List";
import * as React from "react";
import {useEffect, useState} from "react";
import {useMutation, useQuery} from "react-query";
import {linkContent, unlinkContent} from "../queries/content";
import {useRoute, RouteProp, useNavigation} from "@react-navigation/native";
import {MediaViewScreenNavigationProp, RootStackParamList, LinkContentScreenNavigationProp} from "../navigation";
import LargeButton from "../Components/Library/LargeButton";
import TextComponent from "../Components/Library/Text";

export default function ManageContentLinksScreen({}) {

    const route = useRoute<RouteProp<RootStackParamList, "ManageContentLinks">>();
    const navigation = useNavigation<LinkContentScreenNavigationProp>();

    const [linking, setLinking] = useState(false);

    const {
        contentId,
        people,
    } = route.params;

    const [selectedProfiles, setSelectedProfiles] = React.useState<{
        userId: string;
        profileId: string;
    }[]>(people.map(user => ({
        userId: user._id,
        profileId: user.profileId,
    })));

    const mutation = useMutation({
        mutationFn: unlinkContent
    });

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerTransparent: false,
            headerLeft: () => <TextComponent fontFamily={"Semi Bold"} style={{
                fontSize: 24,
            }}>Shared with</TextComponent>,
            headerTitle: "",
            headerTitleAlign: "left",
            headerRight: () => <TouchableOpacity onPress={() => {
                navigation.replace("LinkContent", {
                    contentId,
                    people,
                    sourceHolderId: route.params.sourceHolderId,
                    holderType: route.params.holderType,
                });
            }} style={{
                backgroundColor: "white",
                borderRadius: 30,
                borderColor: "black",
                borderWidth: 1,
                paddingHorizontal: 10,
                paddingVertical: 5,
            }}>
                <TextComponent fontFamily={"Semi Bold"} style={{
                    fontSize: 18,
                }}>Add people</TextComponent>
            </TouchableOpacity>

        })
    }, [navigation]);


    return <View style={styles.containerContent}>
        <View style={{
            flex: 11
        }}>
            <ListOfPeople
                pressToProfile={false}
                disableRefresh={true}
                refresh={() => {}}
                mode={"multiselect"}
                profileSelected={(userId, profileId) => {
                    console.log(userId, profileId, selectedProfiles)
                    const profile = selectedProfiles.find(profile => profile.profileId === profileId);
                    if(profile) {
                        setSelectedProfiles(selectedProfiles.filter(profile => profile.profileId !== profileId));
                    } else {
                        setSelectedProfiles([...selectedProfiles, {
                            userId,
                            profileId
                        }]);
                    }
                }}
                selectedProfiles={selectedProfiles.map(profile => profile.userId)}
                people={people}
                style={{
                    height: "100%",
                }}
                viewStyle={{padding: 10}}
                loading={false}
            />
        </View>
        {selectedProfiles.length !== people.length ?

            <View style={{
               flex: 1,
               bottom: 30,
                alignSelf: "center",
               width: Dimensions.get("window").width - 40,
            }}>
                {!linking ? <LargeButton fontSize={18} onPress={async () => {

                    setLinking(true);

                    const unselectedProfiles = people.filter(profile => !selectedProfiles.find(selectedProfile => selectedProfile.profileId === profile.profileId));
                    for await (const profile of selectedProfiles) {

                        await mutation.mutateAsync({
                            contentId,
                            socialProfilesToUnlink: unselectedProfiles.map(profile => profile.profileId),
                            eventsToUnlink: [],
                        });
                    }
                    setLinking(false);
                    navigation.goBack();
                }} style={{
                    height: 50,
                    shadowColor: 'black',
                    shadowOffset: {
                        width: 0,
                        height: 0
                    },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 1,
                    width: Dimensions.get("window").width - 20,
                    alignItems: "center",

                }} >
                    <TextComponent fontFamily={"Semi Bold"} fontSize={18} style={{color: "black"}}>Save</TextComponent>
                </LargeButton> : <LargeButton fontSize={18} style={{
                   height: 50,
                   shadowColor: 'black',
                   shadowOffset: {
                       width: 0,
                       height: 0
                   },
                   shadowOpacity: 0.2,
                   shadowRadius: 8,
                   elevation: 1,
                   borderColor: "#2a2a2a",
                    borderWidth: 1,
                   width: Dimensions.get("window").width - 20,
                   alignItems: "center",

                }} >
                    <ActivityIndicator size={"small"} color={"#2a2a2a"} style={{
                        flex: 1,
                        marginTop: 17,
                        paddingTop: 5,
                    }} />
                </LargeButton>}
            </View>
        : null}
    </View>

}

const styles = StyleSheet.create({
    containerContent: {flex: 1, backgroundColor: "white",},

});
