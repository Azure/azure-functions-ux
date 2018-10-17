import { AsyncValidator, FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { CustomFormControl } from './../../../controls/click-to-edit/click-to-edit.component';
import { PortalResources } from './../../../shared/models/portal-resources';
import { ApplicationSettingInfo, ApplicationSettings } from './../../../shared/models/arm/application-settings';
import { ConnectionStringInfo, ConnectionStrings } from './../../../shared/models/arm/connection-strings';
import { SiteService } from './../../../shared/services/site.service';

export class CloneSrcValidator implements AsyncValidator {
  constructor(private _siteService: SiteService, private _translateService: TranslateService, private _formGroup: FormGroup) {}

  validate(control: FormControl) {
    if (!this._formGroup) {
      throw new Error('FormGroup for validator cannot be null');
    }

    const nameCtrl: FormControl = this._formGroup.get('name') as FormControl;
    const cloneSrcIdCtrl: FormControl = this._formGroup.get('cloneSrcId') as FormControl;
    const cloneSrcConfigCtrl: FormControl = this._formGroup.get('cloneSrcConfig') as FormControl;

    if (!nameCtrl || !cloneSrcIdCtrl || !cloneSrcConfigCtrl) {
      throw new Error('Validator requires FormGroup with the following controls: name, cloneSrcId, cloneSrcConfig');
    }

    if (control !== cloneSrcIdCtrl) {
      throw new Error('FormGroup for validator must be parent of FormControl being validated');
    }

    if (!(nameCtrl as CustomFormControl)._msRunValidation) {
      (nameCtrl as CustomFormControl)._msRunValidation = true;

      if (nameCtrl.pristine) {
        nameCtrl.updateValueAndValidity();
      }
    }

    cloneSrcConfigCtrl.setValue(null);

    const cloneSrcId = cloneSrcIdCtrl.value;

    if (!cloneSrcId) {
      return Promise.resolve({
        required: this._translateService.instant(PortalResources.validation_requiredError),
      });
    } else if (cloneSrcId === '-') {
      return Promise.resolve(null);
    } else {
      return new Promise(resolve => {
        Observable.zip(
          this._siteService.getSiteConfig(cloneSrcId),
          this._siteService.getAppSettings(cloneSrcId),
          this._siteService.getConnectionStrings(cloneSrcId)
        ).subscribe(r => {
          const [siteConfigResult, appSettingsResult, connectionStringsResult] = r;

          if (siteConfigResult.isSuccessful && appSettingsResult.isSuccessful && connectionStringsResult.isSuccessful) {
            const cloneSrcConfig = siteConfigResult.result.properties;
            cloneSrcConfig.appSettings = this._convertAppSettings(appSettingsResult.result.properties);
            cloneSrcConfig.connectionStrings = this._convertConnectionStrings(connectionStringsResult.result.properties);
            cloneSrcConfigCtrl.setValue(cloneSrcConfig);
            resolve(null);
          } else {
            resolve({
              configReadError: this._translateService.instant(PortalResources.cloneConfigLoadFailure), // TODO [andimarc]: Include reason?
            });
          }
        });
      });
    }
  }

  // This just converts the app settings object from the format in which we retrieve it from ARM (map)
  // to the format that ARM accepts as part of a SiteConfig paylaod (array)
  private _convertAppSettings(applicationSettings: ApplicationSettings): ApplicationSettingInfo[] {
    const result: ApplicationSettingInfo[] = [];

    for (const key of Object.keys(applicationSettings)) {
      result.push({
        name: key,
        value: applicationSettings[key],
      });
    }

    return result;
  }

  // This just converts the connection strings object from the format in which we retrieve it from ARM (map)
  // to the format that ARM accepts as part of a SiteConfig paylaod (array)
  private _convertConnectionStrings(connectionStrings: ConnectionStrings): ConnectionStringInfo[] {
    const result: ConnectionStringInfo[] = [];

    for (const key of Object.keys(connectionStrings)) {
      result.push({
        name: key,
        connectionString: connectionStrings[key].value,
        type: connectionStrings[key].type,
      });
    }

    return result;
  }
}
