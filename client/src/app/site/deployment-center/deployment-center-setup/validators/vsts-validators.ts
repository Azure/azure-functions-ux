import { TranslateService } from '@ngx-translate/core';
import { CacheService } from '../../../../shared/services/cache.service';
import { AzureDevOpsService } from '../wizard-logic/azure-devops.service';
import { AbstractControl } from '@angular/forms';
import { Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { DeploymentCenterStateManager } from '../wizard-logic/deployment-center-state-manager';
import { DeploymentCenterConstants } from '../../../../shared/models/constants';
import { PortalResources } from '../../../../shared/models/portal-resources';

export class VstsValidators {
  static createVstsAccountNameValidator(
    _wizard: DeploymentCenterStateManager,
    _translateService: TranslateService,
    _azureDevOpsService: AzureDevOpsService,
    _cacheService: CacheService
  ) {
    return (control: AbstractControl) => {
      if (control && control.value) {
        return Observable.timer(500)
          .switchMap(() =>
            _cacheService.get(
              `${AzureDevOpsService.AzureDevOpsUrl.Sps}_AzureSpsAccount/ValidateAccountName?accountName=${control.value}`,
              true,
              _azureDevOpsService.getAzDevDirectHeaders(false)
            )
          )
          .map(res => {
            const valid = res.json().valid;
            if (!valid) {
              return {
                invalidName: _translateService.instant(PortalResources.vstsNameUnavailable),
              };
            }
            return null;
          });
      } else {
        return Observable.of(null);
      }
    };
  }

  static createProjectPermissionsValidator(
    _wizard: DeploymentCenterStateManager,
    _translateService: TranslateService,
    _cacheService: CacheService,
    _azureDevOpsService: AzureDevOpsService,
    _accountControl: AbstractControl
  ) {
    return (projectControl: AbstractControl) => {
      const vstsAccountValue: string = _accountControl.value;
      const vstsProjectValue: string = projectControl.value;
      if (vstsAccountValue && vstsProjectValue) {
        return _azureDevOpsService.getAccounts().switchMap(r => {
          const appendMsaPassthroughHeader = r.find(x => x.AccountName.toLowerCase() === vstsAccountValue.toLowerCase())!
            .ForceMsaPassThrough;
          const callHeaders = _azureDevOpsService.getAzDevDirectHeaders(appendMsaPassthroughHeader);
          return _cacheService
            .get(AzureDevOpsService.AzDevProjectsApi.format(vstsAccountValue), true, callHeaders)
            .concatMap(r => {
              const projectList: [{ id: string; name: string }] = r.json().value;
              const currentProject = projectList.find(x => x.name.toLowerCase() === vstsProjectValue.toLowerCase());
              if (currentProject) {
                callHeaders.append('accept', 'application/json;api-version=5.0');
                // need to ping the release rp in vso in order to subscribe to user to the RP, otherwise the rp call will fail
                return _cacheService
                  .get(
                    `${AzureDevOpsService.AzureDevOpsUrl.Rmo}${vstsAccountValue}/${currentProject.id}/_apis/Release/definitions`,
                    true,
                    callHeaders
                  )
                  .switchMap(() => {
                    return Observable.forkJoin(
                      _cacheService.get(
                        `${AzureDevOpsService.AzureDevOpsUrl.Tfs}${vstsAccountValue}/_apis/Permissions/${
                          DeploymentCenterConstants.buildSecurityNameSpace
                        }/${DeploymentCenterConstants.editBuildDefinitionBitMask}?tokens=${currentProject.id}`,
                        true,
                        callHeaders
                      ),
                      _cacheService.get(
                        `${AzureDevOpsService.AzureDevOpsUrl.Tfs}${vstsAccountValue}/_apis/Permissions/${
                          DeploymentCenterConstants.releaseSecurityNameSpace
                        }/${DeploymentCenterConstants.editReleaseDefinitionPermission}?tokens=${currentProject.id}`,
                        true,
                        callHeaders
                      ),
                      _cacheService.get(
                        `${AzureDevOpsService.AzureDevOpsUrl.Tfs}${vstsAccountValue}/${
                          currentProject.id
                        }/_apis/distributedtask/queues?queueNames=${DeploymentCenterConstants.agentQueueNames.join(',')}&actionFilter=${
                          DeploymentCenterConstants.queueActionFilter
                        }&api-version=5.1-preview.1`,
                        true,
                        callHeaders
                      ),
                      VstsValidators.checkTfsGitRepoCreatePermission(
                        _wizard,
                        _cacheService,
                        vstsAccountValue,
                        currentProject.id,
                        callHeaders
                      ),
                      VstsValidators.isAzurePipelinesFeatureEnabled(_cacheService, vstsAccountValue, currentProject.id, callHeaders)
                    );
                  });
              }
              return Observable.of(null);
            })
            .map(results => {
              if (results && results.length === 5) {
                const buildPermissions = results[0] ? results[0].json().value[0] : true;
                const releasePermissions = results[1] ? results[1].json().value[0] : true;
                const queuePermissions = results[2] && results[2].json().count > 0 ? true : false;
                const createRepoPermission = results[3] ? results[3].json().value[0] : true;
                const isPipelineFeatureEnabled = results[4];
                if (!buildPermissions || !releasePermissions) {
                  return {
                    invalidPermissions: _translateService.instant(PortalResources.vstsReleaseBuildPermissions),
                  };
                }

                if (!queuePermissions) {
                  return {
                    invalidPermissions: _translateService.instant(PortalResources.vstsAgentQueuePermissions),
                  };
                }

                if (!createRepoPermission) {
                  return {
                    invalidPermissions: _translateService.instant(PortalResources.vstsCreateRepoPermissions),
                  };
                }

                if (!isPipelineFeatureEnabled) {
                  return {
                    invalidPermissions: _translateService.instant(PortalResources.vstsPipelinesNotEnabled),
                  };
                }
              }
              return null;
            })
            .catch(() => {
              // if there is an error fetching permissions, better to just assume they have them to avoid blocking
              return Observable.of(null);
            });
        });
      } else {
        // Account and Project is empty so no validation
        return Observable.of(null);
      }
    };
  }

  static checkTfsGitRepoCreatePermission(
    _wizard: DeploymentCenterStateManager,
    _cacheService: CacheService,
    _vstsAccountName: string,
    _vstsProjectId: string,
    _callHeaders: Headers
  ): Observable<Response> {
    if (_wizard.wizardValues.sourceProvider === 'localgit') {
      return _cacheService.get(
        `${AzureDevOpsService.AzureDevOpsUrl.Tfs}${_vstsAccountName}/_apis/Permissions/${
          DeploymentCenterConstants.tfsGitSecurityNameSpace
        }/${DeploymentCenterConstants.createRepositoryPermission}?tokens=repoV2/${_vstsProjectId}`,
        true,
        _callHeaders
      );
    }

    return Observable.of(null);
  }

  static isAzurePipelinesFeatureEnabled(
    _cacheService: CacheService,
    _vstsAccountName: string,
    _vstsProjectId: string,
    _callHeaders: Headers
  ): Observable<boolean> {
    const featureQueryPayload = {
      featureIds: [DeploymentCenterConstants.vstsPipelineFeatureId],
      scopeValues: {
        project: _vstsProjectId,
      },
    };

    return _cacheService
      .post(
        `${
          AzureDevOpsService.AzureDevOpsUrl.Tfs
        }${_vstsAccountName}/_apis/FeatureManagement/FeatureStatesQuery/host/project/${_vstsProjectId}?api-version=4.1-preview.1`,
        true,
        _callHeaders,
        featureQueryPayload
      )
      .map(response => {
        let featureStates = response.json().featureStates;
        if (featureStates && featureStates[DeploymentCenterConstants.vstsPipelineFeatureId]) {
          return featureStates[DeploymentCenterConstants.vstsPipelineFeatureId].state.toLowerCase() === 'enabled';
        }

        return true;
      });
  }
}
