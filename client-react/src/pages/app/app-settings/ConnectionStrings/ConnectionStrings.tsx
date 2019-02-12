import { FormikProps } from 'formik';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

import DisplayTableWithEmptyMessage, {
  defaultCellStyle,
} from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import IconButton from '../../../../components/IconButton/IconButton';
import { AppSettingsFormValues, FormConnectionString, Permissions } from '../AppSettings.types';
import ConnectionStringsAddEdit from './ConnectionStringsAddEdit';
import { typeValueToString } from './connectionStringTypes';
import { PermissionsContext } from '../Contexts';

interface ConnectionStringsState {
  hideValues: boolean;
  showPanel: boolean;
  currentConnectionString: FormConnectionString | null;
  currentItemIndex: number;
  createNewItem: boolean;
}

export class ConnectionStrings extends React.Component<FormikProps<AppSettingsFormValues> & WithTranslation, ConnectionStringsState> {
  public static contextType = PermissionsContext;
  public context: Permissions;
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
    const { editable, production_write } = this.context;
    if (!values.connectionStrings) {
      return null;
    }
    return (
      <>
        <ActionButton
          id="app-settings-connection-strings-add"
          onClick={this.createNewItem}
          disabled={!editable}
          styles={{ root: { marginTop: '5px' } }}
          iconProps={{ iconName: 'Add' }}>
          {t('newConnectionString')}
        </ActionButton>
        <ActionButton
          id="app-settings-connection-strings-show-hide"
          onClick={this.flipHideSwitch}
          styles={{ root: { marginTop: '5px' } }}
          iconProps={{ iconName: this.state.hideValues ? 'RedEye' : 'Hide' }}>
          {this.state.hideValues ? 'Show Values' : 'Hide Values'}
        </ActionButton>
        <Panel
          isOpen={this.state.showPanel}
          type={PanelType.smallFixedFar}
          onDismiss={this._onCancel}
          headerText={t('addEditConnectionStringHeader')}
          closeButtonAriaLabel={t('close')}>
          <ConnectionStringsAddEdit
            connectionString={this.state.currentConnectionString!}
            otherConnectionStrings={values.connectionStrings}
            updateConnectionString={this._onClosePanel.bind(this)}
            disableSlotSetting={!production_write}
            closeBlade={this._onCancel}
          />
        </Panel>
        <DisplayTableWithEmptyMessage
          items={values.connectionStrings}
          columns={this._getColumns()}
          isHeaderVisible={true}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          selectionPreservedOnEmptyClick={true}
          emptyMessage={t('emptyConnectionStrings')}
        />
      </>
    );
  }

  private flipHideSwitch = () => {
    this.setState({ hideValues: !this.state.hideValues });
  };

  private createNewItem = () => {
    const blankConnectionString = {
      name: '',
      value: '',
      type: 'MySql',
      sticky: false,
    };
    this.setState({
      showPanel: true,
      currentConnectionString: blankConnectionString,
      createNewItem: true,
      currentItemIndex: -1,
    });
  };

  private _onClosePanel = (currentConnectionString: FormConnectionString): void => {
    this.setState({ currentConnectionString });
    const { values, setFieldValue } = this.props;
    const connectionStrings: FormConnectionString[] = [...values.connectionStrings];
    if (!this.state.createNewItem) {
      connectionStrings[this.state.currentItemIndex] = currentConnectionString;
    } else {
      connectionStrings.push(currentConnectionString);
    }
    setFieldValue('connectionStrings', connectionStrings);
    this.setState({ createNewItem: false, showPanel: false });
  };

  private _onCancel = (): void => {
    this.setState({ createNewItem: false, showPanel: false });
  };

  private _onShowPanel = (item: FormConnectionString, index: number): void => {
    this.setState({
      showPanel: true,
      currentConnectionString: item,
      currentItemIndex: index,
    });
  };

  private removeItem(index: number) {
    const { values, setFieldValue } = this.props;
    const connectionStrings: FormConnectionString[] = [...values.connectionStrings];
    connectionStrings.splice(index, 1);
    setFieldValue('connectionStrings', connectionStrings);
  }

  private onRenderItemColumn = (item: FormConnectionString, index: number, column: IColumn) => {
    const { t } = this.props;
    const { editable } = this.context;
    if (!column || !item) {
      return null;
    }

    if (column.key === 'delete') {
      return (
        <IconButton
          className={defaultCellStyle}
          disabled={!editable}
          iconProps={{ iconName: 'Delete' }}
          id={`app-settings-connection-strings-delete-${index}`}
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
          disabled={!editable}
          iconProps={{ iconName: 'Edit' }}
          id={`app-settings-connection-strings-edit-${index}`}
          ariaLabel={t('edit')}
          title={t('edit')}
          onClick={() => this._onShowPanel(item, index)}
        />
      );
    }
    if (column.key === 'sticky') {
      return item.sticky ? (
        <IconButton
          className={defaultCellStyle}
          id={`app-settings-connection-strings-sticky-${index}`}
          iconProps={{ iconName: 'CheckMark' }}
          ariaLabel={t('slotSettingOn')}
          title={t('sticky')}
        />
      ) : null;
    }
    if (column.key === 'value') {
      return this.state.hideValues ? (
        <div className={defaultCellStyle}>{t('hiddenValueClickAboveToShow')}</div>
      ) : (
        <span id={`app-settings-connection-strings-value-${index}`} className={defaultCellStyle}>
          {item[column.fieldName!]}
        </span>
      );
    }
    if (column.key === 'type') {
      return (
        <span id={`app-settings-connection-strings-type-${index}`} className={defaultCellStyle}>
          {typeValueToString(item[column.fieldName!])}
        </span>
      );
    }
    if (column.key === 'name') {
      return (
        <div id={`app-settings-connection-strings-name-${index}`} className={defaultCellStyle}>
          {item[column.fieldName!]}
        </div>
      );
    }
    return <div className={defaultCellStyle}>{item[column.fieldName!]}</div>;
  };

  private _getColumns = () => {
    const { t } = this.props;
    return [
      {
        key: 'name',
        name: t('nameRes'),
        fieldName: 'name',
        minWidth: 110,
        maxWidth: 350,
        isRowHeader: true,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: this.onRenderItemColumn,
      },
      {
        key: 'value',
        name: t('value'),
        fieldName: 'value',
        minWidth: 110,
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

export default withTranslation('translation')(ConnectionStrings);
