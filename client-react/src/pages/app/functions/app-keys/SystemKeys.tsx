import React, { useState, useContext } from 'react';
import { AppKeysModel, AppKeysTypes } from './AppKeys.types';
import {
  ActionButton,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  SearchBox,
  TooltipHost,
  ICommandBarItemProps,
  PanelType,
} from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import {
  renewTextStyle,
  tableValueComponentStyle,
  tableValueIconStyle,
  tableValueFormFieldStyle,
  tableValueTextFieldStyle,
} from './AppKeys.styles';
import { defaultCellStyle } from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import { emptyKey } from './AppKeys';
import AppKeyAddEdit from './AppKeyAddEdit';
import IconButton from '../../../../components/IconButton/IconButton';
import { AppKeysContext } from './AppKeysDataLoader';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import DisplayTableWithCommandBar from '../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import { ThemeContext } from '../../../../ThemeContext';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import { filterTextFieldStyle } from '../../../../components/form-controls/formControl.override.styles';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';

interface SystemKeysProps {
  resourceId: string;
  loading: boolean;
  systemKeys: AppKeysModel[];
  refreshData: () => void;
  readOnlyPermission: boolean;
}

const SystemKeys: React.FC<SystemKeysProps> = props => {
  const { systemKeys, resourceId, refreshData, loading, readOnlyPermission } = props;
  const [showValues, setShowValues] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [renewKey, setRenewKey] = useState(emptyKey);
  const [filterValue, setFilterValue] = useState('');
  const [panelItem, setPanelItem] = useState('');
  const [currentKey, setCurrentKey] = useState(emptyKey);
  const [shownValues, setShownValues] = useState<string[]>([]);

  const { t } = useTranslation();
  const appKeysContext = useContext(AppKeysContext);
  const theme = useContext(ThemeContext);

  const flipHideSwitch = () => {
    setShownValues(showValues ? [] : [...new Set(systemKeys.map(h => h.name))]);
    setShowValues(!showValues);
  };

  const onClosePanel = () => {
    setShowPanel(false);
    setPanelItem('');
  };

  const showAddEditPanel = (key?: AppKeysModel) => {
    setShowPanel(true);
    setCurrentKey(key ? key : emptyKey);
    setPanelItem(key ? 'edit' : 'add');
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

  const createSystemKey = (key: AppKeysModel) => {
    appKeysContext.createKey(resourceId, key.name, key.value, AppKeysTypes.systemKeys);
    onClosePanel();
    refreshData();
  };

  const getColumns = (): IColumn[] => {
    return [
      {
        key: 'name',
        name: t('nameRes'),
        fieldName: 'name',
        minWidth: 100,
        maxWidth: 220,
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
        minWidth: 350,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: onRenderColumnItem,
      },
      {
        key: 'renew',
        name: '',
        fieldName: 'renew',
        minWidth: 100,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: onRenderColumnItem,
      },
      {
        key: 'delete',
        name: '',
        fieldName: 'delete',
        minWidth: 35,
        maxWidth: 35,
        isRowHeader: false,
        isResizable: false,
        isCollapsable: false,
        onRender: onRenderColumnItem,
      },
    ];
  };

  const onShowHideButtonClick = (itemKey: string) => {
    const hidden = !shownValues.includes(itemKey) && !showValues;
    const newShownValues = new Set(shownValues);
    if (hidden) {
      newShownValues.add(itemKey);
    } else {
      newShownValues.delete(itemKey);
    }
    setShowValues(newShownValues.size === systemKeys.length);
    setShownValues([...newShownValues]);
  };

  const deleteSystemKey = (itemKey: string) => {
    appKeysContext.deleteKey(resourceId, itemKey, AppKeysTypes.systemKeys);
    refreshData();
  };

  const onRenderColumnItem = (item: AppKeysModel, index: number, column: IColumn) => {
    const itemKey = item.name;
    const hidden = !shownValues.includes(itemKey) && !showValues;

    if (column.key === 'value') {
      return (
        <>
          {hidden ? (
            <ActionButton
              id={`app-system-keys-show-${index}`}
              className={defaultCellStyle}
              onClick={() => onShowHideButtonClick(itemKey)}
              iconProps={{ iconName: 'RedEye' }}>
              <div className={defaultCellStyle}>{t('hiddenValueClickAboveToShow')}</div>
            </ActionButton>
          ) : (
            <div className={`${tableValueComponentStyle} ${defaultCellStyle}`} onClick={() => onShowHideButtonClick(itemKey)}>
              <IconButton
                id={`app-system-keys-hide-${index}`}
                className={tableValueIconStyle(theme)}
                iconProps={{ iconName: 'Hide' }}
                onClick={() => onShowHideButtonClick(itemKey)}
              />
              <div className={tableValueTextFieldStyle}>
                <TextFieldNoFormik
                  id={`app-system-keys-value-${index}`}
                  value={item[column.fieldName!]}
                  copyButton={true}
                  disabled={true}
                  formControlClassName={tableValueFormFieldStyle}
                  className={defaultCellStyle}
                  widthOverride="100%"
                />
              </div>
            </div>
          )}
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
            disabled={readOnlyPermission}
            id={`app-settings-application-settings-delete-${index}`}
            iconProps={{ iconName: 'Delete' }}
            ariaLabel={t('delete')}
            onClick={() => deleteSystemKey(itemKey)}
          />
        </TooltipHost>
      );
    }
    if (column.key === 'renew') {
      return (
        <span className={renewTextStyle(theme)} onClick={() => showRenewKeyDialog(item)}>
          {t('renewKeyValue')}
        </span>
      );
    }
    return <div className={defaultCellStyle}>{item[column.fieldName!]}</div>;
  };

  const closeRenewKeyDialog = () => {
    setRenewKey(emptyKey);
    setShowRenewDialog(false);
  };

  const showRenewKeyDialog = (item: AppKeysModel) => {
    setRenewKey(item);
    setShowRenewDialog(true);
  };

  const renewSystemKey = () => {
    if (renewKey.name) {
      createSystemKey({ name: renewKey.name, value: '' });
    }
    closeRenewKeyDialog();
  };

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'app-keys-system-keys-show-hide',
        onClick: flipHideSwitch,
        disabled: loading,
        iconProps: { iconName: !showValues ? 'RedEye' : 'Hide' },
        name: !showValues ? t('showValues') : t('hideValues'),
      },
    ];
  };

  return (
    <>
      <ConfirmDialog
        primaryActionButton={{
          title: t('functionKeys_renew'),
          onClick: renewSystemKey,
        }}
        defaultActionButton={{
          title: t('cancel'),
          onClick: closeRenewKeyDialog,
        }}
        title={t('renewKeyValue')}
        content={t('renewKeyValueContent').format(renewKey.name)}
        hidden={!showRenewDialog}
        onDismiss={closeRenewKeyDialog}
      />
      <DisplayTableWithCommandBar
        commandBarItems={getCommandBarItems()}
        columns={getColumns()}
        items={filterValues()}
        isHeaderVisible={true}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        selectionPreservedOnEmptyClick={true}
        shimmer={{ lines: 2, show: loading }}
        emptyMessage={t('emptySystemKeys')}>
        <SearchBox
          id="app-keys-system-keys-search"
          className="ms-slideDownIn20"
          autoFocus
          iconProps={{ iconName: 'Filter' }}
          styles={filterTextFieldStyle}
          placeholder={t('filterSystemKeys')}
          onChange={newValue => setFilterValue(newValue)}
        />
      </DisplayTableWithCommandBar>
      <CustomPanel
        isOpen={showPanel && (panelItem === 'add' || panelItem === 'edit')}
        onDismiss={onClosePanel}
        headerText={panelItem === 'edit' ? t('editSystemKey') : t('addSystemKey')}
        type={PanelType.medium}>
        <AppKeyAddEdit
          resourceId={resourceId}
          createAppKey={createSystemKey}
          closeBlade={onClosePanel}
          appKey={currentKey}
          otherAppKeys={systemKeys}
          panelItem={panelItem}
          showRenewKeyDialog={showRenewKeyDialog}
          readOnlyPermission={readOnlyPermission}
        />
      </CustomPanel>
    </>
  );
};

export default SystemKeys;
