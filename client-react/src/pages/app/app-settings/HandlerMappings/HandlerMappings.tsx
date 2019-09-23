import { FormikProps } from 'formik';
import { DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

import { defaultCellStyle } from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import IconButton from '../../../../components/IconButton/IconButton';
import { AppSettingsFormValues, Permissions } from '../AppSettings.types';
import HandlerMappingsAddEdit from './HandlerMappingsAddEdit';
import { PermissionsContext } from '../Contexts';
import { HandlerMapping } from '../../../../models/site/config';
import { TooltipHost, ICommandBarItemProps } from 'office-ui-fabric-react';
import Panel from '../../../../components/Panel/Panel';
import DisplayTableWithCommandBar from '../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';

export interface HandlerMappingState {
  showPanel: boolean;
  currentHandlerMapping: HandlerMapping | null;
  currentItemIndex: number | null;
  createNewItem: boolean;
}

export class HandlerMappings extends React.Component<FormikProps<AppSettingsFormValues> & WithTranslation, HandlerMappingState> {
  public static contextType = PermissionsContext;
  public context: Permissions;
  constructor(props) {
    super(props);
    this.state = {
      showPanel: false,
      currentHandlerMapping: null,
      currentItemIndex: null,
      createNewItem: false,
    };
  }

  public render() {
    const { values, t } = this.props;
    if (!values.config) {
      return null;
    }
    return (
      <>
        <DisplayTableWithCommandBar
          commandBarItems={this._getCommandBarItems()}
          items={values.config.properties.handlerMappings || []}
          columns={this._getColumns()}
          isHeaderVisible={true}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          selectionPreservedOnEmptyClick={true}
          emptyMessage={t('emptyHandlerMappings')}
        />
        <Panel
          isOpen={this.state.showPanel}
          onDismiss={this._onCancel}
          headerText={t('newHandlerMapping')}
          closeButtonAriaLabel={t('close')}>
          <HandlerMappingsAddEdit
            handlerMapping={this.state.currentHandlerMapping!}
            updateHandlerMapping={this._onClosePanel.bind(this)}
            closeBlade={this._onCancel.bind(this)}
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
        key: 'app-settings-new-handler-mappings-button',
        onClick: this._createNewItem,
        disabled: !app_write || !editable,
        iconProps: { iconName: 'Add' },
        ariaLabel: t('addNewHandlerMapping'),
        name: t('addNewHandler'),
      },
    ];
  };

  private _createNewItem = () => {
    const blankConnectionString: HandlerMapping = {
      extension: '',
      scriptProcessor: '',
      arguments: '',
    };
    this.setState({
      showPanel: true,
      currentHandlerMapping: blankConnectionString,
      createNewItem: true,
      currentItemIndex: -1,
    });
  };

  private _onClosePanel = (item: HandlerMapping): void => {
    const { values, setValues } = this.props;
    const handlerMappingsItem = values.config.properties.handlerMappings || [];
    const handlerMappings = [...handlerMappingsItem];
    if (!this.state.createNewItem) {
      handlerMappings[this.state.currentItemIndex!] = item;
      setValues({
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
      setValues({
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
    this.setState({ createNewItem: false, showPanel: false });
  };

  private _onCancel = (): void => {
    this.setState({ createNewItem: false, showPanel: false });
  };

  private _onShowPanel = (item: HandlerMapping, index: number): void => {
    this.setState({
      showPanel: true,
      currentHandlerMapping: item,
      currentItemIndex: index,
    });
  };

  private removeItem(index: number) {
    const { values, setValues } = this.props;
    const handlerMappings: HandlerMapping[] = [...values.config.properties.handlerMappings];
    handlerMappings.splice(index, 1);
    setValues({
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

  private onRenderItemColumn = (item: HandlerMapping, index: number, column: IColumn) => {
    const { t } = this.props;
    const { editable, app_write } = this.context;
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
            disabled={!app_write || !editable}
            id={`app-settings-handler-mappings-delete-${index}`}
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
          id={`app-settings-handler-mappings-edit-tooltip-${index}`}
          calloutProps={{ gapSpace: 0 }}
          closeDelay={500}>
          <IconButton
            className={defaultCellStyle}
            disabled={!app_write || !editable}
            id={`app-settings-handler-mappings-edit-${index}`}
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
        key: 'extension',
        name: t('extension'),
        fieldName: 'extension',
        minWidth: 210,
        maxWidth: 350,
        isRowHeader: true,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: this.onRenderItemColumn,
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
        onRender: this.onRenderItemColumn,
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

export default withTranslation('translation')(HandlerMappings);
