import { FormikProps } from 'formik';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import React, { Suspense } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

import DisplayTableWithEmptyMessage, {
  defaultCellStyle,
} from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import IconButton from '../../../../components/IconButton/IconButton';
import { AppSettingsFormValues, FormConnectionString, Permissions } from '../AppSettings.types';
import ConnectionStringsAddEdit from './ConnectionStringsAddEdit';
import { typeValueToString } from './connectionStringTypes';
import { PermissionsContext } from '../Contexts';
import { sortBy } from 'lodash-es';
import LoadingComponent from '../../../../components/loading/loading-component';
import ConnectionStringsBulkEdit from './ConnectionStringsBulkEdit';
import { Stack, SearchBox } from 'office-ui-fabric-react';
import { filterBoxStyle, tableActionButtonStyle } from '../AppSettings.styles';

interface ConnectionStringsState {
  showPanel: boolean;
  currentConnectionString: FormConnectionString | null;
  shownValues: string[];
  panelItem: 'add' | 'bulk';
  filter: string;
  showFilter: boolean;
}

export class ConnectionStrings extends React.Component<FormikProps<AppSettingsFormValues> & WithTranslation, ConnectionStringsState> {
  public static contextType = PermissionsContext;
  public context: Permissions;

  constructor(props) {
    super(props);
    this.state = {
      showPanel: false,
      currentConnectionString: null,
      shownValues: [],
      panelItem: 'add',
      filter: '',
      showFilter: false,
    };
  }

  public render() {
    const { filter, showFilter } = this.state;
    const { values, t } = this.props;
    const { editable, production_write } = this.context;
    if (!values.connectionStrings) {
      return null;
    }
    return (
      <>
        <Stack horizontal verticalAlign="center">
          <ActionButton
            id="app-settings-connection-strings-add"
            onClick={this.createNewItem}
            disabled={!editable}
            styles={tableActionButtonStyle}
            iconProps={{ iconName: 'Add' }}>
            {t('newConnectionString')}
          </ActionButton>
          <ActionButton
            id="app-settings-connection-strings-show-hide"
            onClick={this.flipHideSwitch}
            styles={tableActionButtonStyle}
            iconProps={{ iconName: !this.anyShown() ? 'RedEye' : 'Hide' }}>
            {!this.anyShown() ? 'Show Values' : 'Hide Values'}
          </ActionButton>
          <ActionButton
            id="app-settings-application-settings-bulk-edit"
            onClick={this._openBulkEdit}
            disabled={!editable}
            styles={tableActionButtonStyle}
            iconProps={{ iconName: 'Edit' }}>
            {t('advancedEdit')}
          </ActionButton>
          <ActionButton
            id="app-settings-application-settings-show-filter"
            onClick={this._toggleFilter}
            styles={tableActionButtonStyle}
            iconProps={{ iconName: 'Filter' }}>
            {t('filter')}
          </ActionButton>
        </Stack>
        {showFilter && (
          <SearchBox
            id="app-settings-application-settings-search"
            className="ms-slideDownIn20"
            autoFocus
            iconProps={{ iconName: 'Filter' }}
            styles={filterBoxStyle}
            placeholder={t('filterConnectionStrings')}
            onChange={newValue => this.setState({ filter: newValue })}
          />
        )}
        <Panel
          isOpen={this.state.showPanel && this.state.panelItem === 'add'}
          type={PanelType.large}
          onDismiss={this._onCancel}
          headerText={t('addEditConnectionStringHeader')}
          closeButtonAriaLabel={t('close')}>
          <ConnectionStringsAddEdit
            connectionString={this.state.currentConnectionString!}
            otherConnectionStrings={values.connectionStrings}
            updateConnectionString={this._onClosePanel.bind(this)}
            disableSlotSetting={!production_write}
            closeBlade={this._onCancel}
          />
        </Panel>
        <Panel
          isOpen={this.state.showPanel && this.state.panelItem === 'bulk'}
          type={PanelType.large}
          onDismiss={this._onCancel}
          closeButtonAriaLabel={t('close')}>
          <Suspense fallback={<LoadingComponent />}>
            <ConnectionStringsBulkEdit
              updateAppSetting={this._saveBulkEdit}
              closeBlade={this._onCancel}
              connectionStrings={this.props.values.connectionStrings}
            />
          </Suspense>
        </Panel>
        <DisplayTableWithEmptyMessage
          items={values.connectionStrings.filter(x => {
            if (!filter) {
              return true;
            }
            return x.name.toLowerCase().includes(filter.toLowerCase()) || x.type.toLowerCase() === filter.toLowerCase();
          })}
          columns={this._getColumns()}
          isHeaderVisible={true}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          selectionPreservedOnEmptyClick={true}
          emptyMessage={t('emptyConnectionStrings')}
        />
      </>
    );
  }
  private _saveBulkEdit = (appSettings: FormConnectionString[]) => {
    const newConnectionStrings = sortBy(appSettings, o => o.name.toLowerCase());

    this.props.setFieldValue('connectionStrings', newConnectionStrings);
    this.setState({ showPanel: false });
  };
  private _openBulkEdit = () => {
    this.setState({
      showPanel: true,
      panelItem: 'bulk',
    });
  };
  private _toggleFilter = () => {
    const { showFilter } = this.state;
    this.setState({ showFilter: !showFilter, filter: '' });
  };

