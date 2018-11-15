import * as React from 'react';
import { DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { HandlerMapping } from '../../../../models/WebAppModels';
import HandlerMappingsAddEdit from './HandlerMappingsAddEdit';
import { FormikProps } from 'formik';
import { AppSettingsFormValues } from '../AppSettings.Types';
import { translate, InjectedTranslateProps } from 'react-i18next';
import IconButton from '../../../../components/IconButton/IconButton';
import DisplayTableWithEmptyMessage from 'src/components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';

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
          New Handler
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
    const { values } = this.props;
    if (!column || !item) {
      return null;
    }

    if (column.key === 'delete') {
      return (
        <IconButton
          disabled={!values.siteWritePermission}
          iconProps={{ iconName: 'Delete' }}
          title="Delete"
          onClick={() => this.removeItem(index)}
        />
      );
    }
    if (column.key === 'edit') {
      return (
        <IconButton
          disabled={!values.siteWritePermission}
          iconProps={{ iconName: 'Edit' }}
          title="Edit"
          onClick={() => this._onShowPanel(item, index)}
        />
      );
    }
    return <span>{item[column.fieldName!]}</span>;
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
