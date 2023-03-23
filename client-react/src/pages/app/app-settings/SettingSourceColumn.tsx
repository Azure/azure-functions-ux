import { Icon } from '@fluentui/react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { defaultCellStyle } from '../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import { ThemeContext } from '../../../ThemeContext';
import { iconStyle, sourceTextStyle } from './AppSettings.styles';
import { ReferenceSummary } from './AppSettings.types';
import { isServiceLinkerVisible, isSettingServiceLinker } from './AppSettings.utils';
import {
  getReferenceStatusIconProps,
  getReferenceStatusIconColor,
  useAzureConfigRefAriaLabel,
  useKeyVaultRefAriaLabel,
} from './AppSettingsFormData';
import { azureAppConfigRefStart } from '../../../utils/CommonConstants';

export interface SettingSourceColumnProps {
  name: string;
  value?: string;
  references: ReferenceSummary[];
}

const SettingSourceColumn: React.FC<SettingSourceColumnProps> = props => {
  const { name, value, references } = props;
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  const updatedName = name.toLowerCase();
  const updatedValue = value?.toLowerCase();
  const filteredReference = references.filter(ref => ref.name.toLowerCase() === updatedName);

  if (filteredReference.length > 0) {
    if (updatedValue?.startsWith(azureAppConfigRefStart)) {
      return (
        <div className={defaultCellStyle} aria-label={useAzureConfigRefAriaLabel(filteredReference[0])}>
          <Icon
            iconName={getReferenceStatusIconProps(filteredReference[0]).icon}
            className={iconStyle(theme, getReferenceStatusIconColor(filteredReference[0], theme))}
            ariaLabel={t('azureAppConfigRefValue')}
          />
          <span className={sourceTextStyle}>{t('azureAppConfigRefValue')}</span>
        </div>
      );
    } else {
      return (
        <div className={defaultCellStyle} aria-label={useKeyVaultRefAriaLabel(filteredReference[0])}>
          <Icon
            iconName={getReferenceStatusIconProps(filteredReference[0]).icon}
            className={iconStyle(theme, getReferenceStatusIconColor(filteredReference[0], theme))}
            ariaLabel={t('azureKeyVault')}
          />
          <span className={sourceTextStyle}>{t('azureKeyVault')}</span>
        </div>
      );
    }
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
