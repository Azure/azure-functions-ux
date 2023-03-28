import React, { useContext, useRef } from 'react';
import { FormikProps } from 'formik';
import { AppSettingsFormValues } from '../AppSettings.types';
import { useTranslation } from 'react-i18next';
import ErrorPageGrid from '../ErrorPages/ErrorPageGrid';
import { isEqual } from 'lodash-es';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { SiteContext } from '../Contexts';

const ErrorPagePivot: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { t } = useTranslation();
  const site = useContext(SiteContext);
  const scenarioCheckerRef = useRef(new ScenarioService(t));
  const scenarioChecker = scenarioCheckerRef.current!;
  const overlay = scenarioChecker.checkScenario(ScenarioIds.enableCustomErrorPagesOverlay, { site }).status !== 'disabled'; //check if premium is there

  return (
    <>
      <h3>{t('customErrorPage')}</h3>
      <p id="default-documents-info-message">{t('errorPagesInfoMessage')}</p>
      {overlay && <></>}
      <ErrorPageGrid {...props} />
    </>
  );
};

export default ErrorPagePivot;

export const errorPagesDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return !isEqual(values.errorPages, initialValues.errorPages);
};
