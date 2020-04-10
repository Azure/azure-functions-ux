import React from 'react';
import ConfigurationCommandBar from './ConfigurationCommandBar';
import DisplayTableWithCommandBar from '../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import { ICommandBarItemProps, IColumn, SelectionMode, DetailsListLayoutMode } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { EnvironmentVariable } from './Configuration.types';
import { defaultCellStyle } from '../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';

interface ConfigurationProps {}

const Configuration: React.FC<ConfigurationProps> = props => {
  const { t } = useTranslation();

  const addNewEnvironmentVariable = () => {
    // TODO (krmitta): Add logic here
  };

  const toggleHideButton = () => {
    // TODO (krmitta): Add logic here
  };

  const openBulkEdit = () => {
    // TODO (krmitta): Add logic here
  };

  const toggleFilter = () => {
    // TODO (krmitta): Add logic here
  };

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'add-new-environment-variable',
        onClick: addNewEnvironmentVariable,
        disabled: false,
        iconProps: { iconName: 'Add' },
        name: t('staticSite_addNewEnvironmentVariable'),
        ariaLabel: t('staticSite_addNewEnvironmentVariable'),
      },
      {
        key: 'environment-variable-show-hide',
        onClick: toggleHideButton,
        iconProps: { iconName: 'RedEye' },
        name: t('showValues'),
      },
      {
        key: 'environment-variable-bulk-edit',
        onClick: openBulkEdit,
        disabled: false,
        iconProps: { iconName: 'Edit' },
        name: t('advancedEdit'),
      },
      {
        key: 'environment-variable-show-filter',
        onClick: toggleFilter,
        iconProps: { iconName: 'Filter' },
        name: t('filter'),
      },
    ];
  };

  const onRenderColumnItem = (item: EnvironmentVariable, index: number, column: IColumn) => {
    return <div className={defaultCellStyle}>{item[column.fieldName!]}</div>;
  };

  const getColumns = (): IColumn[] => {
    return [
      {
        key: 'name',
        name: t('nameRes'),
        fieldName: 'name',
        minWidth: 210,
        maxWidth: 350,
        isRowHeader: true,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: onRenderColumnItem,
      },
      {
        key: 'value',
        name: t('value'),
        fieldName: 'value',
        minWidth: 260,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: onRenderColumnItem,
      },
      {
        key: 'delete',
        name: t('delete'),
        fieldName: 'delete',
        minWidth: 50,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: onRenderColumnItem,
      },
      {
        key: 'edit',
        name: t('edit'),
        fieldName: 'edit',
        minWidth: 50,
        maxWidth: 50,
        isRowHeader: false,
        isResizable: false,
        isCollapsable: false,
        onRender: onRenderColumnItem,
      },
    ];
  };

  return (
    <>
      <ConfigurationCommandBar />
      <h3>{t('staticSite_environmentVariables')}</h3>
      <DisplayTableWithCommandBar
        commandBarItems={getCommandBarItems()}
        columns={getColumns()}
        items={[]}
        isHeaderVisible={true}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        selectionPreservedOnEmptyClick={true}
        emptyMessage={t('staticSite_emptyEnvironmentVariableList')}
      />
    </>
  );
};

export default Configuration;
