import React from 'react';
import { AppKeysFormValues } from './AppKeys.types';
import { useTranslation } from 'react-i18next';
import HostKeys from './HostKeys';
import SystemKeys from './SystemKeys';

interface AppKeysPivotProps {
  resourceId: string;
  initialValues: AppKeysFormValues;
  refreshHostKeys: () => void;
  refreshSystemKeys: () => void;
}

const AppKeysPivot: React.FC<AppKeysPivotProps> = props => {
  const { t } = useTranslation();
  const { refreshHostKeys, refreshSystemKeys, initialValues, resourceId } = props;

  return (
    <>
      <h3>{t('appKeysHost')}</h3>
      <div id="app-keys-host-keys">
        <HostKeys hostKeys={initialValues.hostKeys} resourceId={resourceId} refreshHostKeys={refreshHostKeys} />
      </div>
      <h3>{t('appKeysSystem')}</h3>
      <div id="app-keys-system-keys">
        <SystemKeys systemKeys={initialValues.systemKeys} resourceId={resourceId} refreshSystemKeys={refreshSystemKeys} />
      </div>
    </>
  );
};

export default AppKeysPivot;
