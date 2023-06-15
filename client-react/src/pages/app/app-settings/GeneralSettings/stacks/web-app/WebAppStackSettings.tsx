import React from 'react';
import { useTranslation } from 'react-i18next';

import { ScenarioService } from '../../../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../../../utils/scenario-checker/scenario-ids';
import { settingsWrapper } from '../../../AppSettingsForm';
import LinuxStacks from '../../LinuxStacks/LinuxStacks';
import WindowsStacks, { StackProps } from '../../WindowsStacks/WindowsStacks';

const WebAppStackSettings: React.FC<StackProps> = props => {
  const { t } = useTranslation();
  const { values } = props;
  const { site } = values;
  const scenarioService = new ScenarioService(t);
  if (scenarioService.checkScenario(ScenarioIds.xenonAppRuntimeStack, { site }).status === 'disabled') {
    return null;
  } else {
    return (
      <>
        <h3>{t('stackSettings')}</h3>
        <div className={settingsWrapper}>
          {scenarioService.checkScenario(ScenarioIds.linuxAppStack, { site }).status === 'enabled' ? (
            <LinuxStacks {...props} />
          ) : (
            <WindowsStacks {...props} />
          )}
        </div>
      </>
    );
  }
};
export default WebAppStackSettings;
