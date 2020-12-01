import { IDropdownOption } from 'office-ui-fabric-react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterDevOpsProvider from './DeploymentCenterDevOpsProvider';

const DeploymentCenterDevOpsDataLoader: React.FC<DeploymentCenterFieldProps> = props => {
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

  const orgToProjectMapping = useRef<{ [key: string]: IDropdownOption[] }>({});
  const projectToRepoMapping = useRef<{ [key: string]: IDropdownOption[] }>({});

  const fetchOrganizations = async () => {
    setLoadingOrganizations(true);
    orgToProjectMapping.current = {};
    projectToRepoMapping.current = {};
    setProjectOptions([]);
    setRepositoryOptions([]);
    setBranchOptions([]);

    const accounts = await deploymentCenterData.getAccounts();

    if (!!accounts && accounts.length > 0) {
      const orgOptions = accounts.map(account => ({
        key: account.AccountName,
        text: account.AccountName,
      }));

      setOrganizationOptions(orgOptions);
      setLoadingOrganizations(false);
    } else {
      // TODO (michinoy): add an error message here and log it.
    }
  };

  const fetchProjects = async () => {
    // NOTE(michinoy): Once the user has selected their organization we load a list of all repositories in that org
    // each repository is associated with a project. Here we will cache the list of repositories and crate
    // a mapping of org to project to repo.

    if (formProps.values.org) {
      setLoadingProjects(true);
      setRepositoryOptions([]);
      setBranchOptions([]);

      if (!orgToProjectMapping.current[formProps.values.org]) {
        const repositories = await deploymentCenterData.getAzureDevOpsRepositories(formProps.values.org);

        if (!!repositories && repositories.metadata.success) {
          const projects: { [key: string]: string } = {};

          repositories.data.value.forEach(repository => {
            projects[repository.project.id] = repository.project.name;
            const repoDropdownItem = {
              key: repository.id,
              text: repository.name,
            };

            if (projectToRepoMapping.current[repository.project.id]) {
              projectToRepoMapping.current[repository.project.id].push(repoDropdownItem);
            } else {
              projectToRepoMapping.current[repository.project.id] = [repoDropdownItem];
            }
          });

          orgToProjectMapping.current[formProps.values.org] = Object.keys(projects).map(key => ({
            key,
            text: projects[key],
          }));
        } else {
          // TODO (michinoy): add an error message here and log it.
        }

        setProjectOptions(orgToProjectMapping.current[formProps.values.org]);
      }

      setLoadingProjects(false);
    }
  };

  const fetchRepositories = async () => {
    if (formProps.values.devOpsProjectName && projectToRepoMapping.current[formProps.values.devOpsProjectName]) {
      setLoadingRepositories(true);
      setBranchOptions([]);

      setRepositoryOptions(projectToRepoMapping.current[formProps.values.devOpsProjectName]);
      setLoadingRepositories(false);
    } else {
      // TODO (michinoy): add an error message here and log it.
    }
  };

  const fetchBranches = async () => {
    if (formProps.values.org && formProps.values.repo) {
      setLoadingBranches(true);

      const branches = await deploymentCenterData.getAzureDevOpsBranches(formProps.values.org, formProps.values.repo);

      if (!!branches && branches.metadata.success) {
        const dropdownItems = branches.data.value.map(branch => ({
          key: branch.name,
          text: branch.name,
        }));

        setBranchOptions(dropdownItems);
      } else {
        // TODO (michinoy): add an error message here and log it.
      }

      setLoadingBranches(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentCenterContext]);

  useEffect(() => {
    fetchProjects();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.org]);

  useEffect(() => {
    fetchRepositories();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formProps.values.devOpsProjectName]);

  useEffect(() => {
    fetchBranches();

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
