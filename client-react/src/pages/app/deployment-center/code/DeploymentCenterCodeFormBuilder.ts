import { ScmTypes } from '../../../../models/site/config';
import { DeploymentCenterFormData, DeploymentCenterYupValidationSchemaType, DeploymentCenterCodeFormData } from '../DeploymentCenter.types';
import * as Yup from 'yup';
import { DeploymentCenterFormBuilder } from '../DeploymentCenterFormBuilder';

export class DeploymentCenterCodeFormBuilder extends DeploymentCenterFormBuilder {
  public generateFormData(): DeploymentCenterFormData<DeploymentCenterCodeFormData> {
    return {
      publishingUsername: this._publishingUser ? this._publishingUser.properties.publishingUserName : '',
      publishingPassword: '',
      publishingConfirmPassword: '',
      scmType: this._siteConfig ? this._siteConfig.properties.scmType : ScmTypes.None,
      sourceProvider: ScmTypes.None,
      buildProvider: ScmTypes.None,
    };
    // TODO(t-kakan): Properly set sourceProvider and buildProvider rather than setting them to None
  }

  public generateYupValidationSchema(): DeploymentCenterYupValidationSchemaType<DeploymentCenterCodeFormData> {
    // NOTE(michinoy): The password should be at least eight characters long and must contain letters, numbers, and symbol.
    const passwordMinimumRequirementsRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/);
    const usernameMinLength = 3;

    return Yup.object().shape({
      publishingUsername: Yup.string().test(
        'usernameMinCharsIfEntered',
        this._t('usernameLengthRequirements').format(usernameMinLength),
        value => {
          return !value || value.length >= usernameMinLength;
        }
      ),
      publishingPassword: Yup.string().test('validateIfNeeded', this._t('userCredsError'), value => {
        return !value || passwordMinimumRequirementsRegex.test(value);
      }),
      // NOTE(michinoy): Cannot use the arrow operator for the test function as 'this' context is required.
      publishingConfirmPassword: Yup.string().test('validateIfNeeded', this._t('nomatchpassword'), function(value) {
        return !this.parent.publishingPassword || this.parent.publishingPassword === value;
      }),
      scmType: Yup.mixed().required(),
      sourceProvider: Yup.mixed().required(),
      buildProvider: Yup.mixed().required(),
    });
  }
}
