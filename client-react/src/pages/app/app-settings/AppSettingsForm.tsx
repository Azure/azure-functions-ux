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
    const props = this.props;
    return (
      <Pivot>
        <PivotItem linkText={t('generalSettings')}>
          <Stacks {...props} />
          <h3>{t('platformSettings')}</h3>
          <div className={settingsWrapper}>
            <Platform {...props} />
          </div>
          <h3>{t('debugging')}</h3>
          <div className={settingsWrapper}>
            <Debug {...props} />
          </div>
          <SlotAutoSwap {...props} />
        </PivotItem>
        <PivotItem linkText={t('applicationSettings')}>
          <h3>{t('applicationSettings')}</h3>
          <ApplicationSettings {...props} />
          <h3>{t('connectionStrings')}</h3>
          <ConnectionStrings {...props} />
        </PivotItem>
        <PivotItem linkText={t('defaultDocuments')}>
          <h3>{t('defaultDocuments')}</h3>
          <div className={defaultDocumentsWrapper}>
            <DefaultDocuments {...props} />
          </div>
        </PivotItem>
        <PivotItem linkText={t('pathMappings')}>
          <h3>{t('handlerMappings')}</h3>
          <HandlerMappings {...props} />
          <h3>{t('virtualApplications')}</h3>
          <VirtualApplications {...props} />
        </PivotItem>
      </Pivot>
    );
  }
}

export default translate('translation')(AppSettingsForm);
