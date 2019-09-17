import React, { useState } from 'react';
import { FormSystemKeys } from './AppKeys.types';
import { ActionButton, Stack, Panel, PanelType, DetailsListLayoutMode, SelectionMode, IColumn, SearchBox } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { tableActionButtonStyle, filterBoxStyle } from './AppKeys.styles';
import DisplayTableWithEmptyMessage from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';

interface SystemKeysProps {
  resourceId: string;
  systemKeys: FormSystemKeys[];
  refreshSystemKeys: () => void;
}

const SystemKeys: React.FC<SystemKeysProps> = props => {
  const writePermission = false;
  const { systemKeys } = props;
  const [showValues, setShowValues] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  const [panelItem, setPanelItem] = useState('');
  const [currentKey, setCurrentKey] = useState({ name: '', value: '' });

  const { t } = useTranslation();

  const createKey = () => {
    // TODO: Create Host Key Logic Here
    setCurrentKey({
      name: '',
      value: '',
    });
    setShowPanel(true);
    setPanelItem('add');
  };

  const flipHideSwitch = () => {
    setShowValues(!showValues);
  };

  const onClosePanel = () => {
    setShowPanel(false);
    setPanelItem('');
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
      },
    ];
  };

  console.log(currentKey);

  return (
    <>
      <Stack horizontal verticalAlign="center">
        <ActionButton
          id="app-keys-system-keys-add"
          onClick={createKey}
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
        isOpen={showPanel && panelItem === 'add'}
        type={PanelType.large}
        onDismiss={onClosePanel}
        headerText={t('addSystemKey')}
        closeButtonAriaLabel={t('close')}
      />
    </>
  );
};

export default SystemKeys;
