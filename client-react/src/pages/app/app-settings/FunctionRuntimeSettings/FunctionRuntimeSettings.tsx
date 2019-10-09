import { FormikProps, Field } from 'formik';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import React, { useState, useContext } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import DisplayTableWithEmptyMessage, {
  defaultCellStyle,
} from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import IconButton from '../../../../components/IconButton/IconButton';
import { AppSettingsFormValues, FormAppSetting } from '../AppSettings.types';
import { PermissionsContext, SiteContext } from '../Contexts';
import { TooltipHost } from 'office-ui-fabric-react';
import TextField from '../../../../components/form-controls/TextField';
// import LoadingComponent from '../../../../components/loading/loading-component';
import { dirtyElementStyle } from '../AppSettings.styles';
import { ThemeContext } from '../../../../ThemeContext';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import RadioButtonNoFormik from '../../../../components/form-controls/RadioButtonNoFormik';
import { sortBy } from 'lodash-es';

const FunctionRuntimeSettings: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
  const theme = useContext(ThemeContext);
  const site = useContext(SiteContext);
  const { t, values } = props;
  const scenarioChecker = new ScenarioService(t);
  const { app_write, editable } = useContext(PermissionsContext);
  const [shownValues, setShownValues] = useState<string[]>([]);
  const [showAllValues, setShowAllValues] = useState(false);

  const updateRuntimeVersionSetting = (version: string) => {
    let appSettings: FormAppSetting[] = [...values.appSettings];
    const index = appSettings.findIndex(x => x.name.toLowerCase() === 'FUNCTIONS_EXTENSION_VERSION'.toLowerCase());
    if (index === -1) {
      appSettings.push({
        name: 'FUNCTIONS_EXTENSION_VERSION',
        value: version,
        sticky: false,
      });
    } else {
      const setting = appSettings[index];
      appSettings[index] = {
        name: 'FUNCTIONS_EXTENSION_VERSION',
        value: version,
        sticky: setting.sticky,
      };
    }
    appSettings = sortBy(appSettings, o => o.name.toLowerCase());
    props.setFieldValue('appSettings', appSettings);
  };

  const getRuntimeVersion = (appSettings: FormAppSetting[]) => {
    const index = appSettings.findIndex(x => x.name.toLowerCase() === 'FUNCTIONS_EXTENSION_VERSION'.toLowerCase());
    return index === -1 ? '' : appSettings[index].value;
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
            disabled={!editable}
            id={`app-settings-application-settings-delete-${index}`}
            iconProps={{ iconName: 'Delete' }}
            ariaLabel={t('delete')}
            onClick={() => removeItem(itemKey)}
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
            className={defaultCellStyle}
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
      return <span id={`app-settings-application-settings-name-${index}`}>{item[column.fieldName!]}</span>;
    }
    return <div className={defaultCellStyle}>{item[column.fieldName!]}</div>;
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
    ];
  };

  if (!values.appSettings) {
    return null;
  }

  return (
    <>
      {false && (
        <DisplayTableWithEmptyMessage
          items={values.appSettings}
          columns={getColumns()}
          isHeaderVisible={true}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          selectionPreservedOnEmptyClick={true}
          emptyMessage={t('emptyAppSettings')}
        />
      )}
      <RadioButtonNoFormik
        selectedKey={getRuntimeVersion(props.values.appSettings)}
        dirty={getRuntimeVersion(values.appSettings) !== getRuntimeVersion(props.initialValues.appSettings)}
        label={t('runtimeVersion')}
        id="functions-runtime-version"
        disabled={!app_write || !editable}
        onChange={(e, newVal) => {
          updateRuntimeVersionSetting(newVal ? newVal.key : '');
        }}
        options={[
          {
            key: '~1',
            text: t('~1'),
          },
          {
            key: '~2',
            text: t('~2'),
          },
          {
            key: '~3',
            text: t('~3'),
          },
        ]}
      />
      {scenarioChecker.checkScenario(ScenarioIds.dailyUsageQuotaSupported, { site }).status === 'enabled' && (
        <Field
          name="site.properties.dailyMemoryTimeQuota"
          dirty={values.site.properties.dailyMemoryTimeQuota !== props.initialValues.site.properties.dailyMemoryTimeQuota}
          component={TextField}
          label={t('dailyUsageQuotaLabel')}
          id="app-settings-daily-memory-time-quota"
          disabled={!app_write || !editable}
          style={{ marginLeft: '1px', marginTop: '1px' }} // Not sure why but left border disappears without margin and for small windows the top also disappears
        />
      )}
    </>
  );
};

export default withTranslation('translation')(FunctionRuntimeSettings);
