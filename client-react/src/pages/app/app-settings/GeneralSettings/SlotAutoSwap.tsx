import { Field, FormikProps } from 'formik';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
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
import { style } from 'typestyle';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';

interface SlotAutoSwapPropsStateMap {
  slots: ArmArray<Site>;
  site: ArmObj<Site>;
}

interface SlotAutoSwapPropsDispatchMap {
  fetchSlotList: () => {};
}
const labelStyle = style({
  display: 'inline-block',
  width: '200px',
});
const ChioceGroupStyle = style({
  display: 'inline-block',
  width: 'calc(100%-200px)',
});
export class SlotAutoSwap extends React.Component<
  FormikProps<AppSettingsFormValues> & SlotAutoSwapPropsStateMap & SlotAutoSwapPropsDispatchMap & InjectedTranslateProps,
  any
> {
  public componentWillMount() {
    this.props.fetchSlotList();
  }
  public render() {
    const { slots, t, values } = this.props;
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
            {!values.productionWritePermission ? (
              <div data-cy="auto-swap-disabled-message">
                <MessageBar messageBarType={MessageBarType.warning} isMultiline={true}>
                  {t('autoSwapSettingPermissionFail')}
                </MessageBar>
              </div>
            ) : (
              <div className={settingsWrapper} data-cy="auto-swap-control-set">
                <Label id={`app-settings-auto-swap-enabled-label`} className={labelStyle}>
                  {t('autoSwapEnabled')}
                </Label>
                <ChoiceGroup
                  ariaLabelledBy={`app-settings-auto-swap-enabled-label`}
                  id="app-settings-auto-swap-enabled"
                  className={ChioceGroupStyle}
                  selectedKey={!!this.props.values.config.properties.autoSwapSlotName ? 'on' : 'off'}
                  options={[
                    {
                      key: 'off',
                      /**
                       * The text string for the option.
                       */
                      text: t('off'),
                    },
                    {
                      key: 'on',
                      /**
                       * The text string for the option.
                       */
                      text: t('on'),
                    },
                  ]}
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
            )}
          </>
        )}
      </>
    );
  }

  private onToggleChange = (e: any, newValue: IChoiceGroupOption) => {
    if (newValue.key === 'off') {
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
