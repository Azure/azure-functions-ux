import { Icon } from '@fluentui/react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { defaultCellStyle } from '../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import { ThemeContext } from '../../../ThemeContext';
import { keyVaultIconStyle, sourceTextStyle } from './AppSettings.styles';
import { KeyVaultReferenceSummary } from './AppSettings.types';
import { isServiceLinkerVisible, isSettingServiceLinker } from './AppSettings.utils';
import {
  isKeyVaultReferenceResolved,
  getKeyVaultReferenceStatusIconProps,
  getKeyVaultReferenceStatusIconColor,
} from './AppSettingsFormData';
import { azureAppConfigRefStart } from '../../../utils/CommonConstants';

export interface SettingSourceColumnProps {
  name: string;
  value?: string;
  references: KeyVaultReferenceSummary[];
}

const SettingSourceColumn: React.FC<SettingSourceColumnProps> = props => {
  const { name, value, references } = props;
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  const updatedName = name.toLowerCase();
  const updatedValue = value?.toLowerCase();
  const filteredReference = references.filter(ref => ref.name.toLowerCase() === updatedName);
  if (updatedValue?.startsWith(azureAppConfigRefStart)) {
    return (
      <div className={defaultCellStyle} aria-label={t('azureAppConfigValue')}>
        {t('azureAppConfigRefValue')}
      </div>
    );
  } else if (filteredReference.length > 0) {
    return (
      <div
        className={defaultCellStyle}
        aria-label={`${t('azureKeyVault')} ${!isKeyVaultReferenceResolved(filteredReference[0]) && 'not'} resolved`}>
        <Icon
          iconName={getKeyVaultReferenceStatusIconProps(filteredReference[0]).icon}
          className={keyVaultIconStyle(theme, getKeyVaultReferenceStatusIconColor(filteredReference[0], theme))}
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
      <div className={defaultCellStyle} aria-label={t('azureAppServiceValue')}>
        {t('azureAppServiceValue')}
      </div>
    );
  }
};

export default SettingSourceColumn;
