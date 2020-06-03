import { FormikProps } from 'formik';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { DetailsListLayoutMode, IColumn, SelectionMode, IDetailsList } from 'office-ui-fabric-react/lib/DetailsList';
import React, { lazy, Suspense, useState, useContext } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { defaultCellStyle } from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import IconButton from '../../../../components/IconButton/IconButton';
import { AppSettingsFormValues, FormAppSetting, AppSettingReferenceSummary } from '../AppSettings.types';
import AppSettingAddEdit from './AppSettingAddEdit';
import { PermissionsContext } from '../Contexts';
import { SearchBox, TooltipHost, ICommandBarItemProps, Icon } from 'office-ui-fabric-react';
import { sortBy } from 'lodash-es';
import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import { dirtyElementStyle, keyVaultIconStyle, sourceTextStyle } from '../AppSettings.styles';
import { isLinuxApp } from '../../../../utils/arm-utils';
import DisplayTableWithCommandBar from '../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import { ThemeContext } from '../../../../ThemeContext';
import { filterTextFieldStyle } from '../../../../components/form-controls/formControl.override.styles';
import { linkCellStyle } from '../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar.style';

const AppSettingsBulkEdit = lazy(() => import(/* webpackChunkName:"appsettingsAdvancedEdit" */ './AppSettingsBulkEdit'));

