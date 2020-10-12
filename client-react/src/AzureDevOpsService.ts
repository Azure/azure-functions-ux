import { uniqBy } from 'lodash-es';
import { forkJoin } from 'rxjs';
import { getErrorMessage } from './ApiHelpers/ArmHelper';
import { sendHttpRequest } from './ApiHelpers/HttpClient';
import {
  AuthenticatedUser,
  AuthenticatedUserContext,
  AzureDevOpsUrl,
  DevOpsAccount,
  TargetAzDevDeployment,
} from './pages/app/deployment-center/DeploymentCenter.types';
import { DeploymentCenterConstants } from './pages/app/deployment-center/DeploymentCenterConstants';
import { getArmToken } from './pages/app/deployment-center/utility/DeploymentCenterUtility';
import { CommonConstants } from './utils/CommonConstants';
import { LogCategories } from './utils/LogCategories';
import LogService from './utils/LogService';
import Url from './utils/url';

export default class AzureDevOpsService {
  private static readonly targetAzDevDeployment = (
    Url.getFeatureValue(CommonConstants.FeatureFlags.targetAzDevDeployment) || TargetAzDevDeployment.SU2
  ).toLowerCase();
  private static accountsList: DevOpsAccount[] = [];
  private static authenticatedUser: AuthenticatedUser;

  public static getAzureDevOpsUrl = (): AzureDevOpsUrl => {
    switch (AzureDevOpsService.targetAzDevDeployment) {
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

  public static getBuildDef(account: string, projectUrl: string, buildId: string) {
    const url = `${projectUrl}/_apis/build/Definitions/${buildId}?api-version=2.0`;
    return this.getAccounts().then(result => {
      const currentAccount = this.accountsList.find(x => x.AccountName.toLowerCase() === account.toLowerCase());
      const forceMsaPassthrough = currentAccount ? currentAccount.ForceMsaPassThrough : false;
      return sendHttpRequest<any>({ url, method: 'GET', headers: this.getAzDevDirectHeaders(forceMsaPassthrough) });
    });
  }

  public static async getAccounts() {
    if (this.accountsList.length > 0) {
      return this.accountsList;
    }
    return this.getUserContext().then(result => {
      if (result) {
        const url = `${AzureDevOpsService.getAzureDevOpsUrl().Sps}_apis/accounts?memeberId=${
          this.authenticatedUser.descriptor
        }?api-version=5.0-preview.1`;
        return forkJoin([
          sendHttpRequest<any>({ url, method: 'GET', headers: this.getAzDevDirectHeaders(false) }),
          sendHttpRequest<any>({ url, method: 'GET', headers: this.getAzDevDirectHeaders(true) }),
        ]).subscribe(([accounts1, accounts2]) => {
          if (accounts1.metadata.success && accounts2.metadata.success) {
            const accountList1: DevOpsAccount[] = accounts1.data.map(account => ({ ...account, ForceMsaPassThrough: false }));
            const accountList2: DevOpsAccount[] = accounts2.data.map(account => ({ ...account, ForceMsaPassThrough: true }));
            const mixedAccountList = uniqBy(accountList1.concat(accountList2), 'AccountId');
            this.accountsList = mixedAccountList;
            return mixedAccountList;
          } else {
            if (accounts1.metadata.error) {
              LogService.error(
                LogCategories.deploymentCenter,
                'DeploymentCenteAzureDevOpsService',
                `Failed to get authenticated user error: ${getErrorMessage(accounts1.metadata.error)}`
              );
            }
            if (accounts2.metadata.error) {
              LogService.error(
                LogCategories.deploymentCenter,
                'DeploymentCenteAzureDevOpsService',
                `Failed to get authenticated user error: ${getErrorMessage(accounts2.metadata.error)}`
              );
            }
            return Promise.resolve(undefined);
          }
        });
      }
    });
  }

  public static async getUserContext() {
    const url = `${AzureDevOpsService.getAzureDevOpsUrl().Sps}_apis/connectionData`;
    if (this.authenticatedUser) {
      return this.authenticatedUser;
    }
    return sendHttpRequest<AuthenticatedUserContext>({ url, method: 'GET', headers: this.getAzDevDirectHeaders(false) }).then(result => {
      if (result.metadata.success) {
        return Promise.resolve((this.authenticatedUser = result.data.authenticatedUser));
      } else {
        LogService.error(
          LogCategories.deploymentCenter,
          'DeploymentCenteAzureDevOpsService',
          `Failed to get authenticated user error: ${getErrorMessage(result.metadata.error)}`
        );
        return Promise.resolve(undefined);
      }
    });
  }

  public static getAzDevDirectHeaders(appendMsaPassthroughHeader: boolean = true) {
    return appendMsaPassthroughHeader
      ? {
          'content-type': 'application/json',
          accept: 'application/json',
          authorization: this._getAuthTokenForMakingAzDevRequestBasedOnDeployment(),
          'x-vss-forcemsapassthrough': `${appendMsaPassthroughHeader}`,
        }
      : {
          'content-type': 'application/json',
          accept: 'application/json',
          authorization: this._getAuthTokenForMakingAzDevRequestBasedOnDeployment(),
        };
  }

  private static _getAuthTokenForMakingAzDevRequestBasedOnDeployment(): string {
    if (AzureDevOpsService.targetAzDevDeployment === TargetAzDevDeployment.Devfabric) {
      const authTokenOverride = Url.getFeatureValue(CommonConstants.FeatureFlags.authTokenOverride);
      if (!authTokenOverride) {
        throw new Error('You are using Devfabric environment but PAT is not provided');
      }
      const auth = 'Basic ';
      let pat = ':';
      pat = pat.concat(authTokenOverride);
      return auth.concat(btoa(pat));
    } else {
      return getArmToken();
    }
  }
}
