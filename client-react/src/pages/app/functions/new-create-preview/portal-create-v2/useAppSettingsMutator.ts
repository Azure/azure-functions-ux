import { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../../../ApiHelpers/ArmHelper';
import { PortalContext } from '../../../../../PortalContext';
import { ArmObj } from '../../../../../models/arm-obj';
import { LogCategories } from '../../../../../utils/LogCategories';
import { getTelemetryInfo } from '../../../../../utils/TelemetryUtils';
import FunctionCreateData from '../FunctionCreate.data';

export function useAppSettingsMutator(resourceId: string) {
  const { t } = useTranslation();
  const portalCommunicator = useContext(PortalContext);

  const updateAppSettings = useCallback(
    async (appSettings: Partial<ArmObj<Record<string, string>>>) => {
      const notificationId = portalCommunicator.startNotification(t('configUpdating'), t('configUpdating'));
      const response = await FunctionCreateData.updateAppSettings(resourceId, appSettings);

      if (response.metadata.success) {
        portalCommunicator.stopNotification(notificationId, true, t('configUpdateSuccess'));
      } else {
        const errorMessage = getErrorMessage(response.metadata.error);
        const description = errorMessage || t('configUpdateFailure');
        portalCommunicator.stopNotification(notificationId, false, description);
        portalCommunicator.log(
          getTelemetryInfo('error', LogCategories.functionCreate, 'updateAppSettings', {
            error: response.metadata.error,
            message: 'Unable to update app settings',
          })
        );

        throw new Error(errorMessage);
      }
    },
    [portalCommunicator, resourceId, t]
  );

  return updateAppSettings;
}
