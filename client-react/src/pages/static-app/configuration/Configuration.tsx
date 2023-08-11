import {
  ActionButton,
  Checkbox,
  DetailsHeader,
  DetailsListLayoutMode,
  DetailsRow,
  IColumn,
  ICommandBarItemProps,
  Link,
  ProgressIndicator,
  SelectionMode,
  TooltipHost,
} from '@fluentui/react';
import { sortBy } from 'lodash-es';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import CustomPanel from '../../../components/CustomPanel/CustomPanel';
import DisplayTableWithCommandBar from '../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar';
import { commandBarSeparator } from '../../../components/DisplayTableWithCommandBar/DisplayTableWithCommandBar.style';
import { defaultCellStyle } from '../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import { learnMoreLinkStyle } from '../../../components/form-controls/formControl.override.styles';
import { getSearchFilter } from '../../../components/form-controls/SearchBox';
import TextFieldNoFormik from '../../../components/form-controls/TextFieldNoFormik';
import IconButton from '../../../components/IconButton/IconButton';
import { ArmObj } from '../../../models/arm-obj';
import { Environment } from '../../../models/static-site/environment';
import { PortalContext } from '../../../PortalContext';
import { ThemeContext } from '../../../ThemeContext';
import { Links } from '../../../utils/FwLinks';
import { dirtyElementStyle } from '../../app/app-settings/AppSettings.styles';
import ConfigurationData from './Configuration.data';
import {
  formDescriptionStyle,
  formStyle,
  tableValueComponentStyle,
  tableValueFormFieldStyle,
  tableValueIconStyle,
  tableValueTextFieldStyle,
} from './Configuration.styles';
import { ConfigurationProps, EnvironmentVariable, PanelType } from './Configuration.types';
import ConfigurationAddEdit from './ConfigurationAddEdit';
import ConfigurationAdvancedAddEdit from './ConfigurationAdvancedAddEdit';
import ConfigurationEnvironmentSelector from './ConfigurationEnvironmentSelector';

