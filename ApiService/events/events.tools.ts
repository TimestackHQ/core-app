import {EventSchema} from "../../shared/models/Event";
import {GCP} from "../../shared";

export const getBuffer = async (event: EventSchema): Promise<String | undefined> => {
    const cover = event.cover;

    if(cover.snapshot) return Buffer.from(await GCP.download(cover.snapshot)).toString('base64');
    else if(cover.thumbnail) return Buffer.from(await GCP.download(cover.thumbnail)).toString('base64');
}

export const standardEventPopulation = [{
    path: "cover",
    select: "publicId thumbnail snapshot"
},
    {
        path: "users",
        select: "firstName lastName profilePictureSource"
    }, {
        path: "invitees",
        select: "firstName lastName profilePictureSource"
    },{
        path: "nonUsersInvitees",
        select: "firstName lastName profilePictureSource"
    }
]
