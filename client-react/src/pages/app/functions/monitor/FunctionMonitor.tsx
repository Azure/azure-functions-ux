import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pivot, PivotItem } from 'office-ui-fabric-react';
import { paddingStyle } from './FunctionMonitor.styles';
import FunctionLog from '../function-log/FunctionLog';
import { PivotState } from './FunctionMonitor.types';
import { ArmFunctionDescriptor } from '../../../../utils/resourceDescriptors';
import FunctionInvocationsDataLoader from '../invocations/FunctionInvocationsDataLoader';

interface FunctionMonitorProps {
  resourceId: string;
  resetAppInsightsToken: () => void;
  appInsightsToken?: string;
}

const FunctionMonitor: React.FC<FunctionMonitorProps> = props => {
  const { resourceId, resetAppInsightsToken, appInsightsToken } = props;
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

  return (
    <div style={paddingStyle}>
      <Pivot getTabId={getPivotTabId} selectedKey={pivotStateKey} onLinkClick={onPivotItemClicked}>
        <PivotItem itemKey={PivotState.invocations} headerText={t('functionMonitor_invocations')}>
          <FunctionInvocationsDataLoader
            resourceId={resourceId}
            appInsightsComponentId={'faf6b3ce-1b4c-4fe1-84fc-5c67b75dc513'}
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
