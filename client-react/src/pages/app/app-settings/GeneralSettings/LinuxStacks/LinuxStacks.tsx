import { Field, FormikProps } from 'formik';
import { DropdownMenuItemType, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import React, { useContext } from 'react';

import Dropdown from '../../../../../components/form-controls/DropDown';
import { AvailableStack } from '../../../../../models/available-stacks';
import { ArmObj } from '../../../../../models/WebAppModels';
import { AppSettingsFormValues } from '../../AppSettings.types';
import { AvailableStacksContext, PermissionsContext } from '../../Contexts';
import TextField from '../../../../../components/form-controls/TextField';
import { useTranslation } from 'react-i18next';
import { ScenarioService } from '../../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../../utils/scenario-checker/scenario-ids';

type PropsType = FormikProps<AppSettingsFormValues>;
const parseLinuxBuiltInStacks = (builtInStacks: ArmObj<AvailableStack>[]) => {
  const linuxFxVersionOptions: IDropdownOption[] = [];

  builtInStacks.forEach(availableStackArm => {
    const availableStack: AvailableStack = availableStackArm.properties;
    linuxFxVersionOptions.push({
      key: availableStack.name,
      text: availableStack.display,
      itemType: DropdownMenuItemType.Header,
    });
    availableStack.majorVersions.forEach(majorVersion => {
      linuxFxVersionOptions.push({
        text: majorVersion.displayVersion,
        key: majorVersion.runtimeVersion.toLowerCase(),
      });
    });

    linuxFxVersionOptions.push({ key: `${availableStack.name}-divider`, text: '-', itemType: DropdownMenuItemType.Divider });
  });

  return linuxFxVersionOptions;
};

const startupFileLearnMoreLink = 'https://go.microsoft.com/fwlink/?linkid=861969';
const LinuxStacks: React.FC<PropsType> = props => {
  const { values } = props;
  const { site } = values;
  const { app_write, editable } = useContext(PermissionsContext);
  const stacks = useContext(AvailableStacksContext);
  const options = parseLinuxBuiltInStacks(stacks.value);
  const { t } = useTranslation();

  const scenarioService = new ScenarioService(t);
  return (
    <>
      {scenarioService.checkScenario(ScenarioIds.linuxAppRuntime, { site }).status !== 'disabled' && (
        <Field
          name="config.properties.linuxFxVersion"
          component={Dropdown}
          disabled={!app_write || !editable}
          label={t('stack')}
          id="linux-fx-version-runtime"
          options={options}
        />
      )}
      <Field
        name="config.properties.appCommandLine"
        component={TextField}
        disabled={!app_write || !editable}
        label={t('appCommandLineLabel')}
        id="linux-fx-version-appCommandLine"
        infoBubbleMessage={t('appCommandLineLabelHelpNoLink')}
        learnMoreLink={startupFileLearnMoreLink}
      />
    </>
  );
};
export default LinuxStacks;
