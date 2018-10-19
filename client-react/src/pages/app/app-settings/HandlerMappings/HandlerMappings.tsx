import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib-commonjs/DetailsList';
import { IconButton, PrimaryButton, ActionButton, DefaultButton } from 'office-ui-fabric-react/lib-commonjs/Button';
import { Panel, PanelType } from 'office-ui-fabric-react/lib-commonjs/Panel';
import { HandlerMapping } from '../../../../models/WebAppModels';
import HandlerMappingsAddEdit from './HandlerMappingsAddEdit';
import { FormikProps } from 'formik';
import { AppSettingsFormValues } from '../AppSettings.Types';

export interface HandlerMappingState {
  showPanel: boolean;
  currentHandlerMapping: HandlerMapping | null;
  currentItemIndex: number | null;
  createNewItem: boolean;
}

export default class HandlerMappings extends React.Component<FormikProps<AppSettingsFormValues>, HandlerMappingState> {
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
    const { values } = this.props;
    if (!values.config) {
      return null;
    }
    return (
      <>
        <ActionButton onClick={this.createNewItem} styles={{ root: { marginTop: '5px' } }} iconProps={{ iconName: 'Add' }}>
          New Handler
        </ActionButton>
        <Panel
          isOpen={this.state.showPanel}
          type={PanelType.medium}
          onDismiss={this._onClosePanel}
          headerText=""
          closeButtonAriaLabel="Close"
          onRenderFooterContent={this._onRenderFooterContent}>
          <HandlerMappingsAddEdit {...this.state.currentHandlerMapping!} updateHandlerMapping={this.updateCurrentItem.bind(this)} />
        </Panel>
        <DetailsList
          items={values.config.properties.handlerMappings || []}
          columns={this._columns}
          isHeaderVisible={true}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          selectionPreservedOnEmptyClick={true}
          ariaLabelForSelectionColumn="Toggle selection"
          ariaLabelForSelectAllCheckbox="Toggle selection for all items"
        />
      </>
    );
  }

  private updateCurrentItem = (item: HandlerMapping) => {
    this.setState({ currentHandlerMapping: item });
  };

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

  private _onClosePanel = (): void => {
    const { values, setValues } = this.props;
    const handlerMappingsItem = values.config.properties.handlerMappings || [];
    const handlerMappings = [...handlerMappingsItem];
    if (!this.state.createNewItem) {
      handlerMappings[this.state.currentItemIndex!] = this.state.currentHandlerMapping!;
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
      handlerMappings.push(this.state.currentHandlerMapping!);
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

  private _onRenderFooterContent = (): JSX.Element => {
    return (
      <div>
        <PrimaryButton onClick={this._onClosePanel} style={{ marginRight: '8px' }}>
          Save
        </PrimaryButton>
        <DefaultButton onClick={this._onCancel}>Cancel</DefaultButton>
      </div>
    );
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
    if (!column || !item) {
      return null;
    }

    if (column.key === 'delete') {
      return <IconButton iconProps={{ iconName: 'Delete' }} title="Delete" onClick={() => this.removeItem(index)} />;
    }
    if (column.key === 'edit') {
      return <IconButton iconProps={{ iconName: 'Edit' }} title="Edit" onClick={() => this._onShowPanel(item, index)} />;
    }
    return <span>{item[column.fieldName!]}</span>;
  };

  // tslint:disable-next-line:member-ordering
  private _columns: IColumn[] = [
    {
      key: 'name',
      name: 'Extension',
      fieldName: 'extension',
      minWidth: 210,
      maxWidth: 350,
      isRowHeader: true,
      data: 'string',
      isPadded: true,
      isResizable: true,
      ariaLabel: 'Operations for name',
    },
    {
      key: 'value',
      name: 'Script Processor',
      fieldName: 'scriptProcessor',
      minWidth: 210,
      maxWidth: 350,
      isRowHeader: true,
      data: 'string',
      isPadded: true,
      isResizable: true,
      ariaLabel: 'Operations for value',
    },
    {
      key: 'type',
      name: 'Arguments',
      fieldName: 'arguments',
      minWidth: 210,
      maxWidth: 350,
      isRowHeader: true,
      data: 'string',
      isPadded: true,
      isResizable: true,
      ariaLabel: 'Operations for value',
    },
    {
      key: 'delete',
      name: '',
      minWidth: 16,
      maxWidth: 16,
      isResizable: true,
      isCollapsable: false,
      onRender: this.onRenderItemColumn,
      ariaLabel: 'Operations for value',
    },
    {
      key: 'edit',
      name: '',
      minWidth: 16,
      maxWidth: 16,
      isResizable: true,
      isCollapsable: false,
      onRender: this.onRenderItemColumn,
      ariaLabel: 'Operations for value',
    },
  ];
}
