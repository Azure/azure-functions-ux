import { Field, FormikProps } from 'formik';
import * as React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';

import Dropdown from '../../../../../components/form-controls/DropDown';
import { AppSettingsFormValues } from '../../AppSettings.types';
import DotNetStack from './DotNetStack';
import JavaStack from './JavaStack';
import PhpStack from './PhpStack';
import PythonStack from './PythonStack';

interface StacksState {
  currentStack: string;
}
class WindowsStacks extends React.Component<FormikProps<AppSettingsFormValues> & InjectedTranslateProps, StacksState> {
  constructor(props) {
    super(props);
    this.state = {
      currentStack: 'dotnet',
    };
  }
  public render() {
    const { t } = this.props;
    return (
      <>
        <Field
          name="currentlySelectedStack"
          component={Dropdown}
          fullpage
          options={[
            {
              key: 'dotnet',
              text: '.NET',
            },
            {
              key: 'php',
              text: 'PHP',
            },
            {
              key: 'python',
              text: 'Python',
            },
            {
              key: 'java',
              text: 'Java',
            },
          ]}
          label={t('stack')}
          id="app-settings-stack-dropdown"
        />
        {this.props.values.currentlySelectedStack === 'dotnet' ? <DotNetStack {...this.props} /> : null}
        {this.props.values.currentlySelectedStack === 'php' ? <PhpStack {...this.props} /> : null}
        {this.props.values.currentlySelectedStack === 'python' ? <PythonStack {...this.props} /> : null}
        {this.props.values.currentlySelectedStack === 'java' ? <JavaStack {...this.props} /> : null}
      </>
    );
  }
}

export default translate('translation')(WindowsStacks);
