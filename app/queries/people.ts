import { PeopleSearchResult } from "@api-types/public";
import HTTPClient from "../httpClient";
import { QueryFunctionContext } from "react-query";

export async function getPeople({ queryKey: [_key, { searchQuery }] }: QueryFunctionContext<[string, { searchQuery: string }]>) {

    const query = new URLSearchParams({
        q: searchQuery,
    });

    const { data } = await HTTPClient<PeopleSearchResult>(`/people?${query.toString()}`, "GET");
    return data;

}