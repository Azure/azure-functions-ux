import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pivot, PivotItem } from 'office-ui-fabric-react';
import { paddingStyle } from './FunctionMonitor.styles';
import FunctionLog from '../function-log/FunctionLog';
import { PivotState } from './FunctionMonitor.types';

interface FunctionMonitorProps {
  resourceId: string;
  resetAppInsightsToken: () => void;
  appInsightsToken?: string;
}

const FunctionMonitor: React.FC<FunctionMonitorProps> = props => {
  const { resourceId, resetAppInsightsToken, appInsightsToken } = props;
  const { t } = useTranslation();
  const [pivotStateKey, setPivotStateKey] = useState<PivotState>(PivotState.invocation);
  // TODO (allisonm): Create and consume Function Resource Descriptor
  const functionName = resourceId.split('/functions/').pop() || '';

  const onPivotItemClicked = (item?: PivotItem) => {
    if (!!item) {
      setPivotStateKey(item.props.itemKey as PivotState);
    }
  };

  const getPivotTabId = (itemKey: string) => {
    switch (itemKey) {
      case PivotState.invocation:
        return 'function-monitor-invocation-tab';
      case PivotState.logs:
        return 'function-monitor-logs-tab';
    }
    return '';
  };

  return (
    <div style={paddingStyle}>
      <Pivot getTabId={getPivotTabId} selectedKey={pivotStateKey} onLinkClick={onPivotItemClicked}>
        <PivotItem itemKey={PivotState.invocation} headerText={t('functionMonitor_invocation')} />
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
