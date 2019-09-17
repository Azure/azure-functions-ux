import React, { useState } from 'react';
import { FormHostKeys } from './AppKeys.types';
import { Stack, ActionButton, Panel, PanelType, DetailsListLayoutMode, SelectionMode, IColumn, SearchBox } from 'office-ui-fabric-react';
import { tableActionButtonStyle, filterBoxStyle } from './AppKeys.styles';
import { useTranslation } from 'react-i18next';
import DisplayTableWithEmptyMessage from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import { emptyKey } from './AppKeys';

interface HostKeysProps {
  resourceId: string;
  hostKeys: FormHostKeys[];
  refreshData: () => void;
}

const HostKeys: React.FC<HostKeysProps> = props => {
  const writePermission = false;
  const { hostKeys } = props;
  const [showValues, setShowValues] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  const [panelItem, setPanelItem] = useState('');
  const [currentKey, setCurrentKey] = useState(emptyKey);

  const { t } = useTranslation();

  const createKey = () => {
    // TODO: Create Host Key Logic Here
    setShowPanel(true);
    setPanelItem('add');
    setCurrentKey(emptyKey);
  };

  const flipHideSwitch = () => {
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

  const filterValues = () => {
    return hostKeys.filter(x => {
      if (!filterValue) {
        return true;
      } else {
        return x.name.toLowerCase().includes(filterValue.toLowerCase());
      }
    });
  };

  console.log(currentKey);

  return (
    <>
      <Stack horizontal verticalAlign="center">
        <ActionButton
          id="app-keys-host-keys-add"
          onClick={createKey}
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
        isOpen={showPanel && panelItem === 'add'}
        type={PanelType.large}
        onDismiss={onClosePanel}
        headerText={t('addHostKey')}
        closeButtonAriaLabel={t('close')}
      />
    </>
  );
};

export default HostKeys;
