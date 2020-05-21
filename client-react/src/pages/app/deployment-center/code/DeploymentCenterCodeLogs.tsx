import React from 'react';
import DisplayTableWithEmptyMessage from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import moment from 'moment';
import { IGroup } from 'office-ui-fabric-react/lib/components/GroupedList/GroupedList.types';
import { DeploymentCenterCodeLogsProps } from '../DeploymentCenter.types';
import { ProgressIndicator } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';

interface DateTimeObj {
  rawTime: moment.Moment;
}
export function dateTimeComparator(a: DateTimeObj, b: DateTimeObj) {
  if (a.rawTime < b.rawTime) {
    return -1;
  }
  if (a.rawTime > b.rawTime) {
    return 1;
  }
  return 0;
}

export function dateTimeComparatorReverse(a: DateTimeObj, b: DateTimeObj) {
  if (a.rawTime < b.rawTime) {
    return 1;
  }
  if (a.rawTime > b.rawTime) {
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

const DeploymentCenterCodeLogs: React.FC<DeploymentCenterCodeLogsProps> = props => {
  const { deployments } = props;
  const { t } = useTranslation();

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

  const rows = deployments.value.map((deployment, index) => ({
    index: index,
    rawTime: moment(deployment.properties.received_time),
    displayTime: moment(deployment.properties.received_time).format('h:mm:ss A Z'),
    commit: deployment.properties.id.substr(0, 7),
    checkinMessage: deployment.properties.message,
    status:
      getStatusString(deployment.properties.status, deployment.properties.progress) + (deployment.properties.active ? ' (Active)' : ''),
  }));
  const items = rows.sort(dateTimeComparatorReverse);

  const columns = [
    { key: 'displayTime', name: 'Time', fieldName: 'displayTime', minWidth: 150 },
    { key: 'commit', name: 'Commit ID', fieldName: 'commit', minWidth: 150 },
    { key: 'status', name: 'Status', fieldName: 'status', minWidth: 210 },
    { key: 'checkinMessage', name: 'Checkin Message', fieldName: 'checkinMessage', minWidth: 210 },
  ];

  var groups: IGroup[] = [];
  var previousMoment: moment.Moment;
  items.forEach((item, index) => {
    if (index === 0 || !item.rawTime.isSame(previousMoment, 'day')) {
      var group = { key: 'Group' + groups.length, name: item.rawTime.format('dddd, MMMM D, YYYY'), startIndex: index, count: 1 };
      previousMoment = item.rawTime;
      groups.push(group);
    } else {
      groups[groups.length - 1].count += 1;
    }
  });

  return (
    <>
      {deployments ? (
        <DisplayTableWithEmptyMessage columns={columns} items={items} selectionMode={0} groups={groups} />
      ) : (
        <ProgressIndicator
          description={t('deploymentCenterCodeLogsLoading')}
          ariaValueText={t('deploymentCenterCodeLogsLoadingAriaValue')}
        />
      )}
    </>
  );
};

export default DeploymentCenterCodeLogs;
