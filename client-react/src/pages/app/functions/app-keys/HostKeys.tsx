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
import {
  renewTextStyle,
  tableValueComponentStyle,
  tableValueIconStyle,
  tableValueFormFieldStyle,
  tableValueTextFieldStyle,
} from './AppKeys.styles';
import { useTranslation } from 'react-i18next';
import { defaultCellStyle } from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import { emptyKey } from './AppKeys';
import AppKeyAddEdit from './AppKeyAddEdit';
import IconButton from '../../../../components/IconButton/IconButton';
import { AppKeysContext } from './AppKeysDataLoader';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import DisplayTableWithCommandBar from '../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import { ThemeContext } from '../../../../ThemeContext';
import { filterTextFieldStyle } from '../../../../components/form-controls/formControl.override.styles';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';

interface HostKeysProps {
  resourceId: string;
  loading: boolean;
  hostKeys: AppKeysModel[];
  refreshData: () => void;
  readOnlyPermission: boolean;
}

const HostKeys: React.FC<HostKeysProps> = props => {
  const { hostKeys, resourceId, refreshData, loading, readOnlyPermission } = props;
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
    setShownValues(showValues ? [] : [...new Set(hostKeys.map(h => h.name))]);
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

  const filterValues = () => {
    return hostKeys.filter(x => {
      if (!filterValue) {
        return true;
      } else {
        return x.name.toLowerCase().includes(filterValue.toLowerCase());
      }
    });
  };

  const onShowHideButtonClick = (itemKey: string) => {
    const hidden = !shownValues.includes(itemKey) && !showValues;
    const newShownValues = new Set(shownValues);
    if (hidden) {
      newShownValues.add(itemKey);
    } else {
      newShownValues.delete(itemKey);
    }
    setShowValues(newShownValues.size === hostKeys.length);
    setShownValues([...newShownValues]);
  };

  const deleteHostKey = (itemKey: string) => {
    appKeysContext.deleteKey(resourceId, itemKey, AppKeysTypes.functionKeys);
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
              id={`app-host-keys-show-${index}`}
              className={defaultCellStyle}
              onClick={() => onShowHideButtonClick(itemKey)}
              iconProps={{ iconName: 'RedEye' }}>
              <div className={defaultCellStyle}>{t('hiddenValueClickAboveToShow')}</div>
            </ActionButton>
          ) : (
            <div className={`${tableValueComponentStyle} ${defaultCellStyle}`} onClick={() => onShowHideButtonClick(itemKey)}>
              <IconButton
                id={`app-host-keys-hide-${index}`}
                className={tableValueIconStyle(theme)}
                iconProps={{ iconName: 'Hide' }}
                onClick={() => onShowHideButtonClick(itemKey)}
              />
              <div className={tableValueTextFieldStyle}>
                <TextFieldNoFormik
                  id={`app-host-keys-value-${index}`}
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
      if (item.name === '_master') {
        return <></>;
      }
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
            onClick={() => deleteHostKey(itemKey)}
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

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'app-keys-host-keys-add',
        onClick: () => showAddEditPanel(),
        disabled: readOnlyPermission || loading,
        iconProps: { iconName: 'Add' },
        name: t('newHostKey'),
        ariaLabel: t('addHostKey'),
      },
      {
        key: 'app-keys-host-keys-show-hide',
        onClick: flipHideSwitch,
        disabled: loading,
        iconProps: { iconName: !showValues ? 'RedEye' : 'Hide' },
        name: !showValues ? t('showValues') : t('hideValues'),
      },
    ];
  };

  const createHostKey = (key: AppKeysModel) => {
    appKeysContext.createKey(resourceId, key.name, key.value, AppKeysTypes.functionKeys);
    onClosePanel();
    refreshData();
  };

  const closeRenewKeyDialog = () => {
    setRenewKey(emptyKey);
    setShowRenewDialog(false);
  };

  const showRenewKeyDialog = (item: AppKeysModel) => {
    setRenewKey(item);
    setShowRenewDialog(true);
  };

  const renewHostKey = () => {
    if (renewKey.name) {
      createHostKey({ name: renewKey.name, value: '' });
    }
    closeRenewKeyDialog();
  };

  return (
    <>
      <ConfirmDialog
        primaryActionButton={{
          title: t('functionKeys_renew'),
          onClick: renewHostKey,
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
        emptyMessage={t('emptyHostKeys')}>
        <SearchBox
          id="app-keys-host-keys-search"
          className="ms-slideDownIn20"
          autoFocus
          iconProps={{ iconName: 'Filter' }}
          styles={filterTextFieldStyle}
          placeholder={t('filterHostKeys')}
          onChange={newValue => setFilterValue(newValue)}
        />
      </DisplayTableWithCommandBar>
      <CustomPanel
        isOpen={showPanel && (panelItem === 'add' || panelItem === 'edit')}
        onDismiss={onClosePanel}
        headerText={panelItem === 'edit' ? t('editHostKey') : t('addHostKey')}
        type={PanelType.medium}>
        <AppKeyAddEdit
          resourceId={resourceId}
          createAppKey={createHostKey}
          closeBlade={onClosePanel}
          appKey={currentKey}
          otherAppKeys={hostKeys}
          panelItem={panelItem}
          showRenewKeyDialog={showRenewKeyDialog}
          readOnlyPermission={readOnlyPermission}
        />
      </CustomPanel>
    </>
  );
};

export default HostKeys;
