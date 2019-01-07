import { Field, FormikProps } from 'formik';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import * as React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';

import Dropdown from '../../../../components/form-controls/DropDown';
import { ArmArray, ArmObj, Site } from '../../../../models/WebAppModels';
import { fetchSlotsRequest } from '../../../../modules/site/slots/actions';
import { RootState } from '../../../../modules/types';
import { AppSettingsFormValues } from '../AppSettings.types';
import { settingsWrapper } from '../AppSettingsForm';

interface SlotAutoSwapPropsStateMap {
  slots: ArmArray<Site>;
  site: ArmObj<Site>;
}

interface SlotAutoSwapPropsDispatchMap {
  fetchSlotList: () => {};
}

export class SlotAutoSwap extends React.Component<
  FormikProps<AppSettingsFormValues> & SlotAutoSwapPropsStateMap & SlotAutoSwapPropsDispatchMap & InjectedTranslateProps,
  any
> {
  public componentWillMount() {
    this.props.fetchSlotList();
  }
  public render() {
    const { slots, t } = this.props;
    if (!slots) {
      return null;
    }
    if (slots.value.length < 1) {
      return null;
    }
    const slotDropDownItems = this.getSlotNameList().map<IDropdownOption>(val => ({
      key: val,
      text: val,
    }));

    return (
      <>
        {this.getCurrentSlotName() !== 'production' && (
          <>
            <h3>{t('slots')}</h3>
            <div className={settingsWrapper}>
              <Toggle
                label={t('autoSwapEnabled')}
                id="app-settings-auto-swap-enabled"
                checked={!!this.props.values.config.properties.autoSwapSlotName}
                onChange={this.onToggleChange}
              />
              {!!this.props.values.config.properties.autoSwapSlotName && (
                <Field
                  name="config.properties.autoSwapSlotName"
                  component={Dropdown}
                  fullpage
                  label={t('autoSwapSlot')}
                  id="app-settings-auto-swap-slot-name"
                  options={slotDropDownItems}
                />
              )}
            </div>
          </>
        )}
      </>
    );
  }

  private onToggleChange = (e: any, newValue: boolean) => {
    if (!newValue) {
      this.props.setFieldValue('config.properties.autoSwapSlotName', '');
    } else {
      const firstSlotName = this.getSlotNameList()[0];
      this.props.setFieldValue('config.properties.autoSwapSlotName', firstSlotName);
    }
  };

  private getCurrentSlotName = () => {
    const slotList = this.props.slots.value.map(val => val.name.split('/')[1]);
    slotList.push('production');
    return this.props.site.name.includes('/') ? this.props.site.name.split('/')[1] : 'production';
  };

  private getSlotNameList = () => {
    const slotList = this.props.slots.value.map(val => val.name.split('/')[1]);
    slotList.push('production');
    const currentSiteName = this.getCurrentSlotName();

    return slotList.filter(x => x.toLowerCase() !== currentSiteName.toLowerCase());
  };
}

const mapStateToProps = (state: RootState, otherProps: FormikProps<AppSettingsFormValues>) => ({
  slots: state.slots.data,
  site: state.site.data,
});
const mapDispatchToProps = dispatch => {
  return {
    fetchSlotList: () => dispatch(fetchSlotsRequest()),
  };
};
export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  translate('translation')
)(SlotAutoSwap);
