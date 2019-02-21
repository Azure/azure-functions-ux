import { Field, FormikProps } from 'formik';
import { DropdownMenuItemType, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import React, { useContext } from 'react';

import Dropdown from '../../../../../components/form-controls/DropDown';
import { AvailableStack } from '../../../../../models/available-stacks';
import { ArmObj } from '../../../../../models/WebAppModels';
import { AppSettingsFormValues } from '../../AppSettings.types';
import { AvailableStacksContext, PermissionsContext } from '../../Contexts';

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
        key: majorVersion.runtimeVersion,
      });
    });

    linuxFxVersionOptions.push({ key: `${availableStack.name}-divider`, text: '-', itemType: DropdownMenuItemType.Divider });
  });

  return linuxFxVersionOptions;
};

const LinuxStacks: React.FC<PropsType> = props => {
  const { app_write, editable } = useContext(PermissionsContext);
  const stacks = useContext(AvailableStacksContext);
  const options = parseLinuxBuiltInStacks(stacks.value);
  return (
    <Field
      name="config.properties.linuxFxVersion"
      component={Dropdown}
      fullpage
      disabled={!app_write || !editable}
      label="Runtime Stack"
      id="linux-fx-version-runtime"
      options={options}
    />
  );
};
export default LinuxStacks;