const ApplicationSettings: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
  const { production_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !editable || saving;
  const [showPanel, setShowPanel] = useState(false);
  const [panelItem, setPanelItem] = useState('add');
  const [currentAppSetting, setCurrentAppSetting] = useState<FormAppSetting | null>(null);
  const [shownValues, setShownValues] = useState<string[]>([]);
  const [filter, setFilter] = useState('');
  const [showAllValues, setShowAllValues] = useState(false);

  const { t, values } = props;

  const theme = useContext(ThemeContext);
  let appSettingsTable: IDetailsList;

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    const allShown = showAllValues || (values.appSettings.length > 0 && shownValues.length === values.appSettings.length);

    return [
      {
        key: 'app-settings-application-settings-add',
        onClick: createNewItem,
        disabled: disableAllControls,
        iconProps: { iconName: 'Add' },
        name: t('newApplicationSetting'),
        ariaLabel: t('addNewSetting'),
      },
      {
        key: 'app-settings-application-settings-show-hide',
        onClick: flipHideSwitch,
        iconProps: { iconName: !allShown ? 'RedEye' : 'Hide' },
        name: !allShown ? t('showValues') : t('hideValues'),
      },
      {
        key: 'app-settings-application-settings-bulk-edit',
        onClick: openBulkEdit,
        disabled: disableAllControls,
        iconProps: { iconName: 'Edit' },
        name: t('advancedEdit'),
      },
    ];
  };

  const flipHideSwitch = () => {
    let newShownValues: string[] = [];
    if (!showAllValues) {
      newShownValues = values.appSettings.map(x => x.name);
    }
    setShownValues(newShownValues);
    setShowAllValues(!showAllValues);
  };

  const openBulkEdit = () => {
    setShowPanel(true);
    setPanelItem('bulk');
  };

  const saveBulkEdit = (appSettings: FormAppSetting[]) => {
    const newAppSettings = sortBy(appSettings, o => o.name.toLowerCase());
    props.setFieldValue('appSettings', newAppSettings);
    setShowPanel(false);
  };

  const createNewItem = () => {
    const blankAppSetting = {
      name: '',
      value: '',
      sticky: false,
    };
    setShowPanel(true);
    setPanelItem('add');
    setCurrentAppSetting(blankAppSetting);
  };

  const getAppSettingIndex = (item: FormAppSetting, appSettings: FormAppSetting[]): number => {
    return appSettings.findIndex(
      x =>
        x.name.toLowerCase() === item.name.toLowerCase() ||
        (!!currentAppSetting && currentAppSetting.name.toLowerCase() === x.name.toLowerCase())
    );
  };

  const onClosePanel = (item: FormAppSetting): void => {
    let appSettings: FormAppSetting[] = [...values.appSettings];
    let index = getAppSettingIndex(item, appSettings);
    if (index !== -1) {
      appSettings[index] = item;
    } else {
      appSettings.push(item);
    }
    appSettings = sortBy(appSettings, o => o.name.toLowerCase());
    props.setFieldValue('appSettings', appSettings);
    setShowPanel(false);
    index = getAppSettingIndex(item, appSettings);
    appSettingsTable.focusIndex(index);
  };

  const onCancel = (): void => {
    setShowPanel(false);
  };

  const onShowPanel = (item: FormAppSetting): void => {
    setShowPanel(true);
    setPanelItem('add');
    setCurrentAppSetting(item);
  };

  const removeItem = (key: string) => {
    const appSettings: FormAppSetting[] = [...values.appSettings].filter(val => val.name !== key);
    props.setFieldValue('appSettings', appSettings);
  };

  const onShowHideButtonClick = (itemKey: string) => {
    const hidden = !shownValues.includes(itemKey) && !showAllValues;
    const newShownValues = new Set(shownValues);
    if (hidden) {
      newShownValues.add(itemKey);
    } else {
      newShownValues.delete(itemKey);
    }
    setShowAllValues(newShownValues.size === values.appSettings.length);
    setShownValues([...newShownValues]);
  };

  const onRenderItemColumn = (item: FormAppSetting, index: number, column: IColumn) => {
    const itemKey = item.name;
    const hidden = !shownValues.includes(itemKey) && !showAllValues;
    if (!column || !item) {
      return null;
    }

    if (column.key === 'delete') {
      return (
        <TooltipHost
          content={t('delete')}
          id={`app-settings-application-settings-delete-tooltip-${index}`}
          calloutProps={{ gapSpace: 0 }}
          closeDelay={500}>
          <IconButton
            className={defaultCellStyle}
            disabled={disableAllControls}
            id={`app-settings-application-settings-delete-${index}`}
            iconProps={{ iconName: 'Delete' }}
            ariaLabel={t('delete')}
            onClick={() => removeItem(itemKey)}
          />
        </TooltipHost>
      );
    }
    if (column.key === 'edit') {
      return (
        <TooltipHost
          content={t('edit')}
          id={`app-settings-application-settings-edit-tooltip-${index}`}
          calloutProps={{ gapSpace: 0 }}
          closeDelay={500}>
          <IconButton
            className={defaultCellStyle}
            disabled={disableAllControls}
            id={`app-settings-application-settings-edit-${index}`}
            iconProps={{ iconName: 'Edit' }}
            ariaLabel={t('edit')}
            onClick={() => onShowPanel(item)}
          />
        </TooltipHost>
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
      return (
        <>
          <ActionButton
            id={`app-settings-application-settings-show-hide-${index}`}
            className={`${defaultCellStyle} ${linkCellStyle(theme)}`}
            onClick={() => onShowHideButtonClick(itemKey)}
            iconProps={{ iconName: hidden ? 'RedEye' : 'Hide' }}>
            {hidden ? (
              <div className={defaultCellStyle}>{t('hiddenValueClickAboveToShow')}</div>
            ) : (
              <div className={defaultCellStyle} id={`app-settings-application-settings-value-${index}`}>
                {item[column.fieldName!]}
              </div>
            )}
          </ActionButton>
        </>
      );
    }
    if (column.key === 'name') {
      column.className = '';
      if (isAppSettingDirty(index)) {
        column.className = dirtyElementStyle(theme);
      }
      return (
        <ActionButton
          className={defaultCellStyle}
          disabled={disableAllControls}
          id={`app-settings-application-settings-name-${index}`}
          onClick={() => onShowPanel(item)}
          ariaLabel={item[column.fieldName!]}>
          <span aria-live="assertive" role="region">
            {item[column.fieldName!]}
          </span>
        </ActionButton>
      );
    }
    if (column.key === 'source') {
      if (values.references && values.references.appSettings) {
        const appSettingReference = values.references.appSettings.filter(ref => ref.name === item.name);
        return appSettingReference.length > 0 ? (
          <div
            className={defaultCellStyle}
            aria-label={`${t('azureKeyVault')} ${!isAppSettingReferenceResolved(appSettingReference[0]) && 'not'} resolved`}>
            <Icon
              iconName={isAppSettingReferenceResolved(appSettingReference[0]) ? 'Completed' : 'ErrorBadge'}
              className={keyVaultIconStyle(theme, isAppSettingReferenceResolved(appSettingReference[0]))}
              ariaLabel={t('azureKeyVault')}
            />
            <span className={sourceTextStyle}>{t('azureKeyVault')}</span>
          </div>
        ) : (
          <div className={defaultCellStyle} aria-label={t('appConfigValue')}>
            {t('appConfigValue')}
          </div>
        );
      }
    }
    return <div className={defaultCellStyle}>{item[column.fieldName!]}</div>;
  };

  const isAppSettingReferenceResolved = (reference: AppSettingReferenceSummary) => {
    return reference.status.toLowerCase() === 'resolved';
  };

  const isAppSettingDirty = (index: number): boolean => {
    const initialAppSettings = props.initialValues.appSettings;
    const currentRow = values.appSettings[index];
    const currentAppSettingIndex = initialAppSettings.findIndex(x => {
      return (
        x.name.toLowerCase() === currentRow.name.toLowerCase() &&
        x.value.toLowerCase() === currentRow.value.toLowerCase() &&
        x.sticky === currentRow.sticky
      );
    });
    return currentAppSettingIndex < 0;
  };

  // tslint:disable-next-line:member-ordering
  const getColumns = () => {
    const columns = [
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
        onRender: onRenderItemColumn,
      },
      {
        key: 'value',
        name: t('value'),
        fieldName: 'value',
        minWidth: 210,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: onRenderItemColumn,
      },
      {
        key: 'source',
        name: t('source'),
        fieldName: 'source',
        minWidth: 180,
        maxWidth: 180,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: false,
        isCollapsable: false,
        onRender: onRenderItemColumn,
      },
      {
        key: 'sticky',
        name: t('sticky'),
        fieldName: 'sticky',
        minWidth: 180,
        maxWidth: 180,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: false,
        isCollapsable: false,
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
    return !!values.references ? columns : columns.filter(column => column.key !== 'source');
  };

  if (!values.appSettings) {
    return null;
  }

  return (
    <>
      <DisplayTableWithCommandBar
        commandBarItems={getCommandBarItems()}
        items={values.appSettings.filter(x => {
          if (!filter) {
            return true;
          }
          return x.name.toLowerCase().includes(filter.toLowerCase());
        })}
        columns={getColumns()}
        componentRef={table => {
          if (table) {
            appSettingsTable = table;
          }
        }}
        isHeaderVisible={true}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        selectionPreservedOnEmptyClick={true}
        emptyMessage={t('emptyAppSettings')}>
        <SearchBox
          id="app-settings-application-settings-search"
          className="ms-slideDownIn20"
          autoFocus
          iconProps={{ iconName: 'Filter' }}
          styles={filterTextFieldStyle}
          placeholder={t('filterAppSettings')}
          onChange={newValue => setFilter(newValue)}
        />
      </DisplayTableWithCommandBar>
      <CustomPanel isOpen={showPanel && panelItem === 'add'} onDismiss={onCancel} headerText={t('addEditApplicationSetting')}>
        <AppSettingAddEdit
          site={values.site}
          appSetting={currentAppSetting!}
          disableSlotSetting={!production_write}
          otherAppSettings={values.appSettings}
          updateAppSetting={onClosePanel}
          closeBlade={onCancel}
        />
      </CustomPanel>
      <CustomPanel isOpen={showPanel && panelItem === 'bulk'} onDismiss={onCancel}>
        <Suspense fallback={<LoadingComponent />}>
          <AppSettingsBulkEdit
            isLinux={isLinuxApp(values.site)}
            updateAppSetting={saveBulkEdit}
            closeBlade={onCancel}
            appSettings={values.appSettings}
            disableSlotSetting={!production_write}
          />
        </Suspense>
      </CustomPanel>
    </>
  );
};

export default withTranslation('translation')(ApplicationSettings);
