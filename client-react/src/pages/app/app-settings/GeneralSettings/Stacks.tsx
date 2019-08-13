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

  // NOTE(michinoy): We should always default to showing the windows runtime stack selector,
  // unless if the kind specifically contains 'linux' in it OR show nothing if the kind contains 'functionapp'

  if (scenarioService.checkScenario(ScenarioIds.linuxAppStack, { site }).status === 'enabled') {
    return (
      <>
        <h3>{t('stackSettings')}</h3>
        <div className={settingsWrapper}>
          <LinuxStacks {...props} />
        </div>
      </>
    );
  } else if (
    scenarioService.checkScenario(ScenarioIds.linuxAppStack, { site }).status !== 'disabled' &&
    scenarioService.checkScenario(ScenarioIds.windowsAppStack, { site }).status !== 'disabled'
  ) {
    return (
      <>
        <h3>{t('stackSettings')}</h3>
        <div className={settingsWrapper}>
          <WindowsStacks {...props} />
        </div>
      </>
    );
  } else {
    return null;
  }
};

export default Stacks;
