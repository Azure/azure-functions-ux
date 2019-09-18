import React from 'react';
import { AppKeysFormValues } from './AppKeys.types';
import { useTranslation } from 'react-i18next';
import HostKeys from './HostKeys';
import SystemKeys from './SystemKeys';

interface AppKeysPivotProps {
  resourceId: string;
  initialValues: AppKeysFormValues;
  refreshData: () => void;
}

const AppKeysPivot: React.FC<AppKeysPivotProps> = props => {
  const { t } = useTranslation();
  const { refreshData, initialValues, resourceId } = props;

  return (
    <>
      <h3>{t('appKeysHost')}</h3>
      <div id="app-keys-host-keys">
        <HostKeys site={initialValues.site} hostKeys={initialValues.hostKeys} resourceId={resourceId} refreshData={refreshData} />
      </div>
      <h3>{t('appKeysSystem')}</h3>
      <div id="app-keys-system-keys">
        <SystemKeys site={initialValues.site} systemKeys={initialValues.systemKeys} resourceId={resourceId} refreshData={refreshData} />
      </div>
    </>
  );
};

export default AppKeysPivot;
