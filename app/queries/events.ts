import { QueryFunctionContext } from "react-query";
import HTTPClient from "../httpClient";
import { EventObject } from "@api-types/public";

export async function getEvents({ queryKey: [_key, { skip, limit }] }: QueryFunctionContext<[string, {
    skip?: number,
    limit?: number
}]>) {

    const queryParams = new URLSearchParams({
        skip: skip?.toString() ?? "0",
        limit: limit?.toString() ?? "10"
    });

    const { data } = await HTTPClient<{
        events: EventObject[],
    }>(`/events?${queryParams.toString()}`, "GET");

    return data.events;

}
export async function getEvent({ queryKey: [_key, { eventId }] }: QueryFunctionContext<[string, { eventId: string }]>) {

    const { data } = await HTTPClient<{
        message: string,
        event: EventObject
    }>(`/events/${eventId}`, "GET");

    return data.event;

}
