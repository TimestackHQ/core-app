import {Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {SearchBar} from "react-native-elements";
import ListOfPeople from "../People/List";
import SwipeUpDownModal from "react-native-swipe-modal-up-down";
import * as React from "react";
import {useEffect, useState} from "react";
import {useMutation, useQuery} from "react-query";
import {listProfiles} from "../../queries/profiles";
import {linkContent} from "../../queries/content";
import {MediaHolderTypesType} from "@shared-types/*";
import FastImage from "react-native-fast-image";

export default function LinkContent({
    contentId,
    sourceHolderId,
    holderType,
    isLinkContentModalOpen,
    setIsLinkContentModalOpen,
}: {
    contentId: string;
    sourceHolderId: string;
    holderType: MediaHolderTypesType;
    isLinkContentModalOpen: boolean;
    setIsLinkContentModalOpen: (isOpen: boolean) => void;
}) {

    const [searchPeople, setSearchPeople] = useState("");

    const [selectedProfiles, setSelectedProfiles] = React.useState<{
        userId: string;
        profileId: string;
    }[]>([]);

    const { data: profiles, status: profilesStatus } = useQuery(["profiles", {  }], listProfiles, {
    });

    useEffect(() => {
        console.log(selectedProfiles);
    }, [selectedProfiles]);

    useEffect(() => {
        if (!isLinkContentModalOpen) {
            setSearchPeople("");
            setSelectedProfiles([]);
        }
    }, [isLinkContentModalOpen]);


    const mutation = useMutation({
        mutationFn: linkContent
    });

    useEffect(() => {
        if (mutation.isSuccess) {
            setTimeout(() => {
                setIsLinkContentModalOpen(false);
                mutation.reset();
            }, 500);
        }
    }, [mutation.isSuccess]);


    let [animateModal, setanimateModal] = useState(false);
    return <SwipeUpDownModal
        modalVisible={isLinkContentModalOpen}
        PressToanimate={animateModal}
        //if you don't pass HeaderContent you should pass marginTop in view of ContentModel to Make modal swipeable
        ContentModal={
            <View style={styles.containerContent}>
                {/*<Text>hello</Text>*/}

                <View style={{
                    flex: 1,
                    marginTop: 0,
                    alignItems: "center",
                    flexDirection: "column",
                }}>

                    <View style={{
                        backgroundColor: "black",
                        opacity: 0.36,
                        height: 6,
                        width: 40,
                        borderRadius: 100,
                    }}>
                    </View>
                    <SearchBar
                        style={{height: 100}}
                        platform={Platform.OS === "ios" ? "ios" : "android"}
                        round={true} cancelButtonTitle={""} showCancel={false}

                        containerStyle={{
                            flex: 1,
                            borderRadius: 10,
                            height: 500,
                            backgroundColor: "#F2F2F2",
                            margin: 10,
                        }}

                        inputContainerStyle={{
                            flex: 1,
                            borderRadius: 10,
                            width: "97%",
                            height: 500,
                            backgroundColor: "#F2F2F2",
                        }}

                        rightIconContainerStyle={{
                            // width: 10,
                            // marginRight: 10,
                            height: 500,
                        }}

                        inputStyle={{
                            fontSize: 16,
                            fontFamily: "Red Hat Display Regular",

                        }}
                        cancelButtonProps={{ color: "black" }}
                        // @ts-ignore
                        onChangeText={(text) => { setSearchPeople(text) }}
                        value={searchPeople}
                        lightTheme
                    />
                    <ListOfPeople
                        refresh={() => {}}
                        mode={"multiselect"}
                        profileSelected={(userId, profileId) => setSelectedProfiles(selectedProfiles.find(profile => profile.profileId === profileId) ? [] : [{
                            userId,
                            profileId
                        }])}
                        selectedProfiles={selectedProfiles.map(profile => profile.userId)}
                        people={profiles}
                        style={{ height: "100%", padding: 10, width: Dimensions.get("window").width, paddingBottom: 300}}
                        viewStyle={{marginBottom: 135, margin: 10}}
                        loading={profilesStatus === "loading"}
                    />
                    {selectedProfiles.length > 0 ? <TouchableOpacity onPress={() => {
                        console.log("mutate", contentId);
                        mutation.mutate({
                            contentId,
                            sourceHolderId,
                            holderType,
                            targetHolderId: selectedProfiles[0].profileId,
                        });
                    }} style={{
                        flex: 2,
                        zIndex: 30,
                        width: "90%",
                        height: 50,
                        backgroundColor: "white",
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 25,
                        shadowColor: 'black',
                        shadowOffset: {
                            width: 0,
                            height: 0
                        },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 1000,
                        position: "absolute",
                        bottom: 30,
                    }} >
                        <Text style={{ fontSize: 20, fontFamily: "Red Hat Display Semi Bold", zIndex: 3, color: "black" }}>
                           Add
                        </Text>
                    </TouchableOpacity> : null}

                </View>

            </View>
        }
        ContentModalStyle={styles.Modal}

        onClose={() => {
            setIsLinkContentModalOpen(false);
            setanimateModal(false);
            setSearchPeople("");
            setSelectedProfiles([]);
        }}
    />
}

const styles = StyleSheet.create({
    containerContent: {flex: 1, marginTop: 10},
    Modal: {
        flex: 1,
        backgroundColor: 'white',
        marginTop: "100%",
    }
});
