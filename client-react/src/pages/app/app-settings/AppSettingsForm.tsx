import * as React from 'react';
import { translate, InjectedTranslateProps } from 'react-i18next';

import { style } from 'typestyle';
import Stacks from './GeneralSettings/Stacks';
import Platform from './GeneralSettings/Platform';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib-commonjs/Pivot';
import ApplicationSettings from './ApplicationSettings/ApplicationSettings';
import { AppSettingsFormValues } from './AppSettings.Types';
import { FormikProps } from 'formik';
import ConnectionStrings from './ConnectionStrings/ConnectionStrings';
import DefaultDocuments from './DefaultDocuments/DefaultDocuments';
import HandlerMappings from './HandlerMappings/HandlerMappings';
import VirtualApplications from './VirtualApplications/VirtualApplications';
import Debug from './GeneralSettings/Debugging';
import SlotAutoSwap from './GeneralSettings/SlotAutoSwap';
import { ScenarioService } from '../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../utils/scenario-checker/scenario-ids';

export const settingsWrapper = style({
  paddingLeft: '15px',
  padding: '5px 20px',
  width: '535px',
});

const defaultDocumentsWrapper = style({
  width: '565px',
});
class AppSettingsForm extends React.Component<FormikProps<AppSettingsFormValues> & InjectedTranslateProps, any> {
  private scenarioChecker: ScenarioService;

  public componentWillMount() {
    this.scenarioChecker = new ScenarioService(this.props.t);
  }
  public render() {
    const { t } = this.props;
    const props = this.props;
    return (
      <Pivot>
        <PivotItem linkText={t('generalSettings')}>
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

  private getPathMappings = () => {
    const { t, values } = this.props;
    const props = this.props;
    const { site } = values;
    if (this.scenarioChecker.checkScenario(ScenarioIds.virtualDirectoriesSupported, { site }).status !== 'disabled') {
      return (
        <PivotItem linkText={t('pathMappings')}>
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
        <PivotItem linkText={t('defaultDocuments')}>
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
    const { t } = this.props;
    const props = this.props;
    return (
      <PivotItem linkText={t('applicationSettings')}>
        <h3>{t('applicationSettings')}</h3>
        <ApplicationSettings {...props} />
        <h3>{t('connectionStrings')}</h3>
        <ConnectionStrings {...props} />
      </PivotItem>
    );
  };
}

export default translate('translation')(AppSettingsForm);
