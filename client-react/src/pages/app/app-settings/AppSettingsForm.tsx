import { Pivot, PivotItem, IPivotItemProps } from '@fluentui/react';
import React, { useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { style } from 'typestyle';
import { AppSettingsFormProps, AppSettingsTabs } from './AppSettings.types';
import GeneralSettings, { generalSettingsDirty, generalSettingsError } from './Sections/GeneralSettings';
import ApplicationSettingsPivot, { applicationSettingsDirty } from './Sections/ApplicationSettingsPivot';
import FunctionRuntimeSettingsPivot, { functionRuntimeSettingsDirty } from './Sections/FunctionRuntimeSettingsPivot';
import DefaultDocumentsPivot, { defaultDocumentsDirty, defaultDocumentsError } from './Sections/DefaultDocumentsPivot';
import PathMappingsPivot, { pathMappingsDirty } from './Sections/PathMappingsPivot';
import CustomTabRenderer from './Sections/CustomTabRenderer';
import { ScenarioService } from '../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../utils/scenario-checker/scenario-ids';
import { ThemeContext } from '../../../ThemeContext';
import { SiteContext } from './Contexts';
import { isWorkflowApp } from '../../../utils/arm-utils';
import { pivotWrapper } from './AppSettings.styles';
import { ExperimentationConstants, OverflowBehavior } from '../../../utils/CommonConstants';
import { errorPagesDirty } from './Sections/ErrorPage';
import ErrorPagePivot from './Sections/ErrorPage';
import { PortalContext } from '../../../PortalContext';

export const settingsWrapper = style({
  padding: '5px 20px 5px 0px',
});

const AppSettingsForm: React.FC<AppSettingsFormProps> = props => {
  const theme = useContext(ThemeContext);
  const { values, initialValues, tab, errors } = props;
  const portalContext = useContext(PortalContext);
  const site = useContext(SiteContext);

  const { t } = useTranslation();
  const scenarioCheckerRef = useRef(new ScenarioService(t));
  const scenarioChecker = scenarioCheckerRef.current!;
  const [flighting, setFlighting] = React.useState(false);

  const generalSettingsDirtyCheck = () => {
    return generalSettingsDirty(values, initialValues);
  };

  const applicationSettingsDirtyCheck = () => {
    return applicationSettingsDirty(values, initialValues);
  };

  const functionRuntimeSettingsDirtyCheck = () => {
    return functionRuntimeSettingsDirty(values, initialValues);
  };

  const errorPagesDirtyCheck = () => {
    return errorPagesDirty(values, initialValues);
  };

  const pathMappingsDirtyCheck = () => {
    return pathMappingsDirty(values, initialValues);
  };

  const defaultDocumentsDirtyCheck = () => {
    return defaultDocumentsDirty(values, initialValues);
  };

  const defaultDocumentsErrorCheck = () => {
    return defaultDocumentsError(errors);
  };

  const generalSettingsErrorCheck = () => {
    return generalSettingsError(errors);
  };

  React.useEffect(() => {
    portalContext.hasFlightEnabled(ExperimentationConstants.TreatmentFlight.customErrorPages).then(setFlighting);
  }, [portalContext]);

  const dirtyLabel = t('modifiedTag');
  const enableDefaultDocuments = scenarioChecker.checkScenario(ScenarioIds.defaultDocumentsSupported, { site }).status !== 'disabled';
  const enablePathMappings = scenarioChecker.checkScenario(ScenarioIds.virtualDirectoriesSupported, { site }).status !== 'disabled';
  const enableAzureStorageMount = scenarioChecker.checkScenario(ScenarioIds.azureStorageMount, { site }).status === 'enabled';
  const showGeneralSettings = scenarioChecker.checkScenario(ScenarioIds.showGeneralSettings, { site }).status !== 'disabled';
  const showFunctionRuntimeSettings = scenarioChecker.checkScenario(ScenarioIds.showFunctionRuntimeSettings, { site }).status === 'enabled';
  const enableCustomErrorPages =
    scenarioChecker.checkScenario(ScenarioIds.enableCustomErrorPages, { site }).status !== 'disabled' && flighting;

  return (
    <Pivot getTabId={getPivotTabId} defaultSelectedKey={tab} overflowBehavior={OverflowBehavior.menu}>
      <PivotItem
        className={pivotWrapper}
        onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
          CustomTabRenderer(link, defaultRenderer, theme, applicationSettingsDirtyCheck, dirtyLabel)
        }
        itemKey={AppSettingsTabs.applicationSettings}
        headerText={t('applicationSettings')}>
        <ApplicationSettingsPivot {...props} />
      </PivotItem>

      {showFunctionRuntimeSettings ? (
        <PivotItem
          className={pivotWrapper}
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, functionRuntimeSettingsDirtyCheck, dirtyLabel)
          }
          itemKey={AppSettingsTabs.functionRuntimeSettings}
          headerText={isWorkflowApp(site) ? t('workflowRuntimeSettings') : t('functionRuntimeSettings')}>
          <FunctionRuntimeSettingsPivot {...props} />
        </PivotItem>
      ) : (
        <PivotItem></PivotItem>
      )}

      {showGeneralSettings ? (
        <PivotItem
          className={pivotWrapper}
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, generalSettingsDirtyCheck, dirtyLabel, generalSettingsErrorCheck)
          }
          itemKey={AppSettingsTabs.generalSettings}
          headerText={t('generalSettings')}>
          <GeneralSettings {...props} />
        </PivotItem>
      ) : (
        <PivotItem></PivotItem>
      )}

      {enableDefaultDocuments ? (
        <PivotItem
          className={pivotWrapper}
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, defaultDocumentsDirtyCheck, dirtyLabel, defaultDocumentsErrorCheck)
          }
          itemKey={AppSettingsTabs.defaultDocuments}
          headerText={t('defaultDocuments')}>
          <DefaultDocumentsPivot {...props} />
        </PivotItem>
      ) : (
        <></>
      )}

      {enablePathMappings || enableAzureStorageMount ? (
        <PivotItem
          className={pivotWrapper}
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, pathMappingsDirtyCheck, dirtyLabel)
          }
          itemKey={AppSettingsTabs.pathMappings}
          headerText={t('pathMappings')}>
          <PathMappingsPivot enableAzureStorageMount={enableAzureStorageMount} enablePathMappings={enablePathMappings} {...props} />
        </PivotItem>
      ) : (
        <PivotItem></PivotItem>
      )}

      {enableCustomErrorPages ? (
        <PivotItem
          className={pivotWrapper}
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, errorPagesDirtyCheck, dirtyLabel)
          }
          itemKey={AppSettingsTabs.customErrorPage}
          headerText={t('customErrorPage')}>
          <ErrorPagePivot {...props} />
        </PivotItem>
      ) : (
        <PivotItem></PivotItem>
      )}
    </Pivot>
  );
};

const getPivotTabId = (itemKey: string) => {
  switch (itemKey) {
    case AppSettingsTabs.generalSettings:
      return 'app-settings-general-settings-tab';
    case AppSettingsTabs.pathMappings:
      return 'app-settings-path-mappings-tab';
    case AppSettingsTabs.defaultDocuments:
      return 'app-settings-default-documents-tab';
    case AppSettingsTabs.applicationSettings:
      return 'app-settings-application-settings-tab';
    case AppSettingsTabs.functionRuntimeSettings:
      return 'app-settings-function-runtime-settings-tab';
    case AppSettingsTabs.customErrorPage:
      return 'app-settings-custom-error-pages-tab';
  }
  return '';
};

export default AppSettingsForm;
