import {CandidateType, SlotType, UserType} from "./types";
import {uuid4} from "@sentry/utils";

const user1: UserType = {
    id: "1",
    slots: [
        {
            id: "1",
            startTime: 0,
            endTime: 60,
        },
        {
            id: "2",
            startTime: 120,
            endTime: 180,
        }
    ]
}
const user2: UserType = {
    id: "2",
    slots: [
        {
            id: "3",
            startTime: 20,
            endTime: 80,
        },
        {
            id: "4",
            startTime: 1000,
            endTime: 2002,
        }
    ]
}

const user3: UserType = {
    id: "3",
    slots: [

    ]
}

const intersection = (slot1: SlotType, slot2: SlotType) => {
    const start = Math.max(slot1.startTime, slot2.startTime);
    const end = Math.min(slot1.endTime, slot2.endTime);
    if (start < end) {
        return {
            id: uuid4(),
            startTime: start,
            endTime: end,
        }
    }
}

const candidateGenerator = (user1: UserType, users: UserType[]) => {
    const candidates: CandidateType[] = [];
    user1.slots.forEach(slot => {
        const intersections: SlotType[] = [];
        const userIds: string[] = [];
        users.forEach(user => {
            user.slots.forEach(userSlot => {
                const intersectionResult = intersection(slot, userSlot);
                if (intersectionResult) {
                    intersections.push(intersectionResult);
                    userIds.push(user.id);
                }
            });
        });

        if(intersections.length !== 0) candidates.push({
            intersections,
            userIds,
            can: userIds.length,
            cannot: users.length - userIds.length,
        })
    })
    return candidates.map(candidate => candidate);
}

// console.log(intersection(user1.slots[0], user2.slots[0]))
console.log(JSON.stringify(candidateGenerator(user1, [user2, user3])))