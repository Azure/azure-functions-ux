import React, { useState, useEffect, useContext } from 'react';
import { IDropdownOption, Dropdown, DefaultButton } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import LoadingComponent from '../../../../../../components/loading/loading-component';
import { paddingSidesStyle, paddingTopStyle } from '../Callout.styles';
import { FieldProps } from 'formik/dist/Field';
import { ArmObj } from '../../../../../../models/arm-obj';
import { Namespace, EventHub, AuthorizationRule, KeyList } from '../../../../../../models/eventhub';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { FormikProps } from 'formik';
import { BindingEditorFormValues } from '../../BindingFormBuilder';
import { EventHubPivotContext } from './EventHubPivotDataLoader';

const EventHubPivot: React.SFC<NewConnectionCalloutProps & FieldProps> = props => {
  const { t } = useTranslation();
  const { resourceId } = props;
  const provider = useContext(EventHubPivotContext);
  const [namespaces, setNamespaces] = useState<ArmObj<Namespace>[] | undefined>(undefined);
  const [selectedNamespace, setSelectedNamespace] = useState<IDropdownOption | undefined>(undefined);
  const [eventHubs, setEventHubs] = useState<ArmObj<EventHub>[] | undefined>(undefined);
  const [selectedEventHub, setSelectedEventHub] = useState<IDropdownOption | undefined>(undefined);
  const [namespaceAuthRules, setNamespaceAuthRules] = useState<ArmObj<AuthorizationRule>[] | undefined>(undefined);
  const [eventHubAuthRules, setEventHubAuthRules] = useState<ArmObj<AuthorizationRule>[] | undefined>(undefined);
  const [selectedPolicy, setSelectedPolicy] = useState<IDropdownOption | undefined>(undefined);
  const [keyList, setKeyList] = useState<KeyList | undefined>(undefined);

  useEffect(() => {
    if (!namespaces) {
      provider.fetchNamespaces(resourceId, setNamespaces);
    } else if (selectedNamespace) {
      if (!eventHubs) {
        provider.fetchEventHubs(String(selectedNamespace.key), setEventHubs);
      }
      if (!namespaceAuthRules) {
        provider.fetchNamespaceAuthRules(String(selectedNamespace.key), setNamespaceAuthRules);
      }
      if (selectedEventHub && !eventHubAuthRules) {
        provider.fetchEventHubAuthRules(String(selectedEventHub.key), setEventHubAuthRules);
      }
      if (selectedPolicy && !keyList) {
        provider.fetchKeyList(String(selectedPolicy.key), setKeyList);
      }
    }
  }, [selectedNamespace, selectedEventHub, selectedPolicy]);

  if (!namespaces) {
    return <LoadingComponent />;
  }

  const namespaceOptions: IDropdownOption[] = [];
  namespaces.forEach(namespace => namespaceOptions.push({ text: namespace.name, key: namespace.id }));
  if (!selectedNamespace && namespaceOptions.length > 0) {
    setSelectedNamespace(namespaceOptions[0]);
  }

  const eventHubOptions: IDropdownOption[] = [];
  if (eventHubs) {
    eventHubs.forEach(eventHub => eventHubOptions.push({ text: eventHub.name, key: eventHub.id }));
    if (!selectedEventHub && eventHubOptions.length > 0) {
      setSelectedEventHub(eventHubOptions[0]);
    }
  }

  const policyOptions: IDropdownOption[] = [];
  if (namespaceAuthRules && eventHubAuthRules) {
    namespaceAuthRules.forEach(rule => policyOptions.push({ text: `${rule.name} ${t('eventHubPicker_namespacePolicy')}`, key: rule.id }));
    eventHubAuthRules.forEach(rule => policyOptions.push({ text: `${rule.name} ${t('eventHubPicker_eventHubPolicy')}`, key: rule.id }));
    if (!selectedPolicy && policyOptions.length > 0) {
      setSelectedPolicy(policyOptions[0]);
    }
  }

  return (
    <form style={paddingSidesStyle}>
      {!!namespaces && namespaces.length === 0 && <p>{t('eventHubPicker_noNamespaces')}</p>}
      <Dropdown
        label={t('eventHubPicker_namespace')}
        options={namespaceOptions}
        selectedKey={selectedNamespace ? selectedNamespace.key : undefined}
        onChange={(o, e) =>
          onNamespaceChange(
            e,
            setSelectedNamespace,
            setEventHubs,
            setSelectedEventHub,
            setNamespaceAuthRules,
            setSelectedPolicy,
            setKeyList
          )
        }
      />
      {!eventHubs && <LoadingComponent />}
      {!!eventHubs && eventHubs.length === 0 && <p>{t('eventHubPicker_noEventHubs')}</p>}
      <Dropdown
        label={t('eventHubPicker_eventHub')}
        options={eventHubOptions}
        selectedKey={selectedEventHub ? selectedEventHub.key : undefined}
        onChange={(o, e) => onEventHubChange(e, setSelectedEventHub, setEventHubAuthRules, setSelectedPolicy, setKeyList)}
      />
      {(!namespaceAuthRules || !eventHubAuthRules) && <LoadingComponent />}
      {!!namespaceAuthRules && namespaceAuthRules.length === 0 && (!!eventHubAuthRules && eventHubAuthRules.length === 0) && (
        <p>{t('eventHubPicker_noPolicies')}</p>
      )}
      <Dropdown
        label={t('eventHubPicker_policy')}
        options={policyOptions}
        selectedKey={selectedPolicy ? selectedPolicy.key : undefined}
        onChange={(o, e) => onPolicyChange(e, setSelectedPolicy, setKeyList)}
      />
      <footer style={paddingTopStyle}>
        {!keyList && <LoadingComponent />}
        <DefaultButton
          disabled={!keyList}
          onClick={() =>
            createEventHubConnection(
              selectedNamespace,
              keyList,
              props.setNewAppSettingName,
              props.setIsDialogVisible,
              props.form,
              props.field
            )
          }>
          {t('ok')}
        </DefaultButton>
      </footer>
    </form>
  );
};

