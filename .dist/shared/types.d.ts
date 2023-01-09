export declare type SlotType = {
    id: string;
    startTime: number;
    endTime: number;
};
export declare type CandidateType = {
    intersections: SlotType[];
    userIds: string[];
    can: number;
    cannot: number;
};
export declare type IntersectionType = {
    userIds: string[];
    startTime: number;
    endTime: number;
};
export declare type UserType = {
    id: string;
    slots: SlotType[];
};
