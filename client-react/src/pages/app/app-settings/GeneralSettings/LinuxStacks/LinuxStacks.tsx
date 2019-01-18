import { Field, FormikProps } from 'formik';
import { DropdownMenuItemType, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import * as React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import Dropdown from '../../../../../components/form-controls/DropDown';
import { AvailableStack } from '../../../../../models/available-stacks';
import { ArmObj } from '../../../../../models/WebAppModels';
import { RootState } from '../../../../../modules/types';
import { AppSettingsFormValues } from '../../AppSettings.types';

export interface StateProps {
  stacks: ArmObj<AvailableStack>[];
  stacksLoading: boolean;
}
type PropsType = FormikProps<AppSettingsFormValues> & InjectedTranslateProps & StateProps;
export class LinuxStacks extends React.Component<PropsType, any> {
  public render() {
    const { stacksLoading, stacks, values } = this.props;
    if (stacksLoading) {
      return null;
    }
    const options = this.parseLinuxBuiltInStacks(stacks);
    return (
      <Field
        name="config.properties.linuxFxVersion"
        component={Dropdown}
        fullpage
        disabled={!values.siteWritePermission}
        label="Runtime Stack"
        id="linux-fx-version-runtime"
        options={options}
      />
    );
  }

  private parseLinuxBuiltInStacks(builtInStacks: ArmObj<AvailableStack>[]) {
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
  }
}
const mapStateToProps = (state: RootState): StateProps => {
  return {
    stacks: state.stacks.data.value,
    stacksLoading: state.stacks.metadata.loading,
  };
};
export default compose<PropsType, FormikProps<AppSettingsFormValues>>(
  connect(
    mapStateToProps,
    null
  ),
  translate('translation')
)(LinuxStacks);
