import { SocialProfileInterface } from "@shared-types/*";
import {PeopleSearchResult, LinkContent, UnlinkContent} from "@api-types/public";
import { QueryFunctionContext } from "react-query";
import HTTPClient from "../httpClient";

export async function linkContent(query: LinkContent & {contentId: string}) {
    try {
        await HTTPClient<SocialProfileInterface, LinkContent>(`/content/${query.contentId}/link`, "POST", {
            holderType: query.holderType,
            sourceHolderId: query.sourceHolderId,
            targetHolderId: query.targetHolderId
        });
    } catch (error) {
        console.log(error.response.data);
    }

}

export async function unlinkContent(query: UnlinkContent & {contentId: string}) {
    try {
        await HTTPClient<SocialProfileInterface, UnlinkContent>(`/content/${query.contentId}/unlink`, "POST", {
            socialProfilesToUnlink: query.socialProfilesToUnlink,
            eventsToUnlink: query.eventsToUnlink
        });
    } catch (error) {
        console.log(error.response.data);
    }

}
