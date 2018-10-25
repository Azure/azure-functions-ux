import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib-commonjs/DetailsList';
import { PrimaryButton, DefaultButton, ActionButton } from 'office-ui-fabric-react/lib-commonjs/Button';
import { AppSetting } from '../../../../modules/site/config/appsettings/appsettings.types';

import { Panel, PanelType } from 'office-ui-fabric-react/lib-commonjs/Panel';
import AppSettingAddEdit from './AppSettingAddEdit';
import { FormikProps } from 'formik';
import { AppSettingsFormValues } from '../AppSettings.Types';
import { translate, InjectedTranslateProps } from 'react-i18next';
import IconButton from '../../../../components/IconButton/IconButton';

interface ApplicationSettingsState {
  hideValues: boolean;
  showPanel: boolean;
  currentAppSetting: AppSetting | null;
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
        <ActionButton onClick={this.createNewItem} styles={{ root: { marginTop: '5px' } }} iconProps={{ iconName: 'Add' }}>
          {t('addEditApplicationSetting')}
        </ActionButton>
        <ActionButton
          onClick={this.flipHideSwitch}
          styles={{ root: { marginTop: '5px' } }}
          iconProps={{ iconName: this.state.hideValues ? 'RedEye' : 'Hide' }}>
          {this.state.hideValues ? 'Show Values' : 'Hide Values'}
        </ActionButton>
        <Panel
          isOpen={this.state.showPanel}
          type={PanelType.medium}
          onDismiss={this._onCancel}
          headerText={t('newApplicationSetting')}
          closeButtonAriaLabel={t('close')}
          onRenderFooterContent={this._onRenderFooterContent}>
          <AppSettingAddEdit {...this.state.currentAppSetting!} updateAppSetting={this.updateCurrentItem.bind(this)} />
        </Panel>
        <DetailsList
          items={this.props.values.appSettings}
          columns={this._getColumns()}
          isHeaderVisible={true}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          selectionPreservedOnEmptyClick={true}
        />
      </>
    );
  }

  private flipHideSwitch = () => {
    this.setState({ hideValues: !this.state.hideValues });
  };
  private updateCurrentItem = (item: AppSetting) => {
    this.setState({ currentAppSetting: item });
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

  private _onClosePanel = (): void => {
    const appSettings: AppSetting[] = [...this.props.values.appSettings];
    if (!this.state.createNewItem) {
      appSettings[this.state.currentItemIndex] = this.state.currentAppSetting!;
      this.props.setFieldValue('appSettings', appSettings);
    } else {
      appSettings.push(this.state.currentAppSetting!);
      this.props.setFieldValue('appSettings', appSettings);
    }
    this.setState({ createNewItem: false, showPanel: false });
  };

  private _onCancel = (): void => {
    this.setState({ createNewItem: false, showPanel: false });
  };
  private _onRenderFooterContent = (): JSX.Element => {
    return (
      <div>
        <PrimaryButton onClick={this._onClosePanel} style={{ marginRight: '8px' }}>
          Save
        </PrimaryButton>
        <DefaultButton onClick={this._onCancel}>Cancel</DefaultButton>
      </div>
    );
  };
  private _onShowPanel = (item: AppSetting, index: number): void => {
    this.setState({
      showPanel: true,
      currentAppSetting: item,
      currentItemIndex: index,
    });
  };

  private removeItem(index: number) {
    const appSettings: AppSetting[] = [...this.props.values.appSettings];
    appSettings.splice(index, 1);
    this.props.setFieldValue('appSettings', appSettings);
  }

  private onRenderItemColumn = (item: AppSetting, index: number, column: IColumn) => {
    const { t } = this.props;
    if (!column || !item) {
      return null;
    }

    if (column.key === 'delete') {
      return <IconButton iconProps={{ iconName: 'Delete' }} title={t('delete')} onClick={() => this.removeItem(index)} />;
    }
    if (column.key === 'edit') {
      return <IconButton iconProps={{ iconName: 'Edit' }} title={t('edit')} onClick={() => this._onShowPanel(item, index)} />;
    }
    if (column.key === 'sticky') {
      return item.sticky ? <IconButton iconProps={{ iconName: 'CheckMark' }} title={t('sticky')} /> : null;
    }
    if (column.key === 'value') {
      return this.state.hideValues ? 'Hidden value. Click show values button above to view' : <span>{item[column.fieldName!]}</span>;
    }
    return <span>{item[column.fieldName!]}</span>;
  };

  // tslint:disable-next-line:member-ordering
  private _getColumns = () => {
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
