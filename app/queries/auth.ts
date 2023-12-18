import {
    HTTPConfirmLoginQueryRequest,
    HTTPConfirmLoginQueryResponse,
    HTTPInitLoginQueryRequest,
    HTTPInitLoginQueryResponse
} from "@api-types/public";
import HTTPClient from "../httpClient";


export async function initLogin(query: { phoneNumber: string }) {
    try {
        const res = await HTTPClient<HTTPInitLoginQueryResponse, HTTPInitLoginQueryRequest>(`/auth/login`, "POST", {
            phoneNumber: query.phoneNumber,
        });

        return res.data;
    } catch (error) {
        console.log(error.response.data);
    }
}

export async function confirmLogin(query: { username: string, code: string }) {
    try {
        const res = await HTTPClient<HTTPConfirmLoginQueryResponse, HTTPConfirmLoginQueryRequest>(`/auth/confirm-login`, "POST", {
            username: query.username,
            code: query.code,
        });

        return res.data;
    } catch (error) {
        console.log(error.response.data);
        return error.response.data;
    }
}
