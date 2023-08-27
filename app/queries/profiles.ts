import { SocialProfileInterface } from "@shared-types/*";
import { PeopleSearchResult } from "@api-types/public";
import { QueryFunctionContext } from "react-query";
import HTTPClient from "../httpClient";

export async function listProfiles({ queryKey: [_key] }: QueryFunctionContext<[string]>) {

    const { data } = await HTTPClient<PeopleSearchResult>(`/social-profiles`, "GET");

    return data.people;

}


export async function getSocialProfile({ queryKey: [_key, { userId }] }: QueryFunctionContext<[string, { userId: string }]>) {

    const { data } = await HTTPClient<SocialProfileInterface>(`/social-profiles/user/${userId}`, "GET");

    console.log(data);
    return data;

}
