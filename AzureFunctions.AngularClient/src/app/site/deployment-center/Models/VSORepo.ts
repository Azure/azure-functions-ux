export interface VSORepo {
    remoteUrl: string;
    name: string;
    project: { name: string };
    id: string;
    account: string;
}

export interface VSOAccount {
    isAccountOwner: boolean;
    accountName: string;
}
