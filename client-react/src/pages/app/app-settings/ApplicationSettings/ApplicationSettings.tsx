import { FormikProps } from 'formik';
import { ActionButton, IButtonProps } from 'office-ui-fabric-react/lib/Button';
import { DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

import DisplayTableWithEmptyMessage, {
  defaultCellStyle,
} from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import IconButton from '../../../../components/IconButton/IconButton';
import { AppSettingsFormValues, FormAppSetting } from '../AppSettings.types';
import AppSettingAddEdit from './AppSettingAddEdit';
import { PermissionsContext } from '../Contexts';
import AppSettingsBulkEdit from './AppSettingsBulkEdit';
import { Coachmark } from 'office-ui-fabric-react/lib/Coachmark';
import { TeachingBubbleContent } from 'office-ui-fabric-react/lib/TeachingBubble';
import { DirectionalHint } from 'office-ui-fabric-react';
import { sortBy } from 'lodash-es';

interface ApplicationSettingsState {
  hideValues: boolean;
  showPanel: boolean;
  panelItem: 'add' | 'bulk';
  currentAppSetting: FormAppSetting | null;
  currentItemIndex: number;
  createNewItem: boolean;
  coachMarkVisible: boolean;
}

export class ApplicationSettings extends React.Component<FormikProps<AppSettingsFormValues> & WithTranslation, ApplicationSettingsState> {
  public static contextType = PermissionsContext;
  private _targetButton = React.createRef<HTMLDivElement>();
  constructor(props) {
    super(props);
    this.state = {
      hideValues: true,
      showPanel: false,
      panelItem: 'add',
      currentAppSetting: null,
      currentItemIndex: -1,
      createNewItem: false,
      coachMarkVisible: false,
    };
  }

  public componentDidMount = () => {
    let showCoachMark = false;
    if (window.localStorage) {
      const localStorageKey = 'app-settings-bulk-edit-coachmark';
      const hasShownCoachmark = window.localStorage.getItem(localStorageKey);
      showCoachMark = !hasShownCoachmark;
      window.localStorage.setItem(localStorageKey, 'true');
    }
    if (showCoachMark) {
      setTimeout(() => {
        this.setState({
          coachMarkVisible: true,
        });
      }, 1000);
    }
  };

  public render() {
    const { t } = this.props;
    const { production_write, editable } = this.context;
    const buttonProps: IButtonProps = {
      text: t('dismiss'),
      onClick: this._onDismissCoachmark,
    };
    if (!this.props.values.appSettings) {
      return null;
    }
    return (
      <>
        <ActionButton
          id="app-settings-application-settings-add"
          onClick={this.createNewItem}
          disabled={!editable}
          styles={{ root: { marginTop: '5px' } }}
          iconProps={{ iconName: 'Add' }}>
          {t('newApplicationSetting')}
        </ActionButton>
        <ActionButton
          id="app-settings-application-settings-show-hide"
          onClick={this.flipHideSwitch}
          componentRef={ref => {
            (this._targetButton.current as any) = ref;
          }}
          styles={{ root: { marginTop: '5px' } }}
          iconProps={{ iconName: this.state.hideValues ? 'RedEye' : 'Hide' }}>
          {this.state.hideValues ? t('showValues') : t('hideValues')}
        </ActionButton>

        <div ref={this._targetButton} style={{ display: 'inline-block' }}>
          <ActionButton
            id="app-settings-application-settings-bulk-edit"
            onClick={this._openBulkEdit}
            disabled={!editable}
            styles={{ root: { marginTop: '5px' } }}
            iconProps={{ iconName: 'Edit' }}>
            {t('advancedEdit')}
          </ActionButton>
        </div>
        <Panel
          isOpen={this.state.showPanel && this.state.panelItem === 'add'}
          type={PanelType.smallFixedFar}
          onDismiss={this.onCancel}
          headerText={t('newApplicationSetting')}
          closeButtonAriaLabel={t('close')}>
          <AppSettingAddEdit
            appSetting={this.state.currentAppSetting!}
            disableSlotSetting={!production_write}
            otherAppSettings={this.props.values.appSettings}
            updateAppSetting={this.onClosePanel.bind(this)}
            closeBlade={this.onCancel}
          />
        </Panel>
        <Panel
          isOpen={this.state.showPanel && this.state.panelItem === 'bulk'}
          type={PanelType.medium}
          onDismiss={this.onCancel}
          closeButtonAriaLabel={t('close')}>
          <AppSettingsBulkEdit
            updateAppSetting={this._saveBulkEdit}
            closeBlade={this.onCancel}
            appSettings={this.props.values.appSettings}
          />
        </Panel>
        {this.state.coachMarkVisible && (
          <Coachmark
            target={this._targetButton.current}
            positioningContainerProps={{
              directionalHint: DirectionalHint.rightCenter,
              doNotLayer: false,
            }}
            ariaAlertText={t('aCoachmarkHasAppearedAriaAlert')}
            ariaDescribedByText={t('coachMarkAriaDescription')}>
            <TeachingBubbleContent
              headline={t('advancedEdit')}
              hasCloseIcon={true}
              closeButtonAriaLabel={t('close')}
              primaryButtonProps={buttonProps}
              onDismiss={this._onDismissCoachmark}>
              {t('advancedEditCoachmarkDesc')}
            </TeachingBubbleContent>
          </Coachmark>
        )}
        <DisplayTableWithEmptyMessage
          items={this.props.values.appSettings}
          columns={this.getColumns()}
          isHeaderVisible={true}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          selectionPreservedOnEmptyClick={true}
          emptyMessage={t('emptyAppSettings')}
        />
      </>
    );
  }

  private flipHideSwitch = () => {
    this.setState({ hideValues: !this.state.hideValues, coachMarkVisible: true });
  };

  private _onDismissCoachmark = (): void => {
    this.setState({
      coachMarkVisible: false,
    });
  };

  private _openBulkEdit = () => {
    this.setState({
      showPanel: true,
      panelItem: 'bulk',
    });
  };

  private _saveBulkEdit = (appSettings: FormAppSetting[]) => {
    this.props.setFieldValue('appSettings', sortBy(appSettings, o => o.name.toLowerCase()));
    this.setState({ createNewItem: false, showPanel: false });
  };
  private createNewItem = () => {
    const blankAppSetting = {
      name: '',
      value: '',
      sticky: false,
    };
    this.setState({
      showPanel: true,
      panelItem: 'add',
      currentAppSetting: blankAppSetting,
      createNewItem: true,
      currentItemIndex: -1,
    });
  };

  private onClosePanel = (item: FormAppSetting): void => {
    const appSettings: FormAppSetting[] = [...this.props.values.appSettings];
    if (!this.state.createNewItem) {
      appSettings[this.state.currentItemIndex] = item;
    } else {
      appSettings.push(item);
    }
    this.props.setFieldValue('appSettings', sortBy(appSettings, o => o.name.toLowerCase()));
    this.setState({ createNewItem: false, showPanel: false });
  };

  private onCancel = (): void => {
    this.setState({ createNewItem: false, showPanel: false });
  };

  private onShowPanel = (item: FormAppSetting, index: number): void => {
    this.setState({
      showPanel: true,
      panelItem: 'add',
      currentAppSetting: item,
      currentItemIndex: index,
    });
  };

  private removeItem(index: number) {
    const appSettings: FormAppSetting[] = [...this.props.values.appSettings];
    appSettings.splice(index, 1);
    this.props.setFieldValue('appSettings', appSettings);
  }

  private onRenderItemColumn = (item: FormAppSetting, index: number, column: IColumn) => {
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
          id={`app-settings-application-settings-delete-${index}`}
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
          disabled={!editable}
          id={`app-settings-application-settings-edit-${index}`}
          iconProps={{ iconName: 'Edit' }}
          ariaLabel={t('edit')}
          title={t('edit')}
          onClick={() => this.onShowPanel(item, index)}
        />
      );
    }
    if (column.key === 'sticky') {
      return item.sticky ? (
        <IconButton
          className={defaultCellStyle}
          id={`app-settings-application-settings-sticky-${index}`}
          iconProps={{ iconName: 'CheckMark' }}
          title={t('sticky')}
          ariaLabel={t('slotSettingOn')}
        />
      ) : null;
    }
    if (column.key === 'value') {
      return this.state.hideValues ? (
        <div className={defaultCellStyle}>{t('hiddenValueClickAboveToShow')}</div>
      ) : (
        <div className={defaultCellStyle} id={`app-settings-application-settings-value-${index}`}>
          {item[column.fieldName!]}
        </div>
      );
    }
    if (column.key === 'name') {
      return (
        <div className={defaultCellStyle} id={`app-settings-application-settings-name-${index}`}>
          {item[column.fieldName!]}
        </div>
      );
    }
    return <div className={defaultCellStyle}>{item[column.fieldName!]}</div>;
  };

  // tslint:disable-next-line:member-ordering
  private getColumns = () => {
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
        onRender: this.onRenderItemColumn,
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

export default withTranslation('translation')(ApplicationSettings);
