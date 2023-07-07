import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CommandBarStyles } from '../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { PortalContext } from '../../../PortalContext';
import { CustomCommandBarButton } from '../../../components/CustomCommandBarButton';
import { IButtonProps, CommandBar, ICommandBarItemProps } from '@fluentui/react';
import StringUtils from '../../../utils/string';
import { isServiceLinkerVisible } from './AppSettings.utils';
import { ServiceLinkerProps } from './AppSettings.types';

interface AppSettingsCommandBarProps {
  onSave: () => void;
  resetForm: () => void;
  refreshAppSettings: () => void;
  dirty: boolean;
  disabled: boolean;
}

type AppSettingsCommandBarPropsCombined = AppSettingsCommandBarProps & ServiceLinkerProps;
const AppSettingsCommandBar: React.FC<AppSettingsCommandBarPropsCombined> = props => {
  const { onSave, resetForm, refreshAppSettings, dirty, disabled, onResourceConnectionClick } = props;
  const { t } = useTranslation();

  const portalCommunicator = useContext(PortalContext);
  const overflowButtonProps: IButtonProps = { ariaLabel: t('moreCommands') };

  const getRefreshButton = (dirty: boolean, disabled: boolean): ICommandBarItemProps => {
    return {
      key: 'refresh',
      name: t('refresh'),
      iconProps: {
        iconName: 'Refresh',
      },
      disabled: disabled,
      ariaLabel: t('appSettingsRefreshAriaLabel'),
      onClick: refreshAppSettings,
    };
  };

  const getSaveButton = (dirty: boolean, disabled: boolean): ICommandBarItemProps => {
    return {
      key: 'save',
      name: t('save'),
      iconProps: {
        iconName: 'Save',
      },
      disabled: !dirty || disabled,
      ariaLabel: t('appSettingsSaveAriaLabel'),
      onClick: onSave,
    };
  };

  const getDiscardButton = (dirty: boolean, disabled: boolean): ICommandBarItemProps => {
    return {
      key: 'discard',
      name: t('discard'),
      iconProps: {
        iconName: 'ChromeClose',
      },
      disabled: !dirty || disabled,
      ariaLabel: t('appSettingsDiscardAriaLabel'),
      onClick: () => resetForm(),
    };
  };

  const getFeedbackItem = (): ICommandBarItemProps => {
    return {
      key: 'feedback',
      name: t('leaveFeedback'),
      iconProps: {
        iconName: 'Heart',
      },
      disabled: false,
      ariaLabel: t('leaveFeedback'),
      onClick: openFeedbackBlade,
    };
  };

  const getButtonSeparator = (key: string) => {
    return {
      key: key,
      name: StringUtils.buttonSeparator,
      disabled: true,
    };
  };

  const getResourceConnectionButton = (dirty: boolean, disabled: boolean) => {
    return {
      key: 'resource-connection',
      name: t('resourceConnection'),
      iconProps: {
        iconName: 'Link12',
      },
      disabled: disabled,
      onClick: () => {
        !!onResourceConnectionClick && onResourceConnectionClick();
      },
    };
  };

  const openFeedbackBlade = () => {
    const featureName = 'AppServiceConfiguration';
    portalCommunicator.openBlade({
      detailBlade: 'InProductFeedbackBlade',
      extension: 'HubsExtension',
      openAsContextBlade: true,
      detailBladeInputs: {
        bladeName: `${featureName}`,
        cesQuestion: t('configurationFeedbackCESQuestion'),
        cvaQuestion: t('configurationFeedbackCVAQuestion'),
        extensionName: 'WebsitesExtension',
        featureName: `${featureName}`,
        surveyId: `${featureName}- 0420`,
      },
    });
  };

  // Data for CommandBar
  const getItems = (dirty: boolean, disabled: boolean): ICommandBarItemProps[] => {
    const items: ICommandBarItemProps[] = [
      getRefreshButton(dirty, disabled),
      getSaveButton(dirty, disabled),
      getDiscardButton(dirty, disabled),
      getFeedbackItem(),
    ];

    if (!!onResourceConnectionClick && isServiceLinkerVisible()) {
      items.push(...[getButtonSeparator('split-button-1'), getResourceConnectionButton(dirty, disabled)]);
    }
    return items;
  };

  useEffect(() => {
    portalCommunicator.updateDirtyState(dirty);
  }, [dirty, portalCommunicator]);
  return (
    <CommandBar
      items={getItems(dirty, disabled)}
      styles={CommandBarStyles}
      ariaLabel={t('appSettingsCommandBarAriaLabel')}
      buttonAs={CustomCommandBarButton}
      overflowButtonProps={overflowButtonProps}
    />
  );
};

export default AppSettingsCommandBar;
