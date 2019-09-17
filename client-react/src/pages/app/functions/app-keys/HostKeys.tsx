import React, { useState } from 'react';
import { FormHostKeys } from './AppKeys.types';
import { Stack, ActionButton, Panel, PanelType, DetailsListLayoutMode, SelectionMode, IColumn, SearchBox } from 'office-ui-fabric-react';
import { tableActionButtonStyle, filterBoxStyle } from './AppKeys.styles';
import { useTranslation } from 'react-i18next';
import DisplayTableWithEmptyMessage, {
  defaultCellStyle,
} from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import { emptyKey } from './AppKeys';
import AppKeyAddEdit from './AppKeyAddEdit';

interface HostKeysProps {
  resourceId: string;
  hostKeys: FormHostKeys[];
  refreshData: () => void;
}

const HostKeys: React.FC<HostKeysProps> = props => {
  const writePermission = false;
  const { hostKeys, resourceId } = props;
  const [showValues, setShowValues] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  const [panelItem, setPanelItem] = useState('');
  const [currentKey, setCurrentKey] = useState(emptyKey);
  const [shownValues, setShownValues] = useState<string[]>([]);

  const { t } = useTranslation();

  const flipHideSwitch = () => {
    setShownValues(showValues ? [] : [...new Set(hostKeys.map(h => h.name))]);
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

  const showAddEditPanel = (key?: FormHostKeys) => {
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

  const onRenderColumnItem = (item: FormHostKeys, index: number, column: IColumn) => {
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
              if (!showValues) {
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
    return <div className={defaultCellStyle}>{item[column.fieldName!]}</div>;
  };

  const createHostKey = (key: FormHostKeys) => {
    // TODO: Create Host Key Logic Here..
  };

  return (
    <>
      <Stack horizontal verticalAlign="center">
        <ActionButton
          id="app-keys-host-keys-add"
          onClick={() => showAddEditPanel()}
          disabled={writePermission}
          styles={tableActionButtonStyle}
          iconProps={{ iconName: 'Add' }}
          ariaLabel={t('addHostKey')}>
          {t('newHostKey')}
        </ActionButton>
        <ActionButton
          id="app-keys-host-keys-show-hide"
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
          id="app-keys-host-keys-search"
          className="ms-slideDownIn20"
          autoFocus
          iconProps={{ iconName: 'Filter' }}
          styles={filterBoxStyle}
          placeholder={t('filterHostKeys')}
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
        emptyMessage={t('emptyHostKeys')}
      />
      <Panel
        isOpen={showPanel && (panelItem === 'add' || panelItem === 'edit')}
        type={PanelType.large}
        onDismiss={onClosePanel}
        headerText={panelItem === 'edit' ? t('editHostKey') : t('addHostKey')}
        closeButtonAriaLabel={t('close')}>
        <AppKeyAddEdit
          resourceId={resourceId}
          createAppKey={createHostKey}
          closeBlade={onClosePanel}
          appKey={currentKey}
          otherAppKeys={hostKeys}
          panelItem={panelItem}
        />
      </Panel>
    </>
  );
};

export default HostKeys;
