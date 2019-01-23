import { Field, FormikProps } from 'formik';
import { Dropdown as OfficeDropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import * as React from 'react';
import { InjectedTranslateProps } from 'react-i18next';
import { connect } from 'react-redux';

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
          label={t('javaVersionLabel')}
          selectedKey={this.state.currentJavaMajorVersion}
          id="app-settings-java-major-verison"
          disabled={!values.siteWritePermission}
          options={javaVersions}
          onChange={this.onMajorVersionChange}
          styles={{
            label: [
              {
                display: 'inline-block',
              },
            ],
            dropdown: [
              {
                display: 'inline-block',
              },
            ],
          }}
        />
        <Field
          name="config.properties.javaVersion"
          component={Dropdown}
          fullpage
          disabled={!values.siteWritePermission}
          label={t('javaMinorVersion')}
          id="app-settings-java-minor-verison"
          options={javaMinorVersionOptions}
        />
        <Field
          name="config.properties.javaContainer"
          component={Dropdown}
          fullpage
          label={t('javaContainer')}
          disabled={!values.siteWritePermission}
          id="app-settings-java-container-runtime"
          options={frameworks}
        />
        <Field
          name="config.properties.javaContainerVersion"
          component={Dropdown}
          fullpage
          disabled={!values.siteWritePermission}
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

const mapStateToProps = (state: RootState, ownProps: FormikProps<AppSettingsFormValues>) => {
  return {
    stacks: state.stacks.data.value,
    stacksLoading: state.stacks.metadata.loading,
    config: state.webConfig.data,
    configLoading: state.webConfig.metadata.loading,
  };
};
export default connect(
  mapStateToProps,
  null
)(JavaStack);
