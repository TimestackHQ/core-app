export type UploadItem = {
    filename: string;
    extension: string;
    uri: string;
    type: string;
    holderId: string;
    holderType: "event" | "socialProfile" | "cover";
    playableDuration: number;
    timestamp: number;
    location: string;
    filesize: number;
    groupName?: string
    compressionProgress: number;
};

export type RollType = ({
    holderImageUrl?: string,
} & (
        {
            holderId: string,
            holderType: "event",
        } | {
            holderId: string,
            holderType: "socialProfile",
            profile: {
                people: {
                    firstName: string,
                    lastName: string,
                    username: string,
                    profilePictureSource?: string,
                }[]
            }
        }
    )) | {
        holderType: "none",
    };