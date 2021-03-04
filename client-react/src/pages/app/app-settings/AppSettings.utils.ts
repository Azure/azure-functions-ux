import { CommonConstants } from '../../../utils/CommonConstants';
import Url from '../../../utils/url';

export const isServiceLinkerVisible = () => {
  return Url.getFeatureValue(CommonConstants.FeatureFlags.showServiceLinkerConnector);
};

export const isSettingServiceLinker = (settingName: string) => {
  return !!settingName && settingName.toLowerCase().startsWith('resourceConnector_');
};
