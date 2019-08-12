// Microsoft Graph / O365 binding definitions

export interface AADPermissions {
  resourceAccess: ResourceAccess[];
  resourceAppId: string;
}

export interface ResourceAccess {
  type: string;
  id: string;
  configured?: boolean;
}
