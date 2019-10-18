import React, { useEffect, useState } from 'react';
import { IDropdownOption, Dropdown, DefaultButton, IDropdownProps } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { Namespace, EventHub, AuthorizationRule, KeyList } from '../../../../../models/eventhub';
import { ArmObj } from '../../../../../models/arm-obj';
import LoadingComponent from '../../../../../components/loading/loading-component';
import { NewConnectionDialogProps } from './DialogProperties';
import { CustomDropdownProps } from '../../../../../components/form-controls/DropDown';
import { FieldProps } from 'formik';
import { paddingSidesStyle, paddingTopStyle } from './Dialog.styles';
import {
  fetchNamespaces,
  fetchEventHubs,
  fetchNamespaceAuthRules,
  fetchEventHubAuthRules,
  fetchKeyList,
  createEventHubConnection,
  onNamespaceChange,
  onEventHubChange,
  onPolicyChange,
} from './EventHubPivot.helper';

const EventHubPivot: React.SFC<NewConnectionDialogProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const { t } = useTranslation();
  const { resourceId, setNewAppSettingName, setIsDialogVisible, form: formProps, field } = props;
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
      fetchNamespaces(resourceId, setNamespaces);
    } else if (selectedNamespace) {
      if (!eventHubs) {
        fetchEventHubs(String(selectedNamespace.key), setEventHubs);
      }
      if (!namespaceAuthRules) {
        fetchNamespaceAuthRules(String(selectedNamespace.key), setNamespaceAuthRules);
      }
      if (selectedEventHub && !eventHubAuthRules) {
        fetchEventHubAuthRules(String(selectedEventHub.key), setEventHubAuthRules);
      }
      if (selectedPolicy && !keyList) {
        fetchKeyList(String(selectedPolicy.key), setKeyList);
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
      {namespaces && namespaces.length === 0 && <p>{t('eventHubPicker_noNamespaces')}</p>}
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
      {eventHubs && eventHubs.length === 0 && <p>{t('eventHubPicker_noEventHubs')}</p>}
      <Dropdown
        label={t('eventHubPicker_eventHub')}
        options={eventHubOptions}
        selectedKey={selectedEventHub ? selectedEventHub.key : undefined}
        onChange={(o, e) => onEventHubChange(e, setSelectedEventHub, setEventHubAuthRules, setSelectedPolicy, setKeyList)}
      />
      {(!namespaceAuthRules || !eventHubAuthRules) && <LoadingComponent />}
      {namespaceAuthRules && namespaceAuthRules.length === 0 && (eventHubAuthRules && eventHubAuthRules.length === 0) && (
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
          onClick={() => createEventHubConnection(selectedNamespace, keyList, setNewAppSettingName, setIsDialogVisible, formProps, field)}>
          {t('ok')}
        </DefaultButton>
      </footer>
    </form>
  );
};

export default EventHubPivot;
