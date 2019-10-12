import React from 'react';
import { AppKeysFormValues } from './AppKeys.types';
import { useTranslation } from 'react-i18next';
import HostKeys from './HostKeys';
import SystemKeys from './SystemKeys';

interface AppKeysPivotProps {
  resourceId: string;
  initialValues: AppKeysFormValues | null;
  initialLoading: boolean;
  refreshData: () => void;
}

const AppKeysPivot: React.FC<AppKeysPivotProps> = props => {
  const { t } = useTranslation();
  const { refreshData, initialValues, resourceId, initialLoading } = props;

  return (
    <>
      <h3>{t('appKeysHost')}</h3>
      <div id="app-keys-host-keys">
        <HostKeys
          initialLoading={initialLoading}
          hostKeys={initialValues ? initialValues.hostKeys : []}
          resourceId={resourceId}
          refreshData={refreshData}
        />
      </div>
      <h3>{t('appKeysSystem')}</h3>
      <div id="app-keys-system-keys">
        <SystemKeys
          initialLoading={initialLoading}
          systemKeys={initialValues ? initialValues.systemKeys : []}
          resourceId={resourceId}
          refreshData={refreshData}
        />
      </div>
    </>
  );
};

export default AppKeysPivot;
