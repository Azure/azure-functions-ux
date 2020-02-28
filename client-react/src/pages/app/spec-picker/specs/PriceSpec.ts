import { SpecResourceSet } from '../../../../models/BillingModels';
import PortalCommunicator from '../../../../portal-communicator';
import { BillingService } from '../../../../utils/BillingService';
import { LogCategories } from '../../../../utils/LogCategories';
import LogService from '../../../../utils/LogService';
import i18next from 'i18next';
import { ArmObj } from '../../../../models/arm-obj';
import { ServerFarm } from '../../../../models/serverFarm/serverfarm';

export interface PriceSpecInput {
  specPickerInput: SpecPickerInput<PlanSpecPickerData>;
  subscriptionId: string;
  plan?: ArmObj<ServerFarm>;
}

export interface SpecPickerInput<T> {
  id: string; // resourceId
  data?: T;
}

export interface SpecPickerOutput {
  skuCode: string; // Like "S1"
  tier: string; // Like "Standard"
}

export interface PlanSpecPickerData {
  subscriptionId: string;
  location: string;
  hostingEnvironmentName: string | null;
  allowAseV2Creation: boolean;
  forbiddenSkus: string[];
  forbiddenComputeMode?: number;
  isFunctionApp?: boolean;
  isLinux: boolean;
  isXenon: boolean;
  hyperV: boolean;
  selectedLegacySkuName: string; // Looks like "small_standard"
  selectedSkuCode?: string; // Can be set in update scenario for initial spec selection
  isElastic?: boolean;
  isNewFunctionAppCreate?: boolean; // NOTE(shimedh): We need this additional flag temporarily to make it work with old and new FunctionApp creates.
  // Since old creates always shows elastic premium sku's along with other sku's.
  // However, in new full screen creates it would be based on the plan type selected which will determing isElastic boolean value.
}

export interface PriceSpecDetail {
  id: string;
  iconUrl: string;
  title: string;
  description: string;
  learnMoreUrl?: string;
}

export enum SpecColorCodes {
  FREE = '#C44200',
  BASIC = '#5A8000',
  STANDARD = '#4D68C8',
  PREMIUM = '#852EA7',
  ISOLATED = '#C44200',
}

enum SubscriptionQuotaIds {
  DreamSparkQuotaId = 'DreamSpark_2015-02-01',
}

export abstract class PriceSpec {
  public skuCode: string; // SKU code name, like S1 or P1v2
  public tier: string;

  // Used ONLY for returning legacy PCV3 SKU names to Ibiza create scenario's since it currently
  // relies on this format.  There's no reason why we couldn't remove it going forward but I've
  // decided not to touch it for now to be safe.
  public legacySkuName: string;

  public topLevelFeatures: string[]; // Features that show up in the card, like "1x cores", "1.75GB RAM", etc...
  public featureItems: PriceSpecDetail[];
  public hardwareItems: PriceSpecDetail[];
  public specResourceSet: SpecResourceSet;

  public cssClass = 'spec';

  public allowZeroCost = false;
  public state: 'enabled' | 'disabled' | 'hidden' = 'enabled';
  public upsellEnabled = false;
  public disabledMessage: string;
  public disabledInfoLink: string;
  public priceString: string;
  public price: number;
  public priceIsBaseline = false;

  protected _billingService: BillingService;
  protected _logService: LogService;
  protected _t: i18next.TFunction;

  constructor(t: i18next.TFunction) {
    const portalCommunicator = new PortalCommunicator();
    this._billingService = new BillingService(portalCommunicator);
    this._logService = new LogService();
    this._t = t;
  }

  public async initialize(input: PriceSpecInput): Promise<void> {
    LogService.debug(LogCategories.specPicker, `Call runInitialize for ${this.skuCode}`);
    await this.runInitialization(input);
    LogService.debug(LogCategories.specPicker, `Completed runInitialize for ${this.skuCode}`);
  }

  public abstract async runInitialization(input: PriceSpecInput): Promise<any>;

  // NOTE(shimedh): This should return the target spec for upsell.
  public getUpsellSpecSkuCode(): string | null {
    return null;
  }

  // tslint:disable:no-empty
  public updateUpsellBanner(): void {}

  protected async checkIfDreamspark(subscriptionId: string): Promise<void> {
    if (this.state !== 'hidden') {
      const isDreamspark = await this._billingService.checkIfSubscriptionHasQuotaId(subscriptionId, SubscriptionQuotaIds.DreamSparkQuotaId);
      if (isDreamspark) {
        this.state = 'disabled';
        this.disabledMessage = this._t('pricing_subscriptionNotAllowed');
        this.disabledInfoLink = `https://account.windowsazure.com/Subscriptions/Statement?subscriptionId=${subscriptionId}&isRdfeId=true&launchOption=upgrade`;
      }
    }
  }
}