const Configuration: React.FC<ConfigurationProps> = (props: ConfigurationProps) => {
  const {
    selectedEnvironmentVariableResponse,
    isLoading,
    hasWritePermissions,
    apiFailure,
    fetchDataOnEnvironmentChange,
    formProps,
    isRefreshing,
  } = props;
  const { values } = formProps;

  const [shownValues, setShownValues] = useState<string[]>([]);
  const [showAllValues, setShowAllValues] = useState(false);
  const [filter, setFilter] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [panelType, setPanelType] = useState<PanelType | undefined>(undefined);
  const [currentEnvironmentVariableIndex, setCurrentEnvironmentVariableIndex] = useState<number | undefined>(undefined);
  const [isDirty, setIsDirty] = useState(false);
  const [onChangeEnvironment, setOnChangeEnvironment] = useState<ArmObj<Environment> | undefined>(undefined);
  const [columns, setColumns] = useState<IColumn[]>([]);
  const [isOnChangeConfirmDialogVisible, setIsOnChangeConfirmDialogVisible] = useState(false);
  const [isEnvironmentChange, setIsEnvironmentChange] = useState(false);

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
      newShownValues = values.environmentVariables ? values.environmentVariables.map(x => x.name) : [];
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
    const allShown =
      showAllValues ||
      (!!values.environmentVariables &&
        values.environmentVariables.length > 0 &&
        shownValues.length === values.environmentVariables.length);

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
        isCollapsible: false,
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
    const newEnvironmentVariables = values.environmentVariables
      ? [...values.environmentVariables].sort((a: EnvironmentVariable, b: EnvironmentVariable) =>
          (currColumn.isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1
        )
      : [];
    formProps.setFieldValue('environmentVariables', newEnvironmentVariables);
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
    setShowAllValues(!!values.environmentVariables && newShownValues.size === values.environmentVariables.length);
    setShownValues([...newShownValues]);
  };

  const onCancel = () => {
    setShowPanel(false);
    setPanelType(undefined);
    setCurrentEnvironmentVariableIndex(undefined);
  };

  const updateEnvironmentVariable = (updatedEnvironmentVariables: EnvironmentVariable[]) => {
    formProps.setFieldValue('environmentVariables', [...updatedEnvironmentVariables]);
  };

  const sort = (environmentVariables: EnvironmentVariable[]) => {
    return sortBy(environmentVariables, e => e.name.toLocaleLowerCase());
  };

  const getInitialEnvironmentVariables = () => {
    if (selectedEnvironmentVariableResponse) {
      return sort(ConfigurationData.convertEnvironmentVariablesObjectToArray(selectedEnvironmentVariableResponse.properties));
    } else {
      return [];
    }
  };

  const getDirtyState = (newEnvironmentVariables: EnvironmentVariable[]) => {
    const initialEnvironmentVariables = getInitialEnvironmentVariables() || [];
    return newEnvironmentVariables
      ? newEnvironmentVariables.length !== initialEnvironmentVariables.length ||
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
      : false;
  };

  const hideOnChangeConfirmDialog = () => {
    setIsOnChangeConfirmDialogVisible(false);
    setOnChangeEnvironment(undefined);
  };

  const onEnvironmentChange = async (environment?: ArmObj<Environment>) => {
    const env: ArmObj<Environment> | undefined = onChangeEnvironment || environment;
    if (env) {
      setIsEnvironmentChange(true);
      await fetchDataOnEnvironmentChange(env.id);
      formProps.setFieldValue('selectedEnvironment', env);
      setIsEnvironmentChange(false);
    }
    hideOnChangeConfirmDialog();
  };

  const onRowItemCheckboxChange = (item: EnvironmentVariable) => {
    const updatedEnvironmentVariables = values.environmentVariables ? [...values.environmentVariables] : [];
    formProps.setFieldValue(
      'environmentVariables',
      updatedEnvironmentVariables.map(environmentVariable => {
        if (environmentVariable.name.toLocaleLowerCase() === item.name.toLocaleLowerCase()) {
          environmentVariable.checked = !item.checked;
        }
        return environmentVariable;
      })
    );
  };

  const onHeaderItemCheckboxChange = (updatedChecked: boolean) => {
    const updatedEnvironmentVariables = values.environmentVariables ? [...values.environmentVariables] : [];
    formProps.setFieldValue(
      'environmentVariables',
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
    const disabled = values.environmentVariables && values.environmentVariables.length === 0;
    const checked = getCheckedValueForCheckBox(disabled);
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

  const getCheckedValueForCheckBox = (disabled: boolean) => {
    const selectedEnvironmentVariables = values.environmentVariables?.filter(environmentVariable => environmentVariable.checked) ?? [];
    return !disabled && !!values.environmentVariables && selectedEnvironmentVariables.length === values.environmentVariables.length;
  };

  const getFilteredItems = () => {
    return (
      values.environmentVariables?.filter(environmentVariable => {
        return !filter || environmentVariable.name.toLowerCase().includes(filter.toLowerCase());
      }) ?? []
    );
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
    return values.environmentVariables && values.environmentVariables.filter(environmentVariable => environmentVariable.checked).length > 0;
  };

  const deleteBulkEnvironmentVariables = () => {
    const updatedEnvironmentVariables = values.environmentVariables ? [...values.environmentVariables] : [];
    formProps.setFieldValue(
      'environmentVariables',
      updatedEnvironmentVariables.filter(environmentVariable => !environmentVariable.checked)
    );
    setIsDirty(true);
    formProps.setFieldValue('isAppSettingsDirty', true);
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
          environmentVariables={values.environmentVariables}
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
          environmentVariables={values.environmentVariables}
          cancel={onCancel}
          updateEnvironmentVariable={updateEnvironmentVariable}
        />
      </CustomPanel>
    );
  };

  const getTable = () => {
    return (
      <DisplayTableWithCommandBar
        ariaLabelForSelectionColumn={t('toggleAppSettingSelectionAriaLabel')}
        ariaLabelForSelectAllCheckbox={t('toggleAllAppSettingsAriaLabel')}
        checkButtonAriaLabel={t('selectAppSettingAriaLabel')}
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
        {getSearchFilter('environment-variable-search', setFilter, t('staticSite_filterApplicationSetting'), isTableCommandBarDisabled())}
      </DisplayTableWithCommandBar>
    );
  };

  const getConfirmDialogs = () => {
    return (
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
    );
  };

  const updateDirtyState = () => {
    const dirtyState = getDirtyState(values.environmentVariables);
    setIsDirty(dirtyState);
    formProps.setFieldValue('isAppSettingsDirty', dirtyState);
    portalContext.updateDirtyState(dirtyState);
  };

  useEffect(() => {
    updateDirtyState();
    setColumns(getDefaultColumns());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shownValues, values.environmentVariables]);

  useEffect(() => {
    if (isEnvironmentChange || isRefreshing) {
      updateEnvironmentVariable([...getInitialEnvironmentVariables()]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEnvironmentVariableResponse]);

  useEffect(() => {
    if (isRefreshing) {
      setFilter('');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefreshing]);

  return (
    <>
      {isLoading ? (
        <div className={formStyle}>
          <ProgressIndicator
            description={t('staticSite_loadingApplicationSettings')}
            ariaValueText={t('staticSite_loadingApplicationSettings')}
          />
        </div>
      ) : (
        <>
          {getConfirmDialogs()}
          <div className={formStyle}>
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
              environments={values.environments || []}
              onDropdownChange={onDropdownChange}
              disabled={isLoading || !hasWritePermissions}
              selectedEnvironment={values.selectedEnvironment}
              isLoading={isLoading}
            />
            {getTable()}
            {getAddEditPanel()}
            {getBulkAddEditPanel()}
          </div>
        </>
      )}
    </>
  );
};

export default Configuration;
