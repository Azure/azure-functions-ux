import { IDropdownOption } from 'office-ui-fabric-react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterDevOpsProvider from './DeploymentCenterDevopsProvider';

const DeploymentCenterDevOpsDataLoader: React.FC<DeploymentCenterFieldProps> = props => {
  const { t } = useTranslation();
  const { formProps } = props;

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);

  const [organizationOptions, setOrganizationOptions] = useState<IDropdownOption[]>([]);
  const [projectOptions, setProjectOptions] = useState<IDropdownOption[]>([]);
  const [repositoryOptions, setRepositoryOptions] = useState<IDropdownOption[]>([]);
  const [branchOptions, setBranchOptions] = useState<IDropdownOption[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingRepositories, setLoadingRepositories] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const fetchData = async () => {};

  const fetchProjects = async () => {};

  const fetchRepositories = async () => {};

  const fetchBranches = async () => {};

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext]);

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.org]);

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.devOpsProject]);

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.repo]);

  return (
    <DeploymentCenterDevOpsProvider
      formProps={formProps}
      organizationOptions={organizationOptions}
      projectOptions={projectOptions}
      repositoryOptions={repositoryOptions}
      branchOptions={branchOptions}
      loadingOrganizations={loadingOrganizations}
      loadingProjects={loadingProjects}
      loadingRepositories={loadingRepositories}
      loadingBranches={loadingBranches}
    />
  );
};

export default DeploymentCenterDevOpsDataLoader;
