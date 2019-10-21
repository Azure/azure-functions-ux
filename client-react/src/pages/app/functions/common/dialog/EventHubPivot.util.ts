import { BindingEditorFormValues } from '../BindingFormBuilder';
import { KeyList, Namespace, EventHub, AuthorizationRule } from '../../../../../models/eventhub';
import { IDropdownOption } from 'office-ui-fabric-react';
import { FormikProps } from 'formik';
import { ArmObj } from '../../../../../models/arm-obj';
import { NewConnectionDialogProps } from './DialogProperties';

export interface EventHubPivotProps extends NewConnectionDialogProps {
  namespaces: ArmObj<Namespace>[];
  eventHubs: ArmObj<EventHub>[] | undefined;
  setEventHubs: (e: ArmObj<EventHub>[] | undefined) => void;
  namespaceAuthRules: ArmObj<AuthorizationRule>[] | undefined;
  setNamespaceAuthRules: (n: ArmObj<AuthorizationRule>[] | undefined) => void;
  eventHubAuthRules: ArmObj<AuthorizationRule>[] | undefined;
  setEventHubAuthRules: (e: ArmObj<AuthorizationRule>[] | undefined) => void;
  selectedNamespace: IDropdownOption | undefined;
  setSelectedNamespace: (n: IDropdownOption | undefined) => void;
  selectedEventHub: IDropdownOption | undefined;
  setSelectedEventHub: (e: IDropdownOption | undefined) => void;
  selectedPolicy: IDropdownOption | undefined;
  setSelectedPolicy: (p: IDropdownOption | undefined) => void;
  keyList: KeyList | undefined;
  setKeyList: (k: KeyList | undefined) => void;
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
