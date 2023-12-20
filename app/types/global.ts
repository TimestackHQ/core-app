import {Request} from "aws4";

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
    holderImageS3Object?: Request
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

export type UserStoreType = {
    loggedIn: true,
   user?: {
       firstName: string,
       lastName: string,
       username: string,
       profilePictureSource?: string,
       authToken: string,
   }
};
