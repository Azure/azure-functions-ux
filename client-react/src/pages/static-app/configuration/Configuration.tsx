import React, { useState, useContext, useEffect } from 'react';
import ConfigurationCommandBar from './ConfigurationCommandBar';
import DisplayTableWithCommandBar from '../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import {
  ICommandBarItemProps,
  IColumn,
  SelectionMode,
  DetailsListLayoutMode,
  Link,
  TooltipHost,
  ActionButton,
  SearchBox,
  MessageBarType,
  Checkbox,
  DetailsRow,
  DetailsHeader,
} from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { EnvironmentVariable, PanelType } from './Configuration.types';
import { defaultCellStyle } from '../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import {
  formStyle,
  commandBarSticky,
  tableValueComponentStyle,
  tableValueFormFieldStyle,
  tableValueIconStyle,
  formDescriptionStyle,
  tableValueTextFieldStyle,
} from './Configuration.styles';
import { learnMoreLinkStyle, filterTextFieldStyle } from '../../../components/form-controls/formControl.override.styles';
import ConfigurationEnvironmentSelector from './ConfigurationEnvironmentSelector';
import { ArmObj } from '../../../models/arm-obj';
import { Environment } from '../../../models/static-site/environment';
import IconButton from '../../../components/IconButton/IconButton';
import { dirtyElementStyle } from '../../app/app-settings/AppSettings.styles';
import { ThemeContext } from '../../../ThemeContext';
import CustomPanel from '../../../components/CustomPanel/CustomPanel';
import ConfigurationAddEdit from './ConfigurationAddEdit';
import { sortBy } from 'lodash-es';
import { KeyValue } from '../../../models/portal-models';
import ConfigurationData from './Configuration.data';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import ConfigurationAdvancedAddEdit from './ConfigurationAdvancedAddEdit';
import CustomBanner from '../../../components/CustomBanner/CustomBanner';
import { Links } from '../../../utils/FwLinks';
import TextFieldNoFormik from '../../../components/form-controls/TextFieldNoFormik';
import { PortalContext } from '../../../PortalContext';
import { commandBarSeparator } from '../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar.style';

interface ConfigurationProps {
  environments: ArmObj<Environment>[];
  isLoading: boolean;
  hasWritePermissions: boolean;
  apiFailure: boolean;
  fetchDataOnEnvironmentChange: (resourceId: string) => {};
  saveEnvironmentVariables: (resourceId: string, environmentVariables: EnvironmentVariable[]) => void;
  refresh: () => void;
  selectedEnvironmentVariableResponse?: ArmObj<KeyValue<string>>;
  environmentHasFunctions?: boolean;
}

