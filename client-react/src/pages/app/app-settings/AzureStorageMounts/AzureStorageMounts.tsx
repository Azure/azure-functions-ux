import { FormikProps } from 'formik';
import { DetailsListLayoutMode, SelectionMode, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import DisplayTableWithEmptyMessage, {
  defaultCellStyle,
} from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import { AppSettingsFormValues, FormAzureStorageMounts } from '../AppSettings.types';
import IconButton from '../../../../components/IconButton/IconButton';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import AzureStorageMountsAddEdit from './AzureStorageMountsAddEdit';
import { MessageBar, MessageBarType, TooltipHost } from 'office-ui-fabric-react';
import { PermissionsContext } from '../Contexts';
import { sortBy } from 'lodash-es';
import { ArmAzureStorageMount, StorageType } from '../../../../models/site/config';

export interface AzureStorageMountLocalState {
  showPanel: boolean;
  currentAzureStorageMount: FormAzureStorageMounts | null;
  currentItemIndex: number | null;
  createNewItem: boolean;
}

interface StateProps {
  azureStorageMountsProp: ArmAzureStorageMount;
}

type CombinedProps = FormikProps<AppSettingsFormValues> & WithTranslation & StateProps;
export class AzureStorageMounts extends React.Component<CombinedProps, AzureStorageMountLocalState> {
  public static contextType = PermissionsContext;

  constructor(props) {
    super(props);
    this.state = {
      showPanel: false,
      currentAzureStorageMount: null,
      currentItemIndex: null,
      createNewItem: false,
    };
  }

  public render() {
    const { values, t } = this.props;
    const { editable } = this.context;
    if (!this.context.app_write) {
      return (
        <MessageBar messageBarType={MessageBarType.warning} isMultiline={false}>
          {t('applicationSettingsNoPermission')}
        </MessageBar>
      );
    }
    return (
      <>
        <ActionButton
          id="app-settings-new-azure-storage-mount-button"
          disabled={!editable}
          onClick={this._createNewItem}
          styles={{ root: { marginTop: '5px' } }}
          iconProps={{ iconName: 'Add' }}>
          {t('newAzureStorageMount')}
        </ActionButton>
        <Panel
          isOpen={this.state.showPanel}
          type={PanelType.large}
          onDismiss={this._onCancel}
          headerText={t('newAzureStorageMount')}
          closeButtonAriaLabel={t('close')}>
          <AzureStorageMountsAddEdit
            azureStorageMount={this.state.currentAzureStorageMount!}
            otherAzureStorageMounts={values.azureStorageMounts}
            updateAzureStorageMount={this._onClosePanel.bind(this)}
            closeBlade={this._onCancel.bind(this)}
          />
        </Panel>
        <DisplayTableWithEmptyMessage
          items={values.azureStorageMounts || []}
          columns={this._getColumns()}
          isHeaderVisible={true}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          selectionPreservedOnEmptyClick={true}
          emptyMessage={t('emptyAzureStorageMount')}
        />
      </>
    );
  }

  private _createNewItem = () => {
    const blankAzureStorageMount: FormAzureStorageMounts = {
      name: '',
      type: StorageType.azureBlob,
      accountName: '',
      shareName: '',
      accessKey: '',
      mountPath: '',
    };
    this.setState({
      showPanel: true,
      currentAzureStorageMount: blankAzureStorageMount,
      createNewItem: true,
      currentItemIndex: -1,
    });
  };

  private _onClosePanel = (item: FormAzureStorageMounts): void => {
    const { values, setValues } = this.props;
    const azureStorageMountsItem = values.azureStorageMounts || [];
    const azureStorageMounts = [...azureStorageMountsItem];
    if (!this.state.createNewItem) {
      azureStorageMounts[this.state.currentItemIndex!] = item;
    } else {
      azureStorageMounts.push(item);
    }
    const sortedAzureStorageMounts = sortBy(azureStorageMounts, o => o.name.toLowerCase());
    setValues({
      ...values,
      azureStorageMounts: sortedAzureStorageMounts,
    });
    this.setState({ createNewItem: false, showPanel: false });
  };

  private _onCancel = (): void => {
    this.setState({ createNewItem: false, showPanel: false });
  };

  private _onShowPanel = (item: FormAzureStorageMounts, index: number): void => {
    this.setState({
      showPanel: true,
      currentAzureStorageMount: item,
      currentItemIndex: index,
    });
  };

  private removeItem(index: number) {
    const { values, setValues } = this.props;
    const azureStorageMounts: FormAzureStorageMounts[] = [...values.azureStorageMounts];
    azureStorageMounts.splice(index, 1);
    setValues({
      ...values,
      azureStorageMounts,
    });
  }

  private onRenderItemColumn = (item: FormAzureStorageMounts, index: number, column: IColumn) => {
    const { t } = this.props;
    const { editable } = this.context;
    if (!column || !item) {
      return null;
    }

    if (column.key === 'delete') {
      return (
        <TooltipHost
          content={t('delete')}
          id={`app-settings-storage-mounts-delete-tooltip-${index}`}
          calloutProps={{ gapSpace: 0 }}
          closeDelay={500}>
          <IconButton
            className={defaultCellStyle}
            disabled={!editable}
            id={`app-settings-storage-mounts-delete-${index}`}
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
          id={`app-settings-storage-mounts-edit-tooltip-${index}`}
          calloutProps={{ gapSpace: 0 }}
          closeDelay={500}>
          <IconButton
            className={defaultCellStyle}
            disabled={!editable}
            id={`app-settings-storage-mounts-edit-${index}`}
            iconProps={{ iconName: 'Edit' }}
            ariaLabel={t('edit')}
            onClick={() => this._onShowPanel(item, index)}
          />
        </TooltipHost>
      );
    }
    return <div className={defaultCellStyle}>{item[column.fieldName!]}</div>;
  };

  // tslint:disable-next-line:member-ordering
  private _getColumns = () => {
    const { t } = this.props;
    return [
      {
        key: 'name',
        name: t('_name'),
        fieldName: 'name',
        minWidth: 100,
        maxWidth: 350,
        isRowHeader: true,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: this.onRenderItemColumn,
      },
      {
        key: 'mountPath',
        name: t('mountPath'),
        fieldName: 'mountPath',
        minWidth: 150,
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
        fieldName: 'type',
        minWidth: 100,
        maxWidth: 350,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: this.onRenderItemColumn,
      },
      {
        key: 'accountName',
        name: t('accountName'),
        fieldName: 'accountName',
        minWidth: 100,
        maxWidth: 350,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: this.onRenderItemColumn,
      },
      {
        key: 'shareName',
        name: t('shareName'),
        fieldName: 'shareName',
        minWidth: 100,
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

export default withTranslation('translation')(AzureStorageMounts);
