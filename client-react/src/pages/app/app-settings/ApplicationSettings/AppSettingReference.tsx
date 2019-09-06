import React from 'react';
import { useTranslation } from 'react-i18next';
import InformationLabel from '../../../../components/InformationLabel/InformationLabel';
import { KeyVaultReference } from '../../../../models/site/config';

export interface AppSettingReferenceProps {
  appSettingReference: KeyVaultReference;
}

const AppSettingReference: React.SFC<AppSettingReferenceProps> = props => {
  const { t } = useTranslation();
  const { status, vaultName = '', secretName = '', secretVersion = '', details, identityType = '' } = props.appSettingReference;

  const isValidValue = (value: string) => {
    return value && value.length > 0;
  };

  const getLabelPropsForStatus = () => {
    if (isResolved(status)) {
      return { icon: 'Completed', type: 'success' };
    } else {
      return { icon: 'ErrorBadge', type: 'error' };
    }
  };

  const isResolved = (status: string) => {
    return status.toLocaleLowerCase() === 'resolved';
  };

  const getIdentityValue = () => {
    return identityType.toLocaleLowerCase() === 'userassigned' ? 'User' : 'System';
  };

  const vaultNameUri = vaultName ? `https://${vaultName}.vault.azure.net/` : '';
  const secretNameUri = secretName ? `${vaultNameUri}/secrets/${secretName}/` : '';
  const secretVersionUri = secretVersion ? `${secretNameUri}/${secretVersion}` : '';

  return (
    <>
      <div id="app-settings-key-vault">
        <h3>{t('keyVaultReferenceDetails')}</h3>
        <div>
          {isValidValue(vaultName) && (
            <InformationLabel value={vaultName} id="key-vault-name" link={vaultNameUri} label={t('keyVaultName')} />
          )}
          {isValidValue(secretName) && (
            <InformationLabel value={secretName} id="key-secret-name" link={secretNameUri} label={t('keyVaultSecretName')} />
          )}
          {isValidValue(secretVersion) && (
            <InformationLabel value={secretVersion} id="key-secret-version" link={secretVersionUri} label={t('keyVaultSecretVersion')} />
          )}
          {isValidValue(identityType) && (
            <InformationLabel value={`${getIdentityValue()} assigned managed identity`} id="key-identity" label={t('identity')} />
          )}
          <InformationLabel value={status} id="key-status" label={t('status')} labelProps={getLabelPropsForStatus()} />
          {!isResolved(status) && <InformationLabel value={details} id="key-error-details" label={t('errorDetails')} />}
        </div>
      </div>
    </>
  );
};
export default AppSettingReference;
