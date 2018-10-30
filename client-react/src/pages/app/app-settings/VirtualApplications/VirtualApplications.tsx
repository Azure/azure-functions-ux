import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { PrimaryButton, ActionButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { AppSettingsFormValues } from '../AppSettings.Types';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { VirtualApplication } from '../../../../models/WebAppModels';
import VirtualApplicationsAddEdit from './VirtualApplicationsAddEdit';
import { FormikProps } from 'formik';
import { translate, InjectedTranslateProps } from 'react-i18next';
import IconButton from '../../../../components/IconButton/IconButton';

export interface VirtualApplicationsState {
  showPanel: boolean;
  currentVirtualApplication: VirtualApplication | null;
  currentItemIndex: number | null;
  createNewItem: boolean;
}
export class VirtualApplications extends React.Component<
  FormikProps<AppSettingsFormValues> & InjectedTranslateProps,
  VirtualApplicationsState
> {
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
    const { values, t } = this.props;
    if (!values.virtualApplications) {
      return null;
    }
    return (
      <>
        <ActionButton
          id="app-settings-new-virtual-app-button"
          disabled={!values.siteWritePermission}
          onClick={this.createNewItem}
          styles={{ root: { marginTop: '5px' } }}
          iconProps={{ iconName: 'Add' }}>
          New Directory/Application
        </ActionButton>
        <Panel
          isOpen={this.state.showPanel}
          type={PanelType.medium}
          onDismiss={this.onCancelPanel}
          headerText={t('newApp')}
          closeButtonAriaLabel={t('close')}
          onRenderFooterContent={this._onRenderFooterContent}>
          <VirtualApplicationsAddEdit
            {...this.state.currentVirtualApplication!}
            otherVirtualApplications={values.virtualApplications}
            updateVirtualApplication={this.updateCurrentItem}
          />
        </Panel>
        <DetailsList
          items={values.virtualApplications}
          columns={this._getColumns()}
          isHeaderVisible={true}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          selectionPreservedOnEmptyClick={true}
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

  private onCancelPanel = () => {
    this.setState({ createNewItem: false, showPanel: false });
  };
  private onClosePanel = () => {
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
        <PrimaryButton onClick={this.onClosePanel} style={{ marginRight: '8px' }}>
          {this.props.t('save')}
        </PrimaryButton>
        <DefaultButton onClick={this.onCancelPanel}>{this.props.t('cancel')}</DefaultButton>
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
    const { values } = this.props;
    if (!column || !item) {
      return null;
    }

    if (column.key === 'delete') {
      return item.virtualPath === '/' ? null : (
        <IconButton
          disabled={!values.siteWritePermission}
          iconProps={{ iconName: 'Delete' }}
          title="Delete"
          onClick={() => this.removeItem(index)}
        />
      );
    }
    if (column.key === 'edit') {
      return item.virtualPath === '/' ? null : (
        <IconButton
          disabled={!values.siteWritePermission}
          iconProps={{ iconName: 'Edit' }}
          title="Edit"
          onClick={() => this._onShowPanel(item, index)}
        />
      );
    }
    if (column.key === 'type') {
      return item.virtualDirectory ? 'Directory' : 'Application';
    }
    return <span>{item[column.fieldName!]}</span>;
  };

  // tslint:disable-next-line:member-ordering
  private _getColumns = () => {
    const { t } = this.props;
    return [
      {
        key: 'virtualPath',
        name: t('virtualPath'),
        fieldName: 'virtualPath',
        minWidth: 210,
        maxWidth: 350,
        isRowHeader: true,
        data: 'string',
        isPadded: true,
        isResizable: true,
      },
      {
        key: 'physicalPath',
        name: t('physicalPath'),
        fieldName: 'physicalPath',
        minWidth: 210,
        maxWidth: 350,
        isRowHeader: true,
        data: 'string',
        isPadded: true,
        isResizable: true,
      },

      {
        key: 'type',
        name: t('type'),
        fieldName: 'virtualDirectory',
        minWidth: 210,
        maxWidth: 350,
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

export default translate('translation')(VirtualApplications);
