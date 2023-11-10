import {SafeAreaView, View} from "react-native";
import {linkContent} from "../queries/content";
import {useMutation, useQuery} from "react-query";
import {useRoute, RouteProp} from "@react-navigation/native";
import {RootStackParamList} from "../navigation";
import ListOfPeople from "../Components/People/List";
import React from "react";
import {listProfiles} from "../queries/profiles";
import SmallButton from "../Components/Library/SmallButton";



export default function LinkContent () {

    const route = useRoute<RouteProp<RootStackParamList, "LinkContent">>();

    const [selectedProfiles, setSelectedProfiles] = React.useState<{
        userId: string;
        profileId: string;
    }[]>([]);
    const mutation = useMutation({
        mutationFn: linkContent
    });

    const { data: profiles, status: profilesStatus } = useQuery(["profiles", {  }], listProfiles, {
    });


    return <SafeAreaView style={{
        flex: 1,
    }}>
        <View style={{flex:8}}>
            <ListOfPeople
                refresh={() => {}}
                mode={"multiselect"}
                profileSelected={(userId, profileId) => setSelectedProfiles(selectedProfiles.find(profile => profile.profileId === profileId) ? [] : [{
                    userId,
                    profileId
                }])}
                selectedProfiles={selectedProfiles.map(profile => profile.userId)}
                people={profiles}
                style={{ height: "100%"}}
                loading={profilesStatus === "loading"}
            />
        </View>
        <View>
            <SmallButton body={"Link"} onPress={() => {
                mutation.mutate({
                    contentId: route.params.contentId,
                    sourceHolderId: route.params.sourceHolderId,
                    holderType: route.params.holderType,
                    targetHolderId: selectedProfiles[0].profileId,
                });
            }}  />
        </View>
    </SafeAreaView>
}