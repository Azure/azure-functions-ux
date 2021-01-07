import { IDropdownOption } from 'office-ui-fabric-react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LogLevels } from '../../../../models/telemetry';
import { PortalContext } from '../../../../PortalContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterFieldProps } from '../DeploymentCenter.types';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import DeploymentCenterDevOpsProvider from './DeploymentCenterDevOpsProvider';

const DeploymentCenterDevOpsDataLoader: React.FC<DeploymentCenterFieldProps> = props => {
  const { formProps } = props;
  const { t } = useTranslation();

  const deploymentCenterData = new DeploymentCenterData();
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const portalContext = useContext(PortalContext);

  const [organizationOptions, setOrganizationOptions] = useState<IDropdownOption[]>([]);
  const [projectOptions, setProjectOptions] = useState<IDropdownOption[]>([]);
  const [repositoryOptions, setRepositoryOptions] = useState<IDropdownOption[]>([]);
  const [branchOptions, setBranchOptions] = useState<IDropdownOption[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingRepositories, setLoadingRepositories] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const orgToProjectMapping = useRef<{ [key: string]: IDropdownOption[] }>({});
  const projectToRepoMapping = useRef<{ [key: string]: IDropdownOption[] }>({});
  const repoUrlToIdMapping = useRef<{ [key: string]: string }>({});

  const fetchOrganizations = async () => {
    setLoadingOrganizations(true);
    orgToProjectMapping.current = {};
    projectToRepoMapping.current = {};
    setProjectOptions([]);
    setRepositoryOptions([]);
    setBranchOptions([]);

    portalContext.log(getTelemetryInfo(LogLevels.info, 'getDevOpsAccounts', 'submit'));
    const accounts = await deploymentCenterData.getAccounts();

    if (!!accounts && accounts.length > 0) {
      const orgOptions = accounts.map(account => ({
        key: account.AccountName,
        text: account.AccountName,
      }));

      setOrganizationOptions(orgOptions);
    } else {
      setErrorMessage(t('deploymentCenterDevOpsNoAccounts'));
    }

    setLoadingOrganizations(false);
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
        portalContext.log(getTelemetryInfo(LogLevels.info, 'getAzureDevOpsRepositories', 'submit'));
        const response = await deploymentCenterData.getAzureDevOpsRepositories(formProps.values.org);

        if (response.metadata.success) {
          const projects: { [key: string]: string } = {};

          response.data.value.forEach(repository => {
            projects[repository.project.id] = repository.project.name;
            const repoDropdownItem = {
              key: repository.remoteUrl,
              text: repository.name,
            };

            repoUrlToIdMapping.current[repository.remoteUrl] = repository.id;

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
          if (!response.metadata.success) {
            portalContext.log(
              getTelemetryInfo(LogLevels.error, 'getAzureDevOpsRepositoriesResponse', 'failed', {
                errorAsString: JSON.stringify(response.metadata.error),
              })
            );
          }
        }

        setProjectOptions(orgToProjectMapping.current[formProps.values.org]);
      }

      setLoadingProjects(false);
    }
  };

  const setRepositories = async () => {
    if (formProps.values.devOpsProjectName && projectToRepoMapping.current[formProps.values.devOpsProjectName]) {
      setLoadingRepositories(true);
      setBranchOptions([]);

      setRepositoryOptions(projectToRepoMapping.current[formProps.values.devOpsProjectName]);
      setLoadingRepositories(false);
    }
  };

  const fetchBranches = async () => {
    if (formProps.values.org && formProps.values.repo) {
      setLoadingBranches(true);

      const repoId = repoUrlToIdMapping.current[formProps.values.repo];
      portalContext.log(getTelemetryInfo(LogLevels.info, 'getAzureDevOpsBranches', 'submit'));
      const response = await deploymentCenterData.getAzureDevOpsBranches(formProps.values.org, repoId);

      if (!!response && response.metadata.success) {
        const dropdownItems = response.data.value.map(branch => {
          const branchName = branch.name.replace('refs/heads/', '');

          return {
            key: branchName,
            text: branchName,
          };
        });

        setBranchOptions(dropdownItems);
      } else {
        if (!response.metadata.success) {
          portalContext.log(
            getTelemetryInfo(LogLevels.error, 'getAzureDevOpsBranchesResponse', 'failed', {
              errorAsString: JSON.stringify(response.metadata.error),
            })
          );
        }
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
    setRepositories();

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
      errorMessage={errorMessage}
    />
  );
};

export default DeploymentCenterDevOpsDataLoader;
