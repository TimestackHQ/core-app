import { ComponentType, ElementType } from "react";
import { FlatList, Image, ScrollView, Text, TouchableWithoutFeedback, View } from "react-native";
import TextComponent from "../Library/Text";
import ProfilePicture from "../ProfilePicture";
import { FlashList } from "@shopify/flash-list";
import { PeopleSearchResult } from "@api-types/public";
import { useNavigation } from "@react-navigation/native";
import { SocialProfileScreenNavigationProp } from "../../navigation";

export default function ListOfPeople({ ListHeaderComponent, people, style }: {
    ListHeaderComponent?: any,
    people: PeopleSearchResult["people"],
    style?: any,
    loading: boolean,
}) {

    const navigator = useNavigation<SocialProfileScreenNavigationProp>();
    return <View>
        <FlatList
            ListHeaderComponent={ListHeaderComponent}
            style={{ ...style }}
            data={people}

            renderItem={({ item }) => {
                return <TouchableWithoutFeedback
                    onPress={() => navigator.navigate("SocialProfile", {
                        userId: item._id
                    })}
                >
                    <View style={{
                        marginVertical: 5,
                        flexDirection: "row",
                    }}>
                        <View style={{
                            // flex: 1,
                        }}>
                            <ProfilePicture
                                userId={item._id}
                                pressToProfile
                                width={50}
                                height={50}
                                location={item.profilePictureSource}
                            />

                        </View>

                        <View style={{
                            alignItems: "flex-start",
                            justifyContent: "center",
                            paddingLeft: 10,
                            width: "100%"
                        }}>
                            <TextComponent numberOfLines={1} ellipsizeMode="tail" fontFamily="Bold" fontSize={16} style={{
                                // flex: 10
                                marginVertical: -5,
                                padding: 0,
                                width: "85%"
                            }}>
                                {item.firstName} {item.lastName}
                            </TextComponent>
                            <TextComponent numberOfLines={1} ellipsizeMode="tail" fontFamily="Regular" fontSize={14} style={{
                                // flex: 10
                            }}>
                                {item.username}
                            </TextComponent>
                        </View>

                    </View>
                </TouchableWithoutFeedback>
            }}
            keyExtractor={(item, index) => index.toString()}
        />
    </View>

}