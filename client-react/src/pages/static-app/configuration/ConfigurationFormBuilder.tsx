import { ConfigurationFormData, ConfigurationYupValidationSchemaType, PasswordProtectionTypes } from './Configuration.types';
import * as Yup from 'yup';
import i18next from 'i18next';

export class ConfigurationFormBuilder {
  protected _t: i18next.TFunction;

  constructor(t: i18next.TFunction) {
    this._t = t;
  }

  public generateFormData(): ConfigurationFormData {
    return {
      environments: [],
      passwordProtectionEnvironments: '',
      passwordProtection: PasswordProtectionTypes.Disabled,
      visiorPassword: '',
      visitorPasswordConfirm: '',
    };
  }

  public generateYupValidationSchema(): ConfigurationYupValidationSchemaType {
    const passwordMinimumRequirementsRegex = new RegExp(/^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,})$/);

    return Yup.object().shape({
      environments: Yup.mixed().notRequired(),
      passwordProtection: Yup.mixed().notRequired(),
      passwordProtectionEnvironments: Yup.mixed().notRequired(),
      visiorPassword: Yup.string().test('publishingPasswordRequirements', this._t('userCredsError'), value => {
        return !value || passwordMinimumRequirementsRegex.test(value);
      }),
      visitorPasswordConfirm: Yup.string().test('validatePublishingConfirmPassword', this._t('nomatchpassword'), function(value) {
        return !this.parent.visiorPassword || this.parent.visiorPassword === value;
      }),
    });
  }
}
