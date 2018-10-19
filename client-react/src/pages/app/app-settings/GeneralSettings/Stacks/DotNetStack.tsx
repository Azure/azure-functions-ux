import * as React from 'react';
import { connect } from 'react-redux';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { ArmObj } from '../../../../../models/WebAppModels';
import { AvailableStack } from '../../../../../models/available-stacks';
import { Field, FormikProps } from 'formik';
import { AppSettingsFormValues } from '../../AppSettings.Types';

export interface StateProps {
  stacks: ArmObj<AvailableStack>[];
  stacksLoading: boolean;
}

type Props = StateProps & FormikProps<AppSettingsFormValues>;

const DotNetStack: React.SFC<Props> = props => {
  const { stacks, stacksLoading } = props;
  const aspNetStack = stacks.find(x => x.name === 'aspnet');
  if (!aspNetStack) {
    return null;
  }
  return (
    <Field
      name="config.properties.netFrameworkVersion"
      component={Dropdown}
      label=".Net Framework Version"
      id="netValidationVersion"
      Loading={stacksLoading}
      options={aspNetStack!.properties.majorVersions.map(x => ({
        key: x.runtimeVersion,
        text: x.displayVersion,
      }))}
    />
  );
};

const mapStateToProps = state => {
  return {
    stacks: state.stacks.stacks.value,
    stacksLoading: state.stacks.loading,
  };
};
export default connect(
  mapStateToProps,
  null
)(DotNetStack);
