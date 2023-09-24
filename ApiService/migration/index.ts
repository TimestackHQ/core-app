import { config } from "../../shared";
import * as Models from "../../shared/models";
import { Media, Event } from "../../shared/models";
import oldEvents from "./events.json";
import oldMedia from "./mediafile.json";

(async () => {

    process.env.MONGODB_URI = "mongodb+srv://achraf:s8n9vNf8YbxnuJzB@parmesan.ojuii.mongodb.net/timestack_prod";

    await config();

    // for (const oldEvent of oldEvents) {

    //     await Models.Event.updateOne({
    //         _id: oldEvent._id.$oid
    //     }, {
    //         _id: oldEvent._id.$oid,
    //         name: oldEvent.name,
    //         startsAt: oldEvent.startsAt.$date,
    //         endsAt: oldEvent.endsAt?.$date,
    //         location: oldEvent.location,
    //         locationMapsPayload: oldEvent.locationMapsPayload,
    //         status: oldEvent.status,
    //         about: oldEvent.about,
    //         revisits: oldEvent.revisits,
    //         // revisitsCache: oldEvent.revisitsCache,
    //         content: oldEvent.media?.map((media: any) => media.$oid) || [],
    //         createdBy: oldEvent.createdBy.$oid,
    //         users: oldEvent.users?.map(u => u.$oid) || [],
    //         invitees: oldEvent.invitees?.map(u => u.$oid) || [],
    //         cover: oldEvent.cover?.$oid,
    //         exclusionList: oldEvent.exclusionList?.map(u => u.$oid) || [],
    //         defaultPermission: oldEvent.defaultPermission,
    //         mutedList: oldEvent.mutedList?.map(u => u.$oid) || [],
    //     }, {
    //         upsert: true
    //     });

    // }

    let i = 0;
    for (const oldFile of oldMedia) {
        console.log(i)
        i = i + 1;
        // await Models.Content.updateOne({
        //     _id: oldFile._id.$oid
        // }, {
        //     _id: oldFile._id.$oid,
        //     contentId: oldFile._id.$oid,
        //     contentType: "media",
        //     createdAt: oldFile.createdAt?.$date,
        // },
        //     {
        //         upsert: true
        //     });

        await Models.Media.updateOne({
            _id: oldFile._id.$oid
        }, {
            _id: oldFile._id.$oid,
            user: oldFile.user.$oid,
            files: [{
                quality: "high",
                format: "jpg",
                storage: {
                    path: "media/" + oldFile.storageLocation,
                    bucket: "timestack-private",
                    url: "https://timestack-private.s3.ca-central-1.amazonaws.com/media/" + oldFile.storageLocation
                },
            }, {
                quality: "lowest",
                format: "jpg",
                storage: {
                    path: "media/" + oldFile.thumbnail,
                    bucket: "timestack-private",
                    url: "https://timestack-private.s3.ca-central-1.amazonaws.com/media/" + oldFile.thumbnail
                },
            }],
            metadata: oldFile.metadata,
            status: "active",
            timestamp: oldFile.timestamp?.$date,
            type: oldFile.type.includes("video") ? "video" : "image",
            createdAt: oldFile.createdAt?.$date,
            updatedAt: oldFile.updatedAt?.$date,



        }, {
            upsert: true
        });

    }

    console.log("Done");

    process.exit(0);

})();
