import { FormikProps } from 'formik';
import { DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import React, { useState, useContext } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { defaultCellStyle } from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import IconButton from '../../../../components/IconButton/IconButton';
import { AppSettingsFormValues } from '../AppSettings.types';
import VirtualApplicationsAddEdit from './VirtualApplicationsAddEdit';
import { PermissionsContext } from '../Contexts';
import { VirtualApplication } from '../../../../models/site/config';
import { TooltipHost, ICommandBarItemProps, PanelType } from 'office-ui-fabric-react';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import DisplayTableWithCommandBar from '../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import { ThemeContext } from '../../../../ThemeContext';
import { dirtyElementStyle } from '../AppSettings.styles';

export interface VirtualApplicationsState {
  showPanel: boolean;
  currentVirtualApplication: VirtualApplication | null;
  currentItemIndex: number | null;
  createNewItem: boolean;
}
const VirtualApplications: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const theme = useContext(ThemeContext);

  const [showPanel, setShowPanel] = useState(false);
  const [currentVirtualApplication, setCurrentVirtualApplication] = useState<VirtualApplication | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
  const [createNewItem, setCreateNewItem] = useState(false);

  const { t, values } = props;

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'app-settings-new-virtual-app-button',
        onClick: createVirtualApplication,
        disabled: disableAllControls,
        iconProps: { iconName: 'Add' },
        ariaLabel: t('addNewVirtualDirectory'),
        name: t('addNewVirtualDirectoryV3'),
      },
    ];
  };

  const createVirtualApplication = () => {
    const blank: VirtualApplication = {
      physicalPath: '',
      virtualPath: '',
      virtualDirectories: [],
      preloadEnabled: false,
      virtualDirectory: true,
    };
    setShowPanel(true);
    setCreateNewItem(true);
    setCurrentItemIndex(-1);
    setCurrentVirtualApplication(blank);
  };

  const onCancelPanel = () => {
    setShowPanel(false);
    setCreateNewItem(false);
  };

  const onClosePanel = (item: VirtualApplication) => {
    const virtualApplications = [...values.virtualApplications];
    if (!createNewItem) {
      virtualApplications[currentItemIndex!] = item;
    } else {
      virtualApplications.push(item);
    }
    props.setValues({
      ...values,
      virtualApplications,
    });
    setCreateNewItem(false);
    setShowPanel(false);
  };

  const onShowPanel = (item: VirtualApplication, index: number): void => {
    setShowPanel(true);
    setCurrentVirtualApplication(item);
    setCurrentItemIndex(index);
  };

  const removeItem = (index: number) => {
    const virtualApplications: VirtualApplication[] = [...values.virtualApplications];
    virtualApplications.splice(index, 1);
    props.setValues({
      ...values,
      virtualApplications,
    });
  };

  const isVirtualApplicationEqual = (virtualApp1: VirtualApplication, virtualApp2: VirtualApplication): boolean => {
    if (
      virtualApp1.physicalPath === virtualApp2.physicalPath &&
      virtualApp1.virtualPath === virtualApp2.virtualPath &&
      virtualApp1.virtualDirectory === virtualApp2.virtualDirectory &&
      virtualApp1.preloadEnabled === virtualApp2.preloadEnabled
    ) {
      return true;
    }
    return false;
  };

  const isAppSettingDirty = (index: number): boolean => {
    const initialVirtualApplications = props.initialValues.virtualApplications;
    const currentRow = values.virtualApplications[index];
    const initialVirtualApplicationIndex = initialVirtualApplications.findIndex(x => isVirtualApplicationEqual(x, currentRow));
    if (initialVirtualApplicationIndex >= 0) {
      return false;
    }
    return true;
  };

  const onRenderItemColumn = (item: VirtualApplication, index: number, column: IColumn) => {
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
            disabled={disableAllControls}
            id={`app-settings-virtual-applications-delete-${index}`}
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
          id={`app-settings-virtual-applications-edit-tooltip-${index}`}
          calloutProps={{ gapSpace: 0 }}
          closeDelay={500}>
          <IconButton
            className={defaultCellStyle}
            disabled={disableAllControls}
            id={`app-settings-virtual-applications-edit-${index}`}
            iconProps={{ iconName: 'Edit' }}
            ariaLabel={t('edit')}
            onClick={() => onShowPanel(item, index)}
          />
        </TooltipHost>
      );
    }
    if (column.key === 'type') {
      return <div className={defaultCellStyle}>{item.virtualDirectory ? t('directory') : t('application')}</div>;
    }
    if (column.key === 'virtualPath') {
      column.className = '';
      if (isAppSettingDirty(index)) {
        column.className = dirtyElementStyle(theme);
      }
    }
    return <div className={defaultCellStyle}>{item[column.fieldName!]}</div>;
  };

  const getColumns = () => {
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
        onRender: onRenderItemColumn,
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
        onRender: onRenderItemColumn,
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

  if (!values.virtualApplications) {
    return null;
  }
  return (
    <>
      <DisplayTableWithCommandBar
        commandBarItems={getCommandBarItems()}
        items={values.virtualApplications || []}
        columns={getColumns()}
        isHeaderVisible={true}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        selectionPreservedOnEmptyClick={true}
        emptyMessage={t('emptyVirtualDirectories')}
      />
      <CustomPanel type={PanelType.medium} isOpen={showPanel} onDismiss={onCancelPanel} headerText={t('newApp')}>
        <VirtualApplicationsAddEdit
          virtualApplication={currentVirtualApplication!}
          otherVirtualApplications={values.virtualApplications}
          updateVirtualApplication={onClosePanel}
          closeBlade={onCancelPanel}
        />
      </CustomPanel>
    </>
  );
};

export default withTranslation('translation')(VirtualApplications);
