import React, { useContext, useState, useEffect } from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { Formik, FormikProps, FieldProps } from 'formik';
import LoadingComponent from '../../../../../../components/Loading/LoadingComponent';
import { IoTHubPivotContext } from './IoTHubPivotDataLoader';
import { IotHub, KeyList, Key } from '../../../../../../models/iothub';
import { ArmObj } from '../../../../../../models/arm-obj';
import LogService from '../../../../../../utils/LogService';
import { LogCategories } from '../../../../../../utils/LogCategories';
import { IDropdownOption, DefaultButton, IDropdownProps } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { paddingSidesStyle, paddingTopStyle } from '../Callout.styles';
import Dropdown, { CustomDropdownProps } from '../../../../../../components/form-controls/DropDown';

interface IoTHubPivotFormValues {
  iotHub: ArmObj<IotHub> | undefined;
  endpoint: string | undefined;
}

const IotHubPivot: React.SFC<NewConnectionCalloutProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const provider = useContext(IoTHubPivotContext);
  const { t } = useTranslation();
  const { resourceId } = props;
  const [formValues, setFormValues] = useState<IoTHubPivotFormValues>({ iotHub: undefined, endpoint: undefined });
  const [iotHubs, setIoTHubs] = useState<ArmObj<IotHub>[] | undefined>(undefined);
  const [keyList, setKeyList] = useState<KeyList | undefined>(undefined);
  const [serviceKey, setServiceKey] = useState<Key | undefined>(undefined);

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const keyFound = keyList.value.find(key => key.rights.toLowerCase().indexOf('registry') > -1);
    if (keyFound) {
      setServiceKey(keyFound);
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
      onSubmit={() => setIoTHubConnection(formValues, serviceKey, props.setNewAppSetting, props.setSelectedItem, props.setIsDialogVisible)}>
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
                  errorMessage={undefined}
                  {...props}
                />
                {!keyList && <LoadingComponent />}
                {!!keyList && !!endpointOptions && endpointOptions.length === 0 ? (
                  <p>{t('iotHubPivot_noEndpoints')}</p>
                ) : (
                  <Dropdown
                    label={t('iotHubPivot_Endpoint')}
                    options={endpointOptions}
                    selectedKey={formValues.endpoint}
                    onChange={(o, e) => {
                      setFormValues({ ...formValues, endpoint: e && e.data });
                    }}
                    errorMessage={undefined}
                    {...props}
                  />
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

const setIoTHubConnection = (
  formValues: IoTHubPivotFormValues,
  serviceKey: Key | undefined,
  setNewAppSetting: (a: { key: string; value: string }) => void,
  setSelectedItem: (u: undefined) => void,
  setIsDialogVisible: (b: boolean) => void
) => {
  if (formValues.iotHub && formValues.endpoint && serviceKey) {
    const appSettingName = `${formValues.iotHub.name}_${formValues.endpoint}_IOTHUB`;
    const appSettingValue = formatIoTHubValue(formValues.endpoint, formValues.iotHub, serviceKey);
    setNewAppSetting({ key: appSettingName, value: appSettingValue });
    setSelectedItem(undefined);
    setIsDialogVisible(false);
  }
};

const formatIoTHubValue = (endpoint: string, iotHub: ArmObj<IotHub>, serviceKey: Key): string => {
  let iotEndpoint = '';
  const primaryKey = serviceKey.primaryKey;
  let iotPath = '';
  if (endpoint === 'events' && iotHub.properties.eventHubEndpoints && iotHub.properties.eventHubEndpoints.events) {
    iotEndpoint = iotHub.properties.eventHubEndpoints.events.endpoint;
    iotPath = iotHub.properties.eventHubEndpoints.events.path;
  } else if (
    endpoint === 'monitoring' &&
    iotHub.properties.eventHubEndpoints &&
    iotHub.properties.eventHubEndpoints.operationsMonitoringEvents
  ) {
    iotEndpoint = iotHub.properties.eventHubEndpoints.operationsMonitoringEvents.endpoint;
    iotPath = iotHub.properties.eventHubEndpoints.operationsMonitoringEvents.path;
  }

  return `Endpoint=${iotEndpoint};SharedAccessKeyName=iothubowner;SharedAccessKey=${primaryKey};EntityPath=${iotPath}`;
};

export default IotHubPivot;
