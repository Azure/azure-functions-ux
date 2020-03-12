import React, { useState } from 'react';
import { AppInsightsMonthlySummary, AppInsightsInvocationTrace } from '../../../../models/app-insights';
import { DetailsListLayoutMode, SelectionMode, IColumn, SearchBox, ICommandBarItemProps } from 'office-ui-fabric-react';
import DisplayTableWithCommandBar from '../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import { formStyle, filterBoxStyle } from './FunctionInvocations.style';
import { useTranslation } from 'react-i18next';

interface FunctionInvocationsProps {
  resourceId: string;
  monthlySummary: AppInsightsMonthlySummary;
  invocationTraces: AppInsightsInvocationTrace[];
}

const FunctionInvocations: React.FC<FunctionInvocationsProps> = props => {
  const { monthlySummary, invocationTraces } = props;
  const [showFilter, setShowFilter] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  const { t } = useTranslation();

  const toggleFilter = () => {
    setFilterValue('');
    setShowFilter(!showFilter);
  };

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'invocations-show-filter',
        onClick: toggleFilter,
        iconProps: { iconName: 'Filter' },
        name: t('filter'),
      },
    ];
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

  const filterValues = () => {
    return invocationTraces.filter(trace => {
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
    });
  };

  return (
    <div>
      <h2>{`Success Count: ${monthlySummary.successCount}`}</h2>
      <h2>{`Error Count: ${monthlySummary.failedCount}`}</h2>
      <div id="invocations" className={formStyle}>
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
      </div>
    </div>
  );
};

export default FunctionInvocations;
