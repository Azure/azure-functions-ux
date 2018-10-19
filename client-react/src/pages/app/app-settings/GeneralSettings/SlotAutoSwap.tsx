import * as React from 'react';
import { FormikProps, Field } from 'formik';
import { AppSettingsFormValues } from '../AppSettings.Types';
import IState from 'src/modules/types';
import { connect } from 'react-redux';
import { ArmArray, Site, ArmObj } from 'src/models/WebAppModels';
import { fetchSlotList } from 'src/modules/site/slots/thunks';
import { IDropdownOption } from 'office-ui-fabric-react/lib-commonjs/Dropdown';
import { Toggle } from 'office-ui-fabric-react/lib-commonjs/Toggle';
import { settingsWrapper } from '../AppSettingsForm';
import Dropdown from 'src/components/form-controls/DropDown';

interface SlotAutoSwapPropsStateMap {
  slots: ArmArray<Partial<Site>>;
  site: ArmObj<Partial<Site>>;
}

interface SlotAutoSwapPropsDispatchMap {
  fetchSlotList: () => {};
}

export class SlotAutoSwap extends React.Component<
  FormikProps<AppSettingsFormValues> & SlotAutoSwapPropsStateMap & SlotAutoSwapPropsDispatchMap,
  any
> {
  public componentWillMount() {
    this.props.fetchSlotList();
  }
  public render() {
    if (!this.props.slots) {
      return null;
    }
    if (this.props.slots.value.length < 1) {
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
            <h3>Slot swapping</h3>
            <div className={settingsWrapper}>
              <Toggle
                label="Auto Swap Enabled"
                checked={!!this.props.values.config.properties.autoSwapSlotName}
                tabIndex={0}
                onChange={this.onToggleChange}
              />
              {!!this.props.values.config.properties.autoSwapSlotName && (
                <Field
                  name="config.properties.autoSwapSlotName"
                  component={Dropdown}
                  label="Auto Swap Slot"
                  id="autoSwapSlotName"
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

const mapStateToProps = (state: IState, otherProps: FormikProps<AppSettingsFormValues>) => ({
  slots: state.slots.slots,
  site: state.site.site,
});
const mapDispatchToProps = dispatch => {
  return {
    fetchSlotList: () => dispatch(fetchSlotList()),
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SlotAutoSwap);
