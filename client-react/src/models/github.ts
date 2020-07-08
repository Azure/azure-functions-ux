export interface GitHubUser {
  avatar_url: string;
  blog: string;
  created_at: string;
  events_url: string;
  followers: number;
  followers_url: string;
  following: number;
  following_url: string;
  gists_url: string;
  gravatar_id: string;
  html_url: string;
  id: number;
  login: string;
  name: string;
  node_id: string;
  organizations_url: string;
  public_gists: number;
  public_repos: number;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  updated_at: string;
  url: string;
  bio?: string;
  company?: string;
  email?: string;
  hireable?: string;
  location?: string;
}

// Note (t-kakan): optional properties only should be null when getting directory content rather than a file
export class FileContent {
  path: string;
  type: string;
  sha: string;
  content?: string;
  encoding?: string;
}

export interface GitHubActionWorkflowRequestContent {
  resourceId: string;
  secretName: string;
  commit: GitHubCommit;
}

export interface GitHubCommit {
  repoName: string;
  branchName: string;
  filePath: string;
  message: string;
  committer: GitHubCommitter;
  contentBase64Encoded?: string;
  sha?: string;
}

export interface GitHubCommitter {
  name: string;
  email: string;
}

export interface GitHubOrganizations {
  avatar_url: string;
  description: string;
  events_url: string;
  hooks_url: string;
  id: number;
  issues_url: string;
  login: string;
  members_url: string;
  node_id: string;
  public_members_url: string;
  repos_url: string;
  url: string;
}

export interface GitHubRepository {
  name: string;
  html_url: string;
  branches_url: string;
  url: string;
  permissions?: GitHubRepositoryPermissions;
}

export interface GitHubRepositoryPermissions {
  admin: boolean;
  pull: boolean;
  push: boolean;
}

export interface GitHubBranch {
  name: string;
  protected: boolean;
}
