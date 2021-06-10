import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { Link, Icon } from 'office-ui-fabric-react';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { DeploymentCenterFieldProps, DeploymentCenterCodeFormData } from '../DeploymentCenter.types';
import { PortalContext } from '../../../../PortalContext';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';

const DeploymentCenterExternalConfiguredView: React.FC<DeploymentCenterFieldProps<DeploymentCenterCodeFormData>> = props => {
  const { formProps } = props;
  const { t } = useTranslation();

  const [repo, setRepo] = useState<string | undefined>(undefined);
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [externalUsername, setExternalUsername] = useState<string | undefined>(undefined);
  const [isSourceControlLoading, setIsSourceControlLoading] = useState(true);
  const [isBranchInfoMissing, setIsBranchInfoMissing] = useState(false);

  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const portalContext = useContext(PortalContext);
  const deploymentCenterData = new DeploymentCenterData();
  const externalUsernameExists = externalUsername || (formProps && formProps.values.externalUsername);

  const getSourceControlDetails = async () => {
    setIsBranchInfoMissing(false);
    const sourceControlDetailsResponse = await deploymentCenterData.getSourceControlDetails(deploymentCenterContext.resourceId);
    if (sourceControlDetailsResponse.metadata.success) {
      setBranch(sourceControlDetailsResponse.data.properties.branch);
      processRepo(sourceControlDetailsResponse.data.properties.repoUrl);
    } else {
      setIsBranchInfoMissing(true);
      setRepo(t('deploymentCenterErrorFetchingInfo'));
      setBranch(t('deploymentCenterErrorFetchingInfo'));
      portalContext.log(
        getTelemetryInfo('error', 'getSourceControls', 'failed', {
          message: getErrorMessage(sourceControlDetailsResponse.metadata.error),
          error: sourceControlDetailsResponse.metadata.error,
        })
      );
    }
    setIsSourceControlLoading(false);
  };

  const processRepo = (repoUrl: string): void => {
    // NOTE(michinoy): There can be multiple variations of the URL:
    // The protocol can be either https or http
    // The host part can be - username@domain.net/path/name.git
    //                        username:password@domain.net/path/name.git
    //                        domain.net/path/name.git

    const repoUrlParts = repoUrl.split('://');
    const protocol = repoUrlParts[0];
    const hostContents = repoUrlParts[1];
    const hostContentParts = hostContents.split('@');
    const domainContent = hostContentParts[1] ? hostContentParts[1] : hostContentParts[0];
    const usernameAndPassword = hostContentParts[1] ? hostContentParts[0] : '';
    const username = usernameAndPassword ? usernameAndPassword.split(':')[0] : '';

    setExternalUsername(username);
    setRepo(`${protocol}://${domainContent}`);
  };

  const getBranchLink = () => {
    if (!isBranchInfoMissing) {
      return (
        <Link key="deployment-center-branch-link" onClick={() => window.open(repo, '_blank')}>
          {`${branch} `}
          <Icon id={`branch-button`} iconName={'NavigateExternalInline'} />
        </Link>
      );
    }

    return branch;
  };

  const getExternalUsernameValue = (isLoading: boolean) => {
    if (isLoading && formProps && formProps.values.externalUsername) {
      return formProps.values.externalUsername;
    } else if (isLoading && (!formProps || !formProps.values.externalUsername)) {
      return t('loading');
    }
    return externalUsername;
  };

  const getRepoValue = (isLoading: boolean) => {
    if (isLoading && formProps && formProps.values.repo) {
      return formProps.values.repo;
    } else if (isLoading && (!formProps || !formProps.values.repo)) {
      return t('loading');
    }
    return repo;
  };

  const getBranchValue = (isLoading: boolean) => {
    if (isLoading && formProps && formProps.values.branch) {
      return formProps.values.branch;
    } else if (isLoading && (!formProps || !formProps.values.branch)) {
      return t('loading');
    }
    return branch;
  };

  useEffect(() => {
    getSourceControlDetails();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setRepo(getRepoValue(isSourceControlLoading));
    setBranch(getBranchValue(isSourceControlLoading));
    if (externalUsernameExists) {
      setExternalUsername(getExternalUsernameValue(isSourceControlLoading));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSourceControlLoading]);

  return (
    <>
      <h3>{t('deploymentCenterCodeExternalGitTitle')}</h3>
      {externalUsernameExists && (
        <ReactiveFormControl id="deployment-center-username" label={t('deploymentCenterCodeExternalUsernameLabel')}>
          <div>{externalUsername}</div>
        </ReactiveFormControl>
      )}
      <ReactiveFormControl id="deployment-center-repository" label={t('deploymentCenterOAuthRepository')}>
        <div>{repo}</div>
      </ReactiveFormControl>
      <ReactiveFormControl id="deployment-center-branch" label={t('deploymentCenterOAuthBranch')}>
        <div>{isSourceControlLoading ? branch : getBranchLink()}</div>
      </ReactiveFormControl>
    </>
  );
};

export default DeploymentCenterExternalConfiguredView;
