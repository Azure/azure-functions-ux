import { FormikProps } from 'formik';
import React from 'react';

import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { AppSettingsFormValues } from '../AppSettings.types';
import { settingsWrapper } from '../AppSettingsForm';
import LinuxStacks from './LinuxStacks/LinuxStacks';
import WindowsStacks from './WindowsStacks/WindowsStacks';
import { useTranslation } from 'react-i18next';

const Stacks: React.SFC<FormikProps<AppSettingsFormValues>> = props => {
  const { values } = props;
  const { site } = values;
  const { t } = useTranslation();
  const scenarioService = new ScenarioService(t);

  if (scenarioService.checkScenario(ScenarioIds.linuxAppStack, { site }).status === 'enabled') {
    return (
      <>
        <h3>{t('stackSettings')}</h3>
        <div className={settingsWrapper}>
          <LinuxStacks {...props} />
        </div>
      </>
    );
  } else if (scenarioService.checkScenario(ScenarioIds.functionAppRuntimeStack, { site }).status === 'disabled') {
    return null;
  } else if (scenarioService.checkScenario(ScenarioIds.xenonAppRuntimeStack, { site }).status === 'disabled') {
    return null;
  } else {
    // NOTE(michinoy): Always default to the windows based runtime stack.

    return (
      <>
        <h3>{t('stackSettings')}</h3>
        <div className={settingsWrapper}>
          <WindowsStacks {...props} />
        </div>
      </>
    );
  }
};

export default Stacks;
