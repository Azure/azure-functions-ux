import * as React from 'react';
import { connect } from 'react-redux';
import { fetchSite, updateSite } from '../../../modules/site/thunks';
import { fetchConfig, updateConfig } from '../../../modules/site/config/web/thunks';
import { fetchAppSettings } from '../../../modules/site/config/appsettings/thunks';
import { fetchConnectionStrings } from '../../../modules/site/config/connectionstrings/thunks';
import { compose } from 'recompose';
import { translate } from 'react-i18next';
import { Formik, FormikProps, FormikActions } from 'formik';
import AppSettingsForm from './AppSettingsForm';
import LoadingComponent from '../../../components/loading/loading-component';
import { style } from 'typestyle';
import { ArmObj, Site, SiteConfig, VirtualApplication } from '../../../models/WebAppModels';
import { AppSetting } from '../../../modules/site/config/appsettings/appsettings.types';
import { IConnectionString } from '../../../modules/site/config/connectionstrings/actions';
import { AppSettingsFormValues } from './AppSettings.Types';
import { fetchStacks } from '../../../modules/service/available-stacks/thunks';
import IState from '../../../modules/types';
import AppSettingsCommandBar from './AppSettingsCommandBar';

export interface AppSettingsProps {
  fetchSite: () => Promise<ArmObj<Site>>;
  fetchSettings: () => void;
  fetchConfig: () => void;
  fetchConnStrings: () => void;
  fetchStacks: (osType: string) => void;
  updateSite: (site: any, appSettings: any, connectionStrings: any) => void;
  updateConfig: (config: any, stack: string, virtualApplications: any) => void;
  site: ArmObj<Partial<Site>>;
  config: ArmObj<Partial<SiteConfig>>;
  virtualApplications: VirtualApplication[];
  currentlySelectedStack: string;
  appSettings: AppSetting[];
  connectionStrings: IConnectionString[];
}

export interface AppSettingsState {
  isSubmitting: boolean;
  isValidating: boolean;
}
const formStyle = style({
  padding: '5px 20px',
});

export class AppSettings extends React.Component<AppSettingsProps, AppSettingsState> {
  constructor(props) {
    super(props);
    this.state = {
      isSubmitting: false,
      isValidating: false,
    };
  }
  public componentWillMount() {
    this.props.fetchSettings();
    this.props.fetchConfig();
    this.props.fetchConnStrings();
    this.props.fetchSite().then(value => {
      if (value && value.kind) {
        if (value.kind.includes('linux')) {
          this.props.fetchStacks('Linux');
        } else {
          this.props.fetchStacks('Windows');
        }
      }
    });
  }

  public onSubmit = async (values: AppSettingsFormValues, actions: FormikActions<AppSettingsFormValues>) => {
    this.setState({ isSubmitting: true });

    await Promise.all([
      this.props.updateSite(values.site, values.appSettings, values.connectionStrings),
      this.props.updateConfig(values.config, values.currentlySelectedStack, values.virtualApplications),
    ]);
    this.setState({ isSubmitting: false });
    actions.setSubmitting(false);
  };
  public render() {
    return (
      <Formik
        initialValues={this.initialValues(this.props)}
        onSubmit={this.onSubmit}
        enableReinitialize={true}
        validateOnBlur
        validateOnChange>
        {(props: FormikProps<AppSettingsFormValues>) => {
          if (this.state.isSubmitting) {
            return <LoadingComponent pastDelay={true} error={false} isLoading={true} timedOut={false} retry={() => null} />;
          }
          return (
            <div>
              <AppSettingsCommandBar submitForm={props.submitForm} resetForm={props.resetForm} dirty={props.dirty} />
              <div className={formStyle}>
                <AppSettingsForm {...props} />
              </div>
            </div>
          );
        }}
      </Formik>
    );
  }

  public initialValues = ({
    site,
    config,
    appSettings,
    connectionStrings,
    virtualApplications,
    currentlySelectedStack,
  }): AppSettingsFormValues => ({
    site,
    config,
    virtualApplications,
    appSettings,
    connectionStrings,
    currentlySelectedStack,
  });
}

const mapStateToProps = (state: IState) => {
  return {
    site: state.site.site,
    currentlySelectedStack: state.webConfig.currentlySelectedStack,
    config: state.webConfig.config,
    virtualApplications: state.webConfig.virtualApplications,
    appSettings: state.appSettings.settings,
    connectionStrings: state.connectionStrings.connectionStrings,
  };
};
const mapDispatchToProps = dispatch => {
  return {
    fetchSite: () => dispatch(fetchSite()),
    fetchSettings: () => dispatch(fetchAppSettings()),
    fetchConnStrings: () => dispatch(fetchConnectionStrings()),
    fetchConfig: () => dispatch(fetchConfig()),
    fetchStacks: (osType: string) => dispatch(fetchStacks(osType)),
    updateSite: (value, appSettings, connectionStrings) => dispatch(updateSite(value, appSettings, connectionStrings)),
    updateConfig: (value, stack, virtualApplications) => dispatch(updateConfig(value, stack, virtualApplications)),
  };
};
export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  translate('translation')
)(AppSettings);
