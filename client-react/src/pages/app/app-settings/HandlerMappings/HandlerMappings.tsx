import { FormikProps } from 'formik';
import { DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import React, { useContext, useState } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

import { defaultCellStyle } from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import IconButton from '../../../../components/IconButton/IconButton';
import { AppSettingsFormValues } from '../AppSettings.types';
import HandlerMappingsAddEdit from './HandlerMappingsAddEdit';
import { PermissionsContext } from '../Contexts';
import { HandlerMapping } from '../../../../models/site/config';
import { TooltipHost, ICommandBarItemProps } from 'office-ui-fabric-react';
import Panel from '../../../../components/Panel/Panel';
import DisplayTableWithCommandBar from '../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import { ThemeContext } from '../../../../ThemeContext';
import { dirtyElementStyle } from '../AppSettings.styles';

export interface HandlerMappingState {
  showPanel: boolean;
  currentHandlerMapping: HandlerMapping | null;
  currentItemIndex: number | null;
  createNewItem: boolean;
}

const HandlerMappings: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
  const permissionContext = useContext(PermissionsContext);
  const theme = useContext(ThemeContext);

  const [showPanel, setShowPanel] = useState(false);
  const [currentHandlerMapping, setCurrentHandlerMapping] = useState<HandlerMapping | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
  const [createNewItem, setCreateNewItem] = useState(false);

  const { t, values } = props;

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'app-settings-new-handler-mappings-button',
        onClick: createNewHandlerMapping,
        disabled: !permissionContext.app_write || !permissionContext.editable,
        iconProps: { iconName: 'Add' },
        ariaLabel: t('addNewHandlerMapping'),
        name: t('addNewHandler'),
      },
    ];
  };

  const createNewHandlerMapping = () => {
    const blankHandlerMapping: HandlerMapping = {
      extension: '',
      scriptProcessor: '',
      arguments: '',
    };
    setShowPanel(true);
    setCurrentHandlerMapping(blankHandlerMapping);
    setCreateNewItem(true);
    setCurrentItemIndex(-1);
  };

  const onClosePanel = (item: HandlerMapping): void => {
    const handlerMappingsItem = values.config.properties.handlerMappings || [];
    const handlerMappings = [...handlerMappingsItem];
    if (!createNewItem) {
      handlerMappings[currentItemIndex!] = item;
      props.setValues({
        ...values,
        config: {
          ...values.config,
          properties: {
            ...values.config.properties,
            handlerMappings,
          },
        },
      });
    } else {
      handlerMappings.push(item);
      props.setValues({
        ...values,
        config: {
          ...values.config,
          properties: {
            ...values.config.properties,
            handlerMappings,
          },
        },
      });
    }
    setCreateNewItem(false);
    setShowPanel(false);
  };

  const onCancel = (): void => {
    setCreateNewItem(false);
    setShowPanel(false);
  };

  const onShowPanel = (item: HandlerMapping, index: number): void => {
    setShowPanel(true);
    setCurrentHandlerMapping(item);
    setCurrentItemIndex(index);
  };

  const removeItem = (index: number) => {
    const handlerMappings: HandlerMapping[] = [...values.config.properties.handlerMappings];
    handlerMappings.splice(index, 1);
    props.setValues({
      ...values,
      config: {
        ...values.config,
        properties: {
          ...values.config.properties,
          handlerMappings,
        },
      },
    });
  };

  const isAppSettingDirty = (extension: string): boolean => {
    const initialAppSettings = props.initialValues.config.properties.handlerMappings || [];
    const currentAppSettings = values.config.properties.handlerMappings || [];
    for (let i = 0; i < initialAppSettings.length; ++i) {
      const appSetting = initialAppSettings[i];
      if (appSetting.extension.toLowerCase() === extension) {
        const currentAppSettingIndex = currentAppSettings.findIndex(x => x.extension.toLowerCase() === name);
        if (
          currentAppSettingIndex === -1 ||
          (appSetting.extension === currentAppSettings[currentAppSettingIndex].extension &&
            appSetting.arguments === currentAppSettings[currentAppSettingIndex].arguments &&
            appSetting.scriptProcessor === currentAppSettings[currentAppSettingIndex].scriptProcessor)
        ) {
          return false;
        } else {
          return true;
        }
      }
    }
    return true;
  };

  const onRenderItemColumn = (item: HandlerMapping, index: number, column: IColumn) => {
    if (!column || !item) {
      return null;
    }

    if (column.key === 'delete') {
      return (
        <TooltipHost
          content={t('delete')}
          id={`app-settings-handler-mappings-delete-tooltip-${index}`}
          calloutProps={{ gapSpace: 0 }}
          closeDelay={500}>
          <IconButton
            className={defaultCellStyle}
            disabled={!permissionContext.app_write || !permissionContext.editable}
            id={`app-settings-handler-mappings-delete-${index}`}
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
          id={`app-settings-handler-mappings-edit-tooltip-${index}`}
          calloutProps={{ gapSpace: 0 }}
          closeDelay={500}>
          <IconButton
            className={defaultCellStyle}
            disabled={!permissionContext.app_write || !permissionContext.editable}
            id={`app-settings-handler-mappings-edit-${index}`}
            iconProps={{ iconName: 'Edit' }}
            ariaLabel={t('edit')}
            onClick={() => onShowPanel(item, index)}
          />
        </TooltipHost>
      );
    }
    if (column.key === 'extension') {
      column.className = '';
      if (isAppSettingDirty(item[column.fieldName!].toLowerCase())) {
        column.className = dirtyElementStyle(theme);
      }
    }
    return <div className={defaultCellStyle}>{item[column.fieldName!]}</div>;
  };

  // tslint:disable-next-line:member-ordering
  const getColumns = () => {
    return [
      {
        key: 'extension',
        name: t('extension'),
        fieldName: 'extension',
        minWidth: 210,
        maxWidth: 350,
        isRowHeader: true,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: onRenderItemColumn,
      },
      {
        key: 'scriptProcessor',
        name: t('scriptProcessor'),
        fieldName: 'scriptProcessor',
        minWidth: 210,
        maxWidth: 350,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: onRenderItemColumn,
      },
      {
        key: 'arguments',
        name: t('argumentsRes'),
        fieldName: 'arguments',
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

  if (!values.config) {
    return null;
  }
  return (
    <>
      <DisplayTableWithCommandBar
        commandBarItems={getCommandBarItems()}
        items={values.config.properties.handlerMappings || []}
        columns={getColumns()}
        isHeaderVisible={true}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        selectionPreservedOnEmptyClick={true}
        emptyMessage={t('emptyHandlerMappings')}
      />
      <Panel isOpen={showPanel} onDismiss={onCancel} headerText={t('newHandlerMapping')} closeButtonAriaLabel={t('close')}>
        <HandlerMappingsAddEdit handlerMapping={currentHandlerMapping!} updateHandlerMapping={onClosePanel} closeBlade={onCancel} />
      </Panel>
    </>
  );
};

export default withTranslation('translation')(HandlerMappings);
