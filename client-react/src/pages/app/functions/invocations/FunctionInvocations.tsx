import React, { useState, useContext } from 'react';
import { AppInsightsMonthlySummary, AppInsightsInvocationTrace, AppInsightsInvocationTraceDetail } from '../../../../models/app-insights';
import {
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  SearchBox,
  ICommandBarItemProps,
  ActionButton,
  PanelType,
  MessageBarType,
} from 'office-ui-fabric-react';
import DisplayTableWithCommandBar from '../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import { invocationsTabStyle, filterBoxStyle } from './FunctionInvocations.style';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ErrorSvg } from '../../../../images/Common/Error.svg';
import { ReactComponent as SuccessSvg } from '../../../../images/Common/Success.svg';
import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import { PortalContext } from '../../../../PortalContext';
import { FunctionInvocationsContext } from './FunctionInvocationsDataLoader';
import { defaultCellStyle } from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import FunctionInvocationDetails from './FunctionInvocationDetails';
import Panel from '../../../../components/Panel/Panel';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';

interface FunctionInvocationsProps {
  functionAppName: string;
  functionName: string;
  appInsightsResourceId: string;
  monthlySummary: AppInsightsMonthlySummary;
  refreshInvocations: () => void;
  setCurrentTrace: (trace: AppInsightsInvocationTrace | undefined) => void;
  invocationTraces?: AppInsightsInvocationTrace[];
  currentTrace?: AppInsightsInvocationTrace;
  invocationDetails?: AppInsightsInvocationTraceDetail[];
}

const FunctionInvocations: React.FC<FunctionInvocationsProps> = props => {
  const {
    monthlySummary,
    invocationTraces,
    refreshInvocations,
    functionAppName,
    functionName,
    appInsightsResourceId,
    invocationDetails,
    setCurrentTrace,
    currentTrace,
  } = props;
  const invocationsContext = useContext(FunctionInvocationsContext);
  const portalContext = useContext(PortalContext);
  const { t } = useTranslation();

  const [showFilter, setShowFilter] = useState(false);
  const [filterValue, setFilterValue] = useState('');

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'invocations-run-query',
        onClick: openAppInsightsQueryEditor,
        iconProps: { iconName: 'LineChart' },
        name: t('runQueryInApplicationInsights'),
      },
      {
        key: 'invocations-refresh',
        onClick: refreshInvocations,
        iconProps: { iconName: 'Refresh' },
        name: t('refresh'),
      },
      {
        key: 'invocations-show-filter',
        onClick: toggleFilter,
        iconProps: { iconName: 'Filter' },
        name: t('filter'),
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
          query: invocationsContext.formInvocationTracesQuery(functionAppName, functionName),
        },
      },
      'function-monitor'
    );
  };

  const toggleFilter = () => {
    setFilterValue('');
    setShowFilter(!showFilter);
  };

  const getColumns = (): IColumn[] => {
    return [
      {
        key: 'date',
        name: t('date'),
        fieldName: 'timestampFriendly',
        minWidth: 210,
        maxWidth: 260,
        isRowHeader: true,
        isPadded: true,
        isResizable: true,
        onRender: onRenderDateColumn,
      },
      {
        key: 'success',
        name: t('success'),
        fieldName: 'success',
        minWidth: 100,
        maxWidth: 150,
        isRowHeader: false,
        isPadded: true,
        isResizable: true,
        onRender: onRenderSuccessColumn,
      },
      {
        key: 'resultCode',
        name: t('resultCode'),
        fieldName: 'resultCode',
        minWidth: 100,
        maxWidth: 150,
        isRowHeader: false,
        isPadded: true,
        isResizable: true,
      },
      {
        key: 'duration',
        name: t('duration'),
        fieldName: 'duration',
        minWidth: 210,
        maxWidth: 260,
        isRowHeader: false,
        isResizable: true,
      },
      {
        key: 'operationId',
        name: t('operationId'),
        fieldName: 'operationId',
        minWidth: 250,
        isRowHeader: true,
        isPadded: true,
        isResizable: true,
      },
    ];
  };

  const onRenderDateColumn = (trace: AppInsightsInvocationTrace, index: number, column: IColumn) => {
    return (
      <ActionButton className={defaultCellStyle} id={`invocations-${index}`} onClick={() => setCurrentTrace(trace)}>
        <span aria-live="assertive" role="region">
          {trace[column.fieldName!]}
        </span>
      </ActionButton>
    );
  };

  const onRenderSuccessColumn = (trace: AppInsightsInvocationTrace) => {
    // TODO (allisonm): Update styling
    const icon = trace.success ? <SuccessSvg /> : <ErrorSvg />;
    const text = trace.success ? t('success') : t('error');
    return (
      <span>
        {icon}
        {text}
      </span>
    );
  };

  const filterValues = () => {
    return invocationTraces
      ? invocationTraces.filter(trace => {
          if (!filterValue) {
            return true;
          }
          return (
            trace.timestampFriendly.toLowerCase().includes(filterValue.toLowerCase()) ||
            trace.resultCode.toLowerCase().includes(filterValue.toLowerCase()) ||
            trace.duration
              .toString()
              .toLowerCase()
              .includes(filterValue.toLowerCase()) ||
            trace.operationId.toLowerCase().includes(filterValue.toLowerCase())
          );
        })
      : [];
  };

  return (
    <div id="invocations-tab" className={invocationsTabStyle}>
      <CustomBanner message={t('appInsightsDelay')} type={MessageBarType.info} />
      <h2>{`Success Count: ${monthlySummary.successCount}`}</h2>
      <h2>{`Error Count: ${monthlySummary.failedCount}`}</h2>
      {!!invocationTraces ? (
        <DisplayTableWithCommandBar
          commandBarItems={getCommandBarItems()}
          columns={getColumns()}
          items={filterValues()}
          isHeaderVisible={true}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          selectionPreservedOnEmptyClick={true}
          emptyMessage={t('noResults')}>
          {showFilter && (
            <SearchBox
              id="invocations-search"
              className="ms-slideDownIn20"
              autoFocus
              iconProps={{ iconName: 'Filter' }}
              styles={filterBoxStyle}
              placeholder={t('filterInvocations')}
              onChange={newValue => setFilterValue(newValue)}
            />
          )}
        </DisplayTableWithCommandBar>
      ) : (
        <LoadingComponent />
      )}
      <Panel isOpen={!!currentTrace} onDismiss={() => setCurrentTrace(undefined)} headerText={'Invocation Details'} type={PanelType.medium}>
        <FunctionInvocationDetails
          invocationDetails={invocationDetails}
          appInsightsResourceId={appInsightsResourceId}
          currentTrace={currentTrace}
        />
      </Panel>
    </div>
  );
};

export default FunctionInvocations;
