import React, { useContext } from 'react';
import { DetailsListLayoutMode, SelectionMode, ICommandBarItemProps, IColumn } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { AppInsightsOrchestrationTrace, AppInsightsEntityTraceDetail } from '../../../../../../../models/app-insights';
import { PortalContext } from '../../../../../../../PortalContext';
import { openAppInsightsQueryEditor } from '../FunctionMonitorTab.data';
import DisplayTableWithCommandBar from '../../../../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import { tabStyle } from '../FunctionMonitorTab.styles';
import { FunctionEntitiesContext } from './FunctionEntitiesDataLoader';

export interface FunctionEntityDetailsProps {
  appInsightsResourceId: string;
  currentTrace?: AppInsightsOrchestrationTrace;
  entityDetails?: AppInsightsEntityTraceDetail[];
}

const FunctionEntityDetails: React.FC<FunctionEntityDetailsProps> = props => {
  const { entityDetails, appInsightsResourceId, currentTrace } = props;
  const portalContext = useContext(PortalContext);
  const entityContext = useContext(FunctionEntitiesContext);
  const instanceId = currentTrace ? currentTrace.DurableFunctionsInstanceId : '';

  const { t } = useTranslation();

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'entity-run-query',
        onClick: () =>
          openAppInsightsQueryEditor(portalContext, appInsightsResourceId, entityContext.formEntityTraceDetailsQuery(instanceId)),
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

  const getItems = (): AppInsightsEntityTraceDetail[] => {
    return entityDetails || [];
  };

  return (
    <div id="entity-details" className={tabStyle}>
      <DisplayTableWithCommandBar
        commandBarItems={getCommandBarItems()}
        columns={getColumns()}
        items={getItems()}
        isHeaderVisible={true}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        selectionPreservedOnEmptyClick={true}
        emptyMessage={t('noResults')}
        shimmer={{ lines: 2, show: !entityDetails }}
      />
    </div>
  );
};

export default FunctionEntityDetails;
