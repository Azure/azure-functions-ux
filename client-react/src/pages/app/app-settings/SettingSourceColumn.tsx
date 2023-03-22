import { Icon } from '@fluentui/react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { defaultCellStyle } from '../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import { ThemeContext } from '../../../ThemeContext';
import { IconStyle, sourceTextStyle } from './AppSettings.styles';
import { ReferenceSummary } from './AppSettings.types';
import { isServiceLinkerVisible, isSettingServiceLinker } from './AppSettings.utils';
import { isReferenceResolved, getReferenceStatusIconProps, getReferenceStatusIconColor } from './AppSettingsFormData';
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
        <div
          className={defaultCellStyle}
          aria-label={`${t('azureAppConfigValue')} ${!isReferenceResolved(filteredReference[0]) && 'not'} resolved`}>
          <Icon
            iconName={getReferenceStatusIconProps(filteredReference[0]).icon}
            className={IconStyle(theme, getReferenceStatusIconColor(filteredReference[0], theme))}
            ariaLabel={t('azureAppConfigRefValue')}
          />
          <span className={sourceTextStyle}>{t('azureAppConfigRefValue')}</span>
        </div>
      );
    } else {
      return (
        <div
          className={defaultCellStyle}
          aria-label={`${t('azureKeyVault')} ${!isReferenceResolved(filteredReference[0]) && 'not'} resolved`}>
          <Icon
            iconName={getReferenceStatusIconProps(filteredReference[0]).icon}
            className={IconStyle(theme, getReferenceStatusIconColor(filteredReference[0], theme))}
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
