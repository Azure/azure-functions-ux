import { FormikProps } from 'formik';
import { Pivot, PivotItem, IPivotItemProps } from 'office-ui-fabric-react/lib/Pivot';
import PivotItemContent from '../../../components/Pivot/PivotItemContent';
import React, { useRef, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { style } from 'typestyle';

import { AppSettingsFormValues } from './AppSettings.types';

import GeneralSettings, { generalSettingsDirty, generalSettingsError } from './Sections/GeneralSettings';
import ApplicationSettingsPivot, { applicationSettingsDirty } from './Sections/ApplicationSettingsPivot';
import DefaultDocumentsPivot, { defaultDocumentsDirty, defaultDocumentsError } from './Sections/DefaultDocumentsPivot';
import PathMappingsPivot, { pathMappingsDirty } from './Sections/PathMappingsPivot';
import CustomTabRenderer from './Sections/CustomTabRenderer';
import { ScenarioService } from '../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../utils/scenario-checker/scenario-ids';
import { ThemeContext } from '../../../ThemeContext';
import { SiteContext } from './Contexts';
export const settingsWrapper = style({
  paddingLeft: '15px',
  padding: '5px 20px',
});

const pivotStylesOverride = {
  root: {
    paddingLeft: '20px',
    paddingTop: '5px',
    paddingRight: '20px',
  },
};

const AppSettingsForm: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const theme = useContext(ThemeContext);
  const { values, initialValues, errors } = props;
  const site = useContext(SiteContext);
  const { t } = useTranslation();
  const scenarioCheckerRef = useRef(new ScenarioService(t));
  const scenarioChecker = scenarioCheckerRef.current!;

  const generalSettingsDirtyCheck = () => {
    return generalSettingsDirty(values, initialValues);
  };

  const applicationSettingsDirtyCheck = () => {
    return applicationSettingsDirty(values, initialValues);
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
  const dirtyLabel = t('modifiedTag');
  const enableDefaultDocuments = scenarioChecker.checkScenario(ScenarioIds.defaultDocumentsSupported, { site }).status !== 'disabled';
  const enablePathMappings = scenarioChecker.checkScenario(ScenarioIds.virtualDirectoriesSupported, { site }).status !== 'disabled';
  const enableAzureStorageMount = scenarioChecker.checkScenario(ScenarioIds.azureStorageMount, { site }).status === 'enabled';
  const showGeneralSettings = scenarioChecker.checkScenario(ScenarioIds.showGeneralSettings, { site }).status !== 'disabled';
  return (
    <Pivot styles={pivotStylesOverride} getTabId={getPivotTabId}>
      <PivotItem
        onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
          CustomTabRenderer(link, defaultRenderer, theme, applicationSettingsDirtyCheck, dirtyLabel)
        }
        itemKey="applicationSettings"
        linkText={t('applicationSettings')}>
        <PivotItemContent>
          <ApplicationSettingsPivot {...props} />
        </PivotItemContent>
      </PivotItem>

      {showGeneralSettings ? (
        <PivotItem
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, generalSettingsDirtyCheck, dirtyLabel, generalSettingsErrorCheck)
          }
          itemKey="generalSettings"
          linkText={t('generalSettings')}>
          <PivotItemContent>
            <GeneralSettings {...props} />
          </PivotItemContent>
        </PivotItem>
      ) : (
        <></>
      )}

      {enableDefaultDocuments ? (
        <PivotItem
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, defaultDocumentsDirtyCheck, dirtyLabel, defaultDocumentsErrorCheck)
          }
          itemKey="defaultDocuments"
          linkText={t('defaultDocuments')}>
          <PivotItemContent>
            <DefaultDocumentsPivot {...props} />
          </PivotItemContent>
        </PivotItem>
      ) : (
        <></>
      )}

      {enablePathMappings || enableAzureStorageMount ? (
        <PivotItem
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, pathMappingsDirtyCheck, dirtyLabel)
          }
          itemKey="pathMappings"
          linkText={t('pathMappings')}>
          <PivotItemContent>
            <PathMappingsPivot enableAzureStorageMount={enableAzureStorageMount} enablePathMappings={enablePathMappings} {...props} />
          </PivotItemContent>
        </PivotItem>
      ) : (
        <></>
      )}
    </Pivot>
  );
};

const getPivotTabId = (itemKey: string, index: number) => {
  switch (itemKey) {
    case 'generalSettings':
      return 'app-settings-general-settings-tab';
    case 'pathMappings':
      return 'app-settings-path-mappings-tab';
    case 'defaultDocuments':
      return 'app-settings-default-documents-tab';
    case 'applicationSettings':
      return 'app-settings-application-settings-tab';
  }
  return '';
};

export default AppSettingsForm;
