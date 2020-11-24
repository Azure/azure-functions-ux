import { uniqBy } from 'lodash-es';
import { sendHttpRequest } from './ApiHelpers/HttpClient';
import { HttpResponseObject } from './ArmHelper.types';
import {
  AuthenticatedUser,
  AuthenticatedUserContext,
  AzureDevOpsUrl,
  DevOpsAccount,
  DevOpsBranches,
  DevOpsBuildDefinition,
  DevOpsRepositories,
  TargetAzDevDeployment,
} from './pages/app/deployment-center/DeploymentCenter.types';
import { DeploymentCenterConstants } from './pages/app/deployment-center/DeploymentCenterConstants';
import { getArmToken } from './pages/app/deployment-center/utility/DeploymentCenterUtility';
import { CommonConstants } from './utils/CommonConstants';
import { LogCategories } from './utils/LogCategories';
import LogService from './utils/LogService';
import Url from './utils/url';

export default class AzureDevOpsService {
  private readonly _targetAzDevDeployment = (
    Url.getFeatureValue(CommonConstants.FeatureFlags.targetAzDevDeployment) || TargetAzDevDeployment.SU2
  ).toLowerCase();
  private _accountsList: DevOpsAccount[] = [];
  private _authenticatedUser: AuthenticatedUser;

  public getAzureDevOpsUrl = (): AzureDevOpsUrl => {
    switch (this._targetAzDevDeployment) {
      case TargetAzDevDeployment.Devfabric:
        return {
          Tfs: DeploymentCenterConstants.AzDevDevFabricTfsUri,
          Sps: DeploymentCenterConstants.AzDevDevFabricSpsUri,
          Aex: DeploymentCenterConstants.AzDevDevFabricAexUri,
          Rmo: DeploymentCenterConstants.AzDevDevFabricRmoUri,
          PeDeploymentLevel: DeploymentCenterConstants.AzDevDevFabricPeDeploymentLevelUri,
          PeCollectionLevel: DeploymentCenterConstants.AzDevDevFabricPeCollectionLevelUri,
        };

      case TargetAzDevDeployment.Preflight:
        return {
          Tfs: DeploymentCenterConstants.AzDevProductionTfsUri,
          Sps: DeploymentCenterConstants.AzDevProductionSpsUri,
          Aex: DeploymentCenterConstants.AzDevProductionAexUri,
          Rmo: DeploymentCenterConstants.AzDevProductionRmoUri,
          PeDeploymentLevel: DeploymentCenterConstants.AzDevPreFlightPeDeploymentLevelUri,
          PeCollectionLevel: DeploymentCenterConstants.AzDevProductionPeCollectionLevelUri,
        };

      case TargetAzDevDeployment.SU2:
      default:
        return {
          Tfs: DeploymentCenterConstants.AzDevProductionTfsUri,
          Sps: DeploymentCenterConstants.AzDevProductionSpsUri,
          Aex: DeploymentCenterConstants.AzDevProductionAexUri,
          Rmo: DeploymentCenterConstants.AzDevProductionRmoUri,
          PeDeploymentLevel: DeploymentCenterConstants.AzDevProductionPeDeploymentLevelUri,
          PeCollectionLevel: DeploymentCenterConstants.AzDevProductionPeCollectionLevelUri,
        };
    }
  };

  public async getAccounts() {
    if (this._accountsList.length > 0) {
      return this._accountsList;
    }

    const authenticatedUserContext = await this.getUserContext();
    if (authenticatedUserContext) {
      const url = `${this.getAzureDevOpsUrl().Sps}_apis/accounts?memeberId=${this._authenticatedUser.descriptor}?api-version=5.0-preview.1`;

      const [accounts1Response, accounts2Response] = await Promise.all([
        sendHttpRequest<any>({ url, method: 'GET', headers: this.getAzDevDirectHeaders(false) }),
        sendHttpRequest<any>({ url, method: 'GET', headers: this.getAzDevDirectHeaders(true) }),
      ]);

      if (accounts1Response.metadata.success && accounts2Response.metadata.success) {
        const accountList1: DevOpsAccount[] = accounts1Response.data.map(account => ({ ...account, ForceMsaPassThrough: false }));
        const accountList2: DevOpsAccount[] = accounts2Response.data.map(account => ({ ...account, ForceMsaPassThrough: true }));
        const mixedAccountList = uniqBy(accountList1.concat(accountList2), 'AccountId');
        this._accountsList = mixedAccountList;
        return mixedAccountList;
      } else {
        if (accounts1Response.metadata.error) {
          LogService.error(
            LogCategories.deploymentCenter,
            'DeploymentCenteAzureDevOpsService',
            `Failed to get authenticated user error: ${accounts1Response.metadata.error}`
          );
        }
        if (accounts2Response.metadata.error) {
          LogService.error(
            LogCategories.deploymentCenter,
            'DeploymentCenteAzureDevOpsService',
            `Failed to get authenticated user error: ${accounts2Response.metadata.error}`
          );
        }
        return Promise.resolve(undefined);
      }
    }
  }

