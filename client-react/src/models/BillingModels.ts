export interface SpecCostQueryInput {
  /**
   * The subscription Id.
   */
  subscriptionId: string;
  /**
   * The list of spec resource sets.
   */
  specResourceSets: SpecResourceSet[];
  /**
   * The list spec ids to allow zero cost.
   * This is a pre-defined list of specs that are allowed zero cost, to avoid displaying misleading billing information in UI. Make it required is to
   * enforce awareness of this parameter.
   *
   * 1) Sometimes a zero cost is computed by the billing backend for various reasons, either legitimate or not, for any spec card.
   * 2) There is a very strong design requirement that the spec picker should never show a zero unexpected.
   */
  specsToAllowZeroCost: string[];
  /**
   * The spec type. e.g. "Website", "VirtualMachine"
   */
  specType?: string;
  /**
   * The common properties of reservation, should only be used by reservations.
   */
  reservationProperties?: ReservationPropertiesDefinition;
}

export interface SpecResourceSet {
  id: string;
  firstParty?: FirstPartyResource[];
}

export interface FirstPartyResource {
  /**
   * The round-tripped Id.
   */
  id?: string;
  /**
   * The MINT Resource Id (referred to as Resource GUID in some documentation).
   */
  resourceId: string | null;
  /**
   * The quantity of the resource.
   */
  quantity: number;
}

interface ReservationPropertiesDefinition {
  /**
   * The version of reservation. e.g. "1.0".
   */
  version: string;
}

export interface SpecCostQueryResult {
  /**
   * Gets or sets a flag that indicates whether the costs were successfully returned.
   * Otherwise, a failure statusCode is returned.
   */
  isSuccess: boolean;
  /**
   * DEPRECATED: For backwards compatibility, this will be set to true for chanel === DirectEA and false for all other channels.
   * Please use "channel" property instead of this.
   *
   * Gets or sets a flag that indicates whether the cost is of enterprise agreement type.
   */
  isEASubscription: boolean;
  /**
   * Gets or sets the channel.
   */
  channel: string;
  /**
   * Gets or sets the list of the list of cost estimates.
   */
  costs: CostEstimate[];
  /**
   * Gets or sets the status code.
   */
  statusCode: SpecCostQueryResultStatusCode;
  /**
   * Gets or sets the SpecCostQueryResult version.
   */
  version: string;
}

/**
 * Data contract for a third party resource and the quantity of that resource
 */
interface CostEstimate {
  /**
   * The round-tripped Id
   */
  id: string;
  /**
   * The total monetarty amount for this estimate
   * FirstParty + ThirdParty, but single currency
   */
  amount: number;
  /**
   * The billing currency code (e.g. USD)
   */
  currencyCode: string;
  /**
   * The status code for the individual spec cost
   */
  statusCode: SpecCostQueryResultSpecStatusCode;
  /**
   * The cost the first party resources
   */
  firstParty: CostEstimateResource[];
  /**
   * The cost the third party resources
   */
  thirdParty: CostEstimateResource[];
  /**
   * The availability id
   */
  availabilityId?: string;
}

/**
 * Status code for the GetSpecsCosts result
 * The corresponding C# enum is CostEstimateOverallStatusCode
 */
enum SpecCostQueryResultSpecStatusCode {
  /**
   * Costing data was successfully returned.
   */
  Success = 0,
  /**
   * Error retrieving price
   */
  PricingException = 1,
  /**
   * Spec not supported in region
   */
  NotSupportedInBillingRegion = 2,
  /**
   * Spec not available for subscription
   */
  NotAvailableForSubscription = 3,
  /**
   * Spec returns for retail but not ea
   */
  SuccessAsRetailForEa = 4,
  /**
   * Meter doesn't exist, do not display
   */
  MeterNotFound = 5,
}

/**
 * Data contract for a cost estimate resource.
 */
