import { QueryFunctionContext } from "react-query";
import HTTPClient from "../httpClient";
import { EventObject } from "@api-types/public";

export async function getEvents({ queryKey: [_key, { q, skip, limit }] }: QueryFunctionContext<[string, {
    q?: string,
    skip?: number,
    limit?: number
}]>) {

    const queryParams = new URLSearchParams({
        q: q ?? "",
        skip: skip?.toString() ?? "0",
        limit: limit?.toString() ?? "10"
    });

    const { data } = await HTTPClient<{
        events: EventObject[],
    }>(`/events?${queryParams.toString()}`, "GET");

    return data.events;

}

export async function getMutualEvents({ queryKey: [_key, { userId, q, skip, limit }] }: QueryFunctionContext<[string, {
    q?: string,
    userId: string,
    skip?: number,
    limit?: number
}]>) {

    const queryParams = new URLSearchParams({
        q: q ?? "",
        skip: skip?.toString() ?? "0",
        limit: limit?.toString() ?? "10"
    });

    const { data } = await HTTPClient<{
        events: EventObject[],
    }>(`/events/mutual/user/${userId}?${queryParams.toString()}`, "GET");

    return data.events;

}

export async function getEvent({ queryKey: [_key, { eventId }] }: QueryFunctionContext<[string, { eventId: string }]>) {

    const { data } = await HTTPClient<{
        message: string,
        event: EventObject
    }>(`/events/${eventId}`, "GET");

    return data.event;

}

export async function getLinkedEvents({ queryKey: [_key, { eventId }] }: QueryFunctionContext<[string, { eventId: string }]>) {

    const { data } = await HTTPClient<{
        linkedEvents: {
            _id: string,
            name: string,
            thumbnailUrl?: EventObject["thumbnailUrl"],
            storageLocation?: EventObject["storageLocation"],
        }[]
    }>(`/events/${eventId}/linked-events`, "GET");

    return data.linkedEvents;

}

