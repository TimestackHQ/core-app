import { RouteProp, useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { UploadItem } from "../types/global";
import React, { useEffect, useState } from "react";

import { RootStackParamList, UploadScreenNavigationProp } from "../navigation";
import { FlashList } from "@shopify/flash-list";
import { FlatList } from "react-native-gesture-handler";
import {ActivityIndicator, Image, Text, Touchable, TouchableOpacity, View} from "react-native";
import { useQueue, useQueueCounter } from "../hooks/queue";
import FastImage from "react-native-fast-image";
import { set } from "lodash";
import UploadQueueTracker from "../Components/UploadQueueTracker";
import {uploadQueueWorker} from "../App";
import {CompressionProgressEvent, UploadItemJob} from "../utils/UploadJobsQueue";
import {TimestackCoreNativeCompressionListener} from "../modules/timestack-core";
import CircularProgress from "react-native-circular-progress-indicator";
import Spinner from "../Components/Library/Spinner";

export default function UploadQueue() {

    const route = useRoute<RouteProp<RootStackParamList, "UploadQueue">>();

    const jobs = useQueue(route.params?.holderId);

    const fetchJobs = async () => {
        const holderId = String(route.params?.holderId)
        if (!holderId) return;
        const jobs: UploadItemJob[] = (await uploadQueueWorker.getAllJobs())
            .filter((job) => job.holderId.toString() === holderId.toString())
            .reverse();

    };

    useEffect(() => {
        (async () => {
            await fetchJobs();
            for(let i = 0; i > -1; i) {
                await fetchJobs();
                console.log("Fetching jobs...")
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log("Done fetching jobs...")
            }
        })();
    }, []); // Runs the effect once, when the component mounts

    const [compressionStatus, setCompressionStatus] = useState<CompressionProgressEvent>({
        itemId: "",
        progress: 0,
    });

    const [devJobs, setDevJobs] = useState<UploadItemJob[]>([]);

    useEffect(() => {
        (async () => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setDevJobs(jobs);
        })();

        TimestackCoreNativeCompressionListener(async (eventRaw) => {

            const event: CompressionProgressEvent = eventRaw;

            console.log(event);

            setCompressionStatus(event);
        })
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
                data={new Array(...jobs).reverse()}
                renderItem={(entry) => {
                    const item = entry.item.item;

                    return (
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
                                {compressionStatus.itemId === entry.item.id ? <React.Fragment>
                                    {compressionStatus.progress === 0 ?
                                        <View style={{
                                            width: 24,
                                            height: 24,
                                        }}>
                                            <Spinner/>
                                        </View> :
                                        <CircularProgress
                                        radius={12}
                                        activeStrokeWidth={4}
                                        inActiveStrokeWidth={4}
                                        inActiveStrokeOpacity={0.3}
                                        circleBackgroundColor={"transparent"}
                                        activeStrokeColor={"#007AFF"}
                                        showProgressValue={false}
                                        value={compressionStatus.progress}
                                    />}
                                </React.Fragment> : <View style={{
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
                                    }}>
                                        Pending
                                    </Text>
                                </View>}
                            </View>
                        </View>
                    )
                }}
                keyExtractor={item => item?.item?.uri}
                numColumns={1}
            />
        </View>
    );


}