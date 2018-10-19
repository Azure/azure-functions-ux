import * as React from 'react';
import { connect } from 'react-redux';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { FormState, FormApi, AppSettingsFormValues } from '../../AppSettings.Types';
import IState from '../../../../../modules/types';
import { ArmObj } from '../../../../../models/WebAppModels';
import { AvailableStack } from '../../../../../models/available-stacks';
import { Field, FormikProps } from 'formik';

export interface StateProps {
  stacks: ArmObj<AvailableStack>[];
  stacksLoading: boolean;
}

export interface OwnProps {
  formState: FormState;
  formApi: FormApi;
}

type Props = StateProps & FormikProps<AppSettingsFormValues>;

const PythonStack: React.StatelessComponent<Props> = (props: Props) => {
  const { stacks } = props;
  const pythonStack = stacks.find(x => x.name === 'python');
  if (!pythonStack) {
    return null;
  }
  const pythonVersions: {
    key: string;
    text: string;
  }[] = pythonStack!.properties.majorVersions.map(x => ({
    key: x.runtimeVersion,
    text: x.displayVersion,
  }));
  pythonVersions.push({ key: '', text: 'Off' });
  return (
    <Field name="config.properties.pythonVersion" component={Dropdown} label="Python Version" id="pythonVersion" options={pythonVersions} />
  );
};

const mapStateToProps = (state: IState): StateProps => {
  return {
    stacks: state.stacks.stacks.value,
    stacksLoading: state.stacks.loading,
  };
};
export default connect(
  mapStateToProps,
  null
)(PythonStack);
