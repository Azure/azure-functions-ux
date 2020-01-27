import { ArmObj } from '../models/arm-obj';
import { CommonConstants } from './CommonConstants';

export default class FunctionAppService {
  public static getRFPSetting(appSettings: ArmObj<{ [key: string]: string }>): string {
    return (
      appSettings.properties[CommonConstants.AppSettingNames.websiteUseZip] ||
      appSettings.properties[CommonConstants.AppSettingNames.websiteRunFromZip] ||
      appSettings.properties[CommonConstants.AppSettingNames.websiteRunFromPackage] ||
      '0'
    );
  }
}