const Configuration: React.FC<ConfigurationProps> = props => {
  const {
    environments,
    selectedEnvironmentVariableResponse,
    saveEnvironmentVariables,
    isLoading,
    hasWritePermissions,
    apiFailure,
    fetchDataOnEnvironmentChange,
    environmentHasFunctions,
  } = props;

  const [shownValues, setShownValues] = useState<string[]>([]);
  const [showAllValues, setShowAllValues] = useState(false);
  const [environmentVariables, setEnvironmentVariables] = useState<EnvironmentVariable[]>([]);
  const [filter, setFilter] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [panelType, setPanelType] = useState<PanelType | undefined>(undefined);
  const [currentEnvironmentVariableIndex, setCurrentEnvironmentVariableIndex] = useState<number | undefined>(undefined);
  const [selectedEnvironment, setSelectedEnvironment] = useState<ArmObj<Environment> | undefined>(undefined);
  const [isDirty, setIsDirty] = useState(false);
  const [isDiscardConfirmDialogVisible, setIsDiscardConfirmDialogVisible] = useState(false);
  const [isOnChangeConfirmDialogVisible, setIsOnChangeConfirmDialogVisible] = useState(false);
  const [onChangeEnvironment, setOnChangeEnvironment] = useState<ArmObj<Environment> | undefined>(undefined);
  const [isRefreshConfirmDialogVisible, setIsRefreshConfirmDialogVisible] = useState(false);
  const [columns, setColumns] = useState<IColumn[]>([]);

  const { t } = useTranslation();

  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);

  const openAddNewEnvironmentVariablePanel = () => {
    setShowPanel(true);
    setPanelType(PanelType.edit);
  };

  const openEditEnvironmentVariablePanel = (index: number) => {
    setCurrentEnvironmentVariableIndex(index);
    setShowPanel(true);
    setPanelType(PanelType.edit);
  };

  const toggleHideButton = () => {
    let newShownValues: string[] = [];
    if (!showAllValues) {
      newShownValues = environmentVariables.map(x => x.name);
    }
    setShownValues(newShownValues);
    setShowAllValues(!showAllValues);
  };

  const openBulkEdit = () => {
    setShowPanel(true);
    setPanelType(PanelType.bulk);
  };

  const isTableCommandBarDisabled = () => {
    return isLoading || !hasWritePermissions || apiFailure;
  };

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    const allShown = showAllValues || (environmentVariables.length > 0 && shownValues.length === environmentVariables.length);

    return [
      {
        key: 'add-new-environment-variable',
        onClick: openAddNewEnvironmentVariablePanel,
        disabled: isTableCommandBarDisabled(),
        iconProps: { iconName: 'Add' },
        name: t('staticSite_addNewApplicationSetting'),
        ariaLabel: t('staticSite_ariaLabel_addNewApplicationSetting'),
      },
      {
        key: 'environment-variable-show-hide',
        onClick: toggleHideButton,
        disabled: isTableCommandBarDisabled(),
        iconProps: { iconName: !allShown ? 'RedEye' : 'Hide' },
        name: !allShown ? t('showValues') : t('hideValues'),
      },
      {
        key: 'environment-variable-bulk-edit',
        onClick: openBulkEdit,
        disabled: isTableCommandBarDisabled(),
        iconProps: { iconName: 'Edit' },
        name: t('advancedEdit'),
      },
      {
        key: 'environment-variable-bulk-delete',
        onClick: deleteBulkEnvironmentVariables,
        disabled: isTableCommandBarDisabled() || !isDeleteButtonEnabled(),
        iconProps: { iconName: 'Delete' },
        text: t('delete'),
        className: commandBarSeparator(theme),
      },
    ];
  };

  const onRenderColumnItem = (item: EnvironmentVariable, index: number, column: IColumn) => {
    const itemKey = item.name;
    const hidden = !shownValues.includes(itemKey) && !showAllValues;
    if (!column || !item) {
      return null;
    }
    if (column.key === 'edit') {
      return (
        <TooltipHost content={t('edit')} id={`environment-variable-edit-tooltip-${index}`} calloutProps={{ gapSpace: 0 }} closeDelay={500}>
          <IconButton
            className={defaultCellStyle}
            disabled={false}
            id={`environment-variable-edit-${index}`}
            iconProps={{ iconName: 'Edit' }}
            ariaLabel={t('edit')}
            onClick={() => {
              openEditEnvironmentVariablePanel(index);
            }}
          />
        </TooltipHost>
      );
    }
    if (column.key === 'value') {
      return (
        <>
          {hidden ? (
            <ActionButton
              id={`environment-variable-show-${index}`}
              className={defaultCellStyle}
              onClick={() => onShowHideButtonClick(itemKey)}
              iconProps={{ iconName: 'RedEye' }}>
              <div className={defaultCellStyle}>{t('hiddenValueClickAboveToShow')}</div>
            </ActionButton>
          ) : (
            <div className={`${tableValueComponentStyle} ${defaultCellStyle}`} onClick={() => onShowHideButtonClick(itemKey)}>
              <IconButton
                id={`environment-variable-hide-${index}`}
                className={tableValueIconStyle(theme)}
                iconProps={{ iconName: 'Hide' }}
                onClick={() => onShowHideButtonClick(itemKey)}
              />
              <div className={tableValueTextFieldStyle}>
                <TextFieldNoFormik
                  id={`environment-variable-value-${index}`}
                  value={item[column.fieldName!]}
                  copyButton={true}
                  disabled={true}
                  formControlClassName={tableValueFormFieldStyle}
                  className={defaultCellStyle}
                  widthOverride="100%"
                />
              </div>
            </div>
          )}
        </>
      );
    }
    if (column.key === 'name') {
      return (
        <ActionButton
          className={defaultCellStyle}
          disabled={false}
          id={`environment-variable-name-${index}`}
          onClick={() => {
            openEditEnvironmentVariablePanel(index);
          }}>
          <span aria-live="assertive" role="region">
            {item[column.fieldName!]}
          </span>
        </ActionButton>
      );
    }

    return <div className={defaultCellStyle}>{item[column.fieldName!]}</div>;
  };

  const getDefaultColumns = (): IColumn[] => {
    return [
      {
        key: 'name',
        name: t('nameRes'),
        fieldName: 'name',
        minWidth: 100,
        maxWidth: 220,
        isRowHeader: true,
        data: 'string',
        isPadded: true,
        isResizable: true,
        isSortedDescending: false,
        isSorted: true,
        onRender: onRenderColumnItem,
        onColumnClick: onColumnClick,
      },
      {
        key: 'value',
        name: t('value'),
        fieldName: 'value',
        minWidth: 350,
        isRowHeader: false,
        data: 'string',
        isPadded: true,
        isResizable: true,
        onRender: onRenderColumnItem,
        onColumnClick: onColumnClick,
      },
      {
        key: 'edit',
        name: t('edit'),
        fieldName: 'edit',
        minWidth: 35,
        maxWidth: 35,
        isRowHeader: false,
        isResizable: false,
        isCollapsable: false,
        onRender: onRenderColumnItem,
      },
    ];
  };

  const onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn) => {
    const currColumn = columns.filter(currCol => column.key === currCol.key)[0];
    updateColumnSortOrder(currColumn);
    sortEnvironmentVariablesByColumn(currColumn);
  };

  const updateColumnSortOrder = (currColumn: IColumn) => {
    const newColumns = [...columns];
    newColumns.forEach((newCol: IColumn) => {
      if (newCol === currColumn) {
        currColumn.isSortedDescending = !currColumn.isSortedDescending;
        currColumn.isSorted = true;
      } else {
        newCol.isSorted = false;
        newCol.isSortedDescending = true;
      }
    });
    setColumns(newColumns);
  };

  const sortEnvironmentVariablesByColumn = (currColumn: IColumn) => {
    const key = currColumn.fieldName! as keyof string;
    const newEnvironmentVariables = [...environmentVariables].sort((a: EnvironmentVariable, b: EnvironmentVariable) =>
      (currColumn.isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1
    );
    setEnvironmentVariables(newEnvironmentVariables);
  };

  const onDropdownChange = (environment: ArmObj<Environment>) => {
    if (isDirty) {
      setOnChangeEnvironment(environment);
      setIsOnChangeConfirmDialogVisible(true);
    } else {
      onEnvironmentChange(environment);
    }
  };

  const isEnvironmentVariableDirty = (item: EnvironmentVariable): boolean => {
    const initialEnvironmentVariables = getInitialEnvironmentVariables();
    const currentEnvironmentVariableIndex = initialEnvironmentVariables.findIndex(x => {
      return x.name.toLowerCase() === item.name.toLowerCase() && x.value.toLowerCase() === item.value.toLowerCase();
    });
    return currentEnvironmentVariableIndex < 0;
  };

  const onShowHideButtonClick = (itemKey: string) => {
    const hidden = !shownValues.includes(itemKey) && !showAllValues;
    const newShownValues = new Set(shownValues);
    if (hidden) {
      newShownValues.add(itemKey);
    } else {
      newShownValues.delete(itemKey);
    }
    setShowAllValues(newShownValues.size === environmentVariables.length);
    setShownValues([...newShownValues]);
  };

  const onCancel = () => {
    setShowPanel(false);
    setPanelType(undefined);
    setCurrentEnvironmentVariableIndex(undefined);
  };

  const updateEnvironmentVariable = (updatedEnvironmentVariables: EnvironmentVariable[]) => {
    setEnvironmentVariables([...updatedEnvironmentVariables]);
  };

  const sort = (environmentVariables: EnvironmentVariable[]) => {
    return sortBy(environmentVariables, e => e.name.toLocaleLowerCase());
  };

  const save = () => {
    if (!!selectedEnvironment) {
      saveEnvironmentVariables(selectedEnvironment.id, environmentVariables);
    }
  };

  const getInitialEnvironmentVariables = () => {
    if (!!selectedEnvironmentVariableResponse) {
      return sort(ConfigurationData.convertEnvironmentVariablesObjectToArray(selectedEnvironmentVariableResponse.properties));
    } else {
      return [];
    }
  };

  const getDirtyState = (newEnvironmentVariables: EnvironmentVariable[]) => {
    const initialEnvironmentVariables = getInitialEnvironmentVariables();
    return (
      newEnvironmentVariables.length !== initialEnvironmentVariables.length ||
      newEnvironmentVariables.filter(environmentVariable => {
        return (
          initialEnvironmentVariables.filter(initialEnvironmentVariable => {
            return (
              initialEnvironmentVariable.name.toLocaleLowerCase() === environmentVariable.name.toLocaleLowerCase() &&
              initialEnvironmentVariable.value === environmentVariable.value
            );
          }).length === 0
        );
      }).length > 0
    );
  };

  const initEnvironmentVariables = () => {
    setEnvironmentVariables([...getInitialEnvironmentVariables()]);
  };

  const discard = () => {
    setIsDirty(false);
    initEnvironmentVariables();
    hideDiscardConfirmDialog();
  };

  const hideDiscardConfirmDialog = () => {
    setIsDiscardConfirmDialogVisible(false);
  };

  const hideOnChangeConfirmDialog = () => {
    setIsOnChangeConfirmDialogVisible(false);
    setOnChangeEnvironment(undefined);
  };

  const onEnvironmentChange = (environment?: ArmObj<Environment>) => {
    const env: ArmObj<Environment> | undefined = onChangeEnvironment || environment;
    if (!!env) {
      fetchDataOnEnvironmentChange(env.id);
      setSelectedEnvironment(env);
    }
    hideOnChangeConfirmDialog();
  };

  const setDefaultSelectedEnvironment = () => {
    if (environments.length > 0 && !selectedEnvironment) {
      onEnvironmentChange(environments[0]);
    }
  };

  const refresh = () => {
    setIsRefreshConfirmDialogVisible(false);
    setSelectedEnvironment(undefined);
    setFilter('');
    props.refresh();
  };

  const hideRefreshConfirmDialog = () => {
    setIsRefreshConfirmDialogVisible(false);
  };

  const getBanner = () => {
    const bannerInfo = { message: '', type: MessageBarType.info };
    if (!hasWritePermissions) {
      bannerInfo.message = t('staticSite_readOnlyRbac');
    } else if (environmentHasFunctions !== undefined && !environmentHasFunctions) {
      bannerInfo.message = t('staticSite_noFunctionMessage');
    }
    return !!bannerInfo.message ? <CustomBanner message={bannerInfo.message} type={bannerInfo.type} /> : <></>;
  };

  const onRowItemCheckboxChange = (item: EnvironmentVariable) => {
    const updatedEnvironmentVariables = [...environmentVariables];
    setEnvironmentVariables(
      updatedEnvironmentVariables.map(environmentVariable => {
        if (environmentVariable.name.toLocaleLowerCase() === item.name.toLocaleLowerCase()) {
          environmentVariable.checked = !item.checked;
        }
        return environmentVariable;
      })
    );
  };

  const onHeaderItemCheckboxChange = (updatedChecked: boolean) => {
    const updatedEnvironmentVariables = [...environmentVariables];
    setEnvironmentVariables(
      updatedEnvironmentVariables.map(environmentVariable => {
        environmentVariable.checked = updatedChecked;
        return environmentVariable;
      })
    );
  };

  const onRenderRowItemCheckbox = (item: EnvironmentVariable) => {
    return (
      <Checkbox
        checked={!!item.checked}
        onChange={() => {
          onRowItemCheckboxChange(item);
        }}
      />
    );
  };

  const onRenderHeaderItemCheckbox = () => {
    const selectedEnvironmentVariables = environmentVariables.filter(environmentVariable => environmentVariable.checked).length;
    const disabled = environmentVariables.length === 0;
    const checked = !disabled && selectedEnvironmentVariables === environmentVariables.length;
    return (
      <Checkbox
        disabled={disabled}
        checked={checked}
        onChange={() => {
          onHeaderItemCheckboxChange(!checked);
        }}
      />
    );
  };

  const getFilteredItems = () => {
    return environmentVariables.filter(environmentVariable => {
      if (!filter) {
        return true;
      }
      return environmentVariable.name.toLowerCase().includes(filter.toLowerCase());
    });
  };

  const onRenderRow = rowProps => {
    const { item } = rowProps;
    let className = '';
    if (isEnvironmentVariableDirty(item)) {
      className = dirtyElementStyle(theme);
    }
    return <DetailsRow className={className} {...rowProps} onRenderCheck={() => onRenderRowItemCheckbox(item)} />;
  };

  const onRenderDetailsHeader = headerProps => {
    return <DetailsHeader {...headerProps} onRenderDetailsCheckbox={onRenderHeaderItemCheckbox} />;
  };

  const isDeleteButtonEnabled = () => {
    return environmentVariables.filter(environmentVariable => environmentVariable.checked).length > 0;
  };

  const deleteBulkEnvironmentVariables = () => {
    const updatedEnvironmentVariables = [...environmentVariables];
    setEnvironmentVariables(updatedEnvironmentVariables.filter(environmentVariable => !environmentVariable.checked));
  };

  const getConfirmDialogs = () => {
    return (
      <>
        <ConfirmDialog
          primaryActionButton={{
            title: t('ok'),
            onClick: discard,
          }}
          defaultActionButton={{
            title: t('cancel'),
            onClick: hideDiscardConfirmDialog,
          }}
          title={t('discardChangesTitle')}
          content={t('staticSite_discardChangesMesssage').format(
            !!selectedEnvironment ? ConfigurationData.getEnvironmentName(selectedEnvironment) : ''
          )}
          hidden={!isDiscardConfirmDialogVisible}
          onDismiss={hideDiscardConfirmDialog}
        />
        <ConfirmDialog
          primaryActionButton={{
            title: t('ok'),
            onClick: onEnvironmentChange,
          }}
          defaultActionButton={{
            title: t('cancel'),
            onClick: hideOnChangeConfirmDialog,
          }}
          title={t('staticSite_changeEnvironmentTitle')}
          content={t('staticSite_changeEnvironmentMessage')}
          hidden={!isOnChangeConfirmDialogVisible}
          onDismiss={hideOnChangeConfirmDialog}
        />
        <ConfirmDialog
          primaryActionButton={{
            title: t('ok'),
            onClick: refresh,
          }}
          defaultActionButton={{
            title: t('cancel'),
            onClick: hideRefreshConfirmDialog,
          }}
          title={t('staticSite_refreshConfirmTitle')}
          content={t('staticSite_refreshConfirmMessage')}
          hidden={!isRefreshConfirmDialogVisible}
          onDismiss={hideRefreshConfirmDialog}
        />
      </>
    );
  };

  const getAddEditPanel = () => {
    return (
      <CustomPanel
        isOpen={showPanel && panelType === PanelType.edit}
        onDismiss={onCancel}
        headerText={
          currentEnvironmentVariableIndex === undefined
            ? t('staticSite_addApplicationSettingHeader')
            : t('staticSite_editApplicationSettingHeader')
        }>
        <ConfigurationAddEdit
          currentEnvironmentVariableIndex={currentEnvironmentVariableIndex!}
          environmentVariables={environmentVariables}
          cancel={onCancel}
          updateEnvironmentVariable={updateEnvironmentVariable}
        />
      </CustomPanel>
    );
  };

  const getBulkAddEditPanel = () => {
    return (
      <CustomPanel isOpen={showPanel && panelType === PanelType.bulk} onDismiss={onCancel}>
        <ConfigurationAdvancedAddEdit
          environmentVariables={environmentVariables}
          cancel={onCancel}
          updateEnvironmentVariable={updateEnvironmentVariable}
        />
      </CustomPanel>
    );
  };

  const getTable = () => {
    return (
      <DisplayTableWithCommandBar
        commandBarItems={getCommandBarItems()}
        columns={columns}
        items={getFilteredItems()}
        isHeaderVisible={true}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.multiple}
        selectionPreservedOnEmptyClick={true}
        emptyMessage={t('staticSite_emptyApplicationSettingList')}
        shimmer={{ lines: 2, show: isLoading }}
        onRenderRow={onRenderRow}
        onRenderDetailsHeader={onRenderDetailsHeader}>
        <SearchBox
          id="environment-variable-search"
          className="ms-slideDownIn20"
          autoFocus
          iconProps={{ iconName: 'Filter' }}
          styles={filterTextFieldStyle}
          placeholder={t('staticSite_filterApplicationSetting')}
          onChange={newValue => setFilter(newValue)}
          value={filter}
          disabled={isTableCommandBarDisabled()}
        />
      </DisplayTableWithCommandBar>
    );
  };

  useEffect(() => {
    setDefaultSelectedEnvironment();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environments]);

  useEffect(() => {
    const dirtyState = getDirtyState(environmentVariables);
    setIsDirty(dirtyState);
    portalContext.updateDirtyState(dirtyState);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentVariables]);

  useEffect(() => {
    initEnvironmentVariables();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEnvironmentVariableResponse]);

  useEffect(() => {
    setColumns(getDefaultColumns());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shownValues, environmentVariables]);

  return (
    <>
      <div className={commandBarSticky}>
        <ConfigurationCommandBar
          save={save}
          dirty={isDirty}
          isLoading={isLoading}
          showDiscardConfirmDialog={() => setIsDiscardConfirmDialogVisible(true)}
          refresh={() => {
            if (isDirty) {
              setIsRefreshConfirmDialogVisible(true);
            } else {
              refresh();
            }
          }}
        />
      </div>
      {getBanner()}
      {getConfirmDialogs()}
      <div className={formStyle}>
        <h3>{t('staticSite_applicationSettings')}</h3>
        <p className={formDescriptionStyle}>
          <span id="environment-variable-info-message">{t('staticSite_applicationSettingsInfoMessage')}</span>
          <Link
            id="environment-variable-info-learnMore"
            href={Links.staticSiteEnvironmentVariablesLearnMore}
            target="_blank"
            className={learnMoreLinkStyle}
            aria-labelledby="environment-variable-info-message">
            {` ${t('learnMore')}`}
          </Link>
        </p>
        <ConfigurationEnvironmentSelector
          environments={environments}
          onDropdownChange={onDropdownChange}
          disabled={isLoading || !hasWritePermissions}
          selectedEnvironment={selectedEnvironment}
        />
        {getTable()}
        {getAddEditPanel()}
        {getBulkAddEditPanel()}
      </div>
    </>
  );
};

export default Configuration;
