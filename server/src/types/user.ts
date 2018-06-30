export interface User {
    token: Token;
    aud: string;
    iss: string;
    iat: number;
    nbf: number;
    exp: number;
    acr: string;
    aio: string;
    altsecid: string;
    amr: Array<string>;
    appid: string;
    appidacr: string;
    email: string;
    family_name: string;
    given_name: string;
    groups: Array<string>;
    idp: string;
    ipaddr: string;
    name: string;
    oid: string;
    platf: string;
    puid: string;
    scp: string;
    sub: string;
    tid: string;
    unique_name: string;
    ver: string;
    wids: Array<string>;
}

export interface Token {
    token_type: string;
    scope: string;
    expires_in: string;
    ext_expires_in: string;
    expires_on: string;
    not_before: string;
    resource: string;
    access_token: string;
    id_token: string;
}