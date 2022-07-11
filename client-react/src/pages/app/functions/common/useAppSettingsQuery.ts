import { useEffect, useState } from 'react';
import { getErrorMessageOrStringify } from '../../../../ApiHelpers/ArmHelper';
import SiteService from '../../../../ApiHelpers/SiteService';
import { ArmObj } from '../../../../models/arm-obj';
import { LogCategories } from '../../../../utils/LogCategories';
import LogService from '../../../../utils/LogService';

export const useAppSettingsQuery = (resourceId: string) => {
  const [appSettings, setAppSettings] = useState<ArmObj<Record<string, string>>>();

  useEffect(() => {
    SiteService.fetchApplicationSettings(resourceId).then(response => {
      if (response.metadata.success) {
        setAppSettings(response.data);
      } else {
        LogService.error(
          LogCategories.bindingResource,
          'getAppSettings',
          `Failed to get appSettings: ${getErrorMessageOrStringify(response.metadata.error)}`
        );
      }
    });
  }, [resourceId]);

  return {
    appSettings,
  };
};
