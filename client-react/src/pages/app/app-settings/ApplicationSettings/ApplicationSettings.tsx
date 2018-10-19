import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib-commonjs/DetailsList';
import { IconButton, PrimaryButton, DefaultButton, ActionButton } from 'office-ui-fabric-react/lib-commonjs/Button';
import { AppSetting } from '../../../../modules/site/config/appsettings/appsettings.types';

import { Panel, PanelType } from 'office-ui-fabric-react/lib-commonjs/Panel';
import AppSettingAddEdit from './AppSettingAddEdit';
import { FormikProps } from 'formik';
import { AppSettingsFormValues } from '../AppSettings.Types';

interface ApplicationSettingsState {
  showPanel: boolean;
  currentAppSetting: AppSetting | null;
  currentItemIndex: number;
  createNewItem: boolean;
}

export default class ApplicationSettings extends React.Component<FormikProps<AppSettingsFormValues>, ApplicationSettingsState> {
  constructor(props) {
    super(props);
    this.state = {
      showPanel: false,
      currentAppSetting: null,
      currentItemIndex: -1,
      createNewItem: false,
    };
  }

  public render() {
    if (!this.props.values.appSettings) {
      return null;
    }
    return (
      <>
        <ActionButton onClick={this.createNewItem} styles={{ root: { marginTop: '5px' } }} iconProps={{ iconName: 'Add' }}>
          New App Setting
        </ActionButton>
        <Panel
          isOpen={this.state.showPanel}
          type={PanelType.medium}
          onDismiss={this._onClosePanel}
          headerText="New App Setting"
          closeButtonAriaLabel="Close"
          onRenderFooterContent={this._onRenderFooterContent}>
          <AppSettingAddEdit {...this.state.currentAppSetting!} updateAppSetting={this.updateCurrentItem.bind(this)} />
        </Panel>
        <DetailsList
          items={this.props.values.appSettings}
          columns={this._columns}
          isHeaderVisible={true}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          selectionPreservedOnEmptyClick={true}
          ariaLabelForSelectionColumn="Toggle selection"
          ariaLabelForSelectAllCheckbox="Toggle selection for all items"
        />
      </>
    );
  }

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
    if (!this.state.createNewItem) {
      const appSettings: AppSetting[] = JSON.parse(JSON.stringify(this.props.values.appSettings));
      appSettings[this.state.currentItemIndex] = this.state.currentAppSetting!;
      this.props.setFieldValue('appSettings', appSettings);
    } else {
      const appSettings: AppSetting[] = JSON.parse(JSON.stringify(this.props.values.appSettings));
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
    const appSettings: ApplicationSettings[] = JSON.parse(JSON.stringify(this.props.values.appSettings));
    appSettings.splice(index, 1);
    this.props.setFieldValue('appSettings', appSettings);
  }

  private onRenderItemColumn = (item: AppSetting, index: number, column: IColumn) => {
    if (!column || !item) {
      return null;
    }

    if (column.key === 'delete') {
      return <IconButton iconProps={{ iconName: 'Delete' }} title="Delete" onClick={() => this.removeItem(index)} />;
    }
    if (column.key === 'edit') {
      return <IconButton iconProps={{ iconName: 'Edit' }} title="Edit" onClick={() => this._onShowPanel(item, index)} />;
    }
    if (column.key === 'sticky') {
      return item.sticky ? <IconButton iconProps={{ iconName: 'CheckMark' }} title="Sticky" /> : null;
    }
    return <span>{item[column.fieldName!]}</span>;
  };

  // tslint:disable-next-line:member-ordering
  private _columns: IColumn[] = [
    {
      key: 'name',
      name: 'Name',
      fieldName: 'name',
      minWidth: 210,
      maxWidth: 350,
      isRowHeader: true,
      data: 'string',
      isPadded: true,
      isResizable: true,
      ariaLabel: 'Operations for name',
    },
    {
      key: 'value',
      name: 'Value',
      fieldName: 'value',
      minWidth: 210,
      maxWidth: 350,
      isRowHeader: true,
      data: 'string',
      isPadded: true,
      isResizable: true,
      ariaLabel: 'Operations for value',
    },
    {
      key: 'sticky',
      name: 'Slot Setting',
      fieldName: 'sticky',
      minWidth: 20,
      isRowHeader: true,
      data: 'string',
      isPadded: true,
      isResizable: true,
      onRender: this.onRenderItemColumn,
      ariaLabel: 'Operations for value',
    },
    {
      key: 'delete',
      name: '',
      minWidth: 16,
      maxWidth: 16,
      isResizable: true,
      isCollapsable: false,
      onRender: this.onRenderItemColumn,
      ariaLabel: 'Operations for value',
    },
    {
      key: 'edit',
      name: '',
      minWidth: 16,
      maxWidth: 16,
      isResizable: true,
      isCollapsable: false,
      onRender: this.onRenderItemColumn,
      ariaLabel: 'Operations for value',
    },
  ];
}
