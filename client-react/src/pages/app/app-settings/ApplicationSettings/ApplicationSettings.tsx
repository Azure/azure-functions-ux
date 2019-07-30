import { FormikProps } from 'formik';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { DetailsListLayoutMode, IColumn, SelectionMode, IDetailsList } from 'office-ui-fabric-react/lib/DetailsList';
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
import { SearchBox, Stack, TooltipHost } from 'office-ui-fabric-react';
import { sortBy } from 'lodash-es';
import LoadingComponent from '../../../../components/loading/loading-component';
import { filterBoxStyle, tableActionButtonStyle } from '../AppSettings.styles';
import { isLinuxApp } from '../../../../utils/arm-utils';

const AppSettingsBulkEdit = lazy(() => import(/* webpackChunkName:"appsettingsAdvancedEdit" */ './AppSettingsBulkEdit'));
interface ApplicationSettingsState {
  showPanel: boolean;
  panelItem: 'add' | 'bulk';
  currentAppSetting: FormAppSetting | null;
  shownValues: string[];
  filter: string;
  showFilter: boolean;
  showAllValues: boolean;
}

export class ApplicationSettings extends React.Component<FormikProps<AppSettingsFormValues> & WithTranslation, ApplicationSettingsState> {
  public static contextType = PermissionsContext;
  public list: IDetailsList | null;
  constructor(props) {
    super(props);
    this.state = {
      showPanel: false,
      panelItem: 'add',
      currentAppSetting: null,
      shownValues: [],
      filter: '',
      showFilter: false,
      showAllValues: false,
    };
  }

  public render() {
    const { t, values } = this.props;
    const { production_write, editable } = this.context;
    const { filter, showFilter, showAllValues, shownValues } = this.state;
    if (!values.appSettings) {
      return null;
    }
    const allShown = showAllValues || (values.appSettings.length > 0 && shownValues.length === values.appSettings.length);
    return (
      <>
        <Stack horizontal verticalAlign="center">
          <ActionButton
            id="app-settings-application-settings-add"
            onClick={this._createNewItem}
            disabled={!editable}
            styles={tableActionButtonStyle}
            iconProps={{ iconName: 'Add' }}
            ariaLabel={t('addNewSetting')}>
            {t('newApplicationSetting')}
          </ActionButton>
          <ActionButton
            id="app-settings-application-settings-show-hide"
            onClick={this._flipHideSwitch}
            styles={tableActionButtonStyle}
            iconProps={{ iconName: !allShown ? 'RedEye' : 'Hide' }}>
            {!allShown ? t('showValues') : t('hideValues')}
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
          onDismiss={this._onDismiss}
          headerText={t('addEditApplicationSetting')}
          closeButtonAriaLabel={t('close')}>
          <AppSettingAddEdit
            isLinux={isLinuxApp(values.site)}
            appSetting={this.state.currentAppSetting!}
            disableSlotSetting={!production_write}
            otherAppSettings={values.appSettings}
            updateAppSetting={this._onClosePanel.bind(this)}
            closeBlade={this._onCancel}
          />
        </Panel>
        <Panel
          isOpen={this.state.showPanel && this.state.panelItem === 'bulk'}
          type={PanelType.large}
          onDismiss={this._onDismiss}
          closeButtonAriaLabel={t('close')}>
          <Suspense fallback={<LoadingComponent />}>
            <AppSettingsBulkEdit
              isLinux={isLinuxApp(values.site)}
              updateAppSetting={this._saveBulkEdit}
              closeBlade={this._onCancel}
              appSettings={values.appSettings}
            />
          </Suspense>
        </Panel>
        <DisplayTableWithEmptyMessage
          items={values.appSettings.filter(x => {
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
          componentRef={ref => {
            this.list = ref;
          }}
          emptyMessage={t('emptyAppSettings')}
        />
      </>
    );
  }

  private _updateAlertMessage = (message: string) => {
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) {
      alertContainer.innerText = message;
    }
  };

  private _flipHideSwitch = () => {
    const { showAllValues } = this.state;
    let shownValues: string[] = [];
    if (!showAllValues) {
      shownValues = this.props.values.appSettings.map(x => x.name);
    }
    this.setState({ shownValues, showAllValues: !showAllValues });
  };

  private _openBulkEdit = () => {
    this._updateAlertMessage('Advanced edit panel opened.');
    setTimeout(() => {
      this.setState({
        showPanel: true,
        panelItem: 'bulk',
      });
    });
  };

  private _toggleFilter = () => {
    const { showFilter } = this.state;
    this.setState({ showFilter: !showFilter, filter: '' });
  };

  private _saveBulkEdit = (appSettings: FormAppSetting[]) => {
    const notificationMessage = 'Advanced edit panel closed. Changes applied.';
    this._updateAlertMessage(notificationMessage);
    setTimeout(() => {
      const newAppSettings = sortBy(appSettings, o => o.name.toLowerCase());

      this.props.setFieldValue('appSettings', newAppSettings);
      this.setState({ showPanel: false });
    });
  };
  private _createNewItem = () => {
    const notificationMessage = 'Add/Edit application setting panel opened.';
    this._updateAlertMessage(notificationMessage);
    setTimeout(() => {
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
    });
  };

  private _onClosePanel = (item: FormAppSetting): void => {
    if (!!this.list) {
      this.list.focusIndex(0, true);
    }
    const notificationMessage = `Add/Edit application setting panel closed. Changes applied to app setting ${item.name}`;
    this._updateAlertMessage(notificationMessage);
    setTimeout(() => {
      let appSettings: FormAppSetting[] = [...this.props.values.appSettings];
      const index = appSettings.findIndex(
        x =>
          x.name.toLowerCase() === item.name.toLowerCase() ||
          (!!this.state.currentAppSetting && this.state.currentAppSetting.name.toLowerCase() === x.name.toLowerCase())
      );
      if (index !== -1) {
        appSettings[index] = item;
      } else {
        appSettings.push(item);
      }
      appSettings = sortBy(appSettings, o => o.name.toLowerCase());
      this.props.setFieldValue('appSettings', appSettings);
      this.setState({ showPanel: false });
    });
  };

  private _onCancel = (): void => {
    const notificationMessage =
      this.state.panelItem === 'add'
        ? 'Add/Edit application setting panel closed. No changes applied.'
        : 'Advanced edit panel closed. No changes applied.';
    this._updateAlertMessage(notificationMessage);
    setTimeout(() => {
      this.setState({ showPanel: false });
    });
  };

  private _onDismiss = (): void => {
    if (this.state.showPanel) {
      this._onCancel();
    }
  };

  private _onShowPanel = (item: FormAppSetting): void => {
    const notificationMessage = 'Add/Edit application setting panel opened.';
    this._updateAlertMessage(notificationMessage);
    setTimeout(() => {
      this.setState({
        showPanel: true,
        panelItem: 'add',
        currentAppSetting: item,
      });
    });
  };

  private _removeItem(key: string) {
    const appSettings: FormAppSetting[] = [...this.props.values.appSettings].filter(val => val.name !== key);
    this.props.setFieldValue('appSettings', appSettings);
  }

  private _onRenderItemColumn = (item: FormAppSetting, index: number, column: IColumn) => {
    const { t } = this.props;
    const { editable } = this.context;
    const { shownValues, showAllValues } = this.state;
    const itemKey = item.name;
    const hidden = !shownValues.includes(itemKey) && !showAllValues;
    if (!column || !item) {
      return null;
    }

    if (column.key === 'delete') {
      return (
        <TooltipHost
          content={t('delete')}
          id={`app-settings-application-settings-delete-tooltip-${index}`}
          calloutProps={{ gapSpace: 0 }}
          closeDelay={500}>
          <IconButton
            className={defaultCellStyle}
            disabled={!editable}
            id={`app-settings-application-settings-delete-${index}`}
            iconProps={{ iconName: 'Delete' }}
            ariaLabel={t('delete')}
            onClick={() => this._removeItem(itemKey)}
          />
        </TooltipHost>
      );
    }
    if (column.key === 'edit') {
      return (
        <TooltipHost
          content={t('edit')}
          id={`app-settings-application-settings-edit-tooltip-${index}`}
          calloutProps={{ gapSpace: 0 }}
          closeDelay={500}>
          <IconButton
            className={defaultCellStyle}
            disabled={!editable}
            id={`app-settings-application-settings-edit-${index}`}
            iconProps={{ iconName: 'Edit' }}
            ariaLabel={t('edit')}
            onClick={() => this._onShowPanel(item)}
          />
        </TooltipHost>
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
        <div role="presentation" aria-live="assertive">
          {hidden ? (
            <ActionButton
              id={`app-settings-application-settings-show-${index}`}
              className={defaultCellStyle}
              onClick={() => {
                const newShownValues = new Set(shownValues);
                newShownValues.add(itemKey);
                this.setState({ shownValues: [...newShownValues], showAllValues: false });
              }}
              iconProps={{ iconName: 'RedEye' }}>
              <div className={defaultCellStyle}>{t('hiddenValueClickAboveToShow')}</div>
            </ActionButton>
          ) : (
            <ActionButton
              id={`app-settings-application-settings-hide-${index}`}
              className={defaultCellStyle}
              onClick={() => {
                const newShownValues = new Set(shownValues);
                newShownValues.delete(itemKey);
                this.setState({ shownValues: [...newShownValues], showAllValues: false });
              }}
              iconProps={{ iconName: hidden ? 'RedEye' : 'Hide' }}>
              <div className={defaultCellStyle} id={`app-settings-application-settings-value-${index}`}>
                {item[column.fieldName!]}
              </div>
            </ActionButton>
          )}
        </div>
      );
    }
    if (column.key === 'name') {
      return (
        <ActionButton
          className={defaultCellStyle}
          id={`app-settings-application-settings-name-${index}`}
          onClick={() => this._onShowPanel(item)}>
          {item[column.fieldName!]}
        </ActionButton>
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
        onRender: this._onRenderItemColumn,
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
        onRender: this._onRenderItemColumn,
      },
      {
        key: 'sticky',
        name: t('sticky'),
        fieldName: 'sticky',
        minWidth: 180,
        maxWidth: 180,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: false,
        isCollapsable: false,
        onRender: this._onRenderItemColumn,
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
        onRender: this._onRenderItemColumn,
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
        onRender: this._onRenderItemColumn,
      },
    ];
  };
}

export default withTranslation('translation')(ApplicationSettings);
