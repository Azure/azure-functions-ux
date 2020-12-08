import React from 'react';
import { AppKeysFormValues } from './AppKeys.types';
import { useTranslation } from 'react-i18next';
import HostKeys from './HostKeys';
import SystemKeys from './SystemKeys';
import { formDescriptionStyle } from './AppKeys.styles';

interface AppKeysPivotProps {
  resourceId: string;
  initialValues: AppKeysFormValues | null;
  loading: boolean;
  refreshData: () => void;
  appPermission: boolean;
}

const AppKeysPivot: React.FC<AppKeysPivotProps> = props => {
  const { t } = useTranslation();
  const { refreshData, initialValues, resourceId, loading, appPermission } = props;

  return (
    <>
      <h3>{t('appKeysHost')}</h3>
      <p className={formDescriptionStyle}>{t('appKeys_hostKeys_description')}</p>
      <div id="app-keys-host-keys">
        <HostKeys
          loading={loading}
          hostKeys={initialValues ? initialValues.hostKeys : []}
          resourceId={resourceId}
          refreshData={refreshData}
          readOnlyPermission={!appPermission}
        />
      </div>
      <h3>{t('appKeysSystem')}</h3>
      <p className={formDescriptionStyle}>{t('appKeys_systemKeys_description')}</p>
      <div id="app-keys-system-keys">
        <SystemKeys
          loading={loading}
          systemKeys={initialValues ? initialValues.systemKeys : []}
          resourceId={resourceId}
          refreshData={refreshData}
          readOnlyPermission={!appPermission}
        />
      </div>
    </>
  );
};

export default AppKeysPivot;
