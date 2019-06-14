import { Formik, FormikProps } from 'formik';
import React, { useRef, useContext } from 'react';
import { AppSettingsFormValues } from './AppSettings.types';
import AppSettingsCommandBar from './AppSettingsCommandBar';
import AppSettingsDataLoader from './AppSettingsDataLoader';
import AppSettingsForm from './AppSettingsForm';
import { ScenarioIds } from '../../../utils/scenario-checker/scenario-ids';
import { useTranslation } from 'react-i18next';
import { ScenarioService } from '../../../utils/scenario-checker/scenario.service';
import i18n from 'i18next';
import { PermissionsContext, SiteContext } from './Contexts';
import { commandBarSticky, formStyle } from './AppSettings.styles';
import UpsellBanner from '../../../components/UpsellBanner/UpsellBanner';
import { ArmObj } from '../../../models/arm-obj';
import { Site } from '../../../models/site/site';

const validate = (values: AppSettingsFormValues, t: i18n.TFunction, scenarioChecker: ScenarioService, site: ArmObj<Site>) => {
  const duplicateDefaultDocumentsValidation = (value: string) => {
    return values.config.properties.defaultDocuments.filter(v => v === value).length > 1 ? t('fieldMustBeUnique') : null;
  };
  const hasDuplicates = array => {
    return new Set(array).size !== array.length;
  };
  const isJavaApp = values.currentlySelectedStack === 'java';
  const defaultDocumentsEnabled =
    scenarioChecker.checkScenario(ScenarioIds.defaultDocumentsSupported, { site: values.site }).status !== 'disabled';
  let hasAnyError = false;
  const errors = {
    config: {
      properties: {} as any,
    },
  };
  if (scenarioChecker.checkScenario(ScenarioIds.skipStackValidation, { site }).status !== 'disabled') {
    if (isJavaApp && !values.config.properties.javaContainer) {
      hasAnyError = true;
      errors.config.properties.javaContainer = 'required';
    }
    if (isJavaApp && !values.config.properties.javaContainerVersion) {
      hasAnyError = true;
      errors.config.properties.javaContainerVersion = 'required';
    }
    if (isJavaApp && !values.config.properties.javaVersion) {
      hasAnyError = true;
      errors.config.properties.javaVersion = 'required';
    }
  }
  if (defaultDocumentsEnabled && hasDuplicates(values.config.properties.defaultDocuments)) {
    hasAnyError = true;
    errors.config.properties.defaultDocuments = values.config.properties.defaultDocuments.map(value => {
      return duplicateDefaultDocumentsValidation(value);
    });
  }

  return hasAnyError ? errors : {};
};

interface AppSettingsProps {
  resourceId: string;
}

const AppSettings: React.FC<AppSettingsProps> = props => {
  const { resourceId } = props;
  const { t } = useTranslation();
  const { app_write, editable } = useContext(PermissionsContext);
  const scenarioCheckerRef = useRef(new ScenarioService(t));
  const scenarioChecker = scenarioCheckerRef.current!;

  return (
    <AppSettingsDataLoader resourceId={resourceId}>
      {({ initialFormValues, saving, onSubmit, scaleUpPlan }) => (
        <SiteContext.Consumer>
          {site => {
            return (
              <Formik
                initialValues={initialFormValues}
                onSubmit={onSubmit}
                enableReinitialize={true}
                validate={values => validate(values, t, scenarioChecker, site)}
                validateOnBlur={false}
                validateOnChange={false}>
                {(formProps: FormikProps<AppSettingsFormValues>) => (
                  <form>
                    <div className={commandBarSticky}>
                      <AppSettingsCommandBar
                        submitForm={formProps.submitForm}
                        resetForm={formProps.resetForm}
                        disabled={!app_write || !editable || saving}
                        dirty={formProps.dirty}
                      />
                      {scenarioChecker.checkScenario(ScenarioIds.showAppSettingsUpsell, { site }).status === 'enabled' && (
                        <UpsellBanner onClick={scaleUpPlan} />
                      )}
                    </div>
                    <div className={formStyle}>
                      <AppSettingsForm {...formProps} />
                    </div>
                  </form>
                )}
              </Formik>
            );
          }}
        </SiteContext.Consumer>
      )}
    </AppSettingsDataLoader>
  );
};

export default AppSettings;
