import React, { useState, useEffect, useContext } from 'react';
import MakeArmCall from '../../../../ApiHelpers/ArmHelper';
// import MakeArmCall, { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import DisplayTableWithEmptyMessage from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import { ArmArray } from '../../../../models/arm-obj';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import moment from 'moment';
import { IGroup } from 'office-ui-fabric-react/lib/components/GroupedList/GroupedList.types';

export interface DeploymentLogProperties {
  id: string;
  status: number;
  status_text: string;
  author_email: string;
  author: string;
  deployer: string;
  message: string;
  progress: string;
  received_time: string;
  start_time: string;
  end_time: string;
  last_success_end_time: string;
  complete: string;
  active: string;
  is_temp: string;
  is_readonly: string;
  url: string;
  log_url: string;
  site_name: string;
}

export interface Group {
  key: moment.Moment;
  name: string;
  startIndex: number;
  count: number;
}

interface DateTimeObj {
  time: moment.Moment;
}
export function dateTimeComparator(a: DateTimeObj, b: DateTimeObj) {
  if (a.time < b.time) {
    return -1;
  }
  if (a.time > b.time) {
    return 1;
  }
  return 0;
}

export function dateTimeComparatorReverse(a: DateTimeObj, b: DateTimeObj) {
  if (a.time < b.time) {
    return 1;
  }
  if (a.time > b.time) {
    return -1;
  }
  return 0;
}

enum DeployStatus {
  Pending,
  Building,
  Deploying,
  Failed,
  Success,
}

const DeploymentCenterCodeLogs: React.FC<{}> = props => {
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const resourceId = deploymentCenterContext.resourceId;
  // const { t } = useTranslation();
  const [logs, setLogs] = useState<ArmArray<DeploymentLogProperties> | undefined>(undefined);

  const getCodeResource = async () => {
    const id = `${resourceId}/deployments`;
    const getCodeLogsResponse = MakeArmCall<ArmArray<DeploymentLogProperties>>({
      resourceId: id,
      commandName: 'fetchCodeLogs',
      method: 'GET',
      skipBatching: true,
    });

    const codeLogsResponse = await getCodeLogsResponse;

    if (codeLogsResponse.metadata.success) {
      setLogs(codeLogsResponse.data);
    } else {
      // const errorMessage = getErrorMessage(codeLogsResponse.metadata.error);
      // setLogs(
      //   errorMessage ? t('deploymentCenterContainerLogsFailedWithError').format(errorMessage) : t('deploymentCenterContainerLogsFailed')
      // );
    }
  };

  useEffect(() => {
    getCodeResource();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!logs) {
    return <LoadingComponent />;
  }

  const getStatusString = (status: DeployStatus, progressString: string) => {
    switch (status) {
      case DeployStatus.Building:
      case DeployStatus.Deploying:
        return progressString;
      case DeployStatus.Pending:
        return 'Pending';
      case DeployStatus.Failed:
        return 'Failed';
      case DeployStatus.Success:
        return 'Success';
      default:
        return '';
    }
  };

  const rows = logs.value.map((log, index) => ({
    index: index,
    time: moment(log.properties.received_time),
    t: moment(log.properties.received_time).format('h:mm:ss A Z'),
    commit: log.properties.id.substr(0, 7),
    checkinMessage: log.properties.message,
    status: getStatusString(log.properties.status, log.properties.progress) + (log.properties.active ? ' (Active)' : ''),
  }));
  const items = rows.sort(dateTimeComparatorReverse);
  const columns = [
    { key: 't', name: 'Time', fieldName: 't', minWidth: 210 },
    { key: 'status', name: 'Status', fieldName: 'status', minWidth: 210 },
    { key: 'commit', name: 'Commit ID', fieldName: 'commit', minWidth: 210 },
    { key: 'checkinMessage', name: 'Checkin Message', fieldName: 'checkinMessage', minWidth: 210 },
  ];

  var groups: IGroup[] = [];
  var previousMoment: moment.Moment = moment(0);
  items.forEach((item, index) => {
    if (index === 0 || !item.time.isSame(previousMoment, 'day')) {
      var group = { key: 'Group' + groups.length, name: item.time.format('dddd, MMMM D, YYYY'), startIndex: index, count: 1 };
      previousMoment = item.time;
      groups.push(group);
    } else {
      groups[groups.length - 1].count += 1;
    }
  });

  return <DisplayTableWithEmptyMessage columns={columns} items={items} selectionMode={0} groups={groups} />;
};

export default DeploymentCenterCodeLogs;
