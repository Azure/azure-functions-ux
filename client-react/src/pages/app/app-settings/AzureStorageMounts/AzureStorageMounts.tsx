import { FormikProps } from 'formik';
import { DetailsListLayoutMode, SelectionMode, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import React, { useContext, useState } from 'react';
import { defaultCellStyle } from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import { AppSettingsFormValues, FormAzureStorageMounts } from '../AppSettings.types';
import IconButton from '../../../../components/IconButton/IconButton';
import AzureStorageMountsAddEdit from './AzureStorageMountsAddEdit';
import { MessageBarType, TooltipHost, ICommandBarItemProps, PanelType } from 'office-ui-fabric-react';
import { PermissionsContext } from '../Contexts';
import { sortBy } from 'lodash-es';
import { StorageType } from '../../../../models/site/config';
import DisplayTableWithCommandBar from '../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { ThemeContext } from '../../../../ThemeContext';
import { dirtyElementStyle } from '../AppSettings.styles';
import { useTranslation } from 'react-i18next';
import { isXenonApp } from '../../../../utils/arm-utils';

const MAXALLOWEDAZUREMOUNTS = 5;

const AzureStorageMounts: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const theme = useContext(ThemeContext);
  const disableAllControls = !app_write || !editable || saving;

  const [showPanel, setShowPanel] = useState(false);
  const [currentAzureStorageMount, setCurrentAzureStorageMount] = useState<FormAzureStorageMounts | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | undefined>(undefined);
  const [createNewItem, setCreateNewItem] = useState(false);

  const { values } = props;
  const { t } = useTranslation();

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'app-settings-new-azure-storage-mount-button',
        onClick: createNewAzureStorageMount,
        disabled: disableAllControls || values.azureStorageMounts.length >= MAXALLOWEDAZUREMOUNTS,
        iconProps: { iconName: 'Add' },
        text: t('newAzureStorageMount'),
      },
    ];
  };

  const createNewAzureStorageMount = () => {
    const blankAzureStorageMount: FormAzureStorageMounts = {
      name: '',
      type: StorageType.azureBlob,
      accountName: '',
      shareName: '',
      accessKey: '',
      mountPath: '',
    };
    setShowPanel(true);
    setCurrentAzureStorageMount(blankAzureStorageMount);
    setCreateNewItem(true);
    setCurrentItemIndex(undefined);
  };

  const onClosePanel = (item: FormAzureStorageMounts): void => {
    const azureStorageMountsItem = values.azureStorageMounts || [];
    const azureStorageMounts = [...azureStorageMountsItem];
    if (!createNewItem && currentItemIndex !== undefined) {
      azureStorageMounts[currentItemIndex] = item;
    } else {
      azureStorageMounts.push(item);
    }
    const sortedAzureStorageMounts = sortBy(azureStorageMounts, o => o.name.toLowerCase());
    props.setValues({
      ...values,
      azureStorageMounts: sortedAzureStorageMounts,
    });

    setCreateNewItem(false);
    setShowPanel(false);
  };

  const onCancel = (): void => {
    setCreateNewItem(false);
    setShowPanel(false);
  };

  const onShowPanel = (item: FormAzureStorageMounts, index: number): void => {
    setShowPanel(true);
    setCurrentAzureStorageMount(item);
    setCurrentItemIndex(index);
  };

  const removeItem = (index: number) => {
    const azureStorageMounts: FormAzureStorageMounts[] = [...values.azureStorageMounts];
    azureStorageMounts.splice(index, 1);
    props.setValues({
      ...values,
      azureStorageMounts,
    });
  };

  const isAzureStorageMountEqual = (storageMount1: FormAzureStorageMounts, storageMount2: FormAzureStorageMounts): boolean => {
    return (
      storageMount1.name === storageMount2.name &&
      storageMount1.type === storageMount2.type &&
      storageMount1.accountName === storageMount2.accountName &&
      storageMount1.shareName === storageMount2.shareName &&
      storageMount1.accessKey === storageMount2.accessKey &&
      storageMount1.mountPath === storageMount2.mountPath
    );
  };

  const isAzureStorageMountDirty = (index: number): boolean => {
    const initialstorageMounts = props.initialValues.azureStorageMounts || [];
    const currentRow = values.azureStorageMounts[index] || null;
    return !!currentRow && initialstorageMounts.findIndex(x => isAzureStorageMountEqual(x, currentRow)) < 0;
  };

  const onRenderItemColumn = (item: FormAzureStorageMounts, index: number, column: IColumn) => {
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
            disabled={disableAllControls}
            id={`app-settings-storage-mounts-delete-${index}`}
            iconProps={{ iconName: 'Delete' }}
            ariaLabel={t('delete')}
            onClick={() => removeItem(index)}
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
            disabled={disableAllControls}
            id={`app-settings-storage-mounts-edit-${index}`}
            iconProps={{ iconName: 'Edit' }}
            ariaLabel={t('edit')}
            onClick={() => onShowPanel(item, index)}
          />
        </TooltipHost>
      );
    }
    if (column.key === 'name') {
      column.className = '';
      if (isAzureStorageMountDirty(index)) {
        column.className = dirtyElementStyle(theme);
      }
    }
    return <div className={defaultCellStyle}>{item[column.fieldName!]}</div>;
  };

  // tslint:disable-next-line:member-ordering
  const getColumns = () => {
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
        onRender: onRenderItemColumn,
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
        onRender: onRenderItemColumn,
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
        onRender: onRenderItemColumn,
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
        onRender: onRenderItemColumn,
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
        onRender: onRenderItemColumn,
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
        onRender: onRenderItemColumn,
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
        onRender: onRenderItemColumn,
      },
    ];
  };

  const getTable = () => {
    return (
      <>
        <DisplayTableWithCommandBar
          commandBarItems={getCommandBarItems()}
          items={values.azureStorageMounts || []}
          columns={getColumns()}
          isHeaderVisible={true}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          selectionPreservedOnEmptyClick={true}
          emptyMessage={t('emptyAzureStorageMount')}
        />
        <CustomPanel
          type={PanelType.medium}
          isOpen={showPanel}
          onDismiss={onCancel}
          headerText={createNewItem ? t('newAzureStorageMount') : t('editAzureStorageMount')}>
          <AzureStorageMountsAddEdit
            azureStorageMount={currentAzureStorageMount!}
            otherAzureStorageMounts={values.azureStorageMounts}
            updateAzureStorageMount={item => onClosePanel(item)}
            closeBlade={onCancel}
            enableValidation={!isXenonApp(values.site)}
          />
        </CustomPanel>
      </>
    );
  };

  return !app_write ? <CustomBanner message={t('applicationSettingsNoPermission')} type={MessageBarType.warning} /> : getTable();
};

export default AzureStorageMounts;
