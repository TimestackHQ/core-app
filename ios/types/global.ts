export type UploadItem = {
    filename: string;
    extension: string;
    uri: string;
    type: string;
    holderId: string;
    holderType: "event" | "socialProfile";
    playableDuration: number;
    timestamp: number;
    location: string;
    filesize: number;
};
