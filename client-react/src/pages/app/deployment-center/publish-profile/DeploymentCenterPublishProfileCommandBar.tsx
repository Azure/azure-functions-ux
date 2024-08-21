import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ICommandBarItemProps, CommandBar, IButtonProps } from '@fluentui/react';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { DeploymentCenterPublishProfileCommandBarProps } from '../DeploymentCenter.types';
import { CommandBarStyles } from '../../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CustomCommandBarButton } from '../../../../components/CustomCommandBarButton';
import CustomFocusTrapCallout from '../../../../components/CustomCallout/CustomFocusTrapCallout';
import DeploymentCenterData from '../DeploymentCenter.data';
import { PortalContext } from '../../../../PortalContext';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';

const DeploymentCenterPublishProfileCommandBar: React.FC<DeploymentCenterPublishProfileCommandBarProps> = props => {
  const { resetApplicationPassword } = props;
  const { t } = useTranslation();

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const portalContext = useContext(PortalContext);
  const overflowButtonProps: IButtonProps = { ariaLabel: t('moreCommands') };
  const [isResetCalloutHidden, setIsResetCalloutHidden] = useState<boolean>(true);

  const downloadProfile = async () => {
    const deploymentCenterData = new DeploymentCenterData();
    const notificationId = portalContext.startNotification(t('downloadPublishProfile'), t('downloadingPublishProfile'));
    const getPublishProfileResponse = await deploymentCenterData.getPublishProfile(deploymentCenterContext.resourceId);

    if (getPublishProfileResponse.metadata.success) {
      triggerPublishProfileDownload(getPublishProfileResponse.data);
      portalContext.stopNotification(notificationId, true, t('downloadingPublishProfileSucceeded'));
    } else {
      portalContext.stopNotification(notificationId, false, t('downloadingPublishProfileFailed'));
      portalContext.log(
        getTelemetryInfo('error', 'downloadPublishProfile', 'failed', {
          message: getErrorMessage(getPublishProfileResponse.metadata.error),
          error: getPublishProfileResponse.metadata.error,
        })
      );
    }
  };

  const triggerPublishProfileDownload = (profileXml: string) => {
    const blob = new Blob([profileXml], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'profile.publishsettings';
    a.click();
  };

  const isDisabled = () => !deploymentCenterContext.hasWritePermission;

  const showResetCallout = () => {
    setIsResetCalloutHidden(false);
  };

  const resetProfile = () => {
    portalContext.log(
      getTelemetryInfo('info', 'resetFtpPassword', 'submit', {
        location: 'managePublishProfileSlideOut',
      })
    );

    resetApplicationPassword();
    setIsResetCalloutHidden(true);
  };

  const hideResetCallout = () => {
    setIsResetCalloutHidden(true);
  };

  const onDownloadProfileClick = () => {
    portalContext.log(getTelemetryInfo('info', 'downloadProfileButton', 'clicked'));
    downloadProfile();
  };

  const onResetPublishProfileClick = () => {
    portalContext.log(getTelemetryInfo('info', 'resetPublishProfileButton', 'clicked'));
    showResetCallout();
  };

  const commandBarItems: ICommandBarItemProps[] = [
    {
      id: 'manage-publish-profile-download',
      key: 'downloadPublishProfile',
      name: t('downloadPublishProfile'),
      iconProps: {
        iconName: 'Download',
      },
      ariaLabel: t('downloadPublishProfile'),
      disabled: isDisabled(),
      onClick: onDownloadProfileClick,
    },
    {
      id: 'manage-publish-profile-reset',
      key: 'resetPublishProfile',
      name: t('resetPublishProfile'),
      iconProps: {
        iconName: 'Refresh',
      },
      ariaLabel: t('resetPublishProfile'),
      disabled: isDisabled(),
      onClick: onResetPublishProfileClick,
    },
  ];

  return (
    <>
      <CommandBar
        items={commandBarItems}
        role="nav"
        styles={CommandBarStyles}
        ariaLabel={t('managePublishProfileCommandBarAriaLabel')}
        buttonAs={CustomCommandBarButton}
        overflowButtonProps={overflowButtonProps}
      />
      <CustomFocusTrapCallout
        target="#manage-publish-profile-reset"
        onDismissFunction={hideResetCallout}
        setInitialFocus={true}
        hidden={isResetCalloutHidden}
        title={t('resetPublishProfileConfirmationTitle')}
        description={t('resetPublishProfileConfirmationDescription')}
        defaultButtonTitle={t('reset')}
        defaultButtonFunction={resetProfile}
        primaryButtonTitle={t('cancel')}
        primaryButtonFunction={hideResetCallout}
      />
    </>
  );
};

export default DeploymentCenterPublishProfileCommandBar;
