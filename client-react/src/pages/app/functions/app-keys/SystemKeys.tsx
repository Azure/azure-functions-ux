import React, { useState, useContext } from 'react';
import { FormSystemKeys, AppKeysTypes } from './AppKeys.types';
import {
  ActionButton,
  Stack,
  Panel,
  PanelType,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  SearchBox,
  TooltipHost,
} from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { tableActionButtonStyle, filterBoxStyle } from './AppKeys.styles';
import DisplayTableWithEmptyMessage, {
  defaultCellStyle,
} from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import { emptyKey } from './AppKeys';
import AppKeyAddEdit from './AppKeyAddEdit';
import IconButton from '../../../../components/IconButton/IconButton';
import { AppKeysContext } from './AppKeysDataLoader';
import { Site } from '../../../../models/site/site';
import { ArmObj } from '../../../../models/arm-obj';

interface SystemKeysProps {
  resourceId: string;
  site: ArmObj<Site>;
  systemKeys: FormSystemKeys[];
  refreshData: () => void;
}

const SystemKeys: React.FC<SystemKeysProps> = props => {
  const writePermission = false;
  const { systemKeys, resourceId, refreshData } = props;
  const [showValues, setShowValues] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  const [panelItem, setPanelItem] = useState('');
  const [currentKey, setCurrentKey] = useState(emptyKey);
  const [shownValues, setShownValues] = useState<string[]>([]);

  const { t } = useTranslation();
  const appKeysContext = useContext(AppKeysContext);

  const flipHideSwitch = () => {
    setShownValues(showValues ? [] : [...new Set(systemKeys.map(h => h.name))]);
    setShowValues(!showValues);
  };

  const onClosePanel = () => {
    setShowPanel(false);
    setPanelItem('');
  };

  const showAddEditPanel = (key?: FormSystemKeys) => {
    setShowPanel(true);
    setCurrentKey(key ? key : emptyKey);
    setPanelItem(key ? 'edit' : 'add');
  };

  const toggleFilter = () => {
    setFilterValue('');
    setShowFilter(!showFilter);
  };

  const filterValues = () => {
    return systemKeys.filter(x => {
      if (!filterValue) {
        return true;
      } else {
        return x.name.toLowerCase().includes(filterValue.toLowerCase());
      }
    });
  };

  const createSystemKey = (key: FormSystemKeys) => {
    appKeysContext.createKey(resourceId, key.name, key.value, AppKeysTypes.systemKeys);
    refreshData();
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
        minWidth: 210,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: onRenderColumnItem,
      },
    ];
  };

  const deleteSystemKey = (itemKey: string) => {
    appKeysContext.deleteKey(resourceId, itemKey, AppKeysTypes.systemKeys);
    refreshData();
  };

  const onRenderColumnItem = (item: FormSystemKeys, index: number, column: IColumn) => {
    const itemKey = item.name;
    const hidden = !shownValues.includes(itemKey) && !showValues;

    if (!column || !item) {
      return null;
    }

    if (column.key === 'value') {
      return (
        <>
          <ActionButton
            id={`app-keys-host-keys-show-hide-${index}`}
            className={defaultCellStyle}
            onClick={() => {
              const newShownValues = new Set(shownValues);
              if (hidden) {
                newShownValues.add(itemKey);
              } else {
                newShownValues.delete(itemKey);
              }
              setShowValues(false);
              setShownValues([...newShownValues]);
            }}
            iconProps={{ iconName: hidden ? 'RedEye' : 'Hide' }}>
            {hidden ? (
              <div className={defaultCellStyle}>{t('hiddenValueClickAboveToShow')}</div>
            ) : (
              <div className={defaultCellStyle} id={`app-keys-host-keys-value-${index}`}>
                {item[column.fieldName!]}
              </div>
            )}
          </ActionButton>
        </>
      );
    }
    if (column.key === 'name') {
      return (
        <ActionButton
          className={defaultCellStyle}
          id={`app-settings-application-settings-name-${index}`}
          onClick={() => showAddEditPanel(item)}>
          <span aria-live="assertive" role="region">
            {item[column.fieldName!]}
          </span>
        </ActionButton>
      );
    }
    if (column.key === 'delete') {
      return (
        <TooltipHost
          content={t('delete')}
          id={`app-keys-host-keys-delete-tooltip-${index}`}
          calloutProps={{ gapSpace: 0 }}
          closeDelay={500}>
          <IconButton
            className={defaultCellStyle}
            disabled={false}
            id={`app-settings-application-settings-delete-${index}`}
            iconProps={{ iconName: 'Delete' }}
            ariaLabel={t('delete')}
            onClick={() => deleteSystemKey(itemKey)}
          />
        </TooltipHost>
      );
    }
    return <div className={defaultCellStyle}>{item[column.fieldName!]}</div>;
  };

  return (
    <>
      <Stack horizontal verticalAlign="center">
        <ActionButton
          id="app-keys-system-keys-add"
          onClick={() => showAddEditPanel()}
          disabled={writePermission}
          styles={tableActionButtonStyle}
          iconProps={{ iconName: 'Add' }}
          ariaLabel={t('addSystemKey')}>
          {t('newSystemKey')}
        </ActionButton>
        <ActionButton
          id="app-keys-system-keys-show-hide"
          onClick={flipHideSwitch}
          styles={tableActionButtonStyle}
          iconProps={{ iconName: !showValues ? 'RedEye' : 'Hide' }}>
          {!showValues ? t('showValues') : t('hideValues')}
        </ActionButton>
        <ActionButton
          id="app-keys-host-keys-show-filter"
          onClick={toggleFilter}
          styles={tableActionButtonStyle}
          iconProps={{ iconName: 'Filter' }}>
          {t('filter')}
        </ActionButton>
      </Stack>
      {showFilter && (
        <SearchBox
          id="app-keys-system-keys-search"
          className="ms-slideDownIn20"
          autoFocus
          iconProps={{ iconName: 'Filter' }}
          styles={filterBoxStyle}
          placeholder={t('filterSystemKeys')}
          onChange={newValue => setFilterValue(newValue)}
        />
      )}
      <DisplayTableWithEmptyMessage
        columns={getColumns()}
        items={filterValues()}
        isHeaderVisible={true}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        selectionPreservedOnEmptyClick={true}
        emptyMessage={t('emptySystemKeys')}
      />
      <Panel
        isOpen={showPanel && (panelItem === 'add' || panelItem === 'edit')}
        type={PanelType.large}
        onDismiss={onClosePanel}
        headerText={panelItem === 'edit' ? t('editSystemKey') : t('addSystemKey')}
        closeButtonAriaLabel={t('close')}>
        <AppKeyAddEdit
          resourceId={resourceId}
          createAppKey={createSystemKey}
          closeBlade={onClosePanel}
          appKey={currentKey}
          otherAppKeys={systemKeys}
          panelItem={panelItem}
        />
      </Panel>
    </>
  );
};

export default SystemKeys;
