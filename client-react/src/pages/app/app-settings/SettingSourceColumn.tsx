import { Icon } from 'office-ui-fabric-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { defaultCellStyle } from '../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import { ThemeContext } from '../../../ThemeContext';
import { keyVaultIconStyle, sourceTextStyle } from './AppSettings.styles';
import { KeyVaultReferenceSummary } from './AppSettings.types';
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
  const filteredReference = references.filter(ref => ref.name.toLowerCase() === name);

  if (filteredReference.length > 0) {
    return (
      <div
        className={defaultCellStyle}
        aria-label={`${t('azureKeyVault')} ${!isKeyVaultReferenceResolved(filteredReference[0]) && 'not'} resolved`}>
        <Icon
          iconName={isKeyVaultReferenceResolved(filteredReference[0]) ? 'Completed' : 'ErrorBadge'}
          className={keyVaultIconStyle(theme, isKeyVaultReferenceResolved(filteredReference[0]))}
          ariaLabel={t('azureKeyVault')}
        />
        <span className={sourceTextStyle}>{t('azureKeyVault')}</span>
      </div>
    );
  } else if (isServiceLinkerVisible() && isSettingServiceLinker(name)) {
    return (
      <div className={defaultCellStyle} aria-label={t('serviceLinker')}>
        {t('serviceLinker')}
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
