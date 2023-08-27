import { IEvent } from "../../shared/models/Event";
import { AWSS3ObjectType, ExtendedMongoDocument } from "../../shared/@types/global";

export type EventObject = {
    _id: string,
    name: IEvent["name"],
    startsAt: IEvent["startsAt"],
    endsAt: IEvent["endsAt"],
    about: IEvent["about"],
    location: IEvent["location"],
    locationMapsPayload: IEvent["locationMapsPayload"],
    status: IEvent["status"],
    revisits: IEvent["revisits"],
    peopleCount: number,
    mediaCount: number,

    people: ReturnType<IEvent["people"]>,
    hasPermission: ReturnType<IEvent["hasPermission"]>,
    muted: boolean,
    thumbnailUrl?: AWSS3ObjectType,
    storageLocation?: AWSS3ObjectType,
}