import { FormikProps } from 'formik';
import React from 'react';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { AppSettingsFormValues } from '../AppSettings.types';
import { useTranslation } from 'react-i18next';
import FunctionAppStackSettings from './stacks/function-app/FunctionAppStackSettings';
import WebAppStackSettings from './stacks/web-app/WebAppStackSettings';

const Stacks: React.SFC<FormikProps<AppSettingsFormValues>> = props => {
  const { values } = props;
  const { site } = values;
  const { t } = useTranslation();
  const scenarioService = new ScenarioService(t);

  if (scenarioService.checkScenario(ScenarioIds.functionAppRuntimeStack, { site }).status === 'enabled') {
    return <FunctionAppStackSettings {...props} />;
  } else {
    return <WebAppStackSettings {...props} />;
  }
};

export default Stacks;
