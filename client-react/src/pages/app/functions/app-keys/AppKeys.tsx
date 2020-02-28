import React from 'react';
import { AppKeysFormValues } from './AppKeys.types';
import { commandBarSticky, formStyle } from './AppKeys.styles';
import AppKeysCommandBar from './AppKeysCommandBar';
import AppKeysPivot from './AppKeysPivot';

export interface AppKeysProps {
  resourceId: string;
  initialLoading: boolean;
  initialValues: AppKeysFormValues | null;
  refreshData: () => void;
}

export const emptyKey = { name: '', value: '' };

const AppKeys: React.FC<AppKeysProps> = props => {
  const { refreshData, initialValues, resourceId, initialLoading } = props;

  return (
    <div>
      <div id="command-bar" className={commandBarSticky}>
        <AppKeysCommandBar refreshFunction={refreshData} initialLoading={initialLoading} />
      </div>
      <div id="app-keys-data" className={formStyle}>
        <AppKeysPivot initialLoading={initialLoading} refreshData={refreshData} initialValues={initialValues} resourceId={resourceId} />
      </div>
    </div>
  );
};

export default AppKeys;
