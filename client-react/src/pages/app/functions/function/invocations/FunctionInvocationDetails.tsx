import React, { useContext } from 'react';
import { PortalContext } from '../../../../../PortalContext';
import { FunctionInvocationsContext } from './FunctionInvocationsDataLoader';
import { AppInsightsInvocationTraceDetail, AppInsightsInvocationTrace } from '../../../../../models/app-insights';
import { invocationsTabStyle } from './FunctionInvocations.style';
import { DetailsListLayoutMode, SelectionMode, ICommandBarItemProps, IColumn } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import DisplayTableWithCommandBar from '../../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';

export interface FunctionInvocationDetailsProps {
  appInsightsResourceId: string;
  currentTrace?: AppInsightsInvocationTrace;
  invocationDetails?: AppInsightsInvocationTraceDetail[];
}

const FunctionInvocationDetails: React.FC<FunctionInvocationDetailsProps> = props => {
  const { invocationDetails, appInsightsResourceId, currentTrace } = props;
  const portalContext = useContext(PortalContext);
  const invocationsContext = useContext(FunctionInvocationsContext);
  const operationId = currentTrace ? currentTrace.operationId : '';
  const invocationId = currentTrace ? currentTrace.invocationId : '';
  const { t } = useTranslation();

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'invocations-run-query',
        onClick: openAppInsightsQueryEditor,
        iconProps: { iconName: 'LineChart' },
        name: t('runQueryInApplicationInsights'),
      },
    ];
  };

  const openAppInsightsQueryEditor = () => {
    portalContext.openBlade(
      {
        detailBlade: 'LogsBlade',
        extension: 'Microsoft_Azure_Monitoring_Logs',
        detailBladeInputs: {
          resourceId: appInsightsResourceId,
          source: 'Microsoft.Web-FunctionApp',
          query: invocationsContext.formInvocationDetailsQuery(operationId, invocationId),
        },
      },
      'function-monitor'
    );
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
        key: 'type',
        name: t('type'),
        fieldName: 'logLevel',
        minWidth: 100,
        maxWidth: 100,
        isResizable: true,
      },
    ];
  };

  const getItems = (): AppInsightsInvocationTraceDetail[] => {
    return invocationDetails || [];
  };

  return (
    <div id="invocation-details" className={invocationsTabStyle}>
      <DisplayTableWithCommandBar
        commandBarItems={getCommandBarItems()}
        columns={getColumns()}
        items={getItems()}
        isHeaderVisible={true}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        selectionPreservedOnEmptyClick={true}
        emptyMessage={t('noResults')}
        shimmer={{ lines: 2, show: !invocationDetails }}
      />
    </div>
  );
};

export default FunctionInvocationDetails;
