import { FormikProps } from 'formik';
import { Pivot, PivotItem, IPivotItemProps } from 'office-ui-fabric-react/lib/Pivot';
import * as React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { style } from 'typestyle';

import { AppSettingsFormValues } from './AppSettings.types';

import GeneralSettings, { generalSettingsDirty, generalSettingsError } from './Sections/GeneralSettings';
import ApplicationSettingsPivot, { applicationSettingsDirty } from './Sections/ApplicationSettingsPivot';
import DefaultDocumentsPivot, { defaultDocumentsDirty, defaultDocumentsError } from './Sections/DefaultDocumentsPivot';
import PathMappingsPivot, { pathMappingsDirty } from './Sections/PathMappingsPivot';
import CustomTabRenderer from './Sections/CustomTabRenderer';
import { useRef } from 'react';
import { ScenarioService } from '../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../utils/scenario-checker/scenario-ids';
import { RootState } from '../../../modules/types';
import { ThemeExtended } from '../../../theme/SemanticColorsExtended';
import { connect } from 'react-redux';
import { compose } from 'recompose';

export const settingsWrapper = style({
  paddingLeft: '15px',
  padding: '5px 20px',
});

interface StateProps {
  theme: ThemeExtended;
}

const AppSettingsForm: React.FC<FormikProps<AppSettingsFormValues> & InjectedTranslateProps & StateProps> = props => {
  const { t, values, initialValues, errors, theme } = props;
  const { site } = values;

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
  const enableDefaultDocuments = scenarioChecker.checkScenario(ScenarioIds.defaultDocumentsSupported, { site }).status !== 'disabled';
  const enablePathMappings = scenarioChecker.checkScenario(ScenarioIds.virtualDirectoriesSupported, { site }).status !== 'disabled';
  return (
    <Pivot getTabId={getPivotTabId}>
      <PivotItem
        onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
          CustomTabRenderer(link, defaultRenderer, theme, generalSettingsDirtyCheck, generalSettingsErrorCheck)
        }
        itemKey="generalSettings"
        linkText={t('generalSettings')}>
        <GeneralSettings {...props} />
      </PivotItem>
      <PivotItem
        onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
          CustomTabRenderer(link, defaultRenderer, theme, applicationSettingsDirtyCheck)
        }
        itemKey="applicationSettings"
        linkText={t('applicationSettings')}>
        <ApplicationSettingsPivot {...props} />
      </PivotItem>
      {enableDefaultDocuments && (
        <PivotItem
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, defaultDocumentsDirtyCheck, defaultDocumentsErrorCheck)
          }
          itemKey="defaultDocuments"
          linkText={t('defaultDocuments')}>
          <DefaultDocumentsPivot {...props} />
        </PivotItem>
      )}

      {enablePathMappings && (
        <PivotItem
          onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
            CustomTabRenderer(link, defaultRenderer, theme, pathMappingsDirtyCheck)
          }
          itemKey="pathMappings"
          linkText={t('pathMappings')}>
          <PathMappingsPivot {...props} />
        </PivotItem>
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

const mapStateToProps = (state: RootState) => {
  return {
    theme: state.portalService.theme,
  };
};

export default compose(
  connect(mapStateToProps),
  translate('translation')
)(AppSettingsForm);
