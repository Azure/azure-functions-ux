import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '@fluentui/react';

import { defaultCellStyle } from '../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import { ThemeContext } from '../../../ThemeContext';
import { azureAppConfigRefStart } from '../../../utils/CommonConstants';

import { iconStyle, sourceTextStyle } from './AppSettings.styles';
import { ReferenceSummary } from './AppSettings.types';
import { isServiceLinkerVisible, isSettingServiceLinker } from './AppSettings.utils';
import {
  getAzureConfigRefAriaLabel,
  getKeyVaultRefAriaLabel,
  getReferenceStatusIconColor,
  getReferenceStatusIconProps,
} from './AppSettingsFormData';

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
        <div className={defaultCellStyle} aria-label={getAzureConfigRefAriaLabel(filteredReference[0], t)}>
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
        <div className={defaultCellStyle} aria-label={getKeyVaultRefAriaLabel(filteredReference[0], t)}>
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
