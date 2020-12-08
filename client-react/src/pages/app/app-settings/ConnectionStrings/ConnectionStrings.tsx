import { FormikProps } from 'formik';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import React, { Suspense, useState, useContext } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

import { defaultCellStyle } from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import IconButton from '../../../../components/IconButton/IconButton';
import { AppSettingsFormValues, FormConnectionString } from '../AppSettings.types';
import ConnectionStringsAddEdit from './ConnectionStringsAddEdit';
import { typeValueToString } from './connectionStringTypes';
import { PermissionsContext } from '../Contexts';
import { sortBy } from 'lodash-es';
import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import ConnectionStringsBulkEdit from './ConnectionStringsBulkEdit';
import { SearchBox, TooltipHost, ICommandBarItemProps } from 'office-ui-fabric-react';
import { dirtyElementStyle } from '../AppSettings.styles';
import DisplayTableWithCommandBar from '../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import { ThemeContext } from '../../../../ThemeContext';
import { filterTextFieldStyle } from '../../../../components/form-controls/formControl.override.styles';
import { linkCellStyle } from '../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar.style';

const ConnectionStrings: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
  const { production_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !editable || saving;
  const [showPanel, setShowPanel] = useState(false);
  const [panelItem, setPanelItem] = useState('add');
  const [currentConnectionString, setCurrentConnectionString] = useState<FormConnectionString | null>(null);
  const [shownValues, setShownValues] = useState<string[]>([]);
  const [filter, setFilter] = useState('');
  const [showAllValues, setShowAllValues] = useState(false);

  const { t, values } = props;
  const theme = useContext(ThemeContext);

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    const allShown = showAllValues || (values.appSettings.length > 0 && shownValues.length === values.appSettings.length);

    return [
      {
        key: 'app-settings-connection-strings-add',
        onClick: createNewItem,
        disabled: disableAllControls,
        iconProps: { iconName: 'Add' },
        name: t('newConnectionString'),
        ariaLabel: t('addNewConnectionString'),
      },
      {
        key: 'app-settings-connection-strings-show-hide',
        onClick: flipHideSwitch,
        iconProps: { iconName: !allShown ? 'RedEye' : 'Hide' },
        name: !allShown ? t('showValues') : t('hideValues'),
      },
      {
        key: 'app-settings-connection-strings-bulk-edit',
        onClick: openBulkEdit,
        disabled: disableAllControls,
        iconProps: { iconName: 'Edit' },
        name: t('advancedEdit'),
      },
    ];
  };

  const saveBulkEdit = (connectionString: FormConnectionString[]) => {
    const newConnectionStrings = sortBy(connectionString, o => o.name.toLowerCase());
    props.setFieldValue('connectionStrings', newConnectionStrings);
    setShowPanel(false);
  };

  const openBulkEdit = () => {
    setShowPanel(true);
    setPanelItem('bulk');
  };

  const flipHideSwitch = () => {
    let newShownValues: string[] = [];
    if (!showAllValues) {
      newShownValues = values.connectionStrings.map(x => x.name);
    }
    setShownValues(newShownValues);
    setShowAllValues(!showAllValues);
  };

  const createNewItem = () => {
    const blankConnectionString = {
      name: '',
      value: '',
      type: 'MySql',
      sticky: false,
      index: -1,
    };
    setShowPanel(true);
    setPanelItem('add');
    setCurrentConnectionString(blankConnectionString);
  };

  const onClosePanel = (newConnectionString: FormConnectionString): void => {
    setCurrentConnectionString(newConnectionString);
    const connectionStrings: FormConnectionString[] = [...values.connectionStrings];
    const index = connectionStrings.findIndex(
      x =>
        x.name.toLowerCase() === newConnectionString.name.toLowerCase() ||
        (!!currentConnectionString && currentConnectionString.name.toLowerCase() === x.name.toLowerCase())
    );
    if (index !== -1) {
      connectionStrings[index] = newConnectionString;
    } else {
      connectionStrings.push({ ...newConnectionString });
    }
    const sortedConnectionStrings = sortBy(connectionStrings, o => o.name.toLowerCase());
    props.setFieldValue('connectionStrings', sortedConnectionStrings);
    setShowPanel(false);
  };

  const onCancel = (): void => {
    setShowPanel(false);
  };

  const onShowPanel = (item: FormConnectionString): void => {
    setShowPanel(true);
    setCurrentConnectionString(item);
    setPanelItem('add');
  };

  const removeItem = (key: string) => {
    const connectionStrings: FormConnectionString[] = [...values.connectionStrings].filter(v => v.name !== key);
    props.setFieldValue('connectionStrings', connectionStrings);
  };

  const onShowHideButtonClick = (itemKey: string) => {
    const hidden = !shownValues.includes(itemKey) && !showAllValues;
    const newShownValues = new Set(shownValues);
    if (hidden) {
      newShownValues.add(itemKey);
    } else {
      newShownValues.delete(itemKey);
    }
    setShowAllValues(newShownValues.size === values.connectionStrings.length);
    setShownValues([...newShownValues]);
  };

  const isConnectionStringDirty = (index: number): boolean => {
    const initialAppSettings = props.initialValues.connectionStrings;
    const currentRow = values.connectionStrings[index];
    const currentAppSettingIndex = initialAppSettings.findIndex(x => {
      return (
        x.name.toLowerCase() === currentRow.name.toLowerCase() &&
        x.value.toLowerCase() === currentRow.value.toLowerCase() &&
        x.sticky === currentRow.sticky &&
        x.type === currentRow.type
      );
    });
    return currentAppSettingIndex < 0;
  };

  const onRenderItemColumn = (item: FormConnectionString, index: number, column: IColumn) => {
    const itemKey = item.name;
    const hidden = !shownValues.includes(itemKey) && !showAllValues;
    if (!column || !item) {
      return null;
    }

    if (column.key === 'delete') {
      return (
        <TooltipHost
          content={t('delete')}
          id={`app-settings-connection-strings-delete-tooltip-${index}`}
          calloutProps={{ gapSpace: 0 }}
          closeDelay={500}>
          <IconButton
            className={defaultCellStyle}
            disabled={disableAllControls}
            id={`app-settings-connection-strings-delete-${index}`}
            iconProps={{ iconName: 'Delete' }}
            ariaLabel={t('delete')}
            onClick={() => removeItem(itemKey)}
          />
        </TooltipHost>
      );
    }
    if (column.key === 'edit') {
      return (
        <TooltipHost
          content={t('edit')}
          id={`app-settings-connection-strings-edit-tooltip-${index}`}
          calloutProps={{ gapSpace: 0 }}
          closeDelay={500}>
          <IconButton
            className={defaultCellStyle}
            disabled={disableAllControls}
            id={`app-settings-connection-strings-edit-${index}`}
            iconProps={{ iconName: 'Edit' }}
            ariaLabel={t('edit')}
            onClick={() => onShowPanel(item)}
          />
        </TooltipHost>
      );
    }
    if (column.key === 'sticky') {
      return item.sticky ? (
        <IconButton
          className={defaultCellStyle}
          id={`app-settings-connection-strings-sticky-${index}`}
          iconProps={{ iconName: 'CheckMark' }}
          ariaLabel={t('slotSettingOn')}
          title={t('sticky')}
        />
      ) : null;
    }
    if (column.key === 'value') {
      return (
        <>
          <ActionButton
            id={`app-settings-connection-strings-show-hide-${index}`}
            className={`${defaultCellStyle} ${linkCellStyle(theme)}`}
            onClick={() => onShowHideButtonClick(itemKey)}
            iconProps={{ iconName: hidden ? 'RedEye' : 'Hide' }}>
            {hidden ? (
              <div className={defaultCellStyle}>{t('hiddenValueClickAboveToShow')}</div>
            ) : (
              <div className={defaultCellStyle} id={`app-settings-connection-strings-value-${index}`}>
                {item[column.fieldName!]}
              </div>
            )}
          </ActionButton>
        </>
      );
    }
    if (column.key === 'type') {
      return (
        <span id={`app-settings-connection-strings-type-${index}`} className={defaultCellStyle}>
          {typeValueToString(item[column.fieldName!])}
        </span>
      );
    }
    if (column.key === 'name') {
      column.className = '';
      if (isConnectionStringDirty(index)) {
        column.className = dirtyElementStyle(theme);
      }
      return (
        <ActionButton
          id={`app-settings-connection-strings-name-${index}`}
          className={defaultCellStyle}
          disabled={disableAllControls}
          onClick={() => onShowPanel(item)}
          ariaLabel={item[column.fieldName!]}>
          <span aria-live="assertive" role="region">
            {item[column.fieldName!]}
          </span>
        </ActionButton>
      );
    }
    return <div className={defaultCellStyle}>{item[column.fieldName!]}</div>;
  };

  const getColumns = () => {
    return [
      {
        key: 'name',
        name: t('nameRes'),
        fieldName: 'name',
        minWidth: 110,
        maxWidth: 350,
        isRowHeader: true,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: onRenderItemColumn,
      },
      {
        key: 'value',
        name: t('value'),
        fieldName: 'value',
        minWidth: 110,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: onRenderItemColumn,
      },
      {
        key: 'type',
        name: t('type'),
        fieldName: 'type',
        minWidth: 200,
        maxWidth: 250,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: onRenderItemColumn,
      },
      {
        key: 'sticky',
        name: t('sticky'),
        fieldName: 'sticky',
        minWidth: 50,
        maxWidth: 100,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: onRenderItemColumn,
      },
      {
        key: 'delete',
        name: t('delete'),
        fieldName: 'delete',
        minWidth: 100,
        maxWidth: 100,
        isRowHeader: false,
        isResizable: false,
        isCollapsable: false,
        onRender: onRenderItemColumn,
      },
      {
        key: 'edit',
        name: t('edit'),
        fieldName: 'edit',
        minWidth: 100,
        maxWidth: 100,
        isRowHeader: false,
        isResizable: false,
        isCollapsable: false,
        onRender: onRenderItemColumn,
      },
    ];
  };

  if (!values.connectionStrings) {
    return null;
  }

  return (
    <>
      <DisplayTableWithCommandBar
        commandBarItems={getCommandBarItems()}
        items={values.connectionStrings.filter(x => {
          if (!filter) {
            return true;
          }
          return x.name.toLowerCase().includes(filter.toLowerCase()) || x.type.toLowerCase() === filter.toLowerCase();
        })}
        columns={getColumns()}
        isHeaderVisible={true}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        selectionPreservedOnEmptyClick={true}
        emptyMessage={t('emptyConnectionStrings')}>
        <SearchBox
          id="app-settings-connection-strings-search"
          className="ms-slideDownIn20"
          autoFocus
          iconProps={{ iconName: 'Filter' }}
          styles={filterTextFieldStyle}
          placeholder={t('filterConnectionStrings')}
          onChange={newValue => setFilter(newValue)}
        />
      </DisplayTableWithCommandBar>
      <CustomPanel isOpen={showPanel && panelItem === 'add'} onDismiss={onCancel} headerText={t('addEditConnectionStringHeader')}>
        <ConnectionStringsAddEdit
          connectionString={currentConnectionString!}
          otherConnectionStrings={values.connectionStrings}
          updateConnectionString={onClosePanel}
          disableSlotSetting={!production_write}
          closeBlade={onCancel}
          site={values.site}
        />
      </CustomPanel>
      <CustomPanel isOpen={showPanel && panelItem === 'bulk'} onDismiss={onCancel}>
        <Suspense fallback={<LoadingComponent />}>
          <ConnectionStringsBulkEdit
            updateAppSetting={saveBulkEdit}
            closeBlade={onCancel}
            connectionStrings={values.connectionStrings}
            disableSlotSetting={!production_write}
          />
        </Suspense>
      </CustomPanel>
    </>
  );
};

export default withTranslation('translation')(ConnectionStrings);