  public async getUserContext() {
    const url = `${this.getAzureDevOpsUrl().Sps}_apis/connectionData`;
    if (this._authenticatedUser) {
      return Promise.resolve(this._authenticatedUser);
    }
    const authenticatedUserResponse = await sendHttpRequest<AuthenticatedUserContext>({
      url,
      method: 'GET',
      headers: this.getAzDevDirectHeaders(false),
    });
    if (authenticatedUserResponse.metadata.success) {
      return Promise.resolve((this._authenticatedUser = authenticatedUserResponse.data.authenticatedUser));
    } else {
      LogService.error(
        LogCategories.deploymentCenter,
        'DeploymentCenteAzureDevOpsService',
        `Failed to get authenticated user error: ${authenticatedUserResponse.metadata.error}`
      );
      return Promise.resolve(undefined);
    }
  }

  public getAzDevDirectHeaders(appendMsaPassthroughHeader: boolean = true) {
    return {
      'content-type': 'application/json',
      accept: 'application/json',
      authorization: this._getAuthTokenForMakingAzDevRequestBasedOnDeployment(),
      'x-vss-forcemsapassthrough': appendMsaPassthroughHeader ? `${appendMsaPassthroughHeader}` : undefined,
    };
  }

  public getBuildDef(account: string, projectUrl: string, buildId: string): Promise<HttpResponseObject<DevOpsBuildDefinition>> {
    const url = `${projectUrl}/_apis/build/Definitions/${buildId}?api-version=2.0`;

    // NOTE(michinoy): Need to figure out
    return this._sendRequest<DevOpsBuildDefinition>(url, account);
  }

  public getRepositoriesForAccount(account: string): Promise<HttpResponseObject<DevOpsRepositories>> {
    const url = `${this.getAzureDevOpsUrl().Tfs}${account}/_apis/git/repositories`;

    return this._sendRequest<DevOpsRepositories>(url, account);
  }

  public getBranchesForRepo(account: string, repositoryId: string): Promise<HttpResponseObject<DevOpsBranches>> {
    const url = `${this.getAzureDevOpsUrl().Tfs}${account}/_apis/git/repositories/${repositoryId}/refs?api-version=5.0`;

    return this._sendRequest<DevOpsBranches>(url, account);
  }

  private _sendRequest<T>(url: string, account: string): Promise<HttpResponseObject<T>> {
    return this.getAccounts().then(result => {
      const currentAccount = this._accountsList.find(x => x.AccountName.toLowerCase() === account.toLowerCase());
      const forceMsaPassthrough = currentAccount ? currentAccount.ForceMsaPassThrough : false;
      return sendHttpRequest<T>({ url, method: 'GET', headers: this.getAzDevDirectHeaders(forceMsaPassthrough) });
    });
  }

  private _getAuthTokenForMakingAzDevRequestBasedOnDeployment(): string {
    if (this._targetAzDevDeployment === TargetAzDevDeployment.Devfabric) {
      const authTokenOverride = Url.getFeatureValue(CommonConstants.FeatureFlags.authTokenOverride);
      if (!authTokenOverride) {
        throw new Error('You are using Devfabric environment but PAT is not provided');
      }
      const auth = 'Basic ';
      let pat = ':';
      pat = pat.concat(authTokenOverride);
      return auth.concat(btoa(pat));
    }
    return getArmToken();
  }
}
