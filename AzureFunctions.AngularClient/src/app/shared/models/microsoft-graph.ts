// Microsoft Graph / O365 binding definitions

export module MSGraphConstants {
    export class General {
        public static ApiVersion = '1.6';
        public static AADReplyUrl = '/.auth/login/aad/callback';
    }
    
    export class RequiredResources {
        public static MicrosoftGraph = '00000003-0000-0000-c000-000000000000';
        public static WindowsAzureActiveDirectory = '00000002-0000-0000-c000-000000000000';
    }
}

export enum ODataTypeMapping {
    Message = <any>"#Microsoft.Graph.Message",
    Contact = <any>"#Microsoft.Graph.Contact",
    Drive = <any>"#Microsoft.Graph.Drive",
    Event = <any>"#Microsoft.Graph.Event"
}

export class Moniker {
    public Resource: string;
    public IdToken: string;
    public PrincipalId: string;

    constructor(resource: string, idToken: string, principalId: string) {
        this.Resource = resource;
        this.IdToken = idToken;
        this.PrincipalId = principalId;
    }
}

export class GraphSubscription {
    public changeType: string;
    public notificationUrl: string;
    public resource: string;
    public expirationDateTime: string;
    public clientState: string;
    public id: string;

    constructor(changeType: string, notificationUrl: string, resource: string, expirationDatetime: string, clientState?: string) {
        this.changeType = changeType;
        this.notificationUrl = notificationUrl;
        this.resource = resource;
        this.expirationDateTime = expirationDatetime;
        this.clientState = clientState;
    }
}

export class GraphSubscriptionEntry {
    public SubscriptionId: string;
    public ClientState: string;
    public Moniker: string;

    constructor(SubscriptionId: string, ClientState: string, Moniker: string) {
        this.SubscriptionId = SubscriptionId;
        this.ClientState = ClientState;
        this.Moniker = Moniker;
    }
}

export class AADPermissions {
    public resourceAccess: ResourceAccess[];
    public resourceAppId: string;
}

export class ResourceAccess {
    public type: string;
    public id: string;
}