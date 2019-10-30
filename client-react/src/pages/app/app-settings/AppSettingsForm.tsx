import { FormikProps } from 'formik';
import { Pivot, PivotItem, IPivotItemProps } from 'office-ui-fabric-react/lib/Pivot';
import PivotItemContent, { BannerMessageProps } from '../../../components/Pivot/PivotItemContent';
import React, { useRef, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { style } from 'typestyle';

import { AppSettingsFormValues } from './AppSettings.types';

import GeneralSettings, { generalSettingsDirty, generalSettingsError } from './Sections/GeneralSettings';
import ApplicationSettingsPivot, { applicationSettingsDirty } from './Sections/ApplicationSettingsPivot';
import FunctionRuntimeSettingsPivot, { functionRuntimeSettingsDirty } from './Sections/FunctionRuntimeSettingsPivot';
import DefaultDocumentsPivot, { defaultDocumentsDirty, defaultDocumentsError } from './Sections/DefaultDocumentsPivot';
import PathMappingsPivot, { pathMappingsDirty } from './Sections/PathMappingsPivot';
import CustomTabRenderer from './Sections/CustomTabRenderer';
import { ScenarioService } from '../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../utils/scenario-checker/scenario-ids';
import { ThemeContext } from '../../../ThemeContext';
import { SiteContext, BannerMessageContext } from './Contexts';
import { isEqual } from 'lodash-es';
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
  const [bannerMessageProps, setBannerMessageProps] = useState<BannerMessageProps | undefined>(undefined);
  const theme = useContext(ThemeContext);
  const { values, initialValues, errors } = props;
  const site = useContext(SiteContext);
  const { t } = useTranslation();
  const scenarioCheckerRef = useRef(new ScenarioService(t));
  const scenarioChecker = scenarioCheckerRef.current!;

  const bannerMessageContext = {
    updateBanner: (bannerMsgProps?: BannerMessageProps) => {
      if (!isEqual(bannerMessageProps, bannerMsgProps)) {
        setBannerMessageProps(bannerMsgProps);
      }
    },
  };

  const generalSettingsDirtyCheck = () => {
    return generalSettingsDirty(values, initialValues);
  };

  const applicationSettingsDirtyCheck = () => {
    return applicationSettingsDirty(values, initialValues);
  };

  const functionRuntimeSettingsDirtyCheck = () => {
    return functionRuntimeSettingsDirty(values, initialValues);
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
  const showFunctionRuntimeSettings = scenarioChecker.checkScenario(ScenarioIds.showFunctionRuntimeSettings, { site }).status === 'enabled';
  return (
    <BannerMessageContext.Provider value={bannerMessageContext}>
      <Pivot styles={pivotStylesOverride} getTabId={getPivotTabId} onLinkClick={() => setBannerMessageProps(undefined)}>
        <PivotItem
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, applicationSettingsDirtyCheck, dirtyLabel, undefined)
          }
          itemKey="applicationSettings"
          linkText={t('applicationSettings')}>
          <PivotItemContent bannerMessageProps={bannerMessageProps}>
            <ApplicationSettingsPivot {...props} />
          </PivotItemContent>
        </PivotItem>

        {showFunctionRuntimeSettings ? (
          <PivotItem
            onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
              CustomTabRenderer(link, defaultRenderer, theme, functionRuntimeSettingsDirtyCheck, dirtyLabel)
            }
            itemKey="functionRuntimeSettings"
            linkText={t('functionRuntimeSettings')}>
            <PivotItemContent bannerMessageProps={bannerMessageProps}>
              <FunctionRuntimeSettingsPivot {...props} />
            </PivotItemContent>
          </PivotItem>
        ) : (
          <></>
        )}

        {showGeneralSettings ? (
          <PivotItem
            onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
              CustomTabRenderer(link, defaultRenderer, theme, generalSettingsDirtyCheck, dirtyLabel, generalSettingsErrorCheck)
            }
            itemKey="generalSettings"
            linkText={t('generalSettings')}>
            <PivotItemContent bannerMessageProps={bannerMessageProps}>
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
            <PivotItemContent bannerMessageProps={bannerMessageProps}>
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
            <PivotItemContent bannerMessageProps={bannerMessageProps}>
              <PathMappingsPivot enableAzureStorageMount={enableAzureStorageMount} enablePathMappings={enablePathMappings} {...props} />
            </PivotItemContent>
          </PivotItem>
        ) : (
          <></>
        )}
      </Pivot>
    </BannerMessageContext.Provider>
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
    case 'functionRuntimeSettings':
      return 'app-settings-function-runtime-settings-tab';
  }
  return '';
};

export default AppSettingsForm;
