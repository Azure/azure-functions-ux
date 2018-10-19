export interface ITemplateDeploymentOptions extends IDeploymentApiArgs {
  /**
   * The location/region.
   */
  resourceGroupLocation: string;
  /**
   * An array of the resource providers to be registered for the subscription.
   */
  resourceProviders: string[];
  /**
   * The parameters for the template deployment (name and value pairs).
   */
  // tslint:disable-next-line:ban-types
  parameters?: any;
  /**
   * The reference parameters for the template deployment.
   */
  referenceParameters?: any;
  /**
   * The URI for the parameters file. Use this to link to an existing parameters file. Specify
   * this or the parameters and/or referenceParameters properties, but not both.
   */
  parametersLinkUri?: string;
  /**
   * The URI for the ARM template. Specify this or the templateJson property, but not both.
   */
  templateLinkUri?: string;
  /**
   * The inline deployment template JSON. Specify this or the templateLinkUri property, but not both.
   */
  templateJson?: any;
  /**
   * Flag indicating whether to suppress default deployment notifications or not. Defaults to
   * false. This applies only to intermediate local notifications (initialization, submitting
   * the deployment, and starting the deployment). Success and failures will still show as they
   * arrive from the events service.
   */
  suppressDefaultNotifications?: boolean;
  /**
   * The template deployment operation mode. Defaults to 'RequestDeploymentOnly'.
   */
  deploymentMode?: TemplateDeploymentMode;
  /**
   * Flag indicating that we should run ARM's preflight validation before submitting the template
   * deployment request to ARM. Defaults to false.
   */
  validateTemplate?: boolean;
}

interface IDeploymentApiArgs {
  /**
   * The subscription id.
   */
  subscriptionId: string;
  /**
   * The deployment name.
   */
  deploymentName: string;
  /**
   * The resource group name.
   */
  resourceGroupName: string;
  /**
   * The resource id. Supply this to link the notifications to the asset or if the deployment
   * results in a startboard part.
   */
  resourceId?: string;
  /**
   * Debug info.
   */
  debug?: string;
}

const enum TemplateDeploymentMode {
  /**
   * Submit a deployment request to ARM only (this does not wait till the resouces are provisioned).
   * The 'deployTemplate' API will return a promise that resolves with ARM's response to the request.
   */
  RequestDeploymentOnly = 1,
  /**
   * Submit a deployment request to ARM and wait till provisioning the resources has completed
   * (silent polling). The 'deployTemplate' API will return a promise that reports progress only
   * once, when the request is accepted. The promise resolves when provisioning the resources
   * has completed.
   */
  DeployAndAwaitCompletion = 2,
  /**
   * Submit a deployment request to ARM and wait till provisioning the resources has completed,
   * while reporting all updates from ARM. The 'deployTemplate' API will return a promise that
   * reports progress when the request is accepted, followed by all ARM operations on every poll.
   * The promise resolves when provisioning the resources has completed.
   */
  DeployAndGetAllOperations = 3,
  /**
   * Execute all the deployment preflight actions without submitting the deployment request
   * (sanity check, provisioning the resource group, registering the resource providers,
   * getting a valid deployment name, and running ARM's preflight validation).
   */
  PreflightOnly = 4,
}
