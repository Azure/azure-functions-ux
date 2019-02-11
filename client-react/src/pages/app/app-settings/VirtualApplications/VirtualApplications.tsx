import { FormikProps } from 'formik';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import DisplayTableWithEmptyMessage, {
  defaultCellStyle,
} from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import IconButton from '../../../../components/IconButton/IconButton';
import { VirtualApplication } from '../../../../models/WebAppModels';
import { AppSettingsFormValues, Permissions } from '../AppSettings.types';
import VirtualApplicationsAddEdit from './VirtualApplicationsAddEdit';
import { PermissionsContext } from '../Contexts';

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
        <ActionButton
          id="app-settings-new-virtual-app-button"
          disabled={!this.context.app_write}
          onClick={this.createNewItem}
          styles={{ root: { marginTop: '5px' } }}
          iconProps={{ iconName: 'Add' }}>
          {t('addNewVirtualDirectoryV3')}
        </ActionButton>
        <Panel
          isOpen={this.state.showPanel}
          type={PanelType.smallFixedFar}
          onDismiss={this.onCancelPanel}
          headerText={t('newApp')}
          closeButtonAriaLabel={t('close')}>
          <VirtualApplicationsAddEdit
            virtualApplication={this.state.currentVirtualApplication!}
            otherVirtualApplications={values.virtualApplications}
            updateVirtualApplication={this.onClosePanel.bind(this)}
            closeBlade={this.onCancelPanel.bind(this)}
          />
        </Panel>
        <DisplayTableWithEmptyMessage
          items={values.virtualApplications}
          columns={this._getColumns()}
          isHeaderVisible={true}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          selectionPreservedOnEmptyClick={true}
          emptyMessage={t('emptyVirtualDirectories')}
        />
      </>
    );
  }

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
    if (!column || !item) {
      return null;
    }

    if (column.key === 'delete') {
      return item.virtualPath === '/' ? null : (
        <IconButton
          className={defaultCellStyle}
          disabled={!this.context.app_write}
          iconProps={{ iconName: 'Delete' }}
          ariaLabel={t('delete')}
          title={t('delete')}
          onClick={() => this.removeItem(index)}
        />
      );
    }
    if (column.key === 'edit') {
      return item.virtualPath === '/' ? null : (
        <IconButton
          className={defaultCellStyle}
          disabled={!this.context.app_write}
          iconProps={{ iconName: 'Edit' }}
          ariaLabel={t('edit')}
          title={t('edit')}
          onClick={() => this._onShowPanel(item, index)}
        />
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
        isRowHeader: true,
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

export default withTranslation('translation')(VirtualApplications);