  private anyShown = () => {
    return this.state.shownValues.length > 0;
  };
  private flipHideSwitch = () => {
    let shownValues: string[] = [];
    if (!this.anyShown()) {
      shownValues = this.props.values.connectionStrings.map(x => x.name);
    } else {
      shownValues = [];
    }
    this.setState({ shownValues });
  };

  private createNewItem = () => {
    const blankConnectionString = {
      name: '',
      value: '',
      type: 'MySql',
      sticky: false,
      index: -1,
    };
    this.setState({
      showPanel: true,
      panelItem: 'add',
      currentConnectionString: blankConnectionString,
    });
  };

  private _onClosePanel = (currentConnectionString: FormConnectionString): void => {
    this.setState({ currentConnectionString });
    const { values, setFieldValue } = this.props;
    const connectionStrings: FormConnectionString[] = [...values.connectionStrings];
    const index = connectionStrings.findIndex(x => x.name.toLowerCase() === currentConnectionString.name.toLowerCase());
    if (index !== -1) {
      connectionStrings[index] = currentConnectionString;
    } else {
      connectionStrings.push({ ...currentConnectionString });
    }
    const sortedConnectionStrings = sortBy(connectionStrings, o => o.name.toLowerCase());
    setFieldValue('connectionStrings', sortedConnectionStrings);
    this.setState({ showPanel: false });
  };

  private _onCancel = (): void => {
    this.setState({ showPanel: false });
  };

  private _onShowPanel = (item: FormConnectionString): void => {
    this.setState({
      showPanel: true,
      currentConnectionString: item,
      panelItem: 'add',
    });
  };

  private removeItem(key: string) {
    const { values, setFieldValue } = this.props;
    const connectionStrings: FormConnectionString[] = [...values.connectionStrings].filter(v => v.name !== key);
    setFieldValue('connectionStrings', connectionStrings);
  }

  private onRenderItemColumn = (item: FormConnectionString, index: number, column: IColumn) => {
    const { t } = this.props;
    const { editable } = this.context;

    const itemKey = item.name;
    const hidden = !this.state.shownValues.includes(itemKey);
    if (!column || !item) {
      return null;
    }

    if (column.key === 'delete') {
      return (
        <IconButton
          className={defaultCellStyle}
          disabled={!editable}
          iconProps={{ iconName: 'Delete' }}
          id={`app-settings-connection-strings-delete-${index}`}
          ariaLabel={t('delete')}
          title={t('delete')}
          onClick={() => this.removeItem(itemKey)}
        />
      );
    }
    if (column.key === 'edit') {
      return (
        <IconButton
          className={defaultCellStyle}
          disabled={!editable}
          iconProps={{ iconName: 'Edit' }}
          id={`app-settings-connection-strings-edit-${index}`}
          ariaLabel={t('edit')}
          title={t('edit')}
          onClick={() => this._onShowPanel(item)}
        />
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
            styles={{ root: { height: '15px' } }}
            onClick={() => {
              let shownValues = [...this.state.shownValues];
              if (hidden) {
                shownValues.push(itemKey);
              } else {
                shownValues = shownValues.filter(x => x !== itemKey);
              }
              this.setState({ shownValues });
            }}
            iconProps={{ iconName: hidden ? 'RedEye' : 'Hide' }}>
            {hidden ? (
              <div className={defaultCellStyle}>{t('hiddenValueClickAboveToShow')}</div>
            ) : (
              <div className={defaultCellStyle} id={`app-settings-application-settings-value-${index}`}>
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
      return (
        <div id={`app-settings-connection-strings-name-${index}`} className={defaultCellStyle}>
          {item[column.fieldName!]}
        </div>
      );
    }
    return <div className={defaultCellStyle}>{item[column.fieldName!]}</div>;
  };

  private _getColumns = () => {
    const { t } = this.props;
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
        onRender: this.onRenderItemColumn,
      },
      {
        key: 'value',
        name: t('value'),
        fieldName: 'value',
        minWidth: 110,
        isRowHeader: true,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: this.onRenderItemColumn,
      },
      {
        key: 'type',
        name: t('type'),
        fieldName: 'type',
        minWidth: 200,
        maxWidth: 250,
        isRowHeader: true,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: this.onRenderItemColumn,
      },
      {
        key: 'sticky',
        name: t('sticky'),
        fieldName: 'sticky',
        minWidth: 50,
        maxWidth: 100,
        isRowHeader: true,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: this.onRenderItemColumn,
      },
      {
        key: 'delete',
        name: '',
        minWidth: 16,
        maxWidth: 16,
        isResizable: true,
        isCollapsable: false,
        onRender: this.onRenderItemColumn,
        ariaLabel: t('delete'),
      },
      {
        key: 'edit',
        name: '',
        minWidth: 16,
        maxWidth: 16,
        isResizable: true,
        isCollapsable: false,
        onRender: this.onRenderItemColumn,
        ariaLabel: t('edit'),
      },
    ];
  };
}

export default withTranslation('translation')(ConnectionStrings);
