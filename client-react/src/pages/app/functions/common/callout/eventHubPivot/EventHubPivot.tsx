import React, { useState, useEffect, useContext } from 'react';
import { IDropdownOption, DefaultButton, IDropdownProps } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import LoadingComponent from '../../../../../../components/Loading/LoadingComponent';
import { paddingSidesStyle, paddingTopStyle } from '../Callout.styles';
import { ArmObj } from '../../../../../../models/arm-obj';
import { Namespace, EventHub, AuthorizationRule, KeyList } from '../../../../../../models/eventhub';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { FormikProps, Formik, FieldProps } from 'formik';
import { EventHubPivotContext } from './EventHubPivotDataLoader';
import LogService from '../../../../../../utils/LogService';
import { LogCategories } from '../../../../../../utils/LogCategories';
import Dropdown, { CustomDropdownProps } from '../../../../../../components/form-controls/DropDown';
import { FormControlWrapper, Layout } from '../../../../../../components/FormControlWrapper/FormControlWrapper';

export interface EventHubPivotFormValues {
  namespace: ArmObj<Namespace> | undefined;
  eventHub: ArmObj<EventHub> | undefined;
  policy: ArmObj<AuthorizationRule> | undefined;
}

const EventHubPivot: React.SFC<NewConnectionCalloutProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const provider = useContext(EventHubPivotContext);
  const { t } = useTranslation();
  const { resourceId } = props;
  const [formValues, setFormValues] = useState<EventHubPivotFormValues>({ namespace: undefined, eventHub: undefined, policy: undefined });
  const [namespaces, setNamespaces] = useState<ArmObj<Namespace>[] | undefined>(undefined);
  const [eventHubs, setEventHubs] = useState<ArmObj<EventHub>[] | undefined>(undefined);
  const [namespaceAuthRules, setNamespaceAuthRules] = useState<ArmObj<AuthorizationRule>[] | undefined>(undefined);
  const [eventHubAuthRules, setEventHubAuthRules] = useState<ArmObj<AuthorizationRule>[] | undefined>(undefined);
  const [keyList, setKeyList] = useState<KeyList | undefined>(undefined);

  useEffect(() => {
    if (!namespaces) {
      provider.fetchNamespaces(resourceId).then(r => {
        if (!r.metadata.success) {
          LogService.trackEvent(LogCategories.bindingResource, 'getNamespaces', `Failed to get Namespaces: ${r.metadata.error}`);
          return;
        }
        setNamespaces(r.data.value);
      });
    } else if (formValues.namespace) {
      if (!eventHubs) {
        provider.fetchEventHubs(formValues.namespace.id).then(r => {
          if (!r.metadata.success) {
            LogService.trackEvent(LogCategories.bindingResource, 'getEventHubs', `Failed to get EventHubs: ${r.metadata.error}`);
            return;
          }
          setEventHubs(r.data.value);
        });
      }
      if (!namespaceAuthRules) {
        provider.fetchAuthRules(formValues.namespace.id).then(r => {
          if (!r.metadata.success) {
            LogService.trackEvent(LogCategories.bindingResource, 'getAuthRules', `Failed to get Authorization Rules: ${r.metadata.error}`);
            return;
          }
          setNamespaceAuthRules(r.data.value);
        });
      }
      if (formValues.eventHub && !eventHubAuthRules) {
        provider.fetchAuthRules(formValues.eventHub.id).then(r => {
          if (!r.metadata.success) {
            LogService.trackEvent(LogCategories.bindingResource, 'getAuthRules', `Failed to get Authorization Rules: ${r.metadata.error}`);
            return;
          }
          setEventHubAuthRules(r.data.value);
        });
      }
      if (formValues.policy && !keyList) {
        provider.fetchKeyList(formValues.policy.id).then(r => {
          if (!r.metadata.success) {
            LogService.trackEvent(LogCategories.bindingResource, 'getKeyList', `Failed to get Key List: ${r.metadata.error}`);
            return;
          }
          setKeyList(r.data);
        });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues]);

  if (!namespaces) {
    return <LoadingComponent />;
  }

  const namespaceOptions: IDropdownOption[] = [];
  namespaces.forEach(namespace => namespaceOptions.push({ text: namespace.name, key: namespace.id, data: namespace }));
  if (!formValues.namespace && namespaceOptions.length > 0) {
    setFormValues({ ...formValues, namespace: namespaces[0] });
  }

  const eventHubOptions: IDropdownOption[] = [];
  if (eventHubs) {
    eventHubs.forEach(eventHub => eventHubOptions.push({ text: eventHub.name, key: eventHub.id, data: eventHub }));
    if (!formValues.eventHub && eventHubOptions.length > 0) {
      setFormValues({ ...formValues, eventHub: eventHubs[0] });
    }
  }

  const policyOptions: IDropdownOption[] = [];
  if (namespaceAuthRules && eventHubAuthRules) {
    namespaceAuthRules.forEach(rule =>
      policyOptions.push({ text: `${rule.name} ${t('eventHubPicker_namespacePolicy')}`, key: rule.id, data: rule })
    );
    eventHubAuthRules.forEach(rule =>
      policyOptions.push({ text: `${rule.name} ${t('eventHubPicker_eventHubPolicy')}`, key: rule.id, data: rule })
    );
    if (!formValues.policy && policyOptions.length > 0) {
      const policies = namespaceAuthRules.concat(eventHubAuthRules);
      setFormValues({ ...formValues, policy: policies[0] });
    }
  }

  return (
    <Formik
      initialValues={formValues}
      onSubmit={() => setEventHubConnection(formValues, keyList, props.setNewAppSetting, props.setSelectedItem, props.setIsDialogVisible)}>
      {(formProps: FormikProps<EventHubPivotFormValues>) => {
        return (
          <form style={paddingSidesStyle}>
            {!!namespaces && namespaces.length === 0 ? (
              <p>{t('eventHubPicker_noNamespaces')}</p>
            ) : (
              <>
                <FormControlWrapper label={t('eventHubPicker_namespace')} layout={Layout.vertical}>
                  <Dropdown
                    options={namespaceOptions}
                    selectedKey={formValues.namespace && formValues.namespace.id}
                    onChange={(o, e) => {
                      setFormValues({ namespace: e && e.data, eventHub: undefined, policy: undefined });
                      setEventHubs(undefined);
                      setNamespaceAuthRules(undefined);
                      setKeyList(undefined);
                    }}
                    errorMessage={undefined}
                    {...props}
                  />
                </FormControlWrapper>
                {!eventHubs && <LoadingComponent />}
                {!!eventHubs && eventHubs.length === 0 ? (
                  <p>{t('eventHubPicker_noEventHubs')}</p>
                ) : (
                  <>
                    <FormControlWrapper label={t('eventHubPicker_eventHub')} layout={Layout.vertical}>
                      <Dropdown
                        options={eventHubOptions}
                        selectedKey={formValues.eventHub && formValues.eventHub.id}
                        onChange={(o, e) => {
                          setFormValues({ ...formValues, eventHub: e && e.data, policy: undefined });
                          setEventHubAuthRules(undefined);
                          setKeyList(undefined);
                        }}
                        errorMessage={undefined}
                        {...props}
                      />
                    </FormControlWrapper>
                    {(!namespaceAuthRules || !eventHubAuthRules) && <LoadingComponent />}
                    {!!namespaceAuthRules && namespaceAuthRules.length === 0 && (!!eventHubAuthRules && eventHubAuthRules.length === 0) ? (
                      <p>{t('eventHubPicker_noPolicies')}</p>
                    ) : (
                      <>
                        <FormControlWrapper label={t('eventHubPicker_policy')} layout={Layout.vertical}>
                          <Dropdown
                            options={policyOptions}
                            selectedKey={formValues.policy && formValues.policy.id}
                            onChange={(o, e) => {
                              setFormValues({ ...formValues, policy: e && e.data });
                              setKeyList(undefined);
                            }}
                            errorMessage={undefined}
                            {...props}
                          />
                        </FormControlWrapper>
                        {!keyList && <LoadingComponent />}
                      </>
                    )}
                  </>
                )}
              </>
            )}
            <footer style={paddingTopStyle}>
              <DefaultButton disabled={!keyList} onClick={formProps.submitForm}>
                {t('ok')}
              </DefaultButton>
            </footer>
          </form>
        );
      }}
    </Formik>
  );
};

const setEventHubConnection = (
  formValues: EventHubPivotFormValues,
  keyList: KeyList | undefined,
  setNewAppSetting: React.Dispatch<React.SetStateAction<{ key: string; value: string }>>,
  setSelectedItem: React.Dispatch<React.SetStateAction<IDropdownOption | undefined>>,
  setIsDialogVisible: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (formValues.namespace && formValues.eventHub && keyList) {
    const appSettingName = `${formValues.namespace.name}_${keyList.keyName}_EVENTHUB`;
    const appSettingValue = formatEventHubValue(keyList, formValues.eventHub);
    setNewAppSetting({ key: appSettingName, value: appSettingValue });
    setSelectedItem({ key: appSettingName, text: appSettingName, data: appSettingValue });
    setIsDialogVisible(false);
  }
};

const formatEventHubValue = (keyList: KeyList, eventHub: ArmObj<EventHub>): string => {
  let appSettingValue = keyList.primaryConnectionString;

  // Runtime requires entitypath for all event hub connections strings,
  // so if it's namespace policy add entitypath as selected eventhub
  if (appSettingValue.toLowerCase().indexOf('entitypath') === -1) {
    appSettingValue = `${appSettingValue};EntityPath=${eventHub.name}`;
  }
  return appSettingValue;
};

export default EventHubPivot;
