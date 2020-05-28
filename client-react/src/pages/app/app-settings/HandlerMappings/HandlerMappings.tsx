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
import { TooltipHost, ICommandBarItemProps, PanelType } from 'office-ui-fabric-react';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import DisplayTableWithCommandBar from '../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import { ThemeContext } from '../../../../ThemeContext';
import { dirtyElementStyle } from '../AppSettings.styles';

const HandlerMappings: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
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
        disabled: disableAllControls,
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

  const isHandlerMappingEqual = (handlerMapping1: HandlerMapping, handlerMapping2: HandlerMapping): boolean => {
    return (
      handlerMapping1.extension === handlerMapping2.extension &&
      handlerMapping1.scriptProcessor === handlerMapping2.scriptProcessor &&
      handlerMapping1.arguments === handlerMapping2.arguments
    );
  };

  const isAppSettingDirty = (index: number): boolean => {
    const initialHandlerMappings = props.initialValues.config.properties.handlerMappings || [];
    const currentRow = values.config.properties.handlerMappings[index] || null;
    const initialHandlerMappingIndex = initialHandlerMappings.findIndex(x => isHandlerMappingEqual(x, currentRow));
    return initialHandlerMappingIndex < 0;
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
            disabled={disableAllControls}
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
            disabled={disableAllControls}
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
      if (isAppSettingDirty(index)) {
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
      <CustomPanel type={PanelType.medium} isOpen={showPanel} onDismiss={onCancel} headerText={t('newHandlerMapping')}>
        <HandlerMappingsAddEdit handlerMapping={currentHandlerMapping!} updateHandlerMapping={onClosePanel} closeBlade={onCancel} />
      </CustomPanel>
    </>
  );
};

export default withTranslation('translation')(HandlerMappings);
