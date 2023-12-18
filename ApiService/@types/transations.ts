export type HTTPErrorMessageResponse = {
    message: string
}

export type HTTPInitLoginQueryRequest = {
    phoneNumber: string,
}

export type HTTPInitLoginQueryResponse = {
    userExists: boolean,
} | HTTPErrorMessageResponse

export type HTTPConfirmLoginQueryRequest = {
    username: string,
    code: string,
}

export type HTTPConfirmLoginQueryResponse = {
    userConfirmed: boolean,
    token: string,
} | HTTPErrorMessageResponse