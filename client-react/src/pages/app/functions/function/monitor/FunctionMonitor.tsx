import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MessageBarType, Pivot, PivotItem } from '@fluentui/react';

import CustomBanner from '../../../../../components/CustomBanner/CustomBanner';
import { bannerLinkStyle } from '../../../../../components/CustomBanner/CustomBanner.styles';
import LoadingComponent from '../../../../../components/Loading/LoadingComponent';
import { AppInsightsComponent, AppInsightsKeyType } from '../../../../../models/app-insights';
import { ArmObj } from '../../../../../models/arm-obj';
import { BindingType } from '../../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { PortalContext } from '../../../../../PortalContext';
import { ThemeContext } from '../../../../../ThemeContext';
import { ArmFunctionDescriptor } from '../../../../../utils/resourceDescriptors';
import FunctionInvocationsDataLoader from '../invocations/FunctionInvocationsDataLoader';

import FunctionEntitiesDataLoader from './tabs/entities/FunctionEntitiesDataLoader';
import FunctionLogsDataLoader from './tabs/logs/FunctionLogsDataLoader';
import FunctionOrchestrationsDataLoader from './tabs/orchestrations/FunctionOrchestrationsDataLoader';
import AppInsightsSetup from './AppInsightsSetup';
import { paddingStyle } from './FunctionMonitor.styles';
import { PivotState } from './FunctionMonitor.types';

interface FunctionMonitorProps {
  resourceId: string;
  errorFetchingAppInsightsComponent: boolean;
  resetAppInsightsComponent: () => void;
  resetAppInsightsToken: () => void;
  appInsightsComponent?: ArmObj<AppInsightsComponent> | null;
  appInsightsToken?: string;
  appInsightsKeyType?: AppInsightsKeyType;
  functionInfo?: ArmObj<FunctionInfo>;
}

const FunctionMonitor: React.FC<FunctionMonitorProps> = props => {
  const {
    resourceId,
    resetAppInsightsComponent,
    appInsightsComponent,
    appInsightsToken,
    appInsightsKeyType,
    functionInfo,
    errorFetchingAppInsightsComponent,
  } = props;
  const { t } = useTranslation();

  const portalContext = useContext(PortalContext);
  const theme = useContext(ThemeContext);

  const [pivotStateKey, setPivotStateKey] = useState<PivotState>();

  const armFunctionDescriptor = new ArmFunctionDescriptor(resourceId);

  const onPivotItemClicked = (item?: PivotItem) => {
    if (item) {
      setPivotStateKey(item.props.itemKey as PivotState);
    }
  };

  const isOrchestrationTrigger = () => {
    return (
      functionInfo &&
      functionInfo.properties.config &&
      functionInfo.properties.config.bindings &&
      !!functionInfo.properties.config.bindings.find(e => e.type === BindingType.orchestrationTrigger)
    );
  };

  const isEntityTrigger = () => {
    return (
      functionInfo &&
      functionInfo.properties.config &&
      functionInfo.properties.config.bindings &&
      !!functionInfo.properties.config.bindings.find(e => e.type === BindingType.entityTrigger)
    );
  };

  const getPivotTabId = (itemKey: string) => {
    switch (itemKey) {
      case PivotState.invocations:
        return 'function-monitor-invocations-tab';
      case PivotState.logs:
        return 'function-monitor-logs-tab';
      case PivotState.orchestration:
        return 'function-monitor-orchestration-tab';
      case PivotState.entity:
        return 'function-monitor-entity-tab';
    }
    return '';
  };

  const getAppInsightsKeyErrorMessage = () => {
    return (
      <>
        {t('appInsightsKeyError')}
        <span onClick={onAppInsightsMessageClick} className={bannerLinkStyle(theme)}>
          {t('clickToUpdateSettings')}
        </span>
      </>
    );
  };

  const getAppInsightsKeyVaultErrorMessage = () => {
    return (
      <>
        {t('appInsightsKeyVaultWarningMessage')}
        <span onClick={onAppInsightsMessageClick} className={bannerLinkStyle(theme)}>
          {t('clickToUpdateSettings')}
        </span>
      </>
    );
  };

  const onAppInsightsMessageClick = () => {
    portalContext.openFrameBlade({
      detailBlade: 'SiteConfigSettingsFrameBladeReact',
      detailBladeInputs: { id: armFunctionDescriptor.getSiteOnlyResourceId() },
    });
  };

  if (!!appInsightsKeyType && appInsightsKeyType === AppInsightsKeyType.keyVault) {
    return <CustomBanner message={getAppInsightsKeyVaultErrorMessage()} type={MessageBarType.warning} />;
  } else {
    if (appInsightsComponent === undefined) {
      return errorFetchingAppInsightsComponent ? (
        <CustomBanner message={getAppInsightsKeyErrorMessage()} type={MessageBarType.error} />
      ) : (
        <LoadingComponent />
      );
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
        {isOrchestrationTrigger() && (
          <PivotItem itemKey={PivotState.orchestration} headerText={t('functionMonitor_orchestrations')}>
            <FunctionOrchestrationsDataLoader
              resourceId={resourceId}
              appInsightsAppId={appInsightsComponent.properties.AppId}
              appInsightsResourceId={appInsightsComponent.id}
              appInsightsToken={appInsightsToken}
            />
          </PivotItem>
        )}
        {isEntityTrigger() && (
          <PivotItem itemKey={PivotState.entity} headerText={t('functionMonitor_entities')}>
            <FunctionEntitiesDataLoader
              resourceId={resourceId}
              appInsightsAppId={appInsightsComponent.properties.AppId}
              appInsightsResourceId={appInsightsComponent.id}
              appInsightsToken={appInsightsToken}
            />
          </PivotItem>
        )}
        <PivotItem itemKey={PivotState.invocations} headerText={t('functionMonitor_invocations')}>
          <FunctionInvocationsDataLoader
            resourceId={resourceId}
            appInsightsAppId={appInsightsComponent.properties.AppId}
            appInsightsResourceId={appInsightsComponent.id}
            appInsightsToken={appInsightsToken}
          />
        </PivotItem>
        <PivotItem itemKey={PivotState.logs} headerText={t('functionMonitor_logs')}>
          <FunctionLogsDataLoader resourceId={resourceId} />
        </PivotItem>
      </Pivot>
    </div>
  );
};

export default FunctionMonitor;
