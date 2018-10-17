export interface User {
  aud: string;
  iss: string;
  iat: number;
  nbf: number;
  exp: number;
  acr: string;
  altsecid: string;
  amr: string[];
  appid: string;
  appidacr: string;
  email: string;
  family_name: string;
  given_name: string;
  idp: string;
  ipaddr: string;
  name: string;
  oid: string;
  puid: string;
  scp: string;
  sub: string;
  tid: string;
  unique_name: string;
  ver: string;
}
