import { Field, FormikProps } from 'formik';
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

type Props = StateProps & FormikProps<AppSettingsFormValues> & InjectedTranslateProps;

const DotNetStack: React.SFC<Props> = props => {
  const { stacks, stacksLoading, values, t } = props;
  const aspNetStack = stacks.find(x => x.name === 'aspnet');
  if (!aspNetStack) {
    return null;
  }
  return (
    <Field
      name="config.properties.netFrameworkVersion"
      component={Dropdown}
      fullpage
      label={t('netFrameWorkVersionLabel')}
      id="netValidationVersion"
      disabled={!values.siteWritePermission}
      Loading={stacksLoading}
      options={aspNetStack!.properties.majorVersions.map(x => ({
        key: x.runtimeVersion,
        text: x.displayVersion,
      }))}
    />
  );
};

const mapStateToProps = (state: RootState) => {
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
)(DotNetStack);
