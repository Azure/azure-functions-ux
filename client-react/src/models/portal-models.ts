import { ISubscription } from './subscription';

export interface IEvent {
  data: IData;
  origin: string;
}

export interface IData {
  signature: string;
  kind: string;
  data: any;
}

export interface IUserInfo {
  email: string;
  givenName: string;
  surname: string;
  directoryId: string;
  directoryName: string;
  domainName: string;
  isOrgId: boolean;
  objectId: string;
  principalId: string;
  uniqueDirectoryName: string;
}

export interface IFeatureInfo<T> {
  id: string;
  feature: string;
  data: T;
}

export interface IStartupInfo<T> {
  sessionId: string;
  token: string;
  acceptLanguage: string;
  effectiveLocale: string;
  subscriptions: ISubscription[];
  resourceId: string;
  userInfo: IUserInfo;
  theme: string;
  armEndpoint: string;
  featureInfo: IFeatureInfo<T>;
}

export interface IDataMessage<T> {
  operationId: string;
  data: T;
}

export interface IDataMessageResult<T> {
  status: 'success' | 'failed' | 'cancelled';
  result: T;
}

export interface IAction {
  subcomponent: string;
  action: string;
  data: any; // Properties of the object will be logged as a key-value pair
}

export interface IMessage {
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
  public static executeArmUpdateRequest = 'arm-update-request';

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
  public static loadComplete = 'load-complete';
}

export enum LogEntryLevel {
  Custom = -2,
  Debug = -1,
  Verbose = 0,
  Warning = 1,
  Error = 2,
}

// Mainly used for Ibiza legacy reasons
export interface IWebsiteId {
  Name: string;
  ResourceGroup: string;
  SubscriptionId: string;
}

export interface IOpenBladeInfo<T = any> {
  detailBlade: string;
  detailBladeInputs: T;
  extension?: string;
  openAsContextBlade?: boolean;
  openAsSubJourney?: boolean;
}

export interface FrameBladeParams<T> {
  id?: string;
  feature?: string;
  data?: T;
}

export interface ITimerEvent {
  timerId: string;
  timerAction: 'start' | 'stop';
}

export interface IUpdateBladeInfo {
  title?: string;
  subtitle?: string;
}

export interface IPinPartInfo {
  partSize: PartSize;
  partInput: any;
}

export interface INotificationInfo {
  id?: string;
  state: string; // start, success, fail
  title: string;
  description: string;
}

export interface INotificationStartedInfo {
  id: string;
}

export interface IDirtyStateInfo {
  dirty: boolean;
  message?: string;
}

export interface ISubscriptionRequest {
  subscriptionId: string;
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

export type TokenType = 'graph' | 'azureTfsApi' | 'applicationinsightapi' | '';

export interface ITokenResponse {
  tokenType: TokenType;
  token: string;
}

export interface IBladeResultValue<T> {
  value: T;
}

export interface IBladeResult<T> {
  reason: 'userNavigation' | 'childClosedSelf';
  data: IBladeResultValue<T>;
}

export enum BroadcastMessageId {
  planUpdated = 'PLAN_UPDATED',
  siteUpdated = 'SITE_UPDATED',
  slotSwap = 'SLOT_SWAP',
  slotNew = 'SLOT_NEW',
  menuItemSelected = 'SELECTED_MENU_ITEM',
}

export interface BroadcastMessage<T> {
  id: BroadcastMessageId;
  resourceId: string;
  metadata?: T;
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

export interface PortalDebugInformation {
  hostName: string;
  appName: string;
  version: string;
}

export interface SelectedMenuItemMessage {
  menuId: MenuId;
}

export enum MenuId {
  Overview = 'functionOverview',
  Code = 'code',
  Integration = 'integration',
  Invocation = 'invocation',
  StreamingLogs = 'streamingLogs',
  FunctionKeys = 'functionKeys',
}

export enum SiteReadWriteState {
  readonly = 'readonly',
  readwrite = 'readwrite',
}

export enum FunctionAppEditMode {
  ReadWriteSourceControlled,
  ReadOnlySourceControlled,
  ReadWrite,
  ReadOnly,
  ReadOnlySlots,
  ReadOnlyVSGenerated,
  ReadWriteVSGenerated,
  ReadOnlyRunFromPackage,
  ReadOnlyLocalCache,
  ReadOnlyLinuxDynamic,
  ReadOnlyBYOC,
  ReadOnlyPython,
  ReadOnlyJava,
  ReadOnlyLinuxCodeElastic,
  ReadOnlyLock,
  ReadOnlyRbac,
}

export enum PortalTheme {
  dark = 'dark',
  light = 'light',
}

export interface KeyValue<T> {
  [key: string]: T;
}
