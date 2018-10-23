import * as React from 'react';
import { connect } from 'react-redux';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { FormState, FormApi, AppSettingsFormValues } from '../../AppSettings.Types';
import IState from '../../../../../modules/types';
import { ArmObj } from '../../../../../models/WebAppModels';
import { AvailableStack } from '../../../../../models/available-stacks';
import { Field, FormikProps } from 'formik';
import { compose } from 'recompose';
import { translate, InjectedTranslateProps } from 'react-i18next';

export interface StateProps {
  stacks: ArmObj<AvailableStack>[];
  stacksLoading: boolean;
}

export interface OwnProps {
  formState: FormState;
  formApi: FormApi;
}

type Props = StateProps & FormikProps<AppSettingsFormValues> & InjectedTranslateProps;

const PythonStack: React.StatelessComponent<Props> = props => {
  const { stacks, t } = props;
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
  pythonVersions.push({ key: '', text: t('off') });
  return (
    <Field
      name="config.properties.pythonVersion"
      component={Dropdown}
      label={t('pythonVersion')}
      id="pythonVersion"
      options={pythonVersions}
    />
  );
};

const mapStateToProps = (state: IState): StateProps => {
  return {
    stacks: state.stacks.stacks.value,
    stacksLoading: state.stacks.loading,
  };
};
export default compose(
  connect(
    mapStateToProps,
    null
  ),
  translate()
)(PythonStack);
