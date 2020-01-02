import { Subscription } from './subscription';

export interface Event {
  data: Data;
  origin: string;
}

export interface Data {
  signature: string;
  kind: string;
  data: any;
}

export interface GetStartupInfo {
  iframeAppName: string;
  iframeHostName: string;
}

export interface StartupInfo<T> {
  token: string;
  subscriptions: Subscription[];
  sessionId: string;
  acceptLanguage: string;
  effectiveLocale: string;
  resourceId: string;
  theme: string;
  crmInfo?: CrmInfo;
  featureInfo?: T;
  armEndpoint?: string;
}

export interface SendToken2 {
  token?: string; // Arm
  selfToken?: string;
  graphToken?: string;
}

export interface CrmInfo {
  crmTokenHeaderName: string;
  crmInstanceHeaderName: string;
  crmSolutionIdHeaderName: string;
  environmentId: string;
  namespaceId: string;
}

export interface DataMessage<T> {
  operationId: string;
  data: T;
}

export interface DataMessageResult<T> {
  status: 'success' | 'failed' | 'cancelled';
  result: T;
}

export interface Action {
  subcomponent: string;
  action: string;
  data: any; // Properties of the object will be logged as a key-value pair
}

export interface Message {
  level: LogEntryLevel;
  message: string;
  restArgs: any[];
}

export class Verbs {
  // Initialization verbs
  public static message = 'message';
  public static ready = 'ready';
  public static initializationcomplete = 'initializationcomplete';
  // Requests from iframe
  public static getStartupInfo = 'get-startup-info';
  public static openBlade = 'open-blade';
  public static openBlade2 = 'open-blade2';

  public static openBladeCollector = 'open-blade-collector'; // Deprecated
  public static openBladeCollectorInputs = 'open-blade-collector-inputs'; // Deprecated
  public static updateBladeInfo = 'update-blade-info';
  public static returnPCV3Results = 'return-pcv3-results';
  public static returnByosSelections = 'return-byos-selections';

  public static closeBlades = 'close-blades';
  public static closeSelf = 'close-self';
  public static logAction = 'log-action';
  public static logMessage = 'log-message';
  public static logTimerEvent = 'log-timer-event';
  public static setDirtyState = 'set-dirtystate'; // Deprecated
  public static updateDirtyState = 'update-dirtystate';
  public static setupOAuth = 'setup-oauth';
  public static pinPart = 'pin-part';
  public static setNotification = 'set-notification';
  public static getSubscriptionInfo = 'get-subscription-info';
  public static getSpecCosts = 'get-spec-costs';
  public static broadcastMessage = 'broadcast-message';
  public static setFrameboundEventFilter = 'set-framebound-event-filter';

  public static hasPermission = 'has-permission';
  public static hasLock = 'has-lock';

  // Requests from Ibiza
  public static sendStartupInfo = 'send-startup-info';
  public static sendAppSettingName = 'send-appSettingName';
  public static sendResourceId = 'send-resourceId';
  public static sendInputs = 'send-inputs';
  public static sendToken2 = 'send-token2';
  public static sendOAuthInfo = 'send-oauth-info';
  public static sendNotificationStarted = 'send-notification-started';
  public static sendData = 'send-data';
}

export class EventVerbs {
  public static planUpdated = 'plan-updated';
  public static siteUpdated = 'site-updated';
  public static slotSwap = 'slot-swap';
  public static slotNew = 'slot-new';
  public static sendByosSelection = 'send-byos-selection';
}

export enum LogEntryLevel {
  Custom = -2,
  Debug = -1,
  Verbose = 0,
  Warning = 1,
  Error = 2,
}

export enum BroadcastMessageId {
  planUpdated = 'PLAN_UPDATED',
  siteUpdated = 'SITE_UPDATED',
  slotSwap = 'SLOT_SWAP',
  slotNew = 'SLOT_NEW',
}

// Mainly used for Ibiza legacy reasons
export interface WebsiteId {
  Name: string;
  ResourceGroup: string;
  SubscriptionId: string;
}

export interface OpenBladeInfo<T = any> {
  detailBlade: string;
  detailBladeInputs: T;
  extension?: string;
  openAsContextBlade?: boolean;
  openAsSubJourney?: boolean;
}

export interface FrameBladeParams<T = any> {
  id?: string;
  feature?: string;
  data?: T;
}

export interface TimerEvent {
  timerId: string;
  timerAction: 'start' | 'stop';
}

export interface UpdateBladeInfo {
  title?: string;
  subtitle?: string;
}

export interface PinPartInfo {
  partSize: PartSize;
  partInput: any;
}

export interface NotificationInfo {
  id?: string;
  state: string; // start, success, fail
  title: string;
  description: string;
}

export interface NotificationStartedInfo {
  id: string;
}

export interface DirtyStateInfo {
  dirty: boolean;
  message?: string;
}

export interface SubscriptionRequest {
  subscriptionId: string;
}

export interface BroadcastMessage<T> {
  id: BroadcastMessageId;
  resourceId: string;
  metadata?: T;
}

export enum PartSize {
  /**
   * A tile that is 1 column x 1 row.
   */
  Mini = 0,
  /**
   * A tile that is 2 columns x 1 row.
   */
  Small = 1,
  /**
   * A tile that is 2 columns x 2 rows.
   */
  Normal = 2,
  /**
   * A tile that is 4 columns x 2 rows.
   */
  Wide = 3,
  /**
   * A tile that is 2 columns x 4 rows.
   */
  Tall = 4,
  /**
   * A tile that is 6 columns x 4 rows.
   */
  HeroWide = 5,
  /**
   * A tile that is 4 columns x 6 rows.
   */
  HeroTall = 6,
  /**
   * A tile that is 6 columns by unbounded rows that fits the content.
   */
  HeroWideFitHeight = 7,
  /**
   * A tile that expands all the available columns by unbounded rows that fits the content.
   */
  FullWidthFitHeight = 8,
  /**
   * A tile that fits all the available space of the content area it occupies.
   */
  FitToContainer = 9,
  /**
   * A tile that is 4 columns x 4 rows.
   */
  Large = 10,
  /**
   * A tile that is 6 columns x 6 rows.
   */
  Hero = 11,
  /**
   * A tile with a custom size.
   */
  Custom = 99,
}

export type TokenType = 'graph' | 'azureTfsApi' | 'applicationinsightapi';

export interface TokenResponse {
  tokenType: TokenType;
  token: string;
}

export interface BladeResult<T> {
  reason: 'userNavigation' | 'childClosedSelf';
  data: T;
}

export interface EventFilter {
  allowedIFrameEventVerbs: string[];
}

export interface CheckPermissionRequest {
  resourceId: string;
  actions: string[];
}

export interface CheckPermissionResponse {
  hasPermission: boolean;
}

export type LockType = 'ReadOnly' | 'Delete';

export interface CheckLockRequest {
  resourceId: string;
  type: LockType;
}

export interface CheckLockResponse {
  hasLock: boolean;
}
