import i18next from 'i18next';
import * as Yup from 'yup';

import { ArmObj } from '../../../models/arm-obj';
import { Environment } from '../../../models/static-site/environment';
import { CommonConstants } from '../../../utils/CommonConstants';

import {
  ConfigurationFormData,
  ConfigurationYupValidationSchemaType,
  EnvironmentVariable,
  PasswordProtectionTypes,
  Snippet,
  StagingEnvironmentPolicyTypes,
} from './Configuration.types';

export class ConfigurationFormBuilder {
  protected _t: i18next.TFunction;

  constructor(t: i18next.TFunction) {
    this._t = t;
  }

  public generateFormData(
    environments?: ArmObj<Environment>[],
    passwordProtection?: PasswordProtectionTypes,
    defaultEnvironment?: ArmObj<Environment>,
    defaultEnvironmentVariables?: EnvironmentVariable[],
    defaultSnippets?: Snippet[],
    stagingEnvironmentPolicy: StagingEnvironmentPolicyTypes = StagingEnvironmentPolicyTypes.Enabled,
    allowConfigFileUpdates: boolean = false
  ): ConfigurationFormData {
    return {
      allowConfigFileUpdates,
      stagingEnvironmentPolicy,
      environments: environments || [],
      environmentVariables: defaultEnvironmentVariables || [],
      passwordProtectionEnvironments: '',
      passwordProtection: passwordProtection || PasswordProtectionTypes.Disabled,
      visitorPassword: '',
      visitorPasswordConfirm: '',
      selectedEnvironment: defaultEnvironment,
      isAppSettingsDirty: false,
      isGeneralSettingsDirty: false,
      snippets: defaultSnippets,
    };
  }

  public generateYupValidationSchema(): ConfigurationYupValidationSchemaType {
    return Yup.object().shape({
      stagingEnvironmentPolicy: Yup.mixed().notRequired(),
      allowConfigFileUpdates: Yup.boolean().notRequired(),
      environmentVariables: Yup.mixed().notRequired(),
      isAppSettingsDirty: Yup.mixed().notRequired(),
      isGeneralSettingsDirty: Yup.mixed().notRequired(),
      selectedEnvironment: Yup.mixed().notRequired(),
      environments: Yup.mixed().notRequired(),
      passwordProtection: Yup.mixed().notRequired(),
      passwordProtectionEnvironments: Yup.mixed().notRequired(),
      snippets: Yup.mixed().notRequired(),
      visitorPassword: Yup.string().test('publishingPasswordRequirements', this._t('staticSite_visitorPasswordRequired'), function(value) {
        if (this.parent.isGeneralSettingsDirty && this.parent.passwordProtection !== PasswordProtectionTypes.Disabled) {
          //NOTE(stpelleg): Key Vault references and urls should be blocked, they do not currently work.
          if (!!value && (CommonConstants.isKeyVaultSecretUrl(value) || CommonConstants.isKeyVaultReference(value))) {
            return false;
          }
          return !!value && CommonConstants.passwordMinimumRequirementsRegex.test(value);
        }
        return true;
      }),
      visitorPasswordConfirm: Yup.string().test(
        'validatePublishingConfirmPassword',
        this._t('staticSite_confirmVisitorPasswordRequired'),
        function(value) {
          if (this.parent.isGeneralSettingsDirty && this.parent.passwordProtection !== PasswordProtectionTypes.Disabled) {
            return !!value && this.parent.visitorPassword === value;
          }
          return true;
        }
      ),
    });
  }
}
