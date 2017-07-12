import { WebsiteId } from './models/portal';

export enum ResourceType {
    none,
    site,
    serverFarm,
    hostingEnvironment,
    slot
}

export class Descriptor {
    public resourceId: string;
    public subscription: string;
    public resourceGroup: string;
    public parts: string[];
    public resourceType = ResourceType.none;

    constructor(resourceId: string) {
        this.resourceId = resourceId;
        this.parts = resourceId.split('/').filter(part => !!part);

        if (this.parts.length < 4) {
            throw `resourceId length is too short: ${resourceId}`;
        }

        if (this.parts[0].toLowerCase() !== 'subscriptions') {
            throw `Expected subscriptions segment in resourceId: ${resourceId}`;
        }

        if (this.parts[2].toLowerCase() !== 'resourcegroups') {
            throw `Expected resourceGroups segment in resourceId: ${resourceId}`;
        }

        this.subscription = this.parts[1];
        this.resourceGroup = this.parts[3];
    }

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
    public resourceType = ResourceType.site;

    private _websiteId: WebsiteId;

    constructor(resourceId: string) {
        super(resourceId);

        if (this.parts.length < 8) {
            throw `resourceId length is too short for site descriptor: ${resourceId}`;
        }

        if (this.parts[6].toLowerCase() !== 'sites') {
            throw `Expected sites segment in resourceId: ${resourceId}`;
        }

        this.site = this.parts[7];

        if (this.parts.length > 8 && this.parts[8].toLowerCase() === "slots") {
            this.slot = this.parts[9];
            this.resourceType = ResourceType.slot;
        }
    }

    getResourceId() : string{
        // resource id without slot information
        let resource : string = `/subscriptions/${this.subscription}/resourceGroups/${this.resourceGroup}/providers/Microsoft.Web/sites/${this.site}`;
        // add slots if available
        if (this.slot) {
            resource = `${resource}/slots/${this.slot}`;
        }
        return resource
    }

    getWebsiteId() : WebsiteId{
        if(!this._websiteId){
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
        let parts = resourceId.split("/").filter(part => !!part);
        let siteId = "";
        let maxIndex: number;

        if (parts.length >= 10 && parts[8].toLowerCase() === "slots") {
            maxIndex = 9;
        }
        else if (parts.length >= 8 && parts[6].toLowerCase() === "sites") {
            maxIndex = 7;
        }
        else {
            throw 'Not enough segments in site or slot id';
        }

        for (let i = 0; i <= maxIndex; i++) {
            siteId = siteId + "/" + parts[i];
        }

        return new SiteDescriptor(siteId);
    }
}

export class FunctionDescriptor extends Descriptor {
    public functionName;

    constructor(resourceId: string) {
        super(resourceId);

        if (this.parts.length < 10) {
            throw "Not enough segments in function id";
        }

        if ((this.parts[6].toLowerCase() !== "sites" || this.parts[8].toLowerCase() !== "functions")
            && (this.parts[6].toLowerCase() !== "sites" || this.parts[8].toLowerCase() !== "proxies")) {
            throw "Not a function/proxy id";
        }

        this.functionName = this.parts[9];
    }

}