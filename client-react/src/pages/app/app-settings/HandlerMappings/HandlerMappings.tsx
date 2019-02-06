import { FormikProps } from 'formik';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import * as React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';

import DisplayTableWithEmptyMessage, {
  defaultCellStyle,
} from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import IconButton from '../../../../components/IconButton/IconButton';
import { HandlerMapping } from '../../../../models/WebAppModels';
import { AppSettingsFormValues } from '../AppSettings.types';
import HandlerMappingsAddEdit from './HandlerMappingsAddEdit';

export interface HandlerMappingState {
  showPanel: boolean;
  currentHandlerMapping: HandlerMapping | null;
  currentItemIndex: number | null;
  createNewItem: boolean;
}

export class HandlerMappings extends React.Component<FormikProps<AppSettingsFormValues> & InjectedTranslateProps, HandlerMappingState> {
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
        <ActionButton
          id="app-settings-new-handler-mappings-button"
          disabled={!values.siteWritePermission}
          onClick={this.createNewItem}
          styles={{ root: { marginTop: '5px' } }}
          iconProps={{ iconName: 'Add' }}>
          {t('addNewHandler')}
        </ActionButton>
        <Panel
          isOpen={this.state.showPanel}
          type={PanelType.medium}
          onDismiss={this._onCancel}
          headerText={t('newHandlerMapping')}
          closeButtonAriaLabel={t('close')}>
          <HandlerMappingsAddEdit
            handlerMapping={this.state.currentHandlerMapping!}
            updateHandlerMapping={this._onClosePanel.bind(this)}
            closeBlade={this._onCancel.bind(this)}
          />
        </Panel>
        <DisplayTableWithEmptyMessage
          items={values.config.properties.handlerMappings || []}
          columns={this._getColumns()}
          isHeaderVisible={true}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          selectionPreservedOnEmptyClick={true}
          emptyMessage={t('emptyHandlerMappings')}
        />
      </>
    );
  }

  private createNewItem = () => {
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
    const { values, t } = this.props;
    if (!column || !item) {
      return null;
    }

    if (column.key === 'delete') {
      return (
        <IconButton
          className={defaultCellStyle}
          disabled={!values.siteWritePermission}
          iconProps={{ iconName: 'Delete' }}
          ariaLabel={t('delete')}
          title={t('delete')}
          onClick={() => this.removeItem(index)}
        />
      );
    }
    if (column.key === 'edit') {
      return (
        <IconButton
          className={defaultCellStyle}
          disabled={!values.siteWritePermission}
          iconProps={{ iconName: 'Edit' }}
          ariaLabel={t('edit')}
          title={t('edit')}
          onClick={() => this._onShowPanel(item, index)}
        />
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
        isRowHeader: true,
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

export default translate('translation')(HandlerMappings);
