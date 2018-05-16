import { TranslateService } from '@ngx-translate/core';
import { CacheService } from '../../../../shared/services/cache.service';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { DeploymentCenterStateManager } from '../wizard-logic/deployment-center-state-manager';
import { DeploymentCenterConstants } from '../../../../shared/models/constants';
import { PortalResources } from '../../../../shared/models/portal-resources';

export class VstsValidators {
    static createVstsAccountNameValidator(_wizard: DeploymentCenterStateManager,
        _translateService: TranslateService,
        _cacheService: CacheService) {
        return (control: AbstractControl) => {
            if (control && control.value) {
                return Observable.timer(500)
                    .switchMap(() => _cacheService.get(`https://app.vssps.visualstudio.com/_AzureSpsAccount/ValidateAccountName?accountName=${control.value}`, true, _wizard.getVstsDirectHeaders()))
                    .map(res => {
                        const valid = res.json().valid;
                        if (!valid) {
                            return {
                                invalidName: _translateService.instant(PortalResources.vstsNameUnavailable)
                            };
                        }
                        return null;
                    });
            } else {
                return Observable.of(null);
            }
        };

    }
    static createProjectPermissionsValidator(_wizard: DeploymentCenterStateManager,
        _translateService: TranslateService,
        _cacheService: CacheService) {
        return (abstractForm: FormGroup) => {

            const vstsAccountValue: string = abstractForm.get('vstsAccount').value;
            const vstsProject = abstractForm.get('vstsProject');
            const vstsProjectValue: string = vstsProject.value;
            if (vstsAccountValue && vstsProjectValue) {
                return _cacheService.get(`https://${vstsAccountValue}.visualstudio.com/_apis/projects?includeCapabilities=true`)
                    .switchMap(r => {
                        const projectList: [{ id: string, name: string }] = r.json().value;
                        const currentProject = projectList.find(x => x.name.toLowerCase() === vstsProjectValue.toLowerCase());
                        if (currentProject) {
                            const callHeaders = _wizard.getVstsDirectHeaders();
                            callHeaders.append('accept', 'application/json;api-version=3.2-preview.2');
                            return Observable.forkJoin(
                                _cacheService.get(`https://${vstsAccountValue}.visualstudio.com/DefaultCollection/_apis/Permissions/${DeploymentCenterConstants.buildSecurityNameSpace}/${DeploymentCenterConstants.editBuildDefinitionBitMask}?tokens=${currentProject.id}`, true, callHeaders),
                                _cacheService.get(`https://${vstsAccountValue}.visualstudio.com/DefaultCollection/_apis/Permissions/${DeploymentCenterConstants.releaseSecurityNameSpace}/${DeploymentCenterConstants.editReleaseDefinitionPermission}?tokens=${currentProject.id}`, true, callHeaders)
                            );
                        }
                        return Observable.of(null);
                    })
                    .map(results => {
                        if (results && results.length === 2) {
                            const buildPermissions = results[0].json().value[0];
                            const releasePermissions = results[1].json().value[0];
                            if (!buildPermissions || !releasePermissions) {
                                return {
                                    invalidPermissions: _translateService.instant(PortalResources.vstsReleaseBuildPermissions)
                                };
                            }
                        }
                        return null;
                    });
            } else {
                // Account and Project is empty so no validation
                return Observable.of(null);
            }

        };
    }
}


