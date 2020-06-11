import React from 'react';
import { AppKeysFormValues } from './AppKeys.types';
import { commandBarSticky, formStyle } from './AppKeys.styles';
import AppKeysCommandBar from './AppKeysCommandBar';
import AppKeysPivot from './AppKeysPivot';

export interface AppKeysProps {
  resourceId: string;
  loading: boolean;
  initialValues: AppKeysFormValues | null;
  refreshData: () => void;
  appPermission: boolean;
}

export const emptyKey = { name: '', value: '' };

const AppKeys: React.FC<AppKeysProps> = props => {
  const { refreshData, initialValues, resourceId, loading, appPermission } = props;

  return (
    <div>
      <div id="command-bar" className={commandBarSticky}>
        <AppKeysCommandBar refreshFunction={refreshData} loading={loading} appPermission={appPermission} />
      </div>
      <div id="app-keys-data" className={formStyle}>
        <AppKeysPivot
          loading={loading}
          refreshData={refreshData}
          initialValues={initialValues}
          resourceId={resourceId}
          appPermission={appPermission}
        />
      </div>
    </div>
  );
};

export default AppKeys;
