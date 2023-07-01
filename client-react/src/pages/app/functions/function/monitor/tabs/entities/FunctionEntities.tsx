import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DetailsListLayoutMode, IColumn, ICommandBarItemProps, Link, PanelType, SelectionMode } from '@fluentui/react';

import CustomPanel from '../../../../../../../components/CustomPanel/CustomPanel';
import DisplayTableWithCommandBar from '../../../../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import { getSearchFilter } from '../../../../../../../components/form-controls/SearchBox';
import { AppInsightsEntityTrace, AppInsightsEntityTraceDetail } from '../../../../../../../models/app-insights';
import { PortalContext } from '../../../../../../../PortalContext';
import { openAppInsightsQueryEditor } from '../FunctionMonitorTab.data';
import { tableStyle, tabStyle } from '../FunctionMonitorTab.styles';

import { FunctionEntitiesContext } from './FunctionEntitiesDataLoader';
import FunctionEntityDetails from './FunctionEntityDetails';

interface FunctionEntitiesProps {
  functionResourceId: string;
  appInsightsResourceId: string;
  setCurrentTrace: (trace?: AppInsightsEntityTrace) => void;
  refreshEntities: () => void;
  currentTrace?: AppInsightsEntityTrace;
  entityTraces?: AppInsightsEntityTrace[];
  entityDetails?: AppInsightsEntityTraceDetail[];
}

const FunctionEntities: React.FC<FunctionEntitiesProps> = props => {
  const { entityTraces, functionResourceId, appInsightsResourceId, refreshEntities, setCurrentTrace, currentTrace, entityDetails } = props;

  const [filterValue, setFilterValue] = useState<string>('');
  const entitiesContext = useContext(FunctionEntitiesContext);
  const portalContext = useContext(PortalContext);
  const { t } = useTranslation();

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'entities-run-query',
        onClick: () =>
          openAppInsightsQueryEditor(portalContext, appInsightsResourceId, entitiesContext.formEntityTracesQuery(functionResourceId)),
        iconProps: { iconName: 'LineChart' },
        name: t('runQueryInApplicationInsights'),
        ariaLabel: t('runQueryInApplicationInsights'),
      },
      {
        key: 'entities-refresh',
        onClick: refreshEntities,
        iconProps: { iconName: 'Refresh' },
        name: t('refresh'),
        ariaLabel: t('refresh'),
      },
    ];
  };

  const onRenderDateColumn = (trace: AppInsightsEntityTrace, index: number, column: IColumn) => {
    return (
      <Link id={`entities-${index}`} onClick={() => setCurrentTrace(trace)} role="button">
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
    return entityTraces
      ? entityTraces.filter(trace => {
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
    <div id="entities-tab" className={tabStyle}>
      {/*Orchestration Traces Table*/}
      <div>
        <h3>{t('entityTracesTableTitle')}</h3>
        <div>{t('entityTracesTableDescription')}</div>
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
            shimmer={{ lines: 2, show: !entityTraces }}>
            {getSearchFilter('entities-search', setFilterValue, t('filterEntities'))}
          </DisplayTableWithCommandBar>
        </div>
      </div>
      {/*Entity Details Panel*/}
      <CustomPanel
        isOpen={!!currentTrace}
        onDismiss={() => setCurrentTrace(undefined)}
        headerText={t('entityDetails')}
        type={PanelType.medium}>
        <FunctionEntityDetails entityDetails={entityDetails} appInsightsResourceId={appInsightsResourceId} currentTrace={currentTrace} />
      </CustomPanel>
    </div>
  );
};

export default FunctionEntities;
