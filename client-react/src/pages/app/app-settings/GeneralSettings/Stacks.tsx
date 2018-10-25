import * as React from 'react';
import { FormikProps } from 'formik';
import { AppSettingsFormValues } from '../AppSettings.Types';
import { ScenarioContext } from 'src/pages/App';
import { ScenarioIds } from 'src/utils/scenario-checker/scenario-ids';
import WindowsStacks from './WindowsStacks/WindowsStacks';
import { translate, InjectedTranslateProps } from 'react-i18next';
import { settingsWrapper } from '../AppSettingsForm';

const Stacks: React.SFC<FormikProps<AppSettingsFormValues> & InjectedTranslateProps> = props => {
  const { t, values } = props;
  const { site } = values;
  return (
    <ScenarioContext.Consumer>
      {scenarioService => {
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
        return null;
      }}
    </ScenarioContext.Consumer>
  );
};

export default translate('translation')(Stacks);
