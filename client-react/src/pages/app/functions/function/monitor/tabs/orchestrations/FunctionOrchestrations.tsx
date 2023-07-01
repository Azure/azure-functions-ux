import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DetailsListLayoutMode, IColumn, ICommandBarItemProps, Link, PanelType, SelectionMode } from '@fluentui/react';

import CustomPanel from '../../../../../../../components/CustomPanel/CustomPanel';
import DisplayTableWithCommandBar from '../../../../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import { getSearchFilter } from '../../../../../../../components/form-controls/SearchBox';
import { AppInsightsOrchestrationTrace, AppInsightsOrchestrationTraceDetail } from '../../../../../../../models/app-insights';
import { PortalContext } from '../../../../../../../PortalContext';
import { getTelemetryInfo } from '../../../../../../../utils/TelemetryUtils';
import { openAppInsightsQueryEditor } from '../FunctionMonitorTab.data';
import { tableStyle, tabStyle } from '../FunctionMonitorTab.styles';

import FunctionOrchestrationDetails from './FunctionOrchestrationDetails';
import { FunctionOrchestrationsContext } from './FunctionOrchestrationsDataLoader';

interface FunctionOrchestrationsProps {
  functionResourceId: string;
  appInsightsResourceId: string;
  setCurrentTrace: (trace?: AppInsightsOrchestrationTrace) => void;
  refreshOrchestrations: () => void;
  currentTrace?: AppInsightsOrchestrationTrace;
  orchestrationTraces?: AppInsightsOrchestrationTrace[];
  orchestrationDetails?: AppInsightsOrchestrationTraceDetail[];
}

const FunctionOrchestrations: React.FC<FunctionOrchestrationsProps> = props => {
  const {
    orchestrationTraces,
    functionResourceId,
    appInsightsResourceId,
    refreshOrchestrations,
    setCurrentTrace,
    currentTrace,
    orchestrationDetails,
  } = props;

  const [filterValue, setFilterValue] = useState('');

  const orchestrationsContext = useContext(FunctionOrchestrationsContext);
  const portalContext = useContext(PortalContext);
  const { t } = useTranslation();

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'orchestrations-run-query',
        onClick: () => {
          portalContext.log(
            getTelemetryInfo('info', 'openMonitorBlade', 'clickAiQueryEditorOnOrchestrationsTab', {
              resourceId: functionResourceId,
              message: 'Opening App Insights Query editor from Orchestrations tab.',
            })
          );
          openAppInsightsQueryEditor(
            portalContext,
            appInsightsResourceId,
            orchestrationsContext.formOrchestrationTracesQuery(functionResourceId)
          );
        },
        iconProps: { iconName: 'LineChart' },
        name: t('runQueryInApplicationInsights'),
        ariaLabel: t('runQueryInApplicationInsights'),
      },
      {
        key: 'orchestrations-refresh',
        onClick: refreshOrchestrations,
        iconProps: { iconName: 'Refresh' },
        name: t('refresh'),
        ariaLabel: t('refresh'),
      },
    ];
  };

  const onRenderDateColumn = (trace: AppInsightsOrchestrationTrace, index: number, column: IColumn) => {
    return (
      <Link id={`orchestrations-${index}`} onClick={() => setCurrentTrace(trace)} role="button">
        {trace[column.fieldName!]}
      </Link>
    );
  };

  const getColumns = (): IColumn[] => {
    return [
      {
        key: 'date',
        name: t('date'),
        fieldName: 'timestampFriendly',
        minWidth: 210,
        maxWidth: 260,
        isResizable: true,
      },
      {
        key: 'DurableFunctionsInstanceId',
        name: t('instanceId'),
        fieldName: 'DurableFunctionsInstanceId',
        minWidth: 250,
        maxWidth: 300,
        isResizable: true,
        onRender: onRenderDateColumn,
      },
      {
        key: 'DurableFunctionsRuntimeStatus',
        name: t('runtimeStatus'),
        fieldName: 'DurableFunctionsRuntimeStatus',
        minWidth: 100,
        isResizable: true,
      },
    ];
  };

  const filterValues = () => {
    return orchestrationTraces
      ? orchestrationTraces.filter(trace => {
          if (!filterValue) {
            return true;
          }
          return (
            trace.timestampFriendly.toLowerCase().includes(filterValue.toLowerCase()) ||
            trace.DurableFunctionsRuntimeStatus.toLowerCase().includes(filterValue.toLowerCase()) ||
            trace.DurableFunctionsInstanceId.toLowerCase().includes(filterValue.toLowerCase())
          );
        })
      : [];
  };

  return (
    <div id="orchestrations-tab" className={tabStyle}>
      {/*Orchestration Traces Table*/}
      <div>
        <h3>{t('orchestrationTracesTableTitle')}</h3>
        <div>{t('orchestrationTracesTableDescription')}</div>
        <div className={tableStyle}>
          <DisplayTableWithCommandBar
            commandBarItems={getCommandBarItems()}
            columns={getColumns()}
            items={filterValues()}
            isHeaderVisible={true}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
            selectionPreservedOnEmptyClick={true}
            emptyMessage={t('noResults')}
            shimmer={{ lines: 2, show: !orchestrationTraces }}>
            {getSearchFilter('orchestrations-search', setFilterValue, t('filterOrchestrations'))}
          </DisplayTableWithCommandBar>
        </div>
      </div>
      {/*Orchestration Details Panel*/}
      <CustomPanel
        isOpen={!!currentTrace}
        onDismiss={() => setCurrentTrace(undefined)}
        headerText={t('orchestrationDetails')}
        type={PanelType.medium}>
        <FunctionOrchestrationDetails
          orchestrationDetails={orchestrationDetails}
          appInsightsResourceId={appInsightsResourceId}
          currentTrace={currentTrace}
        />
      </CustomPanel>
    </div>
  );
};

export default FunctionOrchestrations;
