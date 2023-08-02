export abstract class Descriptor {
  public parts: string[];

  constructor(public resourceId: string) {
    this.parts = resourceId.split('/').filter(part => !!part);
  }

  abstract getTrimmedResourceId(): string;
}

export class ArmResourceDescriptor extends Descriptor {
  public subscription: string;
  public resourceGroup: string;
  public resourceGroupId: string;
  public resourceName: string;

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
    this.resourceGroupId = `/subscriptions/${this.subscription}/resourceGroups/${this.resourceGroup}`;
    this.resourceName = this.parts[this.parts.length - 1];
  }

  getTrimmedResourceId() {
    return this.resourceId;
  }
}

export class ArmSiteDescriptor extends ArmResourceDescriptor {
  public site: string;
  public slot: string;

  private _websiteId: WebsiteId;

  public static getSiteResourceIdFromProperties;

  public static getSiteDescriptor(resourceId: string): ArmSiteDescriptor | FunctionDescriptor {
    const parts = resourceId.split('/').filter(part => !!part);
    let siteId = '';
    let maxIndex: number;

    if (parts.length === 10 && parts[6].toLowerCase() === 'sites' && parts[8].toLowerCase() === 'slots') {
      maxIndex = 9;
    } else if (
      parts.length == 11 &&
      parts[6].toLowerCase() === 'sites' &&
      parts[9].toLowerCase() === 'new' &&
      parts[10].toLowerCase() === 'slot'
    ) {
      // handle the scenario where the resourceId is actually the routing path for SlotNewComponent (i.e. "<siteUri>/slots/new/slot")
      maxIndex = 7;
    } else if (parts.length === 8 && parts[6].toLowerCase() === 'sites') {
      maxIndex = 7;
    } else if (parts.length === 10 && parts[6].toLowerCase() === 'sites' && parts[8].toLowerCase() === 'function') {
      return new FunctionDescriptor(resourceId);
    } else {
      throw Error(`Incorrect segments in the resourceId: ${resourceId}`);
    }

    for (let i = 0; i <= maxIndex; i++) {
      siteId = siteId + '/' + parts[i];
    }

    return new ArmSiteDescriptor(siteId);
  }

  public static generateResourceUri(subscription: string, resourceGroup: string, site: string, slot?: string) {
    if (!subscription || !resourceGroup || !site) {
      return null;
    }

    const siteUri = `/subscriptions/${subscription}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/sites/${site}`;
    return slot ? `${siteUri}/slots/${slot}` : siteUri;
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

    // handle the scenario where the resourceId is actually the routing path for SlotNewComponent (i.e. "<siteUri>/slots/new/slot")
    const hasSlotNameSegment = this.parts.length > 9 && this.parts[8].toLowerCase() === 'slots';
    const isNewSlotPath =
      hasSlotNameSegment && this.parts.length > 10 && this.parts[9].toLowerCase() === 'new' && this.parts[10].toLowerCase() === 'slot';
    if (hasSlotNameSegment && !isNewSlotPath) {
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
      const name = !this.slot ? this.site : `${this.site}(${this.slot})`;
      this._websiteId = {
        Name: name,
        SubscriptionId: this.subscription,
        ResourceGroup: this.resourceGroup,
      };
    }

    return this._websiteId;
  }

  getFormattedTargetSiteName(): string {
    const name = !this.slot ? this.site : `${this.site}/${this.slot}`;
    return name;
  }
}

export class FunctionDescriptor extends ArmSiteDescriptor {
  public functionName: string;

  constructor(resourceId: string) {
    super(resourceId);

    if (this.parts.length < 10) {
      throw Error(`resourceId length is too short for function: ${resourceId}`);
    }

    this.functionName = this.parts[9];
  }

  getTrimmedResourceId() {
    return `/subscriptions/${this.subscription}/resourceGroups/${this.resourceGroup}/providers/Microsoft.Web/sites/${this.site}/function/${this.functionName}`;
  }
}

export interface WebsiteId {
  Name: string;
  ResourceGroup: string;
  SubscriptionId: string;
}
