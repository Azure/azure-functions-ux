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

export class Descriptor {
    public resourceId: string;
    public subscription: string;
    public resourceGroup: string;
    public parts: string[];

    constructor(resourceId: string) {
        this.resourceId = resourceId;
        this.parts = resourceId.split('/').filter(part => !!part);

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
    };

    static getDescriptor(resourceId: string) {
        let parts = resourceId.split('/').filter(part => !!part);

        if (parts.length >= 7 && parts[6].toLowerCase() === 'sites') {
            return new SiteDescriptor(resourceId);
        }
        else {
            return new Descriptor(resourceId);
        }
    }
}

export class SiteDescriptor extends Descriptor {
    public site: string;
    public slot: string;

    private _websiteId: WebsiteId;

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
            }
        }

        return this._websiteId;
    }

    public static getSiteDescriptor(resourceId: string): SiteDescriptor {
        let parts = resourceId.split('/').filter(part => !!part);
        let siteId = '';
        let maxIndex: number;

        if (parts.length >= 10 && parts[8].toLowerCase() === 'slots') {
            maxIndex = 9;
        }
        else if (parts.length >= 8 && parts[6].toLowerCase() === 'sites') {
            maxIndex = 7;
        }
        else {
            throw 'Not enough segments in site or slot id';
        }

        for (let i = 0; i <= maxIndex; i++) {
            siteId = siteId + '/' + parts[i];
        }

        return new SiteDescriptor(siteId);
    }
}

export class FunctionDescriptor extends SiteDescriptor {
    public name;
    private _isProxy: boolean;

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