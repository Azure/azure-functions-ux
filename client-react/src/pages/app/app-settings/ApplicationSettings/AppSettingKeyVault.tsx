import React from 'react';
import { useTranslation } from 'react-i18next';

export interface AppSettingKeyVaultProps {}

const AppSettingKeyVault: React.SFC<AppSettingKeyVaultProps> = props => {
  const { t } = useTranslation();
  return (
    <>
      <div id="app-settings-key-vault">
        <h3>{t('key-vault reference')}</h3>
      </div>
    </>
  );
};

export default AppSettingKeyVault;
