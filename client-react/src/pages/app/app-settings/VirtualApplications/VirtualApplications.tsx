import { FormikProps } from 'formik';
import { DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { defaultCellStyle } from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import IconButton from '../../../../components/IconButton/IconButton';
import { AppSettingsFormValues, Permissions } from '../AppSettings.types';
import VirtualApplicationsAddEdit from './VirtualApplicationsAddEdit';
import { PermissionsContext } from '../Contexts';
import { VirtualApplication } from '../../../../models/site/config';
import { TooltipHost, ICommandBarItemProps } from 'office-ui-fabric-react';
import Panel from '../../../../components/Panel/Panel';
import DisplayTableWithCommandBar from '../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';

export interface VirtualApplicationsState {
  showPanel: boolean;
  currentVirtualApplication: VirtualApplication | null;
  currentItemIndex: number | null;
  createNewItem: boolean;
}
export class VirtualApplications extends React.Component<FormikProps<AppSettingsFormValues> & WithTranslation, VirtualApplicationsState> {
  public static contextType = PermissionsContext;
  public context: Permissions;
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
        <DisplayTableWithCommandBar
          commandBarItems={this._getCommandBarItems()}
          items={values.virtualApplications || []}
          columns={this._getColumns()}
          isHeaderVisible={true}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          selectionPreservedOnEmptyClick={true}
          emptyMessage={t('emptyVirtualDirectories')}
        />
        <Panel isOpen={this.state.showPanel} onDismiss={this.onCancelPanel} headerText={t('newApp')} closeButtonAriaLabel={t('close')}>
          <VirtualApplicationsAddEdit
            virtualApplication={this.state.currentVirtualApplication!}
            otherVirtualApplications={values.virtualApplications}
            updateVirtualApplication={this.onClosePanel.bind(this)}
            closeBlade={this.onCancelPanel.bind(this)}
          />
        </Panel>
      </>
    );
  }

  private _getCommandBarItems = (): ICommandBarItemProps[] => {
    const { app_write, editable } = this.context;
    const { t } = this.props;
    return [
      {
        key: 'app-settings-new-virtual-app-button',
        onClick: this._createNewItem,
        disabled: !app_write || !editable,
        iconProps: { iconName: 'Add' },
        ariaLabel: t('addNewVirtualDirectory'),
        name: t('addNewVirtualDirectoryV3'),
      },
    ];
  };

  private _createNewItem = () => {
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
  private onClosePanel = (item: VirtualApplication) => {
    const { values, setValues } = this.props;
    const virtualApplications = [...values.virtualApplications];
    if (!this.state.createNewItem) {
      virtualApplications[this.state.currentItemIndex!] = item;
    } else {
      virtualApplications.push(item);
    }
    setValues({
      ...values,
      virtualApplications,
    });
    this.setState({ createNewItem: false, showPanel: false });
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
    const { t } = this.props;
    const { editable, app_write } = this.context;
    if (!column || !item) {
      return null;
    }

    if (column.key === 'delete') {
      return item.virtualPath === '/' ? null : (
        <TooltipHost
          content={t('delete')}
          id={`app-settings-virtual-applications-delete-tooltip-${index}`}
          calloutProps={{ gapSpace: 0 }}
          closeDelay={500}>
          <IconButton
            className={defaultCellStyle}
            disabled={!app_write || !editable}
            id={`app-settings-virtual-applications-delete-${index}`}
            iconProps={{ iconName: 'Delete' }}
            ariaLabel={t('delete')}
            onClick={() => this.removeItem(index)}
          />
        </TooltipHost>
      );
    }
    if (column.key === 'edit') {
      return (
        <TooltipHost
          content={t('edit')}
          id={`app-settings-virtual-applications-edit-tooltip-${index}`}
          calloutProps={{ gapSpace: 0 }}
          closeDelay={500}>
          <IconButton
            className={defaultCellStyle}
            disabled={!app_write || !editable}
            id={`app-settings-virtual-applications-edit-${index}`}
            iconProps={{ iconName: 'Edit' }}
            ariaLabel={t('edit')}
            onClick={() => this._onShowPanel(item, index)}
          />
        </TooltipHost>
      );
    }
    if (column.key === 'type') {
      return <div className={defaultCellStyle}>{item.virtualDirectory ? t('directory') : t('application')}</div>;
    }
    return <div className={defaultCellStyle}>{item[column.fieldName!]}</div>;
  };

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
        onRender: this.onRenderItemColumn,
      },
      {
        key: 'physicalPath',
        name: t('physicalPath'),
        fieldName: 'physicalPath',
        minWidth: 210,
        maxWidth: 350,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: this.onRenderItemColumn,
      },

      {
        key: 'type',
        name: t('type'),
        fieldName: 'virtualDirectory',
        minWidth: 210,
        maxWidth: 350,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: this.onRenderItemColumn,
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
        onRender: this.onRenderItemColumn,
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
        onRender: this.onRenderItemColumn,
      },
    ];
  };
}

export default withTranslation('translation')(VirtualApplications);
