import React, { useEffect, useState } from 'react';
import LoadingComponent from '../../../../../components/loading/loading-component';
import { ArmObj } from '../../../../../models/arm-obj';
import { NewConnectionDialogProps } from './DialogProperties';
import { IDropdownOption } from 'office-ui-fabric-react';
import { fetchNamespaces, fetchEventHubs, fetchNamespaceAuthRules, fetchEventHubAuthRules, fetchKeyList } from './EventHubPivot.data';
import { Namespace, EventHub, AuthorizationRule, KeyList } from '../../../../../models/eventhub';
import EventHubPivot from './EventHubPivot';
import { FieldProps } from 'formik';

const EventHubPivotDataLoader: React.SFC<NewConnectionDialogProps & FieldProps> = props => {
  const { resourceId } = props;
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

  return (
    <EventHubPivot
      namespaces={namespaces}
      eventHubs={eventHubs}
      setEventHubs={setEventHubs}
      namespaceAuthRules={namespaceAuthRules}
      setNamespaceAuthRules={setNamespaceAuthRules}
      eventHubAuthRules={eventHubAuthRules}
      setEventHubAuthRules={setEventHubAuthRules}
      selectedNamespace={selectedNamespace}
      setSelectedNamespace={setSelectedNamespace}
      selectedEventHub={selectedEventHub}
      setSelectedEventHub={setSelectedEventHub}
      selectedPolicy={selectedPolicy}
      setSelectedPolicy={setSelectedPolicy}
      keyList={keyList}
      setKeyList={setKeyList}
      {...props}
    />
  );
};

export default EventHubPivotDataLoader;
