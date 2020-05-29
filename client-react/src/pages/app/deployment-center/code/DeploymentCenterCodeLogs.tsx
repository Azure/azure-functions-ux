import React, { useState } from 'react';
import DisplayTableWithEmptyMessage from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import moment from 'moment';
import { IGroup } from 'office-ui-fabric-react/lib/components/GroupedList/GroupedList.types';
import {
  DeploymentCenterCodeLogsProps,
  DateTimeObj,
  DeploymentStatus,
  DeploymentProperties,
  CodeDeploymentsRow,
} from '../DeploymentCenter.types';
import { ProgressIndicator, PanelType, IColumn, Link, PrimaryButton } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { deploymentCenterLogsError } from '../DeploymentCenter.styles';
import { ArmObj } from '../../../../models/arm-obj';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import DeploymentCenterCommitLogs from './DeploymentCenterCommitLogs';
// import { style } from 'typestyle';
import { ReactComponent as DeploymentCenterIcon } from '../../../../images/Common/deployment-center.svg';
import { style } from 'typestyle';
import { ScmTypes } from '../../../../models/site/config';

export function dateTimeComparatorReverse(a: DateTimeObj, b: DateTimeObj) {
  if (a.rawTime.isBefore(b.rawTime)) {
    return 1;
  }
  if (a.rawTime.isAfter(b.rawTime)) {
    return -1;
  }
  return 0;
}

const DeploymentCenterCodeLogs: React.FC<DeploymentCenterCodeLogsProps> = props => {
  const [isLogPanelOpen, setIsLogPanelOpen] = useState<boolean>(false);
  const [currentCommitId, setCurrentCommitId] = useState<string | undefined>(undefined);
  const { deployments, deploymentsError, siteConfig } = props;
  const { t } = useTranslation();

  const showLogPanel = (deployment: ArmObj<DeploymentProperties>) => {
    setIsLogPanelOpen(true);
    setCurrentCommitId(deployment.id);
  };
  const dismissLogPanel = () => {
    setIsLogPanelOpen(false);
    setCurrentCommitId(undefined);
  };

  const getStatusString = (status: DeploymentStatus, progressString: string) => {
    switch (status) {
      case DeploymentStatus.Building:
      case DeploymentStatus.Deploying:
        return progressString;
      case DeploymentStatus.Pending:
        return t('pending');
      case DeploymentStatus.Failed:
        return t('failed');
      case DeploymentStatus.Success:
        return t('success');
      default:
        return '';
    }
  };

  const getDeploymentRow = (deployment: ArmObj<DeploymentProperties>, index: number): CodeDeploymentsRow => {
    return {
      index: index,
      rawTime: moment(deployment.properties.received_time),
      // NOTE (t-kakan): A is AM/PM and Z is offset from GMT: -07:00 -06:00 ... +06:00 +07:00
      displayTime: moment(deployment.properties.received_time).format('h:mm:ss A Z'),
      commit: (
        <Link href={`#${deployment.properties.id}`} onClick={() => showLogPanel(deployment)}>
          {deployment.properties.id.substr(0, 7)}
        </Link>
      ),
      checkinMessage: deployment.properties.message,
      status: deployment.properties.active
        ? `${getStatusString(deployment.properties.status, deployment.properties.progress)} (${t('active')})`
        : `${getStatusString(deployment.properties.status, deployment.properties.progress)}`,
    };
  };

  const getItemGroups = (items: CodeDeploymentsRow[]): IGroup[] => {
    const groups: IGroup[] = [];
    items.forEach((item, index) => {
      if (index === 0 || !item.rawTime.isSame(groups[groups.length - 1].data.startIndexRawTime, 'day')) {
        const group = {
          key: `Group${groups.length}`,
          name: item.rawTime.format('dddd, MMMM D, YYYY'),
          startIndex: index,
          count: 1,
          data: { startIndexRawTime: item.rawTime },
        };
        groups.push(group);
      } else {
        groups[groups.length - 1].count += 1;
      }
    });
    return groups;
  };

  const rows: CodeDeploymentsRow[] = deployments ? deployments.value.map((deployment, index) => getDeploymentRow(deployment, index)) : [];
  const items: CodeDeploymentsRow[] = rows.sort(dateTimeComparatorReverse);

  const columns: IColumn[] = [
    { key: 'displayTime', name: t('time'), fieldName: 'displayTime', minWidth: 150 },
    { key: 'commit', name: t('commitId'), fieldName: 'commit', minWidth: 150 },
    { key: 'status', name: t('status'), fieldName: 'status', minWidth: 210 },
    { key: 'checkinMessage', name: t('checkinMessage'), fieldName: 'checkinMessage', minWidth: 210 },
  ];

  const groups: IGroup[] = getItemGroups(items);

  // const cloud3 = style({
  //   // position: 'absolute',
  //   top: '600px',
  //   left: '960px',
  //   width: '100px',
  // });

  const notConfiguredInfo = style({
    width: '100%',
    textAlign: 'center',

    $nest: {
      h3: {
        marginTop: '12px',
        fontSize: '18px',
      },

      p: {
        fontSize: '15px',
      },

      svg: {
        height: '200px',
        width: '200px',
        marginTop: '18px',
      },
    },
  });

  const getZeroDayContent = () => {
    if (siteConfig && siteConfig.properties.scmType === ScmTypes.None) {
      return (
        <>
          <div className={notConfiguredInfo}>
            <DeploymentCenterIcon />
            <h3>CI/CD is not configured</h3>
            <p>To start, go to Settings tab and set up CI/CD.</p>
            <PrimaryButton text="Go to Settings" />
          </div>
        </>
      );
    } else {
      return <h3>No deployments found</h3>;
    }
  };

  return (
    <>
      {deploymentsError ? (
        <pre className={deploymentCenterLogsError}>{deploymentsError}</pre>
      ) : deployments ? (
        <>
          <DisplayTableWithEmptyMessage columns={columns} items={items} selectionMode={0} groups={groups} />
          {items.length === 0 && getZeroDayContent()}
        </>
      ) : (
        <ProgressIndicator
          description={t('deploymentCenterCodeDeploymentsLoading')}
          ariaValueText={t('deploymentCenterCodeDeploymentsLoadingAriaValue')}
        />
      )}
      <CustomPanel isOpen={isLogPanelOpen} onDismiss={dismissLogPanel} type={PanelType.medium}>
        <DeploymentCenterCommitLogs commitId={currentCommitId} />
      </CustomPanel>
    </>
  );
};

export default DeploymentCenterCodeLogs;
