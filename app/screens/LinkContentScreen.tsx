import {ActivityIndicator, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {SearchBar} from "react-native-elements";
import ListOfPeople from "../Components/People/List";
import SwipeUpDownModal from "react-native-swipe-modal-up-down";
import * as React from "react";
import {useEffect, useState} from "react";
import {useMutation, useQuery} from "react-query";
import {listProfiles} from "../queries/profiles";
import {linkContent} from "../queries/content";
import {MediaHolderTypesType} from "@shared-types/*";
import FastImage from "react-native-fast-image";
import {useRoute, RouteProp, useNavigation} from "@react-navigation/native";
import {MediaViewScreenNavigationProp, RootStackParamList} from "../navigation";
import LargeButton from "../Components/Library/LargeButton";
import {getMutuals, getPeople} from "../queries/people";
import TextComponent from "../Components/Library/Text";
import ProfilePicture from "../Components/ProfilePicture";

export default function LinkContentScreen({}) {

    const route = useRoute<RouteProp<RootStackParamList, "LinkContent">>();
    const navigation = useNavigation<MediaViewScreenNavigationProp>();

    const [linking, setLinking] = useState(false);

    const {
        contentId,
        sourceHolderId,
        holderType,
    } = route.params;

    const [searchQuery, setSearchQuery] = useState("");

    const [selectedProfiles, setSelectedProfiles] = React.useState<{
        userId: string;
        profileId: string;
    }[]>([]);

    const {
        data: people,
    } = useQuery(["people", { searchQuery, getConnectedOnly: true }], getPeople, {
    });


    const mutation = useMutation({
        mutationFn: linkContent
    });

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerTransparent: false,
            headerLeft: () => <TextComponent fontFamily={"Semi Bold"} style={{
                fontSize: 24,
            }}>Share</TextComponent>,
            headerTitle: "",
            headerTitleAlign: "left",
            headerRight: () => route.params.people.length > 1 ? <TouchableOpacity onPress={() => {
                navigation.replace("ManageContentLinks", {
                    contentId: route.params.contentId,
                    people: route.params.people,
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
                <View style={{
                    flexDirection: "row-reverse",
                    alignItems: "center",
                }}>
                    {route.params.people
                        .sort((a, b) => {
                            return a.profilePictureSource ? -1 : 1
                        }).slice(0, 4).sort((a, b) => a._id > b._id ? 1 : -1)
                        .reverse().map((user, index) => {
                        return <ProfilePicture key={index} userId={user._id} location={user.profilePictureSource} width={25} height={25} style={{
                            borderRadius: 100,
                            marginLeft: -10,
                            borderWidth: 1,
                            borderColor: "black",
                            backgroundColor: "white",
                        }} />

                    })}
                    <TextComponent fontFamily={"Semi Bold"} style={{
                        fontSize: 18,
                        marginRight: 15,
                    }}>Edit</TextComponent>
                </View>

            </TouchableOpacity> : null,
            // @ts-ignore
            headerSearchBarOptions: {
                placeholder: "Search",
                onChangeText: (event) => {
                    setSearchQuery(event.nativeEvent.text);
                },
                hideWhenScrolling: false,
            }



        })
    }, [navigation]);


    return <View style={styles.containerContent}>
        <View style={{
            flex: 11
        }}>
            <ListOfPeople
                pressToProfile={false}
                refresh={() => {}}
                mode={"multiselect"}
                profileSelected={(userId, profileId) => {
                    console.log(selectedProfiles)
                    const profile = selectedProfiles?.find(profile => profile.profileId === profileId);
                    if (profile) {
                        setSelectedProfiles(selectedProfiles.filter(profile => profile.profileId !== profileId));
                    } else {
                        setSelectedProfiles([...selectedProfiles, {
                            userId,
                            profileId
                        }]);
                    }
                }}
                selectedProfiles={selectedProfiles.map(profile => profile.userId)}
                people={people?.people}
                style={{
                    height: "100%",
                }}
                viewStyle={{padding: 10}}
                loading={false}
            />
        </View>
        {selectedProfiles.length > 0 ?

           <View style={{
               flex: 1,
               bottom: 30,
                alignSelf: "center",
               width: Dimensions.get("window").width - 40,
               // zIndex: 1000
           }}>
               {!linking ? <LargeButton fontSize={18} onPress={async () => {

                    setLinking(true);
                    for await (const profile of selectedProfiles) {

                        await mutation.mutateAsync({
                               contentId,
                               sourceHolderId,
                               holderType,
                               targetHolderId: profile.profileId,
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
                     <TextComponent fontFamily={"Semi Bold"} fontSize={18} style={{color: "black"}}>Share</TextComponent>
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
