import { SocialProfileInterface } from "@shared-types/*";
import { QueryFunctionContext } from "react-query";
import HTTPClient from "../httpClient";

export async function getSocialProfile({ queryKey: [_key, { userId }] }: QueryFunctionContext<[string, { userId: string }]>) {

    const { data } = await HTTPClient<SocialProfileInterface>(`/social-profiles/user/${userId}`, "GET");

    console.log(data);
    return data;

}
