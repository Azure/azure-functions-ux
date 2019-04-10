import { FormikProps } from 'formik';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import React, { lazy, Suspense } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

import DisplayTableWithEmptyMessage, {
  defaultCellStyle,
} from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import IconButton from '../../../../components/IconButton/IconButton';
import { AppSettingsFormValues, FormAppSetting } from '../AppSettings.types';
import AppSettingAddEdit from './AppSettingAddEdit';
import { PermissionsContext } from '../Contexts';
import { SearchBox, Stack } from 'office-ui-fabric-react';
import { sortBy } from 'lodash-es';
import LoadingComponent from '../../../../components/loading/loading-component';
import { filterBoxStyle, tableActionButtonStyle } from '../AppSettings.styles';

const AppSettingsBulkEdit = lazy(() => import(/* webpackChunkName:"appsettingsAdvancedEdit" */ './AppSettingsBulkEdit'));
interface ApplicationSettingsState {
  showPanel: boolean;
  panelItem: 'add' | 'bulk';
  currentAppSetting: FormAppSetting | null;
  shownValues: string[];
  filter: string;
  showFilter: boolean;
}

export class ApplicationSettings extends React.Component<FormikProps<AppSettingsFormValues> & WithTranslation, ApplicationSettingsState> {
  public static contextType = PermissionsContext;
  constructor(props) {
    super(props);
    this.state = {
      showPanel: false,
      panelItem: 'add',
      currentAppSetting: null,
      shownValues: [],
      filter: '',
      showFilter: false,
    };
  }

  public render() {
    const { t } = this.props;
    const { production_write, editable } = this.context;
    const { filter, showFilter } = this.state;
    if (!this.props.values.appSettings) {
      return null;
    }

    return (
      <>
        <Stack horizontal verticalAlign="center">
          <ActionButton
            id="app-settings-application-settings-add"
            onClick={this.createNewItem}
            disabled={!editable}
            styles={tableActionButtonStyle}
            iconProps={{ iconName: 'Add' }}>
            {t('newApplicationSetting')}
          </ActionButton>
          <ActionButton
            id="app-settings-application-settings-show-hide"
            onClick={this.flipHideSwitch}
            styles={tableActionButtonStyle}
            iconProps={{ iconName: !this.anyShown() ? 'RedEye' : 'Hide' }}>
            {!this.anyShown() ? t('showValues') : t('hideValues')}
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
            placeholder={t('filterAppSettings')}
            onChange={newValue => this.setState({ filter: newValue })}
          />
        )}
        <Panel
          isOpen={this.state.showPanel && this.state.panelItem === 'add'}
          type={PanelType.large}
          onDismiss={this.onCancel}
          headerText={t('addEditApplicationSetting')}
          closeButtonAriaLabel={t('close')}>
          <AppSettingAddEdit
            appSetting={this.state.currentAppSetting!}
            disableSlotSetting={!production_write}
            otherAppSettings={this.props.values.appSettings}
            updateAppSetting={this.onClosePanel.bind(this)}
            closeBlade={this.onCancel}
          />
        </Panel>
        <Panel
          isOpen={this.state.showPanel && this.state.panelItem === 'bulk'}
          type={PanelType.large}
          onDismiss={this.onCancel}
          closeButtonAriaLabel={t('close')}>
          <Suspense fallback={<LoadingComponent />}>
            <AppSettingsBulkEdit
              updateAppSetting={this._saveBulkEdit}
              closeBlade={this.onCancel}
              appSettings={this.props.values.appSettings}
            />
          </Suspense>
        </Panel>
        <DisplayTableWithEmptyMessage
          items={this.props.values.appSettings.filter(x => {
            if (!filter) {
              return true;
            }
            return x.name.toLowerCase().includes(filter.toLowerCase());
          })}
          columns={this.getColumns()}
          isHeaderVisible={true}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          selectionPreservedOnEmptyClick={true}
          emptyMessage={t('emptyAppSettings')}
        />
      </>
    );
  }

  private anyShown = () => {
    return this.state.shownValues.length > 0;
  };
  private flipHideSwitch = () => {
    let shownValues: string[] = [];
    if (!this.anyShown()) {
      shownValues = this.props.values.appSettings.map(x => x.name);
    }
    this.setState({ shownValues });
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

  private _saveBulkEdit = (appSettings: FormAppSetting[]) => {
    const newAppSettings = sortBy(appSettings, o => o.name.toLowerCase());

    this.props.setFieldValue('appSettings', newAppSettings);
    this.setState({ showPanel: false });
  };
  private createNewItem = () => {
    const blankAppSetting = {
      name: '',
      value: '',
      sticky: false,
    };
    this.setState({
      showPanel: true,
      panelItem: 'add',
      currentAppSetting: blankAppSetting,
    });
  };

  private onClosePanel = (item: FormAppSetting): void => {
    let appSettings: FormAppSetting[] = [...this.props.values.appSettings];
    const index = appSettings.findIndex(x => x.name.toLowerCase() === item.name.toLowerCase());
    if (index !== -1) {
      appSettings[index] = item;
    } else {
      appSettings.push(item);
    }
    appSettings = sortBy(appSettings, o => o.name.toLowerCase());
    this.props.setFieldValue('appSettings', appSettings);
    this.setState({ showPanel: false });
  };

  private onCancel = (): void => {
    this.setState({ showPanel: false });
  };

  private onShowPanel = (item: FormAppSetting): void => {
    this.setState({
      showPanel: true,
      panelItem: 'add',
      currentAppSetting: item,
    });
  };

  private removeItem(key: string) {
    const appSettings: FormAppSetting[] = [...this.props.values.appSettings].filter(val => val.name !== key);
    this.props.setFieldValue('appSettings', appSettings);
  }

  private onRenderItemColumn = (item: FormAppSetting, index: number, column: IColumn) => {
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
          id={`app-settings-application-settings-delete-${index}`}
          iconProps={{ iconName: 'Delete' }}
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
          id={`app-settings-application-settings-edit-${index}`}
          iconProps={{ iconName: 'Edit' }}
          ariaLabel={t('edit')}
          title={t('edit')}
          onClick={() => this.onShowPanel(item)}
        />
      );
    }
    if (column.key === 'sticky') {
      return item.sticky ? (
        <IconButton
          className={defaultCellStyle}
          id={`app-settings-application-settings-sticky-${index}`}
          iconProps={{ iconName: 'CheckMark' }}
          title={t('sticky')}
          ariaLabel={t('slotSettingOn')}
        />
      ) : null;
    }
    if (column.key === 'value') {
      return (
        <>
          <ActionButton
            id={`app-settings-application-settings-show-hide-${index}`}
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
    if (column.key === 'name') {
      return (
        <div className={defaultCellStyle} id={`app-settings-application-settings-name-${index}`}>
          {item[column.fieldName!]}
        </div>
      );
    }
    return <div className={defaultCellStyle}>{item[column.fieldName!]}</div>;
  };

  // tslint:disable-next-line:member-ordering
  private getColumns = () => {
    const { t } = this.props;
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
        onRender: this.onRenderItemColumn,
      },
      {
        key: 'value',
        name: t('value'),
        fieldName: 'value',
        minWidth: 210,
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

export default withTranslation('translation')(ApplicationSettings);
