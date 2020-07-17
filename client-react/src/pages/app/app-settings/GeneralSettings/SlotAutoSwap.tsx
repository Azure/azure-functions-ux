import { Field, FormikProps } from 'formik';
import { IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import Dropdown from '../../../../components/form-controls/DropDown';
import RadioButtonNoFormik from '../../../../components/form-controls/RadioButtonNoFormik';
import { AppSettingsFormValues } from '../AppSettings.types';
import { settingsWrapper } from '../AppSettingsForm';
import { PermissionsContext, SlotsListContext } from '../Contexts';

export const SlotAutoSwap: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const slots = useContext(SlotsListContext);
  const { t } = useTranslation();
  const { production_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !editable || saving;
  const { values, initialValues } = props;

  const onToggleChange = (e: any, newValue: IChoiceGroupOption) => {
    if (newValue.key === 'off') {
      props.setFieldValue('config.properties.autoSwapSlotName', '');
    } else {
      const firstSlotName = getSlotNameList()[0];
      props.setFieldValue('config.properties.autoSwapSlotName', firstSlotName);
    }
  };

  const getCurrentSlotName = () => {
    const slotList = slots.value.map(val => val.name.split('/')[1]);
    slotList.push('production');
    return values.site.name.includes('/') ? values.site.name.split('/')[1] : 'production';
  };

  const getSlotNameList = () => {
    const slotList = slots.value.map(val => val.name.split('/')[1]);
    slotList.push('production');
    const currentSiteName = getCurrentSlotName();

    return slotList.filter(x => x.toLowerCase() !== currentSiteName.toLowerCase());
  };

  const isSiteLinux = (): boolean => {
    return values.site.kind!.includes('linux');
  };

  if (!slots || slots.value.length < 1) {
    return null;
  }

  const slotDropDownItems = getSlotNameList().map<IDropdownOption>(val => ({
    key: val,
    text: val,
  }));

  return (
    <>
      {getCurrentSlotName() !== 'production' && !isSiteLinux() && (
        <>
          <h3>{t('slots')}</h3>
          {!production_write ? (
            <div data-cy="auto-swap-disabled-message">
              <CustomBanner message={t('autoSwapSettingPermissionFail')} type={MessageBarType.warning} undocked={true} />
            </div>
          ) : (
            <div className={settingsWrapper} data-cy="auto-swap-control-set">
              <RadioButtonNoFormik
                label={t('autoSwapEnabled')}
                dirty={!!values.config.properties.autoSwapSlotName !== !!initialValues.config.properties.autoSwapSlotName}
                ariaLabelledBy={`app-settings-auto-swap-enabled-label`}
                id="app-settings-auto-swap-enabled"
                disabled={disableAllControls}
                selectedKey={!!values.config.properties.autoSwapSlotName ? 'on' : 'off'}
                options={[
                  {
                    key: 'on',
                    text: t('on'),
                  },
                  {
                    key: 'off',
                    text: t('off'),
                  },
                ]}
                onChange={onToggleChange}
              />
              {!!values.config.properties.autoSwapSlotName && (
                <Field
                  name="config.properties.autoSwapSlotName"
                  dirty={values.config.properties.autoSwapSlotName !== initialValues.config.properties.autoSwapSlotName}
                  disabled={disableAllControls}
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
};

export default SlotAutoSwap;