const createEventHubConnection = (
  selectedNamespace: IDropdownOption | undefined,
  keyList: KeyList | undefined,
  setNewAppSettingName: (e: string) => void,
  setIsDialogVisible: (d: boolean) => void,
  formProps: FormikProps<BindingEditorFormValues>,
  field: { name: string; value: any }
) => {
  if (selectedNamespace && keyList) {
    const appSettingName = `${selectedNamespace.text}_${keyList.keyName}_EVENTHUB`;
    formProps.setFieldValue(field.name, appSettingName);
    setNewAppSettingName(appSettingName);
    setIsDialogVisible(false);
  }
};

const onNamespaceChange = (
  namespace: IDropdownOption | undefined,
  setSelectedNamespace: (n: IDropdownOption | undefined) => void,
  setEventHubs: (e: undefined) => void,
  setSelectedEventHub: (e: undefined) => void,
  setNamespaceAuthRules: (a: undefined) => void,
  setSelectedPolicy: (p: undefined) => void,
  setKeyList: (k: undefined) => void
) => {
  setSelectedNamespace(namespace);
  setEventHubs(undefined);
  setSelectedEventHub(undefined);
  setNamespaceAuthRules(undefined);
  setSelectedPolicy(undefined);
  setKeyList(undefined);
};

const onEventHubChange = (
  eventHub: IDropdownOption | undefined,
  setSelectedEventHub: (s: IDropdownOption | undefined) => void,
  setEventHubAuthRules: (a: undefined) => void,
  setSelectedPolicy: (p: undefined) => void,
  setKeyList: (k: undefined) => void
) => {
  setSelectedEventHub(eventHub);
  setEventHubAuthRules(undefined);
  setSelectedPolicy(undefined);
  setKeyList(undefined);
};

const onPolicyChange = (
  policy: IDropdownOption | undefined,
  setSelectedPolicy: (p: IDropdownOption | undefined) => void,
  setKeyList: (k: undefined) => void
) => {
  setSelectedPolicy(policy);
  setKeyList(undefined);
};

export default EventHubPivot;
