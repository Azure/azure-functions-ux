import { useContext, useEffect, useState } from 'react';

import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import SiteService from '../../../../ApiHelpers/SiteService';
import { ArmObj } from '../../../../models/arm-obj';
import { PortalContext } from '../../../../PortalContext';
import { LogCategories } from '../../../../utils/LogCategories';

import { getTelemetryInfo } from './FunctionsUtility';

export const useAppSettingsQuery = (resourceId: string) => {
  const [appSettings, setAppSettings] = useState<ArmObj<Record<string, string>>>();
  const portalCommunicator = useContext(PortalContext);

  useEffect(() => {
    SiteService.fetchApplicationSettings(resourceId).then(response => {
      if (response.metadata.success) {
        setAppSettings(response.data);
      } else {
        portalCommunicator.log(
          getTelemetryInfo('error', LogCategories.bindingResource, 'getAppSettings', {
            errorAsString: response.metadata.error ? JSON.stringify(response.metadata.error) : '',
            message: getErrorMessage(response.metadata.error),
          })
        );
      }
    });
  }, [portalCommunicator, resourceId]);

  return {
    appSettings,
  };
};
