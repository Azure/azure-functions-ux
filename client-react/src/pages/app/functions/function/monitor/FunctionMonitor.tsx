import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pivot, PivotItem } from 'office-ui-fabric-react';
import { paddingStyle } from './FunctionMonitor.styles';
import { PivotState } from './FunctionMonitor.types';
import { ArmFunctionDescriptor } from '../../../../../utils/resourceDescriptors';
import FunctionInvocationsDataLoader from '../invocations/FunctionInvocationsDataLoader';
import { AppInsightsComponent } from '../../../../../models/app-insights';
import LoadingComponent from '../../../../../components/Loading/LoadingComponent';
import { ArmObj } from '../../../../../models/arm-obj';
import AppInsightsSetup from './AppInsightsSetup';
import FunctionLogAppInsightsDataLoader from '../function-log/FunctionLogAppInsightsDataLoader';

interface FunctionMonitorProps {
  resourceId: string;
  resetAppInsightsComponent: () => void;
  resetAppInsightsToken: () => void;
  appInsightsComponent?: ArmObj<AppInsightsComponent> | null;
  appInsightsToken?: string;
}

const FunctionMonitor: React.FC<FunctionMonitorProps> = props => {
  const { resourceId, resetAppInsightsComponent, appInsightsComponent, appInsightsToken } = props;
  const { t } = useTranslation();

  const [pivotStateKey, setPivotStateKey] = useState<PivotState>(PivotState.invocations);

  const armFunctionDescriptor = new ArmFunctionDescriptor(resourceId);

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

  if (appInsightsComponent === undefined) {
    return <LoadingComponent />;
  }

  if (appInsightsComponent === null) {
    return (
      <AppInsightsSetup siteId={armFunctionDescriptor.getSiteOnlyResourceId()} fetchNewAppInsightsComponent={resetAppInsightsComponent} />
    );
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
          <FunctionLogAppInsightsDataLoader resourceId={resourceId} isExpanded={true} forceMaximized={true} hideChevron={true} />
        </PivotItem>
      </Pivot>
    </div>
  );
};

export default FunctionMonitor;
