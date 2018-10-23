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

export const settingsWrapper = style({
  paddingLeft: '15px',
  padding: '5px 20px',
  width: '535px',
});

const defaultDocumentsWrapper = style({
  width: '565px',
});
class AppSettingsForm extends React.Component<FormikProps<AppSettingsFormValues> & InjectedTranslateProps, any> {
  public render() {
    const { t } = this.props;
    return (
      <Pivot>
        <PivotItem linkText={t('generalSettings')}>
          <h3>{t('stackSettings')}</h3>
          <div className={settingsWrapper}>
            <Stacks {...this.props} />
          </div>
          <h3>{t('platformSettings')}</h3>
          <div className={settingsWrapper}>
            <Platform {...this.props} />
          </div>
          <h3>{t('debugging')}</h3>
          <div className={settingsWrapper}>
            <Debug {...this.props} />
          </div>
          <SlotAutoSwap {...this.props} />
        </PivotItem>
        <PivotItem linkText={t('applicationSettings')}>
          <h3>{t('applicationSettings')}</h3>
          <ApplicationSettings {...this.props} />
          <h3>{t('connectionStrings')}</h3>
          <ConnectionStrings {...this.props} />
        </PivotItem>
        <PivotItem linkText={t('defaultDocuments')}>
          <h3>{t('defaultDocuments')}</h3>
          <div className={defaultDocumentsWrapper}>
            <DefaultDocuments {...this.props} />
          </div>
        </PivotItem>
        <PivotItem linkText={t('pathMappings')}>
          <h3>{t('handlerMappings')}</h3>
          <HandlerMappings {...this.props} />
          <h3>{t('virtualApplications')}</h3>
          <VirtualApplications {...this.props} />
        </PivotItem>
      </Pivot>
    );
  }
}

export default translate('translation')(AppSettingsForm);
