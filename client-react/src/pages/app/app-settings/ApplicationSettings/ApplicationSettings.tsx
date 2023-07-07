/* eslint-disable react-hooks/rules-of-hooks */
import React, { lazy, Suspense, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { defaultCellStyle } from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import IconButton from '../../../../components/IconButton/IconButton';
import { AppSettingsFormikPropsCombined, FormAppSetting } from '../AppSettings.types';
import AppSettingAddEdit from './AppSettingAddEdit';
import { PermissionsContext } from '../Contexts';
import {
  TooltipHost,
  ICommandBarItemProps,
  ActionButton,
  DetailsListLayoutMode,
  IColumn,
  SelectionMode,
  IDetailsList,
  IDetailsRowStyles,
  DetailsRow,
  IDetailsListProps,
} from '@fluentui/react';
import { sortBy } from 'lodash-es';
import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import { dirtyElementStyle } from '../AppSettings.styles';
import { isLinuxApp } from '../../../../utils/arm-utils';
import DisplayTableWithCommandBar from '../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import { ThemeContext } from '../../../../ThemeContext';
import { linkCellStyle } from '../../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar.style';
import SettingSourceColumn from '../SettingSourceColumn';
import { isServiceLinkerVisible, isSettingServiceLinker } from '../AppSettings.utils';
import { SearchFilterWithResultAnnouncement } from '../../../../components/form-controls/SearchBox';

const AppSettingsBulkEdit = lazy(() => import(/* webpackChunkName:"appsettingsAdvancedEdit" */ './AppSettingsBulkEdit'));

const ApplicationSettings: React.FC<AppSettingsFormikPropsCombined> = props => {
  const { production_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !editable || saving;
  const [showPanel, setShowPanel] = useState(false);
  const [panelItem, setPanelItem] = useState('add');
  const [currentAppSetting, setCurrentAppSetting] = useState<FormAppSetting | null>(null);
  const [shownValues, setShownValues] = useState<string[]>([]);
  const [filter, setFilter] = useState('');
  const [showAllValues, setShowAllValues] = useState(false);
  const [gridItems, setGridItems] = useState<FormAppSetting[]>([]);

  const { values } = props;
  const { t } = useTranslation();

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
        role: 'button',
      },
      {
        key: 'app-settings-application-settings-show-hide',
        onClick: flipHideSwitch,
        iconProps: { iconName: !allShown ? 'RedEye' : 'Hide' },
        name: !allShown ? t('showValues') : t('hideValues'),
        role: 'button',
      },
      {
        key: 'app-settings-application-settings-bulk-edit',
        onClick: openBulkEdit,
        disabled: disableAllControls,
        iconProps: { iconName: 'Edit' },
        name: t('advancedEdit'),
        role: 'button',
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

  const onRenderRow: IDetailsListProps['onRenderRow'] = props => {
    const customStyles: Partial<IDetailsRowStyles> = {};
    if (props) {
      if (isAppSettingDirty(props?.itemIndex)) {
        customStyles.fields = dirtyElementStyle(theme);
      }

      return <DetailsRow {...props} styles={customStyles} />;
    }
    return null;
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
            onClick={() => onDeleteButtonClick(item)}
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
            onClick={() => onEditButtonClick(item)}
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
      return (
        <ActionButton
          className={defaultCellStyle}
          disabled={disableAllControls}
          id={`app-settings-application-settings-name-${index}`}
          onClick={() => onEditButtonClick(item)}
          ariaLabel={item[column.fieldName!]}>
          <span aria-live="assertive" role="region">
            {item[column.fieldName!]}
          </span>
        </ActionButton>
      );
    }
    if (column.key === 'source') {
      if (values.references && values.references.appSettings) {
        return <SettingSourceColumn name={item.name} value={item.value} references={values.references.appSettings} />;
      }
    }
    return <div className={defaultCellStyle}>{item[column.fieldName!]}</div>;
  };

  const isAppSettingDirty = (index: number): boolean => {
    const initialAppSettings = props.initialValues.appSettings;
    const currentRow = gridItems[index];
    const currentAppSettingIndex = initialAppSettings.findIndex(x => {
      return (
        x.name.toLowerCase() === currentRow.name.toLowerCase() &&
        x.value.toLowerCase() === currentRow.value.toLowerCase() &&
        x.sticky === currentRow.sticky
      );
    });
    return currentAppSettingIndex < 0;
  };

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
        isCollapsible: false,
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
        isCollapsible: false,
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
        isCollapsible: false,
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
        isCollapsible: false,
        onRender: onRenderItemColumn,
      },
    ];
    return values.references ? columns : columns.filter(column => column.key !== 'source');
  };

  const onEditButtonClick = async (item: FormAppSetting) => {
    if (isServiceLinkerVisible() && isSettingServiceLinker(item.name) && !!props.onServiceLinkerUpdateClick) {
      await props.onServiceLinkerUpdateClick(item.name);
    } else {
      onShowPanel(item);
    }
  };

  const onDeleteButtonClick = async (item: FormAppSetting) => {
    if (isServiceLinkerVisible() && isSettingServiceLinker(item.name) && !!props.onServiceLinkerDeleteClick) {
      await props.onServiceLinkerDeleteClick(item.name);
    } else {
      removeItem(item.name);
    }
  };

  if (!values.appSettings) {
    return null;
  }

  const setFilteredGridItems = (appSettings: FormAppSetting[], filter: string) => {
    const filteredItems =
      appSettings?.filter(x => {
        if (!filter) {
          return true;
        }
        return !!x.name && x.name.toLowerCase().includes(filter.toLowerCase());
      }) ?? [];
    setGridItems(filteredItems);
  };

  useEffect(() => {
    setFilteredGridItems(values.appSettings, filter);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.appSettings, filter]);

  return (
    <>
      <DisplayTableWithCommandBar
        onRenderRow={onRenderRow}
        commandBarItems={getCommandBarItems()}
        items={gridItems}
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
        ariaLabelForGrid={t('applicationSettings')}
        emptyMessage={t('emptyAppSettings')}>
        <SearchFilterWithResultAnnouncement
          id="app-settings-application-settings-search"
          setFilterValue={setFilter}
          filter={filter}
          gridItemsCount={gridItems.length}
          placeHolder={t('filterAppSettings')}
        />
      </DisplayTableWithCommandBar>
      <CustomPanel isOpen={showPanel && panelItem === 'add'} onDismiss={onCancel} headerText={t('addEditApplicationSetting')}>
        <AppSettingAddEdit
          site={values.site}
          appSetting={currentAppSetting!}
          disableSlotSetting={!production_write}
          otherAppSettings={values.appSettings.filter(val => val.name.toLowerCase() !== (currentAppSetting?.name ?? '').toLowerCase())}
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

export default ApplicationSettings;
