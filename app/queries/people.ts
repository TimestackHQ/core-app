import {PeopleSearchResult, PersonType} from "@api-types/public";
import HTTPClient from "../httpClient";
import { QueryFunctionContext } from "react-query";

export async function getPeople({ queryKey: [_key, { searchQuery, getConnectedOnly }] }: QueryFunctionContext<[string, { searchQuery: string, getConnectedOnly: boolean }]>) {

    const query = new URLSearchParams({
        searchQuery,
        getConnectedOnly: String(getConnectedOnly)
    });

    const { data } = await HTTPClient<PeopleSearchResult>(`/people?${query.toString()}`, "GET");
    return data;

}

export async function getMutuals({ queryKey: [_key, { targetUserId, getAll }] }: QueryFunctionContext<[string, { targetUserId: string, getAll: boolean }]>) {

    const query = new URLSearchParams({
        getAll: getAll ? "true" : undefined
    })

    console.log(`/people/${targetUserId}/mutuals?${query.toString()}`);
    const { data } = await HTTPClient<{
        mutualCount: number,
        mutuals: PersonType[]
    }>(`/people/${targetUserId}/mutuals${getAll ? "?getAll=true" : ""}`, "GET");

    return data;

}