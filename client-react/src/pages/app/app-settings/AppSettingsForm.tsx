import * as React from 'react';
import { translate } from 'react-i18next';

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
class AppSettingsForm extends React.Component<FormikProps<AppSettingsFormValues>, any> {
  public render() {
    return (
      <Pivot>
        <PivotItem linkText="General Settings">
          <h3>Stack Settings</h3>
          <div className={settingsWrapper}>
            <Stacks {...this.props} />
          </div>
          <h3>Platform Settings</h3>
          <div className={settingsWrapper}>
            <Platform {...this.props} />
          </div>
          <h3>Debugging</h3>
          <div className={settingsWrapper}>
            <Debug {...this.props} />
          </div>
          <SlotAutoSwap {...this.props} />
        </PivotItem>
        <PivotItem linkText="Application Settings">
          <h3>Application Settings</h3>
          <ApplicationSettings {...this.props} />
          <h3>Connection Strings</h3>
          <ConnectionStrings {...this.props} />
        </PivotItem>
        <PivotItem linkText="Default Documents">
          <h3>Default Documents</h3>
          <div className={defaultDocumentsWrapper}>
            <DefaultDocuments {...this.props} />
          </div>
        </PivotItem>
        <PivotItem linkText="Path Mappings">
          <h3>Handler Mappings</h3>
          <HandlerMappings {...this.props} />
          <h3>Virtual applications and directories</h3>
          <VirtualApplications {...this.props} />
        </PivotItem>
      </Pivot>
    );
  }
}

export default translate('translation')(AppSettingsForm);
