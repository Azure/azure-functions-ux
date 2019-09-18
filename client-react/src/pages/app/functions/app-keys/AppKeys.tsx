import React, { useContext } from 'react';
import { AppKeysFormValues } from './AppKeys.types';
import { commandBarSticky, formStyle, messageBanner } from './AppKeys.styles';
import AppKeysCommandBar from './AppKeysCommandBar';
import { useTranslation } from 'react-i18next';
import AppKeysPivot from './AppKeysPivot';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { ThemeContext } from '../../../../ThemeContext';

export interface AppKeysProps {
  resourceId: string;
  initialValues: AppKeysFormValues;
  refreshData: () => void;
}

export const emptyKey = { name: '', value: '' };

const AppKeys: React.FC<AppKeysProps> = props => {
  const { refreshData, initialValues, resourceId } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  return (
    <div>
      <div id="command-bar" className={commandBarSticky}>
        <AppKeysCommandBar refreshFunction={refreshData} />
        <MessageBar id="app-keys-message" isMultiline={false} className={messageBanner(theme)} messageBarType={MessageBarType.info}>
          {t('appKeysInformationBanner')}
        </MessageBar>
      </div>
      <div id="app-keys-data" className={formStyle}>
        <AppKeysPivot refreshData={refreshData} initialValues={initialValues} resourceId={resourceId} />
      </div>
    </div>
  );
};

export default AppKeys;
