import * as React from 'react';
import { connect } from 'react-redux';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { IDropdownOption, Dropdown as OfficeDropdown } from 'office-ui-fabric-react/lib-commonjs/Dropdown';
import { ArmObj } from '../../../../../models/WebAppModels';
import { AvailableStack } from '../../../../../models/available-stacks';
import IState from '../../../../../modules/types';
import { FormikProps, Field } from 'formik';
import { AppSettingsFormValues } from '../../AppSettings.Types';
import { InjectedTranslateProps } from 'react-i18next';

export interface StateProps {
  stacks: ArmObj<AvailableStack>[];
  stacksLoading: boolean;
}

type Props = StateProps & FormikProps<AppSettingsFormValues> & InjectedTranslateProps;
interface JavaStackState {
  currentJavaMajorVersion: string;
  initialized: boolean;
}
class JavaStack extends React.Component<Props, JavaStackState> {
  constructor(props) {
    super(props);
    this.state = {
      currentJavaMajorVersion: '',
      initialized: false,
    };
  }

  public componentWillMount() {
    const { stacks } = this.props;
    const javaStack = stacks.find(x => x.name === 'java');
    const javaContainers = stacks.find(x => x.name === 'javaContainers');
    if (!javaStack || !javaContainers) {
      return;
    }
    if (!this.state.initialized) {
      this.setState({
        currentJavaMajorVersion: this.getJavaMajorVersion(javaStack!.properties),
        initialized: true,
      });
    }
  }
  public componentWillUpdate() {
    const { stacks } = this.props;
    const javaStack = stacks.find(x => x.name === 'java');
    const javaContainers = stacks.find(x => x.name === 'javaContainers');
    if (!javaStack || !javaContainers) {
      return;
    }
    if (!this.state.initialized) {
      this.setState({
        currentJavaMajorVersion: this.getJavaMajorVersion(javaStack!.properties),
        initialized: true,
      });
    }
  }

  public render() {
    const { stacks, values, t } = this.props;
    const javaStack = stacks.find(x => x.name === 'java');
    const javaContainers = stacks.find(x => x.name === 'javaContainers');
    if (!javaStack || !javaContainers) {
      return null;
    }

    // Java Versions
    const javaVersions = javaStack.properties.majorVersions.map<IDropdownOption>(val => {
      return {
        key: val.runtimeVersion,
        text: `Java ${val.runtimeVersion.split('.')[1]}`,
      };
    });

    const currentJavaMajorVersionOption = javaStack.properties.majorVersions.find(
      x => x.runtimeVersion === this.state.currentJavaMajorVersion
    );
    let javaMinorVersionOptions: IDropdownOption[] = [];
    if (currentJavaMajorVersionOption) {
      javaMinorVersionOptions = currentJavaMajorVersionOption.minorVersions.map(val => {
        const newest = val.isDefault ? ` (${t('newest')})` : '';
        return {
          key: val.runtimeVersion,
          text: `${val.displayVersion}${newest}`,
        };
      });
    }

    // container versions
    const frameworks = javaContainers.properties.frameworks.map<IDropdownOption>(val => {
      return {
        key: val.name.toUpperCase(),
        text: val.display,
      };
    });

    const currentFramework =
      values.config.properties.javaContainer &&
      javaContainers.properties.frameworks.find(x => x.name.toLowerCase() === values.config.properties.javaContainer.toLowerCase());
    let javaFrameworkVersionOptions: IDropdownOption[] = [];
    if (currentFramework) {
      const majorVersions = currentFramework.majorVersions.map(val => {
        const version = [
          {
            key: val.runtimeVersion,
            text: `${val.displayVersion} (${t('latestMinorVersion')})`,
          },
        ];
        return version.concat(
          val.minorVersions.map(inner => {
            return {
              key: inner.runtimeVersion,
              text: inner.displayVersion,
            };
          })
        );
      });
      majorVersions.forEach(x => {
        javaFrameworkVersionOptions = javaFrameworkVersionOptions.concat(x);
      });
    }

    return (
      <div>
        <OfficeDropdown
          label={t('javaVersion')}
          selectedKey={this.state.currentJavaMajorVersion}
          id="app-settings-java-container"
          options={javaVersions}
          onChange={this.onMajorVersionChange}
        />
        <Field
          name="config.properties.javaVersion"
          component={Dropdown}
          label={t('javaMinorVersion')}
          id="app-settings-java-container"
          options={javaMinorVersionOptions}
        />
        <Field
          name="config.properties.javaContainer"
          component={Dropdown}
          label={t('javaContainer')}
          id="app-settings-java-container-version"
          options={frameworks}
        />
        <Field
          name="config.properties.javaContainerVersion"
          component={Dropdown}
          label={t('javaContainerVersion')}
          id="app-settings-java-container-version"
          options={javaFrameworkVersionOptions}
        />
      </div>
    );
  }

  private onMajorVersionChange = (e: unknown, option: IDropdownOption) => {
    this.setState({
      currentJavaMajorVersion: option.key as string,
    });
  };
  private getJavaMajorVersion = (javaStack: AvailableStack) => {
    const { javaVersion } = this.props.values.config.properties;
    const javaMajorVersion = javaStack.majorVersions.find(x => !!x.minorVersions.find(y => y.runtimeVersion === javaVersion));
    if (javaMajorVersion) {
      return javaMajorVersion.runtimeVersion;
    }
    const defaultVersion = javaStack.majorVersions.find(x => x.isDefault);
    return defaultVersion ? defaultVersion.runtimeVersion : '1.8';
  };
}

const mapStateToProps = (state: IState, ownProps: FormikProps<AppSettingsFormValues>) => {
  return {
    stacks: state.stacks.stacks.value,
    stacksLoading: state.stacks.loading,
    config: state.webConfig.config,
    configLoading: state.webConfig.loading,
  };
};
export default connect(
  mapStateToProps,
  null
)(JavaStack);
