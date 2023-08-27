import {PeopleSearchResult, PersonType} from "@api-types/public";
import HTTPClient from "../httpClient";
import { QueryFunctionContext } from "react-query";

export async function getPeople({ queryKey: [_key, { searchQuery }] }: QueryFunctionContext<[string, { searchQuery: string }]>) {

    const query = new URLSearchParams({
        q: searchQuery,
    });

    const { data } = await HTTPClient<PeopleSearchResult>(`/people?${query.toString()}`, "GET");
    return data;

}

export async function getMutuals({ queryKey: [_key, { targetUserId, getAll }] }: QueryFunctionContext<[string, { targetUserId: string, getAll: boolean }]>) {

    console.log(`/people/${targetUserId}/mutuals${getAll ? "?getAll=true" : ""}`)
    const { data } = await HTTPClient<{
        mutualCount: number,
        mutuals: PersonType[]
    }>(`/people/${targetUserId}/mutuals${getAll ? "?getAll=true" : ""}`, "GET");

    return data;

}