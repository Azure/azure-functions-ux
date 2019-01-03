import { FormikProps } from 'formik';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import * as React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';

import DisplayTableWithEmptyMessage from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import IconButton from '../../../../components/IconButton/IconButton';
import { AppSettingsFormValues, FormAppSetting } from '../AppSettings.types';
import AppSettingAddEdit from './AppSettingAddEdit';

interface ApplicationSettingsState {
  hideValues: boolean;
  showPanel: boolean;
  currentAppSetting: FormAppSetting | null;
  currentItemIndex: number;
  createNewItem: boolean;
}

export class ApplicationSettings extends React.Component<
  FormikProps<AppSettingsFormValues> & InjectedTranslateProps,
  ApplicationSettingsState
> {
  constructor(props) {
    super(props);
    this.state = {
      hideValues: true,
      showPanel: false,
      currentAppSetting: null,
      currentItemIndex: -1,
      createNewItem: false,
    };
  }

  public render() {
    const { t } = this.props;
    if (!this.props.values.appSettings) {
      return null;
    }
    return (
      <>
        <ActionButton
          id="app-settings-application-settings-add"
          onClick={this.createNewItem}
          styles={{ root: { marginTop: '5px' } }}
          iconProps={{ iconName: 'Add' }}>
          {t('addEditApplicationSetting')}
        </ActionButton>
        <ActionButton
          id="app-settings-application-settings-show-hide"
          onClick={this.flipHideSwitch}
          styles={{ root: { marginTop: '5px' } }}
          iconProps={{ iconName: this.state.hideValues ? 'RedEye' : 'Hide' }}>
          {this.state.hideValues ? 'Show Values' : 'Hide Values'}
        </ActionButton>
        <Panel
          isOpen={this.state.showPanel}
          type={PanelType.medium}
          onDismiss={this.onCancel}
          headerText={t('newApplicationSetting')}
          closeButtonAriaLabel={t('close')}>
          <AppSettingAddEdit
            appSetting={this.state.currentAppSetting!}
            otherAppSettings={this.props.values.appSettings}
            updateAppSetting={this.onClosePanel.bind(this)}
            closeBlade={this.onCancel}
          />
        </Panel>
        <DisplayTableWithEmptyMessage
          items={this.props.values.appSettings}
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

  private flipHideSwitch = () => {
    this.setState({ hideValues: !this.state.hideValues });
  };

  private createNewItem = () => {
    const blankAppSetting = {
      name: '',
      value: '',
      sticky: false,
    };
    this.setState({
      showPanel: true,
      currentAppSetting: blankAppSetting,
      createNewItem: true,
      currentItemIndex: -1,
    });
  };

  private onClosePanel = (item: FormAppSetting): void => {
    const appSettings: FormAppSetting[] = [...this.props.values.appSettings];
    if (!this.state.createNewItem) {
      appSettings[this.state.currentItemIndex] = item;
    } else {
      appSettings.push(item);
    }
    this.props.setFieldValue('appSettings', appSettings);
    this.setState({ createNewItem: false, showPanel: false });
  };

  private onCancel = (): void => {
    this.setState({ createNewItem: false, showPanel: false });
  };

  private onShowPanel = (item: FormAppSetting, index: number): void => {
    this.setState({
      showPanel: true,
      currentAppSetting: item,
      currentItemIndex: index,
    });
  };

  private removeItem(index: number) {
    const appSettings: FormAppSetting[] = [...this.props.values.appSettings];
    appSettings.splice(index, 1);
    this.props.setFieldValue('appSettings', appSettings);
  }

  private onRenderItemColumn = (item: FormAppSetting, index: number, column: IColumn) => {
    const { t } = this.props;
    if (!column || !item) {
      return null;
    }

    if (column.key === 'delete') {
      return (
        <IconButton
          id={`app-settings-application-settings-delete-${index}`}
          iconProps={{ iconName: 'Delete' }}
          title={t('delete')}
          onClick={() => this.removeItem(index)}
        />
      );
    }
    if (column.key === 'edit') {
      return (
        <IconButton
          id={`app-settings-application-settings-edit-${index}`}
          iconProps={{ iconName: 'Edit' }}
          title={t('edit')}
          onClick={() => this.onShowPanel(item, index)}
        />
      );
    }
    if (column.key === 'sticky') {
      return item.sticky ? (
        <IconButton id={`app-settings-application-settings-sticky-${index}`} iconProps={{ iconName: 'CheckMark' }} title={t('sticky')} />
      ) : null;
    }
    if (column.key === 'value') {
      return this.state.hideValues ? (
        'Hidden value. Click show values button above to view'
      ) : (
        <span id={`app-settings-application-settings-value-${index}`}>{item[column.fieldName!]}</span>
      );
    }
    if (column.key === 'name') {
      return <span id={`app-settings-application-settings-name-${index}`}>{item[column.fieldName!]}</span>;
    }
    return <span>{item[column.fieldName!]}</span>;
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

export default translate('translation')(ApplicationSettings);
