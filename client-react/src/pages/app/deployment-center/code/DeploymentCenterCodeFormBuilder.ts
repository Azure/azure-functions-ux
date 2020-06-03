import { ScmTypes } from '../../../../models/site/config';
import { DeploymentCenterFormData, DeploymentCenterYupValidationSchemaType, DeploymentCenterCodeFormData } from '../DeploymentCenter.types';
import * as Yup from 'yup';
import { DeploymentCenterFormBuilder } from '../DeploymentCenterFormBuilder';

export class DeploymentCenterCodeFormBuilder extends DeploymentCenterFormBuilder {
  public generateFormData(): DeploymentCenterFormData<DeploymentCenterCodeFormData> {
    return {
      sourceProvider: ScmTypes.None,
      buildProvider: ScmTypes.None,
      ...this.generatePublishingCredentialsFormData(),
    };
    // TODO(t-kakan): Properly set sourceProvider and buildProvider rather than setting them to None
  }

  public generateYupValidationSchema(): DeploymentCenterYupValidationSchemaType<DeploymentCenterCodeFormData> {
    return Yup.object().shape({
      sourceProvider: Yup.mixed().required(),
      buildProvider: Yup.mixed().required(),
      ...this.generatePublishingCredentailsYupValidationSchema(),
    });
  }
}
