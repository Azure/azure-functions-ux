import { FieldProps, Formik, FormikProps } from 'formik';
import { IDropdownOption, IDropdownProps, PrimaryButton } from 'office-ui-fabric-react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessageOrStringify } from '../../../../../../ApiHelpers/ArmHelper';
import Dropdown, { CustomDropdownProps } from '../../../../../../components/form-controls/DropDown';
import { Layout } from '../../../../../../components/form-controls/ReactiveFormControl';
import LoadingComponent from '../../../../../../components/Loading/LoadingComponent';
import { ArmObj } from '../../../../../../models/arm-obj';
import { AuthorizationRule, EventHub, KeyList, Namespace } from '../../../../../../models/eventhub';
import { LogCategories } from '../../../../../../utils/LogCategories';
import LogService from '../../../../../../utils/LogService';
import { generateAppSettingName } from '../../ResourceDropdown';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { paddingSidesStyle, paddingTopStyle } from '../Callout.styles';
import { EventHubPivotContext } from './EventHubPivotDataLoader';

export interface EventHubPivotFormValues {
  namespace: ArmObj<Namespace> | undefined;
  eventHub: ArmObj<EventHub> | undefined;
  policy: ArmObj<AuthorizationRule> | undefined;
}

const EventHubPivot: React.SFC<NewConnectionCalloutProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const provider = useContext(EventHubPivotContext);
  const { t } = useTranslation();
  const { resourceId, appSettingKeys } = props;
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
          LogService.trackEvent(
            LogCategories.bindingResource,
            'getNamespaces',
            `Failed to get Namespaces: ${getErrorMessageOrStringify(r.metadata.error)}`
          );
          return;
        }
        setNamespaces(r.data.value);
      });
    } else if (formValues.namespace) {
      if (!eventHubs) {
        provider.fetchEventHubs(formValues.namespace.id).then(r => {
          if (!r.metadata.success) {
            LogService.trackEvent(
              LogCategories.bindingResource,
              'getEventHubs',
              `Failed to get EventHubs: ${getErrorMessageOrStringify(r.metadata.error)}`
            );
            return;
          }
          setEventHubs(r.data.value);
        });
      }
      if (!namespaceAuthRules) {
        provider.fetchAuthRules(formValues.namespace.id).then(r => {
          if (!r.metadata.success) {
            LogService.trackEvent(
              LogCategories.bindingResource,
              'getAuthRules',
              `Failed to get Authorization Rules: ${getErrorMessageOrStringify(r.metadata.error)}`
            );
            return;
          }
          setNamespaceAuthRules(r.data.value);
        });
      }
      if (formValues.eventHub && !eventHubAuthRules) {
        provider.fetchAuthRules(formValues.eventHub.id).then(r => {
          if (!r.metadata.success) {
            LogService.trackEvent(
              LogCategories.bindingResource,
              'getAuthRules',
              `Failed to get Authorization Rules: ${getErrorMessageOrStringify(r.metadata.error)}`
            );
            return;
          }
          setEventHubAuthRules(r.data.value);
        });
      }
      if (formValues.policy && !keyList) {
        provider.fetchKeyList(formValues.policy.id).then(r => {
          if (!r.metadata.success) {
            LogService.trackEvent(
              LogCategories.bindingResource,
              'getKeyList',
              `Failed to get Key List: ${getErrorMessageOrStringify(r.metadata.error)}`
            );
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
      onSubmit={() =>
        setEventHubConnection(formValues, keyList, appSettingKeys, props.setNewAppSetting, props.setSelectedItem, props.setIsDialogVisible)
      }>
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
                  errorMessage={undefined}
                  layout={Layout.Vertical}
                  {...props}
                  id="newEventHubNamespaceConnection"
                  mouseOverToolTip={undefined}
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
                      errorMessage={undefined}
                      layout={Layout.Vertical}
                      {...props}
                      id="newEventHubConnection"
                      mouseOverToolTip={undefined}
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
                          errorMessage={undefined}
                          layout={Layout.Vertical}
                          {...props}
                          id="newEventHubPolicyConnection"
                          mouseOverToolTip={undefined}
                        />
                        {!keyList && <LoadingComponent />}
                      </>
                    )}
                  </>
                )}
              </>
            )}
            <footer style={paddingTopStyle}>
              <PrimaryButton disabled={!keyList} onClick={formProps.submitForm}>
                {t('ok')}
              </PrimaryButton>
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
  appSettingKeys: string[],
  setNewAppSetting: React.Dispatch<React.SetStateAction<{ key: string; value: string }>>,
  setSelectedItem: React.Dispatch<React.SetStateAction<IDropdownOption | undefined>>,
  setIsDialogVisible: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (formValues.namespace && formValues.eventHub && keyList) {
    const appSettingName = generateAppSettingName(appSettingKeys, `${formValues.namespace.name}_${keyList.keyName}_EVENTHUB`);
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
