
export type SlotType = {
    id: string;
    startTime: number,
    endTime: number,
}

export type CandidateType = {
    intersections: SlotType[]
    userIds: string[],
    can: number,
    cannot: number,
}

export type IntersectionType = {
    userIds: string[],
    startTime: number,
    endTime: number,
}

export type UserType = {
    id: string,
    slots: SlotType[],
}