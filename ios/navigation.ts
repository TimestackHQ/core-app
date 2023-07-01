import { StackNavigationProp } from "@react-navigation/stack";
import { RollType } from "./types/global";

export type RootStackParamList = {
    NotificationsStack: {
        screen: "Notifications"
    }
    Auth: {
        redirect?: string
    }
    Invite: {
        eventId: string
    },
    Event: {
        eventId: string,
        eventName?: string,
        eventLocation?: string,
        refresh?: boolean,
        openUpload?: boolean,
    },
    EditEvent: {
        eventId: string,
        eventName: string,
        eventThumbnail: string,
    }
    Nofifications: undefined,
    MediaView: {
        mediaId: string
        holderId: string,
        holderType: "event" | "socialProfile",
        content: any[],
        currentIndex: number
        hasPermission: boolean
    },
    AddPeople: {
        eventId: string,
        event: string,
    },
    Upload: {
        eventId: string,
        event: any,
    },
    Roll: RollType,

    SocialProfile: {
        userId: string,
    },

    UploadQueue: {
        holderId: string,
        holderType: "event" | "socialProfile",
    },


};

export type AuthScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Auth'
>;

export type InviteScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Invite'
>;

export type EventScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Event'
>;

export type EditEventScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'EditEvent'
>;

export type NotificationsScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Nofifications'
>;

export type MediaViewScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'MediaView'
>;

export type AddPeopleScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'AddPeople'
>;

export type UploadScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Upload'
>;

export type RollScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Roll'
>;

export type SocialProfileScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'SocialProfile'
>;

export type UploadQueueScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'UploadQueue'
>;