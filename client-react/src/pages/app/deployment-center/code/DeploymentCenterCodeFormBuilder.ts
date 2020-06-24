import { ScmType, BuildProvider } from '../../../../models/site/config';
import { DeploymentCenterFormData, DeploymentCenterYupValidationSchemaType, DeploymentCenterCodeFormData } from '../DeploymentCenter.types';
import * as Yup from 'yup';
import { DeploymentCenterFormBuilder } from '../DeploymentCenterFormBuilder';

export class DeploymentCenterCodeFormBuilder extends DeploymentCenterFormBuilder {
  public generateFormData(): DeploymentCenterFormData<DeploymentCenterCodeFormData> {
    return {
      sourceProvider: ScmType.None,
      buildProvider: BuildProvider.None,
      runtimeStack: '',
      runtimeVersion: '',
      runtimeRecommendedVersion: '',
      gitHubPublishProfileSecretGuid: '',
      ...this.generateCommonFormData(),
    };
  }

  public generateYupValidationSchema(): DeploymentCenterYupValidationSchemaType<DeploymentCenterCodeFormData> {
    return Yup.object().shape({
      sourceProvider: Yup.mixed().required(),
      buildProvider: Yup.mixed().required(),
      runtimeStack: Yup.mixed().notRequired(),
      runtimeVersion: Yup.mixed().notRequired(),
      runtimeRecommendedVersion: Yup.mixed().notRequired(),
      gitHubPublishProfileSecretGuid: Yup.mixed().notRequired(),
      ...this.generateCommonFormYupValidationSchema(),
    });
  }
}
