import React from 'react';
import { useTranslation } from 'react-i18next';
import InformationLabel from '../../../../components/InformationLabel/InformationLabel';

export interface AppSettingKeyVaultProps {}

const AppSettingKeyVault: React.SFC<AppSettingKeyVaultProps> = props => {
  const { t } = useTranslation();
  return (
    <>
      <div id="app-settings-key-vault">
        <h3>{t('keyVaultReference')}</h3>
        <div>
          <InformationLabel value="This is value" id="key-vault-name" label="Vault Name" />
          <InformationLabel value="This is Secret" id="key-vault-secret" label="Secret" link="https:/google.com" />
          <InformationLabel value="Resolved" id="key-vault-status" label="Status" icon="completed" type="success" />
        </div>
      </div>
    </>
  );
};

export default AppSettingKeyVault;
