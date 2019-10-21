import React from 'react';
import { IDropdownOption, Dropdown, DefaultButton } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import LoadingComponent from '../../../../../../components/loading/loading-component';
import { paddingSidesStyle, paddingTopStyle } from '../Callout.styles';
import { createEventHubConnection, onNamespaceChange, onEventHubChange, onPolicyChange, EventHubPivotProps } from './EventHubPivot.util';
import { FieldProps } from 'formik/dist/Field';

const EventHubPivot: React.SFC<EventHubPivotProps & FieldProps> = props => {
  const { t } = useTranslation();
  const {
    namespaces,
    eventHubs,
    setEventHubs,
    namespaceAuthRules,
    setNamespaceAuthRules,
    eventHubAuthRules,
    setEventHubAuthRules,
    selectedNamespace,
    setSelectedNamespace,
    selectedEventHub,
    setSelectedEventHub,
    selectedPolicy,
    setSelectedPolicy,
    keyList,
    setKeyList,
  } = props;

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

export default EventHubPivot;
