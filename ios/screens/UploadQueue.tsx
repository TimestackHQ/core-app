import { RouteProp, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { UploadItem } from "../types/global";
import { useEffect, useState } from "react";

import { RootStackParamList, UploadScreenNavigationProp } from "../navigation";
import { FlashList } from "@shopify/flash-list";
import { FlatList } from "react-native-gesture-handler";
import { Image, Text, Touchable, TouchableOpacity, View } from "react-native";
import { useQueue, useQueueCounter } from "../hooks/queue";
import FastImage from "react-native-fast-image";
import { set } from "lodash";
import UploadQueueTracker from "../Components/UploadQueueTracker";
import {uploadQueueWorker} from "../App";

export default function UploadQueue() {

    const route = useRoute<RouteProp<RootStackParamList, "UploadQueue">>();
    const navigator = useNavigation();
    const isFocused = useIsFocused();

    // @ts-ignore
    const jobs: UploadItem[] = useQueue(String(route.params?.holderId));
    const jobsCount = useQueueCounter(String(route.params?.holderId));

    const [devJobs, setDevJobs] = useState<UploadItem[]>([]);

    useEffect(() => {
        (async () => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setDevJobs(jobs);
        })()
    }, []);

    return (
        <View style={{ backgroundColor: "white", flex: 1 }}>
            <View style={{ height: 40, margin: 10, justifyContent: 'space-between', flexDirection: "row" }}>
                <UploadQueueTracker style={{ flex: 1, height: 40 }} variant="outline" holderId={String(route.params.holderId)} holderType={route.params.holderType} />
                <TouchableOpacity style={{
                    flex: 1,
                    height: 40,
                    justifyContent: "center",
                }}
                    onPress={async () => {
                        uploadQueueWorker.clearUploads();
                    }}
                >
                    <Text style={{
                        fontFamily: "Red Hat Display Regular", fontSize: 16, textAlign: "right",
                        alignContent: "flex-end", justifyContent: "flex-end"
                    }}>Cancel</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={jobs}
                renderItem={({ item }) => (
                    <View style={{ flex: 1, marginHorizontal: 10, flexDirection: "row", }}>
                        <View style={{ flex: 1, borderRadius: 100, marginVertical: 10 }}>
                            <Image
                                source={{
                                    uri: item.uri,
                                }}
                                resizeMode="cover"
                                style={{
                                    flex: 1,
                                    width: 60,
                                    height: 90,
                                    borderRadius: 10,
                                }}
                            />
                        </View>
                        <View style={{ flex: 1, alignItems: "flex-start", justifyContent: "center" }}>
                            <Text style={{
                                fontFamily: "Red Hat Display Semi Bold",
                                fontSize: 18,
                            }}>{item.filesize}</Text>
                        </View>
                        <View style={{ flex: 2, alignItems: "flex-end", justifyContent: "center" }}>
                            <View style={{
                                width: 100,
                                height: 30,
                                borderRadius: 100,
                                alignItems: "flex-start",
                                backgroundColor: "#F0F0F0",
                                justifyContent: "center"
                            }}>
                                <Text style={{
                                    color: "#A6A6A6",
                                    fontFamily: "Red Hat Display Regular",
                                    fontSize: 16,
                                    top: 4,
                                    flex: 1,
                                    width: "100%",
                                    textAlignVertical: "center",
                                    textAlign: "center",
                                    justifyContent: "center",
                                }}>Pending</Text>
                            </View>
                        </View>
                    </View>
                )}
                keyExtractor={item => item?.uri}
                numColumns={1}
            />
        </View>
    );


}