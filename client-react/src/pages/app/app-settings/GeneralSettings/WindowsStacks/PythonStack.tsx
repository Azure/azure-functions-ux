import { Field, FormikProps } from 'formik';
import * as React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import Dropdown from '../../../../../components/form-controls/DropDown';
import { AvailableStack } from '../../../../../models/available-stacks';
import { ArmObj } from '../../../../../models/WebAppModels';
import { RootState } from '../../../../../modules/types';
import { AppSettingsFormValues, FormApi, FormState } from '../../AppSettings.types';

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
  const { stacks, t, values } = props;
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
      fullpage
      disabled={!values.siteWritePermission}
      label={t('pythonVersion')}
      id="pythonVersion"
      options={pythonVersions}
    />
  );
};

const mapStateToProps = (state: RootState): StateProps => {
  return {
    stacks: state.stacks.data.value,
    stacksLoading: state.stacks.metadata.loading,
  };
};
export default compose(
  connect(
    mapStateToProps,
    null
  ),
  translate('translation')
)(PythonStack);
