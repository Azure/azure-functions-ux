import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { PrimaryButton, ActionButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { IConnectionString } from '../../../../modules/site/config/connectionstrings/actions';
import ConnectionStringsAddEdit from './ConnectionStringsAddEdit';
import { AppSettingsFormValues } from '../AppSettings.Types';
import { FormikProps } from 'formik';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { typeValueToString } from './connectionStringTypes';
import IconButton from '../../../../components/IconButton/IconButton';

interface ConnectionStringsState {
  hideValues: boolean;
  showPanel: boolean;
  currentConnectionString: IConnectionString | null;
  currentItemIndex: number;
  createNewItem: boolean;
}

export class ConnectionStrings extends React.Component<
  FormikProps<AppSettingsFormValues> & InjectedTranslateProps,
  ConnectionStringsState
> {
  constructor(props) {
    super(props);
    this.state = {
      hideValues: true,
      showPanel: false,
      currentConnectionString: null,
      currentItemIndex: -1,
      createNewItem: false,
    };
  }

  public render() {
    const { values, t } = this.props;
    if (!values.connectionStrings) {
      return null;
    }
    return (
      <>
        <ActionButton onClick={this.createNewItem} styles={{ root: { marginTop: '5px' } }} iconProps={{ iconName: 'Add' }}>
          {t('newConnectionString')}
        </ActionButton>
        <ActionButton
          onClick={this.flipHideSwitch}
          styles={{ root: { marginTop: '5px' } }}
          iconProps={{ iconName: this.state.hideValues ? 'RedEye' : 'Hide' }}>
          {this.state.hideValues ? 'Show Values' : 'Hide Values'}
        </ActionButton>
        <Panel
          isOpen={this.state.showPanel}
          type={PanelType.medium}
          onDismiss={this._onClosePanel}
          headerText={t('addEditConnectionStringHeader')}
          closeButtonAriaLabel={t('close')}
          onRenderFooterContent={this._onRenderFooterContent}>
          <ConnectionStringsAddEdit
            {...this.state.currentConnectionString!}
            otherConnectionStrings={values.connectionStrings}
            updateConnectionString={this.updateCurrentItem.bind(this)}
          />
        </Panel>
        <DetailsList
          items={values.connectionStrings}
          columns={this._getColumns()}
          isHeaderVisible={true}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          selectionPreservedOnEmptyClick={true}
        />
      </>
    );
  }

  private flipHideSwitch = () => {
    this.setState({ hideValues: !this.state.hideValues });
  };

  private updateCurrentItem = (item: IConnectionString) => {
    this.setState({ currentConnectionString: item });
  };

  private createNewItem = () => {
    const blankConnectionString = {
      name: '',
      value: '',
      type: 0,
      sticky: false,
    };
    this.setState({
      showPanel: true,
      currentConnectionString: blankConnectionString,
      createNewItem: true,
      currentItemIndex: -1,
    });
  };

  private _onClosePanel = (): void => {
    const { values, setFieldValue } = this.props;
    const connectionStrings: IConnectionString[] = [...values.connectionStrings];
    if (!this.state.createNewItem) {
      connectionStrings[this.state.currentItemIndex] = this.state.currentConnectionString!;
    } else {
      connectionStrings.push(this.state.currentConnectionString!);
    }
    setFieldValue('connectionStrings', connectionStrings);
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
  private _onShowPanel = (item: IConnectionString, index: number): void => {
    this.setState({
      showPanel: true,
      currentConnectionString: item,
      currentItemIndex: index,
    });
  };

  private removeItem(index: number) {
    const { values, setFieldValue } = this.props;
    const connectionStrings: IConnectionString[] = [...values.connectionStrings];
    connectionStrings.splice(index, 1);
    setFieldValue('connectionStrings', connectionStrings);
  }

  private onRenderItemColumn = (item: IConnectionString, index: number, column: IColumn) => {
    if (!column || !item) {
      return null;
    }

    if (column.key === 'delete') {
      return <IconButton iconProps={{ iconName: 'Delete' }} title="Delete" onClick={() => this.removeItem(index)} />;
    }
    if (column.key === 'edit') {
      return <IconButton iconProps={{ iconName: 'Edit' }} title="Edit" onClick={() => this._onShowPanel(item, index)} />;
    }
    if (column.key === 'sticky') {
      return item.sticky ? <IconButton iconProps={{ iconName: 'CheckMark' }} title="Sticky" /> : null;
    }
    if (column.key === 'value') {
      return this.state.hideValues ? 'Hidden value. Click show values button above to view' : <span>{item[column.fieldName!]}</span>;
    }
    if (column.key === 'type') {
      return <span>{typeValueToString(item[column.fieldName!])}</span>;
    }
    return <span>{item[column.fieldName!]}</span>;
  };

  private _getColumns = () => {
    const { t } = this.props;
    return [
      {
        key: 'name',
        name: t('nameRes'),
        fieldName: 'name',
        minWidth: 210,
        maxWidth: 350,
        isRowHeader: true,
        data: 'string',
        isPadded: true,
        isResizable: true,
      },
      {
        key: 'value',
        name: t('value'),
        fieldName: 'value',
        minWidth: 210,
        isRowHeader: true,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: this.onRenderItemColumn,
      },
      {
        key: 'type',
        name: t('type'),
        fieldName: 'type',
        minWidth: 200,
        maxWidth: 250,
        isRowHeader: true,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: this.onRenderItemColumn,
      },
      {
        key: 'sticky',
        name: t('sticky'),
        fieldName: 'sticky',
        minWidth: 50,
        maxWidth: 100,
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

export default translate('translation')(ConnectionStrings);
