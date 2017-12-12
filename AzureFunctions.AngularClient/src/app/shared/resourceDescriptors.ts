import { WebsiteId } from './models/portal';

export enum ResourceType {
    none,
    site,
    serverFarm,
    hostingEnvironment,
    slot,
    function,
    proxy
}

export abstract class Descriptor {
    public parts: string[];

    // static getDescriptor(resourceId: string) {
    //     const parts = resourceId.split('/').filter(part => !!part);

    //     if (parts.length >= 7 && parts[6].toLowerCase() === 'sites') {
    //         return new ArmSiteDescriptor(resourceId);
    //     } else if (parts.length >= 7 && parts[6].toLowerCase() === 'entities') {

    //         if (parts.length === 10 && parts[8].toLowerCase() === 'functions') {
    //             return new CdsFunctionDescriptor(resourceId);
    //         } else {
    //             return new CdsEntityDescriptor(resourceId);
    //         }

    //     } else {
    //         return new ArmResourceDescriptor(resourceId);
    //     }
    // }

    constructor(public resourceId: string) {
        this.parts = resourceId.split('/').filter(part => !!part);
    }

    abstract getTrimmedResourceId(): string;
}

export class ArmResourceDescriptor extends Descriptor {
    public subscription: string;
    public resourceGroup: string;

    constructor(resourceId: string) {
        super(resourceId);

        if (this.parts.length < 4) {
            throw Error(`resourceId length is too short: ${resourceId}`);
        }

        if (this.parts[0].toLowerCase() !== 'subscriptions') {
            throw Error(`Expected subscriptions segment in resourceId: ${resourceId}`);
        }

        if (this.parts[2].toLowerCase() !== 'resourcegroups') {
            throw Error(`Expected resourceGroups segment in resourceId: ${resourceId}`);
        }

        this.subscription = this.parts[1];
        this.resourceGroup = this.parts[3];
    }

    getTrimmedResourceId() {
        return this.resourceId;
    }
}

export class CdsEntityDescriptor extends Descriptor {
    public environment: string;
    public scope: string;
    public entity: string;

    constructor(resourceId: string) {
        super(resourceId);

        if (this.parts.length < 8) {
            throw Error(`resourceId length is too short: ${resourceId}`);
        }

        this.environment = this.parts[3];
        this.scope = this.parts[5];
        this.entity = this.parts[7];
    }

    getTrimmedResourceId() {
        return `/providers/Microsoft.Blueridge/environments/${this.environment}/scopes/${this.scope}/entities/${this.entity}`;
    }
}

export class CdsFunctionDescriptor extends CdsEntityDescriptor implements FunctionDescriptor {
    name: string;

    constructor(resourceId) {
        super(resourceId);

        if (this.parts.length < 10) {
            throw Error(`resourceId length is too short for function descriptor: ${resourceId}`);
        }

        this.name = this.parts[9];
    }

    getTrimmedResourceId() {
        return `${super.getTrimmedResourceId()}/functions/${this.name}`;
    }
}

export class ArmSiteDescriptor extends ArmResourceDescriptor {
    public site: string;
    public slot: string;

    private _websiteId: WebsiteId;

    public static getSiteDescriptor(resourceId: string): Descriptor {
        let parts = resourceId.split('/').filter(part => !!part);
        let siteId = '';
        let maxIndex: number;

        if (parts.length >= 10 && parts[8].toLowerCase() === 'slots') {
            maxIndex = 9;
        } else if (parts.length >= 8 && parts[6].toLowerCase() === 'sites') {
            maxIndex = 7;
        } else if (parts.length >= 8 && parts[6].toLowerCase() === 'entities') {
            return new CdsEntityDescriptor(resourceId);
        } else {
            throw Error('Not enough segments in site or slot id');
        }

        for (let i = 0; i <= maxIndex; i++) {
            siteId = siteId + '/' + parts[i];
        }

        return new ArmSiteDescriptor(siteId);
    }

    constructor(resourceId: string) {
        super(resourceId);

        if (this.parts.length < 8) {
            throw Error(`resourceId length is too short for site descriptor: ${resourceId}`);
        }

        if (this.parts[6].toLowerCase() !== 'sites') {
            throw Error(`Expected sites segment in resourceId: ${resourceId}`);
        }

        this.site = this.parts[7];

        if (this.parts.length > 8 && this.parts[8].toLowerCase() === 'slots') {
            this.slot = this.parts[9];
        }
    }

    getSiteOnlyResourceId(): string {
        return `/subscriptions/${this.subscription}/resourceGroups/${this.resourceGroup}/providers/Microsoft.Web/sites/${this.site}`;
    }

    getTrimmedResourceId(): string {
        // resource id without slot information
        let resource = this.getSiteOnlyResourceId();
        // add slots if available
        if (this.slot) {
            resource = `${resource}/slots/${this.slot}`;
        }
        return resource;
    }

    getWebsiteId(): WebsiteId {
        if (!this._websiteId) {
            let name = !this.slot ? this.site : `${this.site}(${this.slot})`;
            this._websiteId = {
                Name: name,
                SubscriptionId: this.subscription,
                ResourceGroup: this.resourceGroup
            };
        }

        return this._websiteId;
    }
}

export interface FunctionDescriptor extends Descriptor{
    name: string;
}

export class ArmFunctionDescriptor extends ArmSiteDescriptor implements FunctionDescriptor {
    public name: string;
    private _isProxy: boolean;

    static getFunctionDescriptor(resourceId: string): FunctionDescriptor {
        const parts = resourceId.split('/').filter(part => !!part);

        if (parts.length >= 8 && parts[6].toLowerCase() === 'entities') {
            return new CdsFunctionDescriptor(resourceId);
        } else {
            return new ArmFunctionDescriptor(resourceId);
        }
    }

    constructor(resourceId: string) {
        super(resourceId);

        if (!this.slot) {
            if (this.parts.length < 10) {
                throw Error('Not a site function/proxy id');
            }

            if (this.parts[8].toLowerCase() !== 'functions' && this.parts[8].toLowerCase() !== 'proxies') {
                throw Error('Not a site function/proxy id');
            }

            this._isProxy = this.parts[8].toLowerCase() === 'proxies';
            this.name = this.parts[9];
        } else {
            if (this.parts.length < 12) {
                throw Error('Not a slot function/proxy id');
            }

            if (this.parts[10].toLowerCase() !== 'functions' && this.parts[10].toLowerCase() !== 'proxies') {
                throw Error('Not a slot function/proxy id');
            }

            this._isProxy = this.parts[10].toLowerCase() === 'proxies';
            this.name = this.parts[11];
        }
    }

    getTrimmedResourceId() {
        return `${super.getTrimmedResourceId()}/${this._isProxy ? 'proxies' : 'functions'}/${this.name}`;
    }
}