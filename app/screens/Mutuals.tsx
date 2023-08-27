import {useQuery} from "react-query";
import {getMutuals} from "../queries/people";
import ListOfPeople from "../Components/People/List";
import {useEffect} from "react";
import {RouteProp, useIsFocused, useRoute} from "@react-navigation/native";
import {RootStackParamList} from "../navigation";
import {View} from "react-native";

export default function MutualsScreen () {

    const isFocused = useIsFocused();

    const route = useRoute<RouteProp<RootStackParamList, "Mutuals">>();

    const { data: mutuals, refetch, status } = useQuery(["get-mutuals", { targetUserId: route.params?.targetUserId, getAll: true }], getMutuals);

    useEffect(() => {
        if(isFocused) refetch();
    }, [isFocused]);

    return <View style={{
        flex: 1,
        backgroundColor: "white",
        paddingLeft: 15
    }}>
        <ListOfPeople refresh={refetch} people={mutuals?.mutuals || []} loading={status === "loading"} />
    </View>

}

