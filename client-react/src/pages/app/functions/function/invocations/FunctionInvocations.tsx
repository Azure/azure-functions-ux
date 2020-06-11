import React, { useState, useContext, useEffect } from 'react';
import {
  AppInsightsMonthlySummary,
  AppInsightsInvocationTrace,
  AppInsightsInvocationTraceDetail,
} from '../../../../../models/app-insights';
import {
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  SearchBox,
  ICommandBarItemProps,
  PanelType,
  MessageBarType,
  Label,
  Link,
} from 'office-ui-fabric-react';
import DisplayTableWithCommandBar from '../../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import { invocationsTabStyle, invocationsSummary, summaryItem, successElement, invocationsTable } from './FunctionInvocations.style';
import { useTranslation } from 'react-i18next';
import { ReactComponent as ErrorSvg } from '../../../../../images/Common/Error.svg';
import { ReactComponent as SuccessSvg } from '../../../../../images/Common/Success.svg';
import LoadingComponent from '../../../../../components/Loading/LoadingComponent';
import { PortalContext } from '../../../../../PortalContext';
import { FunctionInvocationsContext } from './FunctionInvocationsDataLoader';
import FunctionInvocationDetails from './FunctionInvocationDetails';
import CustomPanel from '../../../../../components/CustomPanel/CustomPanel';
import CustomBanner from '../../../../../components/CustomBanner/CustomBanner';
import { filterTextFieldStyle } from '../../../../../components/form-controls/formControl.override.styles';

interface FunctionInvocationsProps {
  functionResourceId: string;
  appInsightsResourceId: string;
  refreshInvocations: () => void;
  setCurrentTrace: (trace: AppInsightsInvocationTrace | undefined) => void;
  monthlySummary?: AppInsightsMonthlySummary;
  invocationTraces?: AppInsightsInvocationTrace[];
  currentTrace?: AppInsightsInvocationTrace;
  invocationDetails?: AppInsightsInvocationTraceDetail[];
}

const FunctionInvocations: React.FC<FunctionInvocationsProps> = props => {
  const {
    monthlySummary,
    invocationTraces,
    refreshInvocations,
    functionResourceId,
    appInsightsResourceId,
    invocationDetails,
    setCurrentTrace,
    currentTrace,
  } = props;
  const invocationsContext = useContext(FunctionInvocationsContext);
  const portalContext = useContext(PortalContext);
  const { t } = useTranslation();

  const [filterValue, setFilterValue] = useState('');
  const [showDelayMessage, setShowDelayMessage] = useState(false);

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
          query: invocationsContext.formInvocationTracesQuery(functionResourceId),
        },
      },
      'function-monitor'
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
        key: 'success',
        name: t('success'),
        fieldName: 'success',
        minWidth: 100,
        maxWidth: 150,
        isResizable: true,
        onRender: onRenderSuccessColumn,
      },
      {
        key: 'resultCode',
        name: t('resultCode'),
        fieldName: 'resultCode',
        minWidth: 100,
        maxWidth: 150,
        isResizable: true,
      },
      {
        key: 'duration',
        name: t('duration'),
        fieldName: 'duration',
        minWidth: 210,
        maxWidth: 260,
        isResizable: true,
      },
      {
        key: 'operationId',
        name: t('operationId'),
        fieldName: 'operationId',
        minWidth: 250,
        isResizable: true,
      },
    ];
  };

  const onRenderDateColumn = (trace: AppInsightsInvocationTrace, index: number, column: IColumn) => {
    return (
      <Link id={`invocations-${index}`} onClick={() => setCurrentTrace(trace)} role="button">
        {trace[column.fieldName!]}
      </Link>
    );
  };

  const onRenderSuccessColumn = (trace: AppInsightsInvocationTrace) => {
    return (
      <span className={successElement}>
        {trace.success ? <SuccessSvg /> : <ErrorSvg />} <span>{trace.success ? t('success') : t('error')}</span>
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

  useEffect(() => {
    setShowDelayMessage(!!invocationTraces && invocationTraces.length === 0);
  }, [invocationTraces]);

  return (
    <div id="invocations-tab" className={invocationsTabStyle}>
      {/*Delay Message Banner*/}
      {showDelayMessage && (
        <CustomBanner message={t('appInsightsDelay')} type={MessageBarType.info} onDismiss={() => setShowDelayMessage(false)} />
      )}

      {/*Summary Items*/}
      <div id="summary-container" className={invocationsSummary}>
        {!!monthlySummary ? (
          <div>
            <div id="summary-success" className={summaryItem}>
              <h4>{t('successCount')}</h4>
              <SuccessSvg /> {monthlySummary.successCount}
              <Label>{t('last30Days')}</Label>
            </div>
            <div id="summary-error" className={summaryItem}>
              <h4>{t('errorCount')}</h4>
              <ErrorSvg /> {monthlySummary.failedCount}
              <Label>{t('last30Days')}</Label>
            </div>
          </div>
        ) : (
          <LoadingComponent />
        )}
      </div>

      {/*Invocation Traces Table*/}
      <div>
        <h3>{t('invocationTracesTableTitle')}</h3>
        <div>{t('invocationTracesTableDescription')}</div>
        <div className={invocationsTable}>
          <DisplayTableWithCommandBar
            commandBarItems={getCommandBarItems()}
            columns={getColumns()}
            items={filterValues()}
            isHeaderVisible={true}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
            selectionPreservedOnEmptyClick={true}
            emptyMessage={t('noResults')}
            shimmer={{ lines: 2, show: !invocationTraces }}>
            <SearchBox
              id="invocations-search"
              className="ms-slideDownIn20"
              autoFocus
              iconProps={{ iconName: 'Filter' }}
              styles={filterTextFieldStyle}
              placeholder={t('filterInvocations')}
              onChange={newValue => setFilterValue(newValue)}
            />
          </DisplayTableWithCommandBar>
        </div>
      </div>

      {/*Invocation Details Panel*/}
      <CustomPanel
        isOpen={!!currentTrace}
        onDismiss={() => setCurrentTrace(undefined)}
        headerText={'Invocation Details'}
        type={PanelType.medium}>
        <FunctionInvocationDetails
          invocationDetails={invocationDetails}
          appInsightsResourceId={appInsightsResourceId}
          currentTrace={currentTrace}
        />
      </CustomPanel>
    </div>
  );
};

export default FunctionInvocations;
