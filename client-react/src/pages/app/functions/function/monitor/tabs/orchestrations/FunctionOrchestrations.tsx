import React, { useState, useContext } from 'react';
import { AppInsightsOrchestrationTrace, AppInsightsOrchestrationTraceDetail } from '../../../../../../../models/app-insights';
import { tableStyle, tabStyle } from '../FunctionMonitorTab.styles';
import CustomBanner from '../../../../../../../components/CustomBanner/CustomBanner';
import { useTranslation } from 'react-i18next';
import {
  MessageBarType,
  DetailsListLayoutMode,
  SelectionMode,
  SearchBox,
  ICommandBarItemProps,
  IColumn,
  Link,
  PanelType,
} from 'office-ui-fabric-react';
import DisplayTableWithCommandBar from '../../../../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import { filterTextFieldStyle } from '../../../../../../../components/form-controls/formControl.override.styles';
import { openAppInsightsQueryEditor } from '../FunctionMonitorTab.data';
import { PortalContext } from '../../../../../../../PortalContext';
import { FunctionOrchestrationsContext } from './FunctionOrchestrationsDataLoader';
import CustomPanel from '../../../../../../../components/CustomPanel/CustomPanel';
import FunctionOrchestrationDetails from './FunctionOrchestrationDetails';
import { Links } from '../../../../../../../utils/FwLinks';

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
        onClick: () =>
          openAppInsightsQueryEditor(
            portalContext,
            appInsightsResourceId,
            orchestrationsContext.formOrchestrationTracesQuery(functionResourceId)
          ),
        iconProps: { iconName: 'LineChart' },
        name: t('runQueryInApplicationInsights'),
      },
      {
        key: 'orchestrations-refresh',
        onClick: refreshOrchestrations,
        iconProps: { iconName: 'Refresh' },
        name: t('refresh'),
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
        onRender: onRenderDateColumn,
      },
      {
        key: 'DurableFunctionsRuntimeStatus',
        name: t('runtimeStatus'),
        fieldName: 'DurableFunctionsRuntimeStatus',
        minWidth: 100,
        maxWidth: 150,
        isResizable: true,
      },
      {
        key: 'DurableFunctionsInstanceId',
        name: t('instanceId'),
        fieldName: 'DurableFunctionsInstanceId',
        minWidth: 250,
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
      {/**Durable Functions Extension Message Banner/ */}
      {!!orchestrationTraces && orchestrationTraces.length === 0 && (
        <CustomBanner
          message={t('durableFunctionNoDataFound')}
          type={MessageBarType.info}
          learnMoreLink={Links.durableFunctionExtensionLearnMore}
        />
      )}

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
            <SearchBox
              id="orchestrations-search"
              className="ms-slideDownIn20"
              autoFocus
              iconProps={{ iconName: 'Filter' }}
              styles={filterTextFieldStyle}
              placeholder={t('filterOrchestrations')}
              onChange={newValue => setFilterValue(newValue)}
            />
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
