export interface WebsiteId {
  Name: string;
  ResourceGroup: string;
  SubscriptionId: string;
}
export enum ResourceType {
  none,
  site,
  serverFarm,
  hostingEnvironment,
  slot,
  function,
  proxy,
}

export abstract class Descriptor {
  public parts: string[];

  constructor(public resourceId: string) {
    this.parts = resourceId.split('/').filter(part => !!part);
  }

  public abstract getTrimmedResourceId(): string;
}

// tslint:disable-next-line:max-classes-per-file
export class ArmSubcriptionDescriptor extends Descriptor {
  public subscriptionId: string;

  constructor(resourceId: string) {
    super(resourceId);

    if (this.parts[0].toLowerCase() !== 'subscriptions') {
      throw Error(`Expected subscriptions segment in resourceId: ${resourceId}`);
    }

    this.subscriptionId = this.parts[1];
  }

  public getTrimmedResourceId() {
    return `/subscriptions/${this.subscriptionId}`;
  }

  public getSubsriptionId() {
    return this.subscriptionId;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class ArmResourceDescriptor extends Descriptor {
  public subscription: string;
  public resourceGroup: string;
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
    this.resourceName = this.parts[this.parts.length - 1];
  }

  public getTrimmedResourceId() {
    return this.resourceId;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class ArmSiteDescriptor extends ArmResourceDescriptor {
  public static getSiteDescriptor(resourceId: string): ArmSiteDescriptor {
    const parts = resourceId.split('/').filter(part => !!part);
    let siteId = '';
    let maxIndex: number;

    if (parts.length >= 10 && parts[6].toLowerCase() === 'sites' && parts[8].toLowerCase() === 'slots') {
      // handle the scenario where the resourceId is actually the routing path for SlotNewComponent (i.e. "<siteUri>/slots/new/slot")
      if (parts.length >= 11 && parts[9].toLowerCase() === 'new' && parts[10].toLowerCase() === 'slot') {
        maxIndex = 7;
      } else {
        maxIndex = 9;
      }
    } else if (parts.length >= 8 && parts[6].toLowerCase() === 'sites') {
      maxIndex = 7;
    } else {
      throw Error(`Not enough segments in site or slot or scope id`);
    }

    // tslint:disable-next-line:no-increment-decrement
    for (let i = 0; i <= maxIndex; i++) {
      // tslint:disable-next-line:prefer-template
      siteId = siteId + '/' + parts[i];
    }

    return new ArmSiteDescriptor(siteId);
  }
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

    // handle the scenario where the resourceId is actually the routing path for SlotNewComponent (i.e. "<siteUri>/slots/new/slot")
    const hasSlotNameSegment = this.parts.length > 9 && this.parts[8].toLowerCase() === 'slots';
    const isNewSlotPath =
      hasSlotNameSegment && this.parts.length > 10 && this.parts[9].toLowerCase() === 'new' && this.parts[10].toLowerCase() === 'slot';
    if (hasSlotNameSegment && !isNewSlotPath) {
      this.slot = this.parts[9];
    }
  }

  public getSiteOnlyResourceId(): string {
    return `/subscriptions/${this.subscription}/resourceGroups/${this.resourceGroup}/providers/Microsoft.Web/sites/${this.site}`;
  }

  public getTrimmedResourceId(): string {
    // resource id without slot information
    let resource = this.getSiteOnlyResourceId();
    // add slots if available
    if (this.slot) {
      resource = `${resource}/slots/${this.slot}`;
    }
    return resource;
  }

  public getWebsiteId(): WebsiteId {
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
}

// tslint:disable-next-line:max-classes-per-file
export class ArmPlanDescriptor extends ArmResourceDescriptor {
  public static getSiteDescriptor(resourceId: string): ArmPlanDescriptor {
    const parts = resourceId.split('/').filter(part => !!part);
    let planId = '';
    let maxIndex: number;

    if (parts.length >= 8 && parts[6].toLowerCase() === 'serverfarms') {
      maxIndex = 7;
    } else {
      throw Error(`Not enough segments in server farm`);
    }

    // tslint:disable-next-line:no-increment-decrement
    for (let i = 0; i <= maxIndex; i++) {
      // tslint:disable-next-line:prefer-template
      planId = planId + '/' + parts[i];
    }

    return new ArmPlanDescriptor(planId);
  }
  public name: string;

  constructor(resourceId: string) {
    super(resourceId);

    if (this.parts.length < 8) {
      throw Error(`resourceId length is too short for serverfarm descriptor: ${resourceId}`);
    }

    if (this.parts[6].toLowerCase() !== 'serverfarms') {
      throw Error(`Expected serverfarms segment in resourceId: ${resourceId}`);
    }

    this.name = this.parts[7];
  }

  public getTrimmedResourceId(): string {
    return `/subscriptions/${this.subscription}/resourceGroups/${this.resourceGroup}/providers/Microsoft.Web/serverfarms/${this.name}`;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class ArmFunctionDescriptor extends ArmSiteDescriptor {
  public name: string;
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

      if (this.parts[9].toLowerCase() === 'new' && this.parts.length > 10 && this.parts[10] === 'function') {
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

  public getTrimmedResourceId() {
    return `${super.getTrimmedResourceId()}/${this._isProxy ? 'proxies' : 'functions'}/${this.name}`;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class ARMApplicationInsightsDescriptior extends ArmResourceDescriptor {
  public instanceName: string;

  constructor(resourceId: string) {
    super(resourceId);

    if (this.parts.length < 8) {
      throw Error(`resourceId length is too short for Application Insights: ${resourceId}`);
    }

    this.instanceName = this.parts[7];
  }

  public getTrimmedResourceId() {
    return `/${this.parts.join('/')}`;
  }

  public getResourceIdForDirectUrl() {
    // NOTE(michinoy): The aiResourceId is /subscriptions/<sub>/resourceGroups/<rg>/providers/microsoft.insights/components/<name>
    // to call the app insights instance directly we need /subscriptions/<sub>/resourceGroups/<rg>/components/<name>
    return `subscriptions/${this.subscription}/resourceGroups/${this.resourceGroup}/components/${this.instanceName}`;
  }
}
