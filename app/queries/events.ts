import {QueryFunctionContext} from "react-query";
import HTTPClient from "../httpClient";
import {EventObject} from "@api-types/public";

export async function getEvent({ queryKey: [_key, { eventId }] }: QueryFunctionContext<[string, { eventId: string }]>) {

    const { data } = await HTTPClient<{
        message: string,
        event: EventObject
    }>(`/events/${eventId}`, "GET");

    return data.event;

}
