import {PersonType} from "@api-types/*";
import {TouchableOpacity, View} from "react-native";
import ProfilePicture from "../ProfilePicture";
import TextComponent from "../Library/Text";
import {useNavigation} from "@react-navigation/native";
import {
    MediaViewScreenNavigationProp, MutualsScreenNavigationProp,
    RollScreenNavigationProp,
    UploadQueueScreenNavigationProp
} from "../../navigation";

export default function Mutuals ({targetUserId, mutualCount, mutuals}: {
    targetUserId: string,
    mutualCount: number,
    mutuals: PersonType[]
}) {

    if(!mutualCount || !mutuals) return null;

    const navigator = useNavigation<MutualsScreenNavigationProp>();

    const message =
        mutualCount === 1 ? `${mutuals[0]?.firstName} is a mutual` :
            mutualCount === 2 ? `${mutuals[0]?.firstName} and ${mutuals[1]?.firstName} are mutuals` :
                mutualCount === 3 ? `${mutuals[0]?.firstName}, ${mutuals[1]?.firstName} and ${mutuals[2]?.firstName} are mutuals` :
        `${mutuals[0]?.firstName}, ${mutuals[1]?.firstName}, ${mutuals[2]?.firstName} and ${mutualCount - 3} ${mutualCount - 3 === 1 ? "mutual" : "mutuals"}`;

    return <TouchableOpacity
        style={{flexDirection: "row", alignItems: "center"}}
        onPress={() => navigator.navigate("Mutuals", {
            targetUserId
        })}
    >
        <View style={{
            flexDirection: "row",
            marginRight: 15
        }}>
            {mutuals.map((mutual, index) => {
                return <ProfilePicture
                    width={30}
                    height={30}
                    style={{
                        marginRight: -12,
                        zIndex: Math.abs(index-mutualCount),
                        borderWidth: 2,
                        borderColor: "white",
                    }}
                    userId={mutual._id}
                    location={mutual.profilePictureSource}
                />
            })}
        </View>
        <TextComponent
            numberOfLines={1}
            fontFamily={"Semi Bold"}
            fontSize={15}
        >
            {message}
        </TextComponent>
    </TouchableOpacity>
}