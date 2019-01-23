import { FormikProps } from 'formik';
import * as React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';

import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { AppSettingsFormValues } from '../AppSettings.types';
import { settingsWrapper } from '../AppSettingsForm';
import LinuxStacks from './LinuxStacks/LinuxStacks';
import WindowsStacks from './WindowsStacks/WindowsStacks';

const Stacks: React.SFC<FormikProps<AppSettingsFormValues> & InjectedTranslateProps> = props => {
  const { t, values } = props;
  const { site } = values;
  const scenarioService = new ScenarioService(t);

  if (scenarioService.checkScenario(ScenarioIds.windowsAppStack, { site }).status === 'enabled') {
    return (
      <>
        <h3>{t('stackSettings')}</h3>
        <div className={settingsWrapper}>
          <WindowsStacks {...props} />
        </div>
      </>
    );
  }
  if (scenarioService.checkScenario(ScenarioIds.linuxAppStack, { site }).status === 'enabled') {
    return (
      <>
        <h3>{t('stackSettings')}</h3>
        <div className={settingsWrapper}>
          <LinuxStacks {...props} />
        </div>
      </>
    );
  }
  return null;
};

export default translate('translation')(Stacks);
