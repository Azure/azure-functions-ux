import { PublishingCredentials } from '../../../shared/models/publishing-credentials';
import { SiteConfig } from '../../../shared/models/arm/site-config';
import { Site } from '../../../shared/models/arm/site';
import { ArmArrayResult, ArmObj } from '../../../shared/models/arm/arm-obj';
export class DeploymentData {
  site: ArmObj<Site>;
  siteConfig?: ArmObj<SiteConfig>;
  siteMetadata?: ArmObj<{ [key: string]: string }>;
  deployments: ArmArrayResult<Deployment>;
  publishingCredentials?: ArmObj<PublishingCredentials>;
  sourceControls?: ArmObj<SourceControlData>;
  publishingUser?: ArmObj<{
    publishingUserName: string;
  }>;
}

export interface SourceControlData {
  deploymentRollbackEnabled: boolean;
  repoUrl: string;
  branch: string;
  isMercurial: boolean;
  isGitHubAction?: boolean;
}
export interface Deployment {
  id: string;
  status: number;
  status_text: string;
  author_email: string;
  author: string;
  deployer: string;
  message: string;
  progress: string;
  received_time: Date;
  start_time: Date;
  end_time: Date;
  last_success_end_time: Date;
  complete: boolean;
  active: boolean;
  is_temp: boolean;
  is_readonly: boolean;
  url: string;
  log_url: string;
  site_name: string;
}

export interface CredentialsData {
  resourceId: string;
}

export interface GithubActionDashboardData {
  resourceId: string;
}
