import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib-commonjs/DetailsList';
import { IconButton, PrimaryButton, ActionButton, DefaultButton } from 'office-ui-fabric-react/lib-commonjs/Button';
import { AppSettingsFormValues } from '../AppSettings.Types';
import { Panel, PanelType } from 'office-ui-fabric-react/lib-commonjs/Panel';
import { VirtualApplication } from '../../../../models/WebAppModels';
import VirtualApplicationsAddEdit from './VirtualApplicationsAddEdit';
import { FormikProps } from 'formik';

export interface VirtualApplicationsState {
  showPanel: boolean;
  currentVirtualApplication: VirtualApplication | null;
  currentItemIndex: number | null;
  createNewItem: boolean;
}
export default class VirtualApplications extends React.Component<FormikProps<AppSettingsFormValues>, VirtualApplicationsState> {
  constructor(props) {
    super(props);
    this.state = {
      showPanel: false,
      currentVirtualApplication: null,
      currentItemIndex: null,
      createNewItem: false,
    };
  }

  public render() {
    const { values } = this.props;
    if (!values.virtualApplications) {
      return null;
    }
    return (
      <>
        <ActionButton onClick={this.createNewItem} styles={{ root: { marginTop: '5px' } }} iconProps={{ iconName: 'Add' }}>
          New Directory/Application
        </ActionButton>
        <Panel
          isOpen={this.state.showPanel}
          type={PanelType.medium}
          onDismiss={this._onClosePanel}
          headerText="New App "
          closeButtonAriaLabel="Close"
          onRenderFooterContent={this._onRenderFooterContent}>
          <VirtualApplicationsAddEdit {...this.state.currentVirtualApplication!} updateVirtualApplication={this.updateCurrentItem} />
        </Panel>
        <DetailsList
          items={values.virtualApplications}
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

  private updateCurrentItem = (item: VirtualApplication) => {
    this.setState({ currentVirtualApplication: item });
  };

  private createNewItem = () => {
    const blank: VirtualApplication = {
      physicalPath: '',
      virtualPath: '',
      virtualDirectories: [],
      preloadEnabled: false,
      virtualDirectory: true,
    };
    this.setState({
      showPanel: true,
      currentVirtualApplication: blank,
      createNewItem: true,
      currentItemIndex: -1,
    });
  };

  private _onClosePanel = (): void => {
    const { values, setValues } = this.props;
    const virtualApplications = [...values.virtualApplications];
    if (!this.state.createNewItem) {
      virtualApplications[this.state.currentItemIndex!] = this.state.currentVirtualApplication!;
    } else {
      virtualApplications.push(this.state.currentVirtualApplication!);
    }
    setValues({
      ...values,
      virtualApplications,
    });
    this.setState({ createNewItem: false, showPanel: false });
  };

  private _onRenderFooterContent = (): JSX.Element => {
    return (
      <div>
        <PrimaryButton onClick={this._onClosePanel} style={{ marginRight: '8px' }}>
          Save
        </PrimaryButton>
        <DefaultButton onClick={this._onClosePanel}>Cancel</DefaultButton>
      </div>
    );
  };
  private _onShowPanel = (item: VirtualApplication, index: number): void => {
    this.setState({
      showPanel: true,
      currentVirtualApplication: item,
      currentItemIndex: index,
    });
  };

  private removeItem(index: number) {
    const { values, setValues } = this.props;
    const virtualApplications: VirtualApplication[] = [...values.virtualApplications];
    virtualApplications.splice(index, 1);
    setValues({
      ...values,
      virtualApplications,
    });
  }

  private onRenderItemColumn = (item: VirtualApplication, index: number, column: IColumn) => {
    if (!column || !item) {
      return null;
    }

    if (column.key === 'delete') {
      return item.virtualPath === '/' ? null : (
        <IconButton iconProps={{ iconName: 'Delete' }} title="Delete" onClick={() => this.removeItem(index)} />
      );
    }
    if (column.key === 'edit') {
      return item.virtualPath === '/' ? null : (
        <IconButton iconProps={{ iconName: 'Edit' }} title="Edit" onClick={() => this._onShowPanel(item, index)} />
      );
    }
    if (column.key === 'type') {
      return item.virtualDirectory ? 'Directory' : 'Application';
    }
    return <span>{item[column.fieldName!]}</span>;
  };

  // tslint:disable-next-line:member-ordering
  private _columns: IColumn[] = [
    {
      key: 'virtualPath',
      name: 'Virtual Path',
      fieldName: 'virtualPath',
      minWidth: 210,
      maxWidth: 350,
      isRowHeader: true,
      data: 'string',
      isPadded: true,
      isResizable: true,
      ariaLabel: 'Operations for value',
    },
    {
      key: 'physicalPath',
      name: 'Physic Path',
      fieldName: 'physicalPath',
      minWidth: 210,
      maxWidth: 350,
      isRowHeader: true,
      data: 'string',
      isPadded: true,
      isResizable: true,
      ariaLabel: 'Operations for name',
    },

    {
      key: 'type',
      name: 'Type',
      fieldName: 'virtualDirectory',
      minWidth: 210,
      maxWidth: 350,
      isRowHeader: true,
      data: 'string',
      isPadded: true,
      isResizable: true,
      ariaLabel: 'Operations for value',
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
