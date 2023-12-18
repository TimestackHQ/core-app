import { StackNavigationProp } from "@react-navigation/stack";
import { RollType } from "./types/global";
import { MediaHolderTypesType, MediaInternetType } from "@shared-types/*";

export type RootStackParamList = {

    Main: {

    }
    Add: {

    }
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
    LinkedEvents: {
        eventId: string,
        eventName: string,
    },
    EventsList: {

    },
    ChatSpace: {

    },
    EditEvent: {
        eventId: string,
        eventName: string,
        eventThumbnail: string,
    }
    Notifications: undefined,
    MediaView: {
        mediaId: string
        holderId: string,
        holderType: MediaHolderTypesType,
        content: MediaInternetType[],
        currentIndex: number
        hasPermission: boolean
    },
    AddPeople: {
        eventId: string,
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

    Mutuals: {
        targetUserId: string,
    },

    LinkContent: {
        contentId: string;
        sourceHolderId: string;
        holderType: MediaHolderTypesType;
    }


};

export type MainScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Main'
>;

export type AddScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Add'
>;

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

export type ChatSpaceScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'ChatSpace'
>;

export type EventsListScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'EventsList'
>;

export type EditEventScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'EditEvent'
>;

export type NotificationsScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Notifications'
>;

export type MediaViewScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'MediaView'
>;

export type LinkedEventsScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'LinkedEvents'
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

export type MutualsScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Mutuals'
>;

export type LinkContentScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'LinkContent'
>;
