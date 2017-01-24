export interface Permissions{
    actions : string[];
    notActions : string[];
}

export interface PermissionsAsRegExp {
    actions: RegExp[];
    notActions: RegExp[];
}