"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@sentry/utils");
const user1 = {
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
};
const user2 = {
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
};
const user3 = {
    id: "3",
    slots: []
};
const intersection = (slot1, slot2) => {
    const start = Math.max(slot1.startTime, slot2.startTime);
    const end = Math.min(slot1.endTime, slot2.endTime);
    if (start < end) {
        return {
            id: (0, utils_1.uuid4)(),
            startTime: start,
            endTime: end,
        };
    }
};
const candidateGenerator = (user1, users) => {
    const candidates = [];
    user1.slots.forEach(slot => {
        const intersections = [];
        const userIds = [];
        users.forEach(user => {
            user.slots.forEach(userSlot => {
                const intersectionResult = intersection(slot, userSlot);
                if (intersectionResult) {
                    intersections.push(intersectionResult);
                    userIds.push(user.id);
                }
            });
        });
        if (intersections.length !== 0)
            candidates.push({
                intersections,
                userIds,
                can: userIds.length,
                cannot: users.length - userIds.length,
            });
    });
    return candidates.map(candidate => candidate);
};
console.log(JSON.stringify(candidateGenerator(user1, [user2, user3])));
//# sourceMappingURL=test.js.map