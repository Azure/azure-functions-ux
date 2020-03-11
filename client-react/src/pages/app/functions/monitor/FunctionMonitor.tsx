import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pivot, PivotItem } from 'office-ui-fabric-react';
import { paddingStyle } from './FunctionMonitor.styles';
import FunctionLog from '../function-log/FunctionLog';
import { PivotState } from './FunctionMonitor.types';
import { ArmFunctionDescriptor } from '../../../../utils/resourceDescriptors';
import FunctionInvocationsDataLoader from '../invocations/FunctionInvocationsDataLoader';
import { AppInsightsComponent } from '../../../../models/app-insights';
import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import { ArmObj } from '../../../../models/arm-obj';

interface FunctionMonitorProps {
  resourceId: string;
  resetAppInsightsToken: () => void;
  appInsightsComponent?: ArmObj<AppInsightsComponent>;
  appInsightsToken?: string;
}

const FunctionMonitor: React.FC<FunctionMonitorProps> = props => {
  const { resourceId, resetAppInsightsToken, appInsightsComponent, appInsightsToken } = props;
  const { t } = useTranslation();
  const [pivotStateKey, setPivotStateKey] = useState<PivotState>(PivotState.invocations);
  const armFunctionDescriptor = new ArmFunctionDescriptor(resourceId);
  const functionName = armFunctionDescriptor.name;

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

  if (!appInsightsComponent) {
    return <LoadingComponent />;
  }

  return (
    <div style={paddingStyle}>
      <Pivot getTabId={getPivotTabId} selectedKey={pivotStateKey} onLinkClick={onPivotItemClicked}>
        <PivotItem itemKey={PivotState.invocations} headerText={t('functionMonitor_invocations')}>
          <FunctionInvocationsDataLoader
            resourceId={resourceId}
            appInsightsAppId={appInsightsComponent.properties.AppId}
            appInsightsToken={appInsightsToken}
          />
        </PivotItem>
        <PivotItem itemKey={PivotState.logs} headerText={t('functionMonitor_logs')}>
          <FunctionLog
            isExpanded={true}
            resetAppInsightsToken={resetAppInsightsToken}
            appInsightsToken={appInsightsToken}
            functionName={functionName}
            forceMaximized={true}
            hideChevron={true}
          />
        </PivotItem>
      </Pivot>
    </div>
  );
};

export default FunctionMonitor;
