import React, { useContext, useState, useEffect } from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { FieldProps, Formik, FormikProps } from 'formik';
import LoadingComponent from '../../../../../../components/loading/loading-component';
import { IoTHubPivotContext } from './IoTHubPivotDataLoader';
import { IotHub, KeyList } from '../../../../../../models/iothub';
import { ArmObj } from '../../../../../../models/arm-obj';
import LogService from '../../../../../../utils/LogService';
import { LogCategories } from '../../../../../../utils/LogCategories';
import { IDropdownOption, Dropdown, DefaultButton } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { paddingSidesStyle, paddingTopStyle } from '../Callout.styles';
import { BindingEditorFormValues } from '../../BindingFormBuilder';

interface IoTHubPivotFormValues {
  iotHub: ArmObj<IotHub> | undefined;
  endpoint: string | undefined;
}

const IotHubPivot: React.SFC<NewConnectionCalloutProps & FieldProps> = props => {
  const provider = useContext(IoTHubPivotContext);
  const { t } = useTranslation();
  const { resourceId } = props;
  const [formValues, setFormValues] = useState<IoTHubPivotFormValues>({ iotHub: undefined, endpoint: undefined });
  const [iotHubs, setIoTHubs] = useState<ArmObj<IotHub>[] | undefined>(undefined);
  const [keyList, setKeyList] = useState<KeyList | undefined>(undefined);

  useEffect(() => {
    if (!iotHubs) {
      provider.fetchIotHubs(resourceId).then(r => {
        if (!r.metadata.success) {
          LogService.trackEvent(LogCategories.bindingResource, 'getIoTHubs', `Failed to get IoTHubs: ${r.metadata.error}`);
          return;
        }
        setIoTHubs(r.data.value);
      });
    } else if (formValues.iotHub && !keyList) {
      provider.fetchKeyList(formValues.iotHub.id).then(r => {
        if (!r.metadata.success) {
          LogService.trackEvent(LogCategories.bindingResource, 'getKeyList', `Failed to get Key List: ${r.metadata.error}`);
          return;
        }
        setKeyList(r.data);
      });
    }
  }, [formValues]);

  if (!iotHubs) {
    return <LoadingComponent />;
  }

  const iotHubOptions: IDropdownOption[] = [];
  iotHubs.forEach(iotHub => iotHubOptions.push({ text: iotHub.name, key: iotHub.id, data: iotHub }));
  if (!formValues.iotHub && iotHubOptions.length > 0) {
    setFormValues({ ...formValues, iotHub: iotHubs[0] });
  }

  let endpointOptions: IDropdownOption[] = [];
  if (keyList) {
    const serviceKey = keyList.value.find(key => key.rights.toLowerCase().indexOf('registry') > -1);
    if (serviceKey) {
      endpointOptions = [
        { text: t('iotHubPivot_IOTEvents'), key: 'events', data: 'events' },
        { text: t('iotHubPivot_IOTMonitoring'), key: 'monitoring', data: 'monitoring' },
      ];
    }
    if (!formValues.endpoint && endpointOptions.length > 0) {
      setFormValues({ ...formValues, endpoint: 'events' });
    }
  }

  return (
    <Formik
      initialValues={formValues}
      onSubmit={() =>
        createIoTHubConnection(formValues, keyList, props.setNewAppSettingName, props.setIsDialogVisible, props.form, props.field)
      }>
      {(formProps: FormikProps<IoTHubPivotFormValues>) => {
        return (
          <form style={paddingSidesStyle}>
            {!!iotHubs && iotHubs.length === 0 ? (
              <p>{t('iotHubPivot_noIoTHubs')}</p>
            ) : (
              <>
                <Dropdown
                  label={t('iotHubPivot_IoTHub')}
                  options={iotHubOptions}
                  selectedKey={formValues.iotHub && formValues.iotHub.id}
                  onChange={(o, e) => {
                    setFormValues({ iotHub: e && e.data, endpoint: undefined });
                    setKeyList(undefined);
                  }}
                />
                {!keyList && <LoadingComponent />}
                {!!keyList && !!endpointOptions && endpointOptions.length === 0 ? (
                  <p>{t('iotHubPivot_noEndpoints')}</p>
                ) : (
                  <>
                    <Dropdown
                      label={t('iotHubPivot_Endpoint')}
                      options={endpointOptions}
                      selectedKey={formValues.endpoint}
                      onChange={(o, e) => {
                        setFormValues({ ...formValues, endpoint: e && e.data });
                      }}
                    />
                    {!keyList && <LoadingComponent />}
                  </>
                )}
              </>
            )}
            <footer style={paddingTopStyle}>
              <DefaultButton disabled={!formValues.endpoint} onClick={formProps.submitForm}>
                {t('ok')}
              </DefaultButton>
            </footer>
          </form>
        );
      }}
    </Formik>
  );
};

const createIoTHubConnection = (
  formValues: IoTHubPivotFormValues,
  keyList: KeyList | undefined,
  setNewAppSettingName: (e: string) => void,
  setIsDialogVisible: (d: boolean) => void,
  formProps: FormikProps<BindingEditorFormValues>,
  field: { name: string; value: any }
) => {
  if (formValues.iotHub && formValues.endpoint && keyList) {
    const appSettingName = `${formValues.iotHub.name}_${formValues.endpoint}_IOTHUB`;
    formProps.setFieldValue(field.name, appSettingName);
    setNewAppSettingName(appSettingName);
    setIsDialogVisible(false);
  }
};

export default IotHubPivot;
