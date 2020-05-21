import React, { useState } from 'react';
import DisplayTableWithEmptyMessage from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import moment from 'moment';
import { IGroup } from 'office-ui-fabric-react/lib/components/GroupedList/GroupedList.types';
import { DeploymentCenterCodeLogsProps, DeployStatus } from '../DeploymentCenter.types';
import { ProgressIndicator, PanelType } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';

interface DateTimeObj {
  rawTime: moment.Moment;
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

const DeploymentCenterCodeLogs: React.FC<DeploymentCenterCodeLogsProps> = props => {
  const [isLogPanelOpen, setIsLogPanelOpen] = useState<boolean>(false);
  const { deployments } = props;
  const { t } = useTranslation();

  const getStatusString = (status: DeployStatus, progressString: string) => {
    switch (status) {
      case DeployStatus.Building:
      case DeployStatus.Deploying:
        return progressString;
      case DeployStatus.Pending:
        return t('pending');
      case DeployStatus.Failed:
        return t('failed');
      case DeployStatus.Success:
        return t('success');
      default:
        return '';
    }
  };

  const rows = deployments.value.map((deployment, index) => ({
    index: index,
    rawTime: moment(deployment.properties.received_time),
    displayTime: moment(deployment.properties.received_time).format('h:mm:ss A Z'),
    commit: React.createElement(
      'a',
      {
        href: '#' + deployment.properties.id,
        onClick: () => {
          showLogPanel(deployment);
        },
      },
      deployment.properties.id.substr(0, 7)
    ),
    checkinMessage: deployment.properties.message,
    status:
      getStatusString(deployment.properties.status, deployment.properties.progress) + (deployment.properties.active ? ' (Active)' : ''),
  }));
  const items = rows.sort(dateTimeComparatorReverse);

  const columns = [
    { key: 'displayTime', name: t('time'), fieldName: 'displayTime', minWidth: 150 },
    { key: 'commit', name: t('commitId'), fieldName: 'commit', minWidth: 150 },
    { key: 'status', name: t('status'), fieldName: 'status', minWidth: 210 },
    { key: 'checkinMessage', name: t('checkinMessage'), fieldName: 'checkinMessage', minWidth: 210 },
  ];

  const groups: IGroup[] = [];
  let previousMoment: moment.Moment;
  items.forEach((item, index) => {
    if (index === 0 || !item.rawTime.isSame(previousMoment, 'day')) {
      const group = { key: 'Group' + groups.length, name: item.rawTime.format('dddd, MMMM D, YYYY'), startIndex: index, count: 1 };
      previousMoment = item.rawTime;
      groups.push(group);
    } else {
      groups[groups.length - 1].count += 1;
    }
  });

  const showLogPanel = deployment => {
    console.log(deployment);
    setIsLogPanelOpen(true);
  };
  const dismissLogPanel = () => {
    setIsLogPanelOpen(false);
  };

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
      <CustomPanel isOpen={isLogPanelOpen} onDismiss={dismissLogPanel} type={PanelType.medium} />
    </>
  );
};

export default DeploymentCenterCodeLogs;
