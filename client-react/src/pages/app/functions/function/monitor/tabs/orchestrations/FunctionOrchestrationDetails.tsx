import React, { useContext } from 'react';
import { DetailsListLayoutMode, SelectionMode, ICommandBarItemProps, IColumn } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { AppInsightsOrchestrationTraceDetail, AppInsightsOrchestrationTrace } from '../../../../../../../models/app-insights';
import { PortalContext } from '../../../../../../../PortalContext';
import { openAppInsightsQueryEditor } from '../FunctionMonitorTab.data';
import { FunctionOrchestrationsContext } from './FunctionOrchestrationsDataLoader';
import DisplayTableWithCommandBar from '../../../../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import { tabStyle } from '../FunctionMonitorTab.styles';

export interface FunctionOrchestrationDetailsProps {
  appInsightsResourceId: string;
  currentTrace?: AppInsightsOrchestrationTrace;
  orchestrationDetails?: AppInsightsOrchestrationTraceDetail[];
}

const FunctionOrchestrationDetails: React.FC<FunctionOrchestrationDetailsProps> = props => {
  const { orchestrationDetails, appInsightsResourceId, currentTrace } = props;
  const portalContext = useContext(PortalContext);
  const orchestrationContext = useContext(FunctionOrchestrationsContext);
  const instanceId = currentTrace ? currentTrace.DurableFunctionsInstanceId : '';

  const { t } = useTranslation();

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'orchestration-run-query',
        onClick: () =>
          openAppInsightsQueryEditor(
            portalContext,
            appInsightsResourceId,
            orchestrationContext.formOrchestrationTraceDetailsQuery(instanceId)
          ),
        iconProps: { iconName: 'LineChart' },
        name: t('runQueryInApplicationInsights'),
      },
    ];
  };

  const getColumns = (): IColumn[] => {
    return [
      {
        key: 'timestamp',
        name: t('timestamp'),
        fieldName: 'timestampFriendly',
        minWidth: 100,
        maxWidth: 170,
        isResizable: true,
      },
      {
        key: 'message',
        name: t('message'),
        fieldName: 'message',
        minWidth: 100,
        maxWidth: 260,
        isResizable: true,
        isMultiline: true,
      },
      {
        key: 'state',
        name: t('state'),
        fieldName: 'state',
        minWidth: 100,
        maxWidth: 100,
        isResizable: true,
      },
    ];
  };

  const getItems = (): AppInsightsOrchestrationTraceDetail[] => {
    return orchestrationDetails || [];
  };

  return (
    <div id="orchestration-details" className={tabStyle}>
      <DisplayTableWithCommandBar
        commandBarItems={getCommandBarItems()}
        columns={getColumns()}
        items={getItems()}
        isHeaderVisible={true}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        selectionPreservedOnEmptyClick={true}
        emptyMessage={t('noResults')}
        shimmer={{ lines: 2, show: !orchestrationDetails }}
      />
    </div>
  );
};

export default FunctionOrchestrationDetails;
