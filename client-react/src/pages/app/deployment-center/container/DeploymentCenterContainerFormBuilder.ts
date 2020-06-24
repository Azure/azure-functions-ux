import { ScmType } from '../../../../models/site/config';
import {
  DeploymentCenterFormData,
  ContainerOptions,
  ContainerRegistrySources,
  ContainerDockerAccessTypes,
  DeploymentCenterYupValidationSchemaType,
  DeploymentCenterContainerFormData,
} from '../DeploymentCenter.types';
import { CommonConstants } from '../../../../utils/CommonConstants';
import * as Yup from 'yup';
import { DeploymentCenterFormBuilder } from '../DeploymentCenterFormBuilder';

export class DeploymentCenterContainerFormBuilder extends DeploymentCenterFormBuilder {
  public generateFormData(): DeploymentCenterFormData<DeploymentCenterContainerFormData> {
    return {
      scmType: this._siteConfig ? this._siteConfig.properties.scmType : ScmType.None,
      option: ContainerOptions.docker,
      registrySource: this._getContainerRegistrySource(),
      dockerAccessType: ContainerDockerAccessTypes.public,
      serverUrl: '',
      image: '',
      tag: '',
      username: '',
      password: '',
      command: '',
      cicd: false,
      ...this.generateCommonFormData(),
    };
  }

  public generateYupValidationSchema(): DeploymentCenterYupValidationSchemaType<DeploymentCenterContainerFormData> {
    return Yup.object().shape({
      scmType: Yup.mixed().required(),
      option: Yup.mixed().notRequired(),
      registrySource: Yup.mixed().notRequired(),
      dockerAccessType: Yup.mixed().notRequired(),
      serverUrl: Yup.mixed().notRequired(),
      image: Yup.mixed().notRequired(),
      tag: Yup.mixed().notRequired(),
      username: Yup.mixed().notRequired(),
      password: Yup.mixed().notRequired(),
      command: Yup.mixed().notRequired(),
      cicd: Yup.mixed().notRequired(),
      ...this.generateCommonFormYupValidationSchema(),
    });
  }

  private _getContainerRegistrySource(): ContainerRegistrySources {
    const serverUrl = this._applicationSettings && this._applicationSettings[CommonConstants.ContainerConstants.serverUrlSetting];

    if (serverUrl && serverUrl.indexOf(CommonConstants.ContainerConstants.acrUriHost) > -1) {
      return ContainerRegistrySources.acr;
    } else if (serverUrl && serverUrl.indexOf(CommonConstants.ContainerConstants.dockerHubUrl) > -1) {
      return ContainerRegistrySources.docker;
    } else {
      return ContainerRegistrySources.privateRegistry;
    }
  }
}
