import React, { useEffect, useState } from 'react';
import { IDropdownOption, Dropdown, DefaultButton, IDropdownProps } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import EventHubService from '../../../../../ApiHelpers/EventHubService';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import { Namespace, EventHub, AuthorizationRule } from '../../../../../models/eventhub';
import { ArmObj } from '../../../../../models/arm-obj';
import LoadingComponent from '../../../../../components/loading/loading-component';
import { NewConnectionDialogProps } from './DialogProperties';
import { CustomDropdownProps } from '../../../../../components/form-controls/DropDown';
import { FieldProps, FormikProps } from 'formik';
import { BindingEditorFormValues } from '../BindingFormBuilder';
import { paddingSidesStyle, paddingTopStyle } from './Dialog.styles';

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

  useEffect(() => {
    // This will need to be moved to a resource data file to handle requests
    if (!namespaces) {
      EventHubService.fetchNamespaces(resourceId).then(r => {
        if (!r.metadata.success) {
          LogService.trackEvent(LogCategories.bindingResource, 'getNamespaces', `Failed to get Namespaces: ${r.metadata.error}`);
          return;
        }
        setNamespaces(r.data.value);
      });
    } else if (selectedNamespace) {
      if (!eventHubs) {
        EventHubService.fetchEventHubs(String(selectedNamespace.key)).then(r => {
          if (!r.metadata.success) {
            LogService.trackEvent(LogCategories.bindingResource, 'getEventHubs', `Failed to get EventHubs: ${r.metadata.error}`);
            return;
          }
          setEventHubs(r.data.value);
        });
      }
      if (!namespaceAuthRules) {
        EventHubService.fetchAuthorizationRules(String(selectedNamespace.key)).then(r => {
          if (!r.metadata.success) {
            LogService.trackEvent(
              LogCategories.bindingResource,
              'getAuthorizationRules',
              `Failed to get Authorization Rules: ${r.metadata.error}`
            );
            return;
          }
          setNamespaceAuthRules(r.data.value);
        });
      }
      if (selectedEventHub && !eventHubAuthRules) {
        EventHubService.fetchAuthorizationRules(String(selectedEventHub.key)).then(r => {
          if (!r.metadata.success) {
            LogService.trackEvent(
              LogCategories.bindingResource,
              'getAuthorizationRules',
              `Failed to get Authorization Rules: ${r.metadata.error}`
            );
            return;
          }
          setEventHubAuthRules(r.data.value);
        });
      }
    }
  }, [selectedNamespace, selectedEventHub]);

  if (!namespaces) {
    return <LoadingComponent />;
  }
  if (namespaces.length === 0) {
    return <p>{'No Namespaces in this subscription'}</p>;
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
      <Dropdown
        label={t('eventHubPicker_namespace')}
        options={namespaceOptions}
        selectedKey={selectedNamespace ? selectedNamespace.key : undefined}
        onChange={(o, e) =>
          onNamespaceChange(e, setSelectedNamespace, setEventHubs, setSelectedEventHub, setNamespaceAuthRules, setSelectedPolicy)
        }
      />
      {!eventHubs && <LoadingComponent />}
      {eventHubs && eventHubs.length === 0 && <p>{'No Event Hubs in this Namespace'}</p>}
      <Dropdown
        label={t('eventHubPicker_eventHub')}
        options={eventHubOptions}
        selectedKey={selectedEventHub ? selectedEventHub.key : undefined}
        onChange={(o, e) => onEventHubChange(e, setSelectedEventHub, setEventHubAuthRules, setSelectedPolicy)}
      />
      {(!namespaceAuthRules || !eventHubAuthRules) && <LoadingComponent />}
      {namespaceAuthRules && namespaceAuthRules.length === 0 && (eventHubAuthRules && eventHubAuthRules.length === 0) && (
        <p>{'No Policies in this Namespace and Event Hub'}</p>
      )}
      <Dropdown
        label={t('eventHubPicker_policy')}
        options={policyOptions}
        selectedKey={selectedPolicy ? selectedPolicy.key : undefined}
        onChange={(o, e) => onPolicyChange(e, setSelectedPolicy)}
      />
      <footer style={paddingTopStyle}>
        <DefaultButton
          disabled={!selectedPolicy}
          onClick={() => createEventHubConnection(selectedNamespace, setNewAppSettingName, setIsDialogVisible, formProps, field)}>
          {t('ok')}
        </DefaultButton>
      </footer>
    </form>
  );
};

const createEventHubConnection = (
  selectedNamespace: IDropdownOption | undefined,
  setNewAppSettingName: any,
  setIsDialogVisilbe: any,
  formProps: FormikProps<BindingEditorFormValues>,
  field: { name: string; value: any }
) => {
  if (selectedNamespace) {
    const appSettingName = `${selectedNamespace.text}_EVENTHUB`;
    formProps.setFieldValue(field.name, appSettingName);
    setNewAppSettingName(appSettingName);
    setIsDialogVisilbe(false);
  }
};

const onNamespaceChange = (
  namespace: IDropdownOption | undefined,
  setSelectedNamespace: any,
  setEventHubs: any,
  setSelectedEventHub: any,
  setNamespaceAuthRules: any,
  setSelectedPolicy: any
) => {
  setSelectedNamespace(namespace);
  setEventHubs(undefined);
  setSelectedEventHub(undefined);
  setNamespaceAuthRules(undefined);
  setSelectedPolicy(undefined);
};

const onEventHubChange = (
  eventHub: IDropdownOption | undefined,
  setSelectedEventHub: any,
  setEventHubAuthRules: any,
  setSelectedPolicy: any
) => {
  setSelectedEventHub(eventHub);
  setEventHubAuthRules(undefined);
  setSelectedPolicy(undefined);
};

const onPolicyChange = (policy: IDropdownOption | undefined, setSelectedPolicy: any) => {
  setSelectedPolicy(policy);
};

export default EventHubPivot;
