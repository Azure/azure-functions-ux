import { FormikProps } from 'formik';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import * as React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { style } from 'typestyle';

import { ScenarioIds } from '../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../utils/scenario-checker/scenario.service';
import ApplicationSettings from './ApplicationSettings/ApplicationSettings';
import { AppSettingsFormValues } from './AppSettings.types';
import ConnectionStrings from './ConnectionStrings/ConnectionStrings';
import DefaultDocuments from './DefaultDocuments/DefaultDocuments';
import Debug from './GeneralSettings/Debugging';
import Platform from './GeneralSettings/Platform';
import SlotAutoSwap from './GeneralSettings/SlotAutoSwap';
import Stacks from './GeneralSettings/Stacks';
import HandlerMappings from './HandlerMappings/HandlerMappings';
import VirtualApplications from './VirtualApplications/VirtualApplications';

export const settingsWrapper = style({
  paddingLeft: '15px',
  padding: '5px 20px',
});

const defaultDocumentsWrapper = style({
  width: '565px',
});
class AppSettingsForm extends React.Component<FormikProps<AppSettingsFormValues> & InjectedTranslateProps, any> {
  private scenarioChecker!: ScenarioService;

  public componentWillMount() {
    this.scenarioChecker = new ScenarioService(this.props.t);
  }
  public render() {
    const { t } = this.props;
    const props = this.props;
    return (
      <Pivot getTabId={this.getPivotTabId}>
        <PivotItem itemKey="generalSettings" linkText={t('generalSettings')}>
          <Stacks {...props} />
          <h3>{t('platformSettings')}</h3>
          <div className={settingsWrapper}>
            <Platform {...props} />
          </div>
          {this.getDebuggingRender()}
          <SlotAutoSwap {...props} />
        </PivotItem>
        {this.getAppSettingsPivot()}
        {this.getDefaultDocuments()}
        {this.getPathMappings()}
      </Pivot>
    );
  }

  private getPivotTabId = (itemKey: string, index: number) => {
    switch (itemKey) {
      case 'generalSettings':
        return 'app-settings-general-settings-tab';
      case 'pathMappings':
        return 'app-settings-path-mappings-tab';
      case 'defaultDocuments':
        return 'app-settings-default-documents-tab';
      case 'applicationSettings':
        return 'app-settings-application-settings-tab';
    }
    return '';
  };
  private getPathMappings = () => {
    const { t, values } = this.props;
    const props = this.props;
    const { site } = values;
    if (this.scenarioChecker.checkScenario(ScenarioIds.virtualDirectoriesSupported, { site }).status !== 'disabled') {
      return (
        <PivotItem itemKey="pathMappings" linkText={t('pathMappings')}>
          <h3>{t('handlerMappings')}</h3>
          <HandlerMappings {...props} />
          <h3>{t('virtualApplications')}</h3>
          <VirtualApplications {...props} />
        </PivotItem>
      );
    }
    return <></>;
  };

  private getDefaultDocuments = () => {
    const { t, values } = this.props;
    const props = this.props;
    const { site } = values;
    if (this.scenarioChecker.checkScenario(ScenarioIds.defaultDocumentsSupported, { site }).status !== 'disabled') {
      return (
        <PivotItem itemKey="defaultDocuments" linkText={t('defaultDocuments')}>
          <h3>{t('defaultDocuments')}</h3>
          <div className={defaultDocumentsWrapper}>
            <DefaultDocuments {...props} />
          </div>
        </PivotItem>
      );
    }
    return <></>;
  };
  private getDebuggingRender = () => {
    const { values } = this.props;
    const { site } = values;

    if (this.scenarioChecker.checkScenario(ScenarioIds.remoteDebuggingSupported, { site }).status !== 'disabled') {
      return <Debug {...this.props} />;
    }
    return null;
  };

  private getAppSettingsPivot = () => {
    const { t, values } = this.props;
    const props = this.props;
    return (
      <PivotItem itemKey="applicationSettings" linkText={t('applicationSettings')}>
        <h3>{t('applicationSettings')}</h3>
        {values.siteWritePermission ? (
          <div id="app-settings-application-settings-table">
            <ApplicationSettings {...props} />
          </div>
        ) : (
          <div id="app-settings-app-settings-rbac-message">
            <MessageBar messageBarType={MessageBarType.warning} isMultiline={false}>
              You do not have permission to view application settings on this web app //TODO: GET BETTER STRING
            </MessageBar>
          </div>
        )}
        <h3>{t('connectionStrings')}</h3>
        {values.siteWritePermission ? (
          <div id="app-settings-connection-strings-table">
            <ConnectionStrings {...props} />
          </div>
        ) : (
          <div id="app-settings-connection-strings-rbac-message">
            <MessageBar messageBarType={MessageBarType.warning} isMultiline={false}>
              You do not have permission to view connection strings on this web app //TODO: GET BETTER STRING
            </MessageBar>
          </div>
        )}
      </PivotItem>
    );
  };
}

export default translate('translation')(AppSettingsForm);