interface CostEstimateResource {
  /**
   * The round-tripped Id
   */
  id: string;
  /**
   * The line level cost breakdown for the resource.
   */
  meters: CostEstimateMeter[];
  /**
   * Additional info about the third party plan / SKU. Null for 1st party resources and comes from the Ratings API
   * for 3rd party resources. Marked optional to avoid breaking older unit tests.
   */
  features?: ProductFeatures;
  /**
   * The per-term cost of purchasing this resource. Null for 1st party resources, and comes from the Ratings API
   * for 3rd party resources. Marked optional to avoid breaking older unit tests.
   */
  costPerTerm?: number;
  /**
   * A string indicating the length of the subscription period for this 3rd party resource.
   * An empty string for 1st party resources, and comes from the Ratings API for 3rd party resources.
   * This value is not localized (it is set from a list of constant values hard coded in the data-market feed).
   * Marked optional to avoid breaking older unit tests.
   */
  term?: string;
}

/**
 * Describes whether the third party product has a free trial or is a bring-your-own-license offer.
 */
interface ProductFeatures {
  /**
   * Indicates whether a 3rd party plan/SKU includes a free trial period.
   */
  hasFreeTrial: boolean;
  /**
   * Indicates whether a third party plan / SKU requires the user to buy a license externally.
   */
  bringYourOwnLicense: boolean;
}

interface CostEstimateMeter {
  /**
   * The round-tripped Id
   */
  id: string;
  /**
   * The monetary amount for this estimate
   * This is in the billing currency code, which is specified in the parent object.
   */
  amount: number;
  /**
   * The monetary amount per unit
   * This value is prorated for 1st party resources, and comes from the Ratings API for 3rd party resources
   */
  perUnitAmount: number;
  /**
   * The Per Unit currency code (e.g. USD)
   * This is the same as the billing currency code for 1st party resources, and comes from the Ratings API for 3rd party resources
   */
  perUnitCurrencyCode: string;
  /**
   * The localized unit. It's empty string for 1st party resources, and comes from the Ratings API for 3rd party resources.
   */
  unit: string;
  /**
   * The name of the meter. Empty string for 1st party resources, and comes from the Ratings API for 3rd party resources.
   * Marked optional to avoid breaking older unit tests.
   */
  name?: string;
  /**
   * Price rules describing the progressive pricing scheme for this meter. Meters which have one flat rate will have a single rule
   * with no upper/lower bound. Marked optional to avoid breaking older unit tests.
   */
  priceRules?: PriceRule[];
}

/**
 * An interval in a progressing pricing scheme.
 */
interface PriceRule {
  /**
   * The lower bound for this interval. If this value is null, then there is no lower bound.
   */
  from: number;
  /**
   * The upper bound for this interval. If this value is null, then there is no upper bound.
   */
  to: number;
  /**
   * The cost for each unit of usage between from and to.
   * This is expressed in the PerUnitCurrencyCode currency code given by the parent CostEstimateMeter.
   */
  amount: number;
}

/**
 * Status code for the GetSpecsCosts result
 * The corresponding C# enum is CostEstimateOverallStatusCode
 */
enum SpecCostQueryResultStatusCode {
  /**
   * Costing data was successfully returned.
   */
  Success = 0,
  /**
   * Costing data is not available.
   */
  CostDataNotAvailable = 1,
  /**
   * Batch mode request error-ed for some items.
   */
  Partial = 2,
  /**
   * Batch mode request error-ed for all items.
   */
  BatchFailed = 3,
  /**
   * Auth failure.
   */
  AuthFailure = 4,
  /**
   * An unexpected exception was thrown by the subscription provider component. Check logs for details.
   */
  SubscriptionException = 5,
  /**
   * User&apos; subscription was not found.
   */
  SubscriptionNotFound = 6,
  /**
   * User&apos; subscription is not active.
   */
  SubscriptionNotActive = 7,
  /**
   * Subscription data is invalid.
   */
  SubscriptionIsInvalid = 8,
  /**
   * Not supported in billing region.
   */
  NotSupportedInBillingRegion = 9,
  /**
   * Pricing is not available for this subscription.
   */
  SubscriptionPricingUnavailable = 10,
  /**
   * Pricing is available as retail when EA is requested
   */
  SuccessAsRetailForEa = 12,
  /**
   * Spec is not supported in the current environment, e.g. Mooncake, Blackforest
   */
  NotSupportedInCurrentEnvironment = 13,
}
