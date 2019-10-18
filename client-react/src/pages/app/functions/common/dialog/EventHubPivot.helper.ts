import { BindingEditorFormValues } from './../BindingFormBuilder';
import { KeyList } from './../../../../../models/eventhub';
import { IDropdownOption } from 'office-ui-fabric-react';
import { FormikProps } from 'formik';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import EventHubService from '../../../../../ApiHelpers/EventHubService';

export function fetchNamespaces(resourceId: string, setNamespaces: any) {
  EventHubService.fetchNamespaces(resourceId).then(r => {
    if (!r.metadata.success) {
      LogService.trackEvent(LogCategories.bindingResource, 'getNamespaces', `Failed to get Namespaces: ${r.metadata.error}`);
      return;
    }
    setNamespaces(r.data.value);
  });
}

export function fetchEventHubs(resourceId: string, setEventHubs: any) {
  EventHubService.fetchEventHubs(resourceId).then(r => {
    if (!r.metadata.success) {
      LogService.trackEvent(LogCategories.bindingResource, 'getEventHubs', `Failed to get EventHubs: ${r.metadata.error}`);
      return;
    }
    setEventHubs(r.data.value);
  });
}

export function fetchNamespaceAuthRules(resourceId: string, setNamespaceAuthRules: any) {
  EventHubService.fetchAuthorizationRules(resourceId).then(r => {
    if (!r.metadata.success) {
      LogService.trackEvent(LogCategories.bindingResource, 'getAuthRules', `Failed to get Authorization Rules: ${r.metadata.error}`);
      return;
    }
    setNamespaceAuthRules(r.data.value);
  });
}

export function fetchEventHubAuthRules(resourceId: string, setEventHubAuthRules: any) {
  EventHubService.fetchAuthorizationRules(resourceId).then(r => {
    if (!r.metadata.success) {
      LogService.trackEvent(LogCategories.bindingResource, 'getAuthRules', `Failed to get Authorization Rules: ${r.metadata.error}`);
      return;
    }
    setEventHubAuthRules(r.data.value);
  });
}

export function fetchKeyList(resourceId: string, setKeyList: any) {
  EventHubService.fetchKeyList(resourceId).then(r => {
    if (!r.metadata.success) {
      LogService.trackEvent(LogCategories.bindingResource, 'getKeyList', `Failed to get Key List: ${r.metadata.error}`);
      return;
    }
    setKeyList(r.data);
  });
}

export function createEventHubConnection(
  selectedNamespace: IDropdownOption | undefined,
  keyList: KeyList | undefined,
  setNewAppSettingName: (e: string) => void,
  setIsDialogVisible: (d: boolean) => void,
  formProps: FormikProps<BindingEditorFormValues>,
  field: { name: string; value: any }
) {
  if (selectedNamespace && keyList) {
    const appSettingName = `${selectedNamespace.text}_${keyList.keyName}_EVENTHUB`;
    formProps.setFieldValue(field.name, appSettingName);
    setNewAppSettingName(appSettingName);
    setIsDialogVisible(false);
  }
}

export function onNamespaceChange(
  namespace: IDropdownOption | undefined,
  setSelectedNamespace: (n: IDropdownOption | undefined) => void,
  setEventHubs: (e: undefined) => void,
  setSelectedEventHub: (e: undefined) => void,
  setNamespaceAuthRules: (a: undefined) => void,
  setSelectedPolicy: (p: undefined) => void,
  setKeyList: (k: undefined) => void
) {
  setSelectedNamespace(namespace);
  setEventHubs(undefined);
  setSelectedEventHub(undefined);
  setNamespaceAuthRules(undefined);
  setSelectedPolicy(undefined);
  setKeyList(undefined);
}

export function onEventHubChange(
  eventHub: IDropdownOption | undefined,
  setSelectedEventHub: (s: IDropdownOption | undefined) => void,
  setEventHubAuthRules: (a: undefined) => void,
  setSelectedPolicy: (p: undefined) => void,
  setKeyList: (k: undefined) => void
) {
  setSelectedEventHub(eventHub);
  setEventHubAuthRules(undefined);
  setSelectedPolicy(undefined);
  setKeyList(undefined);
}

export function onPolicyChange(
  policy: IDropdownOption | undefined,
  setSelectedPolicy: (p: IDropdownOption | undefined) => void,
  setKeyList: (k: undefined) => void
) {
  setSelectedPolicy(policy);
  setKeyList(undefined);
}
