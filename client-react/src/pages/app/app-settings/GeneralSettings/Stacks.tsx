import * as React from 'react';
import { FormikProps } from 'formik';
import { AppSettingsFormValues } from '../AppSettings.Types';
import { ScenarioIds } from 'src/utils/scenario-checker/scenario-ids';
import WindowsStacks from './WindowsStacks/WindowsStacks';
import { translate, InjectedTranslateProps } from 'react-i18next';
import { settingsWrapper } from '../AppSettingsForm';
import LinuxStacks from './LinuxStacks/LinuxStacks';
import { ScenarioService } from 'src/utils/scenario-checker/scenario.service';

const Stacks: React.SFC<FormikProps<AppSettingsFormValues> & InjectedTranslateProps> = props => {
  const { t, values } = props;
  const { site } = values;
  const scenarioService = new ScenarioService();

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
