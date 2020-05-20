import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Pivot, PivotItem, MessageBarType } from 'office-ui-fabric-react';
import { paddingStyle, logStyle } from './FunctionMonitor.styles';
import { PivotState } from './FunctionMonitor.types';
import { ArmFunctionDescriptor } from '../../../../../utils/resourceDescriptors';
import FunctionInvocationsDataLoader from '../invocations/FunctionInvocationsDataLoader';
import { AppInsightsComponent, AppInsightsKeyType } from '../../../../../models/app-insights';
import LoadingComponent from '../../../../../components/Loading/LoadingComponent';
import { ArmObj } from '../../../../../models/arm-obj';
import AppInsightsSetup from './AppInsightsSetup';
import FunctionLogAppInsightsDataLoader from '../function-log/FunctionLogAppInsightsDataLoader';
import CustomBanner from '../../../../../components/CustomBanner/CustomBanner';
import { PortalContext } from '../../../../../PortalContext';
import { bannerLinkStyle } from '../../../../../components/CustomBanner/CustomBanner.styles';
import { ThemeContext } from '../../../../../ThemeContext';

interface FunctionMonitorProps {
  resourceId: string;
  resetAppInsightsComponent: () => void;
  resetAppInsightsToken: () => void;
  appInsightsComponent?: ArmObj<AppInsightsComponent> | null;
  appInsightsToken?: string;
  appInsightsKeyType?: AppInsightsKeyType;
}

const FunctionMonitor: React.FC<FunctionMonitorProps> = props => {
  const { resourceId, resetAppInsightsComponent, appInsightsComponent, appInsightsToken, appInsightsKeyType } = props;
  const { t } = useTranslation();

  const portalContext = useContext(PortalContext);

  const [pivotStateKey, setPivotStateKey] = useState<PivotState>(PivotState.invocations);

  const armFunctionDescriptor = new ArmFunctionDescriptor(resourceId);

  const theme = useContext(ThemeContext);

  const onPivotItemClicked = (item?: PivotItem) => {
    if (!!item) {
      setPivotStateKey(item.props.itemKey as PivotState);
    }
  };

  const getPivotTabId = (itemKey: string) => {
    switch (itemKey) {
      case PivotState.invocations:
        return 'function-monitor-invocations-tab';
      case PivotState.logs:
        return 'function-monitor-logs-tab';
    }
    return '';
  };

  const onAppInsightsKeyVaultWarningMessageClick = () => {
    portalContext.openFrameBlade(
      {
        detailBlade: 'SiteConfigSettingsFrameBladeReact',
        detailBladeInputs: { id: armFunctionDescriptor.getSiteOnlyResourceId() },
      },
      'functionMonitoring'
    );
  };

  if (appInsightsKeyType === AppInsightsKeyType.keyVault) {
    const appInsightsKeyVaultWarningMessage = (
      <>
        {t('appInsightsKeyVaultWarningMessage')}
        <span onClick={onAppInsightsKeyVaultWarningMessageClick} className={bannerLinkStyle(theme)}>
          {t('clickToShowSettings')}
        </span>
      </>
    );
    return <CustomBanner message={appInsightsKeyVaultWarningMessage} type={MessageBarType.warning} />;
  } else {
    if (appInsightsComponent === undefined) {
      return <LoadingComponent />;
    }

    if (appInsightsComponent === null) {
      return (
        <AppInsightsSetup siteId={armFunctionDescriptor.getSiteOnlyResourceId()} fetchNewAppInsightsComponent={resetAppInsightsComponent} />
      );
    }
  }

  return (
    <div style={paddingStyle}>
      <Pivot getTabId={getPivotTabId} selectedKey={pivotStateKey} onLinkClick={onPivotItemClicked}>
        <PivotItem itemKey={PivotState.invocations} headerText={t('functionMonitor_invocations')}>
          <FunctionInvocationsDataLoader
            resourceId={resourceId}
            appInsightsAppId={appInsightsComponent.properties.AppId}
            appInsightsResourceId={appInsightsComponent.id}
            appInsightsToken={appInsightsToken}
          />
        </PivotItem>
        <PivotItem itemKey={PivotState.logs} headerText={t('functionMonitor_logs')}>
          <div style={logStyle}>
            <FunctionLogAppInsightsDataLoader
              resourceId={resourceId}
              isExpanded={true}
              forceMaximized={true}
              hideChevron={true}
              leftAlignMainToolbarItems={true}
            />
          </div>
        </PivotItem>
      </Pivot>
    </div>
  );
};

export default FunctionMonitor;
