import { TranslateService } from "@ngx-translate/core";
import { CacheService } from "../../../../shared/services/cache.service";
import { AbstractControl } from "@angular/forms";

export class VstsValidators {
    // private _hasValidPermissions(account: VSTSModels.Account, project: TFS_Common_Models.ProjectViewModel): Q.Promise<any> {
    //     if (project == null || account == null) {
    //         return Q.resolve({
    //             valid: true,
    //             message: ""
    //         });
    //     }

    //     var defer = Q.defer<any>();
    //     ValidationUtils.ValidationUtils.getVstsPermissions(account, project).then((permissions: ContinousIntegrationModel.BuildReleasePermissions) => {
    //         if (project.id() === this._currentProject.id()) {
    //             defer.resolve({
    //                 valid: permissions.hasPermissions,
    //                 message: permissions.message
    //             });
    //         }
    //     },
    //         () => {
    //             defer.resolve({
    //                 valid: true,
    //                 message: ReleaseManagementResources.failedToValidatePermissions
    //             });
    //         }
    //     );
    //     return defer.promise;
    // }

    static createProjectPermissionsValidator(_translateService: TranslateService,
        _cacheService: CacheService,
        _siteId: string) {
        return (control: AbstractControl) => {


        };
    }
}