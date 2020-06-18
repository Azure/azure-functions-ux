import React, { useContext, useState } from 'react';
import { AppInsightsEntityTrace, AppInsightsEntityTraceDetail } from '../../../../../../../models/app-insights';
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
import { FunctionEntitiesContext } from './FunctionEntitiesDataLoader';
import CustomPanel from '../../../../../../../components/CustomPanel/CustomPanel';
import FunctionEntityDetails from './FunctionEntityDetails';
import { Links } from '../../../../../../../utils/FwLinks';

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

  const [filterValue, setFilterValue] = useState('');

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
      },
      {
        key: 'entities-refresh',
        onClick: refreshEntities,
        iconProps: { iconName: 'Refresh' },
        name: t('refresh'),
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
      {/**Durable Functions Extension Message Banner/ */}
      {!!entityTraces && entityTraces.length === 0 && (
        <CustomBanner
          message={t('durableFunctionNoDataFound')}
          type={MessageBarType.info}
          learnMoreLink={Links.durableFunctionExtensionLearnMore}
        />
      )}

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
            <SearchBox
              id="entities-search"
              className="ms-slideDownIn20"
              autoFocus
              iconProps={{ iconName: 'Filter' }}
              styles={filterTextFieldStyle}
              placeholder={t('filterEntities')}
              onChange={newValue => setFilterValue(newValue)}
            />
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
