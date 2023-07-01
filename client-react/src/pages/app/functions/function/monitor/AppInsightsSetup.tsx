import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { PrimaryButton } from '@fluentui/react';

import FeatureDescriptionCard from '../../../../../components/feature-description-card/FeatureDescriptionCard';
import { ReactComponent as AppInsightsSvg } from '../../../../../images/Common/AppInsights.svg';
import { PortalContext } from '../../../../../PortalContext';
import { SiteStateContext } from '../../../../../SiteState';

import { bottomButtonStyle, paddingStyle } from './FunctionMonitor.styles';

interface AppInsightsSetupProps {
  siteId: string;
  fetchNewAppInsightsComponent: () => void;
}

const AppInsightsSetup: React.FC<AppInsightsSetupProps> = props => {
  const { siteId, fetchNewAppInsightsComponent } = props;
  const portalContext = useContext(PortalContext);
  const siteContext = useContext(SiteStateContext);
  const site = siteContext.site;
  const os = site?.properties.reserved ? 'linux' : 'windows';
  const winFxVersion = site?.properties.siteProperties?.properties?.find(prop => prop.name.toLowerCase() === 'windowsfxversion');
  const linuxFxVersion = site?.properties.siteProperties?.properties?.find(prop => prop.name.toLowerCase() === 'linuxfxversion');
  const { t } = useTranslation();

  const openConfigureAppInsights = async () => {
    await portalContext.openBlade({
      detailBlade: 'AppMonitorEnablementV2',
      extension: 'AppInsightsExtension',
      detailBladeInputs: {
        resourceUri: siteId,
        os: os,
        linuxFxVersion: linuxFxVersion,
        windowsFxVersion: winFxVersion,
      },
    });
    fetchNewAppInsightsComponent();
  };

  return (
    <div style={paddingStyle}>
      <FeatureDescriptionCard name={t('configureAppInsightsTitle')} description={t('configureAppInsightsDesc')} Svg={AppInsightsSvg} />
      <PrimaryButton style={bottomButtonStyle} text={t('configure')} onClick={openConfigureAppInsights} />
    </div>
  );
};

export default AppInsightsSetup;
