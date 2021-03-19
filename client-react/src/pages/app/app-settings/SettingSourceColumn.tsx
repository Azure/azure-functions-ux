import { Icon } from 'office-ui-fabric-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { defaultCellStyle } from '../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import { ThemeContext } from '../../../ThemeContext';
import { keyVaultIconStyle, sourceTextStyle } from './AppSettings.styles';
import { KeyVaultReferenceStatus, KeyVaultReferenceSummary } from './AppSettings.types';
import { isServiceLinkerVisible, isSettingServiceLinker } from './AppSettings.utils';
import { isKeyVaultReferenceResolved } from './AppSettingsFormData';

export interface SettingSourceColumnProps {
  name: string;
  references: KeyVaultReferenceSummary[];
}

const SettingSourceColumn: React.FC<SettingSourceColumnProps> = props => {
  const { name, references } = props;
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  const updatedName = name.toLowerCase();
  const filteredReference = references.filter(ref => ref.name.toLowerCase() === updatedName);

  const getKeyVaultReferenceStatus = (reference: KeyVaultReferenceSummary): string => {
    return !!reference.status ? reference.status.toLowerCase() : '';
  };

  const getKeyVaultReferenceStatusIconName = (reference: KeyVaultReferenceSummary): string => {
    const status = getKeyVaultReferenceStatus(reference);
    if (status === KeyVaultReferenceStatus.resolved) {
      return 'Completed';
    }
    if (status === KeyVaultReferenceStatus.initialized) {
      return 'Info12';
    }
    return 'ErrorBadge';
  };

  const getKeyVaultReferenceStatusIconColor = (reference: KeyVaultReferenceSummary): string => {
    const status = getKeyVaultReferenceStatus(reference);
    if (status === KeyVaultReferenceStatus.resolved) {
      return theme.semanticColors.inlineSuccessText;
    }
    if (status === KeyVaultReferenceStatus.initialized) {
      return theme.semanticColors.infoIcon;
    }
    return theme.semanticColors.inlineErrorText;
  };

  if (filteredReference.length > 0) {
    return (
      <div
        className={defaultCellStyle}
        aria-label={`${t('azureKeyVault')} ${!isKeyVaultReferenceResolved(filteredReference[0]) && 'not'} resolved`}>
        <Icon
          iconName={getKeyVaultReferenceStatusIconName(filteredReference[0])}
          className={keyVaultIconStyle(theme, getKeyVaultReferenceStatusIconColor(filteredReference[0]))}
          ariaLabel={t('azureKeyVault')}
        />
        <span className={sourceTextStyle}>{t('azureKeyVault')}</span>
      </div>
    );
    // NOTE (krmitta): This value is shown only with the flag, and is currently for the private preview
  } else if (isServiceLinkerVisible() && isSettingServiceLinker(updatedName)) {
    return (
      <div className={defaultCellStyle} aria-label={t('resourceConnector')}>
        {t('resourceConnector')}
      </div>
    );
  } else {
    return (
      <div className={defaultCellStyle} aria-label={t('appConfigValue')}>
        {t('appConfigValue')}
      </div>
    );
  }
};

export default SettingSourceColumn;
