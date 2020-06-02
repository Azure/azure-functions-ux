import { ArmObj } from '../../../models/arm-obj';
import { PublishingUser } from '../../../models/site/publish';
import { SiteConfig } from '../../../models/site/config';
import { DeploymentCenterFormData, DeploymentCenterYupValidationSchemaType } from './DeploymentCenter.types';
import i18next from 'i18next';
import { KeyValue } from '../../../models/portal-models';

export abstract class DeploymentCenterFormBuilder {
  protected _publishingUser: ArmObj<PublishingUser>;
  protected _siteConfig: ArmObj<SiteConfig>;
  protected _applicationSettings: ArmObj<KeyValue<string>>;
  protected _t: i18next.TFunction;

  constructor(t: i18next.TFunction) {
    this._t = t;
  }

  public setPublishingUser(publishingUser: ArmObj<PublishingUser>) {
    this._publishingUser = publishingUser;
  }

  public setSiteConfig(siteConfig: ArmObj<SiteConfig>) {
    this._siteConfig = siteConfig;
  }

  public setApplicationSettings(applicationSettings: ArmObj<KeyValue<string>>) {
    this._applicationSettings = applicationSettings;
  }

  public abstract generateFormData(): DeploymentCenterFormData;

  public abstract generateYupValidationSchema(): DeploymentCenterYupValidationSchemaType;
}
