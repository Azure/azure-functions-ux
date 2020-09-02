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
      ...this.generateCommonFormData(),
    };
  }

  public generateYupValidationSchema(): DeploymentCenterYupValidationSchemaType<DeploymentCenterCodeFormData> {
    return Yup.object().shape({
      sourceProvider: Yup.mixed().test('sourceProviderTest', 'Need Source Provider', value => {
        return value !== ScmType.None;
      }),
      buildProvider: Yup.mixed().required(),
      runtimeStack: Yup.mixed().test('runtimeStackTest', 'Need Runtime Stack', function(value) {
        return this.parent.buildProvider === BuildProvider.GitHubAction ? !!value : true;
      }),
      runtimeVersion: Yup.mixed().test('runtimeStackVersion', 'Need Runtime Stack Version', function(value) {
        return this.parent.buildProvider === BuildProvider.GitHubAction ? !!value : true;
      }),
      runtimeRecommendedVersion: Yup.mixed().notRequired(),
      ...this.generateCommonFormYupValidationSchema(),
    });
  }
}
