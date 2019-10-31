import React, { useState, useEffect, useContext } from 'react';
import { IDropdownOption, Dropdown, DefaultButton } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import LoadingComponent from '../../../../../../components/loading/loading-component';
import { paddingSidesStyle, paddingTopStyle } from '../Callout.styles';
import { ArmObj } from '../../../../../../models/arm-obj';
import { Namespace, EventHub, AuthorizationRule, KeyList } from '../../../../../../models/eventhub';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { FormikProps, Formik } from 'formik';
import { EventHubPivotContext } from './EventHubPivotDataLoader';
import LogService from '../../../../../../utils/LogService';
import { LogCategories } from '../../../../../../utils/LogCategories';

export interface EventHubPivotFormValues {
  namespace: ArmObj<Namespace> | undefined;
  eventHub: ArmObj<EventHub> | undefined;
  policy: ArmObj<AuthorizationRule> | undefined;
}

const EventHubPivot: React.SFC<NewConnectionCalloutProps> = props => {
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
                <Dropdown
                  label={t('eventHubPicker_namespace')}
                  options={namespaceOptions}
                  selectedKey={formValues.namespace && formValues.namespace.id}
                  onChange={(o, e) => {
                    setFormValues({ namespace: e && e.data, eventHub: undefined, policy: undefined });
                    setEventHubs(undefined);
                    setNamespaceAuthRules(undefined);
                    setKeyList(undefined);
                  }}
                />
                {!eventHubs && <LoadingComponent />}
                {!!eventHubs && eventHubs.length === 0 ? (
                  <p>{t('eventHubPicker_noEventHubs')}</p>
                ) : (
                  <>
                    <Dropdown
                      label={t('eventHubPicker_eventHub')}
                      options={eventHubOptions}
                      selectedKey={formValues.eventHub && formValues.eventHub.id}
                      onChange={(o, e) => {
                        setFormValues({ ...formValues, eventHub: e && e.data, policy: undefined });
                        setEventHubAuthRules(undefined);
                        setKeyList(undefined);
                      }}
                    />
                    {(!namespaceAuthRules || !eventHubAuthRules) && <LoadingComponent />}
                    {!!namespaceAuthRules && namespaceAuthRules.length === 0 && (!!eventHubAuthRules && eventHubAuthRules.length === 0) ? (
                      <p>{t('eventHubPicker_noPolicies')}</p>
                    ) : (
                      <>
                        <Dropdown
                          label={t('eventHubPicker_policy')}
                          options={policyOptions}
                          selectedKey={formValues.policy && formValues.policy.id}
                          onChange={(o, e) => {
                            setFormValues({ ...formValues, policy: e && e.data });
                            setKeyList(undefined);
                          }}
                        />
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
  setNewAppSetting: (a: { key: string; value: string }) => void,
  setSelectedItem: (u: undefined) => void,
  setIsDialogVisible: (b: boolean) => void
) => {
  if (formValues.namespace && keyList) {
    const appSettingName = `${formValues.namespace.name}_${keyList.keyName}_EVENTHUB`;
    setNewAppSetting({ key: appSettingName, value: appSettingName });
    setSelectedItem(undefined);
    setIsDialogVisible(false);
  }
};

export default EventHubPivot;
