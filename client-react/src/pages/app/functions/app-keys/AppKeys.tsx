import React from 'react';
import { AppKeysFormValues } from './AppKeys.types';
import { commandBarSticky, formStyle } from './AppKeys.styles';
import AppKeysCommandBar from './AppKeysCommandBar';
import InformationBanner from '../../../../components/InformationBanner/InformationBanner';
import { useTranslation } from 'react-i18next';
import AppKeysPivot from './AppKeysPivot';

export interface AppKeysProps {
  resourceId: string;
  initialValues: AppKeysFormValues;
  refreshData: () => void;
}

export const emptyKey = { name: '', value: '' };

const AppKeys: React.FC<AppKeysProps> = props => {
  const { refreshData, initialValues, resourceId } = props;
  const { t } = useTranslation();

  return (
    <div>
      <div id="command-bar" className={commandBarSticky}>
        <AppKeysCommandBar refreshFunction={refreshData} />
        <InformationBanner id="function-app-keys" infoBubbleMessage={t('appKeysInformationBanner')} learnMoreLink="portal.azure.com" />
      </div>
      <div id="app-keys-data" className={formStyle}>
        <AppKeysPivot refreshData={refreshData} initialValues={initialValues} resourceId={resourceId} />
      </div>
    </div>
  );
};

export default AppKeys;
