import React, { useContext, useState } from 'react';
import { FunctionKeysFormValues, FunctionKeysModel } from './FunctionKeys.types';
import { useTranslation } from 'react-i18next';
import { commandBarSticky, formStyle, renewTextStyle, filterBoxStyle } from './FunctionKeys.styles';
import FunctionKeysCommandBar from './FunctionKeysCommandBar';
import {
  ActionButton,
  IColumn,
  TooltipHost,
  ICommandBarItemProps,
  DetailsListLayoutMode,
  SelectionMode,
  SearchBox,
  PanelType,
} from 'office-ui-fabric-react';
import { defaultCellStyle } from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import { FunctionKeysContext } from './FunctionKeysDataLoader';
import IconButton from '../../../../components/IconButton/IconButton';
import { ThemeContext } from '../../../../ThemeContext';
import DisplayTableWithCommandBar from '../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import Panel from '../../../../components/Panel/Panel';
import FunctionKeyAddEdit from './FunctionKeyAddEdit';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import { SiteStateContext } from '../../../../SiteStateContext';
import SiteHelper from '../../../../utils/SiteHelper';

interface FunctionKeysProps {
  resourceId: string;
  initialValues: FunctionKeysFormValues;
  refreshData: () => void;
  setRefeshLoading: (loading: boolean) => void;
}

const emptyKey = { name: '', value: '' };

const FunctionKeys: React.FC<FunctionKeysProps> = props => {
  const {
    refreshData,
    initialValues: { keys },
    resourceId,
    setRefeshLoading,
  } = props;
  const { t } = useTranslation();
  const [showValues, setShowValues] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [renewKey, setRenewKey] = useState(emptyKey);
  const [filterValue, setFilterValue] = useState('');
  const [panelItem, setPanelItem] = useState('');
  const [currentKey, setCurrentKey] = useState(emptyKey);
  const [shownValues, setShownValues] = useState<string[]>([]);

  const functionKeysContext = useContext(FunctionKeysContext);
  const theme = useContext(ThemeContext);

  const siteStateContext = useContext(SiteStateContext);
  const readOnlyPermission = SiteHelper.isFunctionAppReadOnly(siteStateContext);

  const flipHideSwitch = () => {
    setShownValues(showValues ? [] : [...new Set(keys.map(h => h.name))]);
    setShowValues(!showValues);
  };

  const toggleFilter = () => {
    setFilterValue('');
    setShowFilter(!showFilter);
  };

  const onClosePanel = () => {
    setShowPanel(false);
    setPanelItem('');
  };

  const showAddEditPanel = (key?: FunctionKeysModel) => {
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
        minWidth: 100,
        maxWidth: 100,
        isRowHeader: false,
        isResizable: false,
        isCollapsable: false,
        onRender: onRenderColumnItem,
      },
    ];
  };

  const filterValues = () => {
    return keys.filter(x => {
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
    setShowValues(newShownValues.size === keys.length);
    setShownValues([...newShownValues]);
  };

  const deleteHostKey = (itemKey: string) => {
    functionKeysContext.deleteKey(resourceId, itemKey);
    refreshData();
  };

  const onRenderColumnItem = (item: FunctionKeysModel, index: number, column: IColumn) => {
    const itemKey = item.name;
    const hidden = !shownValues.includes(itemKey) && !showValues;

    if (column.key === 'value') {
      return (
        <>
          <ActionButton
            id={`function-keys-show-hide-${index}`}
            className={defaultCellStyle}
            onClick={() => onShowHideButtonClick(itemKey)}
            iconProps={{ iconName: hidden ? 'RedEye' : 'Hide' }}>
            {hidden ? (
              <div className={defaultCellStyle}>{t('hiddenValueClickAboveToShow')}</div>
            ) : (
              <div className={defaultCellStyle} id={`function-keys-value-${index}`}>
                {item[column.fieldName!]}
              </div>
            )}
          </ActionButton>
        </>
      );
    }
    if (column.key === 'name') {
      return (
        <ActionButton className={defaultCellStyle} id={`function-keys-name-${index}`} onClick={() => showAddEditPanel(item)}>
          <span aria-live="assertive" role="region">
            {item[column.fieldName!]}
          </span>
        </ActionButton>
      );
    }
    if (column.key === 'delete') {
      return (
        <TooltipHost content={t('delete')} id={`function-keys-delete-tooltip-${index}`} calloutProps={{ gapSpace: 0 }} closeDelay={500}>
          <IconButton
            className={defaultCellStyle}
            disabled={readOnlyPermission}
            id={`function-keys-delete-${index}`}
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

  const createFunctionKey = async (key: FunctionKeysModel) => {
    setRefeshLoading(true);
    await functionKeysContext.createKey(resourceId, key.name, key.value);
    refreshData();
  };

  const closeRenewKeyDialog = () => {
    setRenewKey(emptyKey);
    setShowRenewDialog(false);
  };

  const showRenewKeyDialog = (item: FunctionKeysModel) => {
    setRenewKey(item);
    setShowRenewDialog(true);
  };

  const renewFunctionKey = () => {
    if (renewKey.name) {
      createFunctionKey({ name: renewKey.name, value: '' });
    }
    closeRenewKeyDialog();
  };

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'function-keys-add',
        onClick: () => showAddEditPanel(),
        disabled: readOnlyPermission,
        iconProps: { iconName: 'Add' },
        name: t('newFunctionKey'),
        ariaLabel: t('functionKeys_addNewFunctionKey'),
      },
      {
        key: 'function-keys-show-hide',
        onClick: flipHideSwitch,
        iconProps: { iconName: !showValues ? 'RedEye' : 'Hide' },
        name: !showValues ? t('showValues') : t('hideValues'),
      },
      {
        key: 'function-keys-show-filter',
        onClick: toggleFilter,
        iconProps: { iconName: 'Filter' },
        name: t('filter'),
      },
    ];
  };

  return (
    <div>
      <div id="command-bar" className={commandBarSticky}>
        <FunctionKeysCommandBar refreshFunction={refreshData} />
      </div>
      <div id="function-keys-data" className={formStyle}>
        <h3>{t('functionKeys_title')}</h3>
        <DisplayTableWithCommandBar
          commandBarItems={getCommandBarItems()}
          columns={getColumns()}
          items={filterValues()}
          isHeaderVisible={true}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          selectionPreservedOnEmptyClick={true}
          emptyMessage={t('emptyFunctionKeys')}>
          {showFilter && (
            <SearchBox
              id="function-keys-search"
              className="ms-slideDownIn20"
              autoFocus
              iconProps={{ iconName: 'Filter' }}
              styles={filterBoxStyle}
              placeholder={t('filterFunctionKeys')}
              onChange={newValue => setFilterValue(newValue)}
            />
          )}
        </DisplayTableWithCommandBar>
        <ConfirmDialog
          primaryActionButton={{
            title: t('functionKeys_renew'),
            onClick: renewFunctionKey,
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
        <Panel
          isOpen={showPanel && (panelItem === 'add' || panelItem === 'edit')}
          onDismiss={onClosePanel}
          headerText={panelItem === 'edit' ? t('editFunctionKey') : t('addFunctionKey')}
          type={PanelType.medium}>
          <FunctionKeyAddEdit
            resourceId={resourceId}
            createAppKey={createFunctionKey}
            closeBlade={onClosePanel}
            appKey={currentKey}
            otherAppKeys={keys}
            panelItem={panelItem}
            showRenewKeyDialog={showRenewKeyDialog}
            readOnlyPermission={readOnlyPermission}
          />
        </Panel>
      </div>
    </div>
  );
};

export default FunctionKeys;
