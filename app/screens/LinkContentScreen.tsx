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

export default function LinkContent({}) {

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
            // @ts-ignore
            headerSearchBarOptions: {
                visible: true,
                autoFocus: true,
                hideWhenScrolling: false,
                onChangeText: (event) => {
                    console.log(event.nativeEvent.text);
                    setSearchQuery(event.nativeEvent.text);
                }
            },

        })
    }, [navigation]);


    return <View style={styles.containerContent}>
        {/*<TextComponent fontFamily={"Semi Bold"} style={{*/}
        {/*    marginTop: 10,*/}
        {/*    marginLeft: 10,*/}
        {/*    fontSize: 24, marginBottom: 0*/}
        {/*}}>Share</TextComponent>*/}
        {/*<SearchBar*/}
        {/*    placeholder={"Search for people"}*/}
        {/*    style={{height: 100}}*/}
        {/*    platform={Platform.OS === "ios" ? "ios" : "android"}*/}
        {/*    round={true} cancelButtonTitle={""} showCancel={false}*/}

        {/*    containerStyle={{*/}
        {/*        flex: 1,*/}
        {/*        borderRadius: 10,*/}
        {/*        height: 700,*/}
        {/*        backgroundColor: "#F2F2F2",*/}
        {/*        margin: 10,*/}
        {/*    }}*/}

        {/*    inputContainerStyle={{*/}
        {/*        flex: 1,*/}
        {/*        height: 800,*/}
        {/*        backgroundColor: "#F2F2F2",*/}
        {/*    }}*/}

        {/*    rightIconContainerStyle={{*/}
        {/*        // width: 10,*/}
        {/*        // marginRight: 10,*/}
        {/*        height: 500,*/}
        {/*    }}*/}

        {/*    inputStyle={{*/}
        {/*        fontSize: 16,*/}
        {/*        fontFamily: "Red Hat Display Regular",*/}

        {/*    }}*/}
        {/*    cancelButtonProps={{ color: "black" }}*/}
        {/*    //@ts-ignore*/}
        {/*    onChangeText={(text) => { setSearchQuery(text) }}*/}
        {/*    value={searchQuery}*/}
        {/*    lightTheme*/}
        {/*/>*/}
        <View style={{
            flex: 11
        }}>
            <ListOfPeople
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
