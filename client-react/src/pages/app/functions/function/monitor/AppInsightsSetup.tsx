import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import FeatureDescriptionCard from '../../../../../components/feature-description-card/FeatureDescriptionCard';
import { ReactComponent as AppInsightsSvg } from '../../../../../images/Common/AppInsights.svg';
import { paddingStyle, bottomButtonStyle } from './FunctionMonitor.styles';
import { PrimaryButton } from 'office-ui-fabric-react';
import { PortalContext } from '../../../../../PortalContext';

interface AppInsightsSetupProps {
  siteId: string;
  fetchNewAppInsightsComponent: () => void;
}

const AppInsightsSetup: React.FC<AppInsightsSetupProps> = props => {
  const { siteId, fetchNewAppInsightsComponent } = props;
  const portalContext = useContext(PortalContext);
  const { t } = useTranslation();

  const openConfigureAppInsights = async () => {
    await portalContext.openBlade(
      {
        detailBlade: 'AppServicesEnablementBlade',
        extension: 'AppInsightsExtension',
        detailBladeInputs: {
          resourceUri: siteId,
          linkedComponent: null,
        },
      },
      'function-monitor'
    );
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
