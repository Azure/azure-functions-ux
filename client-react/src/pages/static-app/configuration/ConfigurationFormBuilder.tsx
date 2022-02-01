import { ConfigurationFormData, ConfigurationYupValidationSchemaType, PasswordProtectionTypes } from './Configuration.types';
import * as Yup from 'yup';
import i18next from 'i18next';
import { ArmObj } from '../../../models/arm-obj';
import { Environment } from '../../../models/static-site/environment';

export class ConfigurationFormBuilder {
  protected _t: i18next.TFunction;

  constructor(t: i18next.TFunction) {
    this._t = t;
  }

  public generateFormData(environments?: ArmObj<Environment>[], passwordProtection?: PasswordProtectionTypes): ConfigurationFormData {
    return {
      environments: environments || [],
      environmentVariables: [],
      passwordProtectionEnvironments: '',
      passwordProtection: passwordProtection || PasswordProtectionTypes.Disabled,
      visitorPassword: '',
      visitorPasswordConfirm: '',
      selectedEnvironment: undefined,
      isAppSettingsDirty: false,
      isGeneralSettingsDirty: false,
    };
  }

  public generateYupValidationSchema(): ConfigurationYupValidationSchemaType {
    const passwordMinimumRequirementsRegex = new RegExp(/^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,})$/);

    return Yup.object().shape({
      environmentVariables: Yup.mixed().notRequired(),
      isAppSettingsDirty: Yup.mixed().notRequired(),
      isGeneralSettingsDirty: Yup.mixed().notRequired(),
      selectedEnvironment: Yup.mixed().notRequired(),
      environments: Yup.mixed().notRequired(),
      passwordProtection: Yup.mixed().notRequired(),
      passwordProtectionEnvironments: Yup.mixed().notRequired(),
      visitorPassword: Yup.string().test('publishingPasswordRequirements', this._t('userCredsError'), value => {
        return !value || passwordMinimumRequirementsRegex.test(value);
      }),
      visitorPasswordConfirm: Yup.string().test('validatePublishingConfirmPassword', this._t('nomatchpassword'), function(value) {
        return !this.parent.visiorPassword || this.parent.visiorPassword === value;
      }),
    });
  }
}
