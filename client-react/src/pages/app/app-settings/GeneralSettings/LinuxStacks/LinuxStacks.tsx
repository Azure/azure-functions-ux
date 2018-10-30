import * as React from 'react';
import { FormikProps, Field } from 'formik';
import { AppSettingsFormValues } from '../../AppSettings.Types';
import { translate, InjectedTranslateProps } from 'react-i18next';
import { compose } from 'recompose';
import IState from '../../../../../modules/types';
import { ArmObj } from '../../../../../models/WebAppModels';
import { AvailableStack } from '../../../../../models/available-stacks';
import { connect } from 'react-redux';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { IDropdownOption, DropdownMenuItemType } from 'office-ui-fabric-react/lib/Dropdown';
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
      linuxFxVersionOptions.push({ key: 'Header', text: availableStack.display, itemType: DropdownMenuItemType.Header });
      availableStack.majorVersions.forEach(majorVersion => {
        linuxFxVersionOptions.push({
          text: majorVersion.displayVersion,
          key: majorVersion.runtimeVersion,
        });
      });

      linuxFxVersionOptions.push({ key: 'Header', text: '-', itemType: DropdownMenuItemType.Divider });
    });

    return linuxFxVersionOptions;
  }
}
const mapStateToProps = (state: IState): StateProps => {
  return {
    stacks: state.stacks.stacks.value,
    stacksLoading: state.stacks.loading,
  };
};
export default compose<PropsType, FormikProps<AppSettingsFormValues>>(
  connect(
    mapStateToProps,
    null
  ),
  translate('translation')
)(LinuxStacks);
