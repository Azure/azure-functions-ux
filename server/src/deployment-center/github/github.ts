export interface GitHubCommitter {
  name: string;
  email: string;
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

export interface GitHubActionWorkflowRequestContent {
  resourceId: string;
  secretName: string;
  commit: GitHubCommit;
  containerUsernameSecretName?: string;
  containerUsernameSecretValue?: string;
  containerPasswordSecretName?: string;
  containerPasswordSecretValue?: string;
}

export interface GitHubSecretPublicKey {
  key_id: string;
  key: string;
}

export interface GitHubDatabaseGetTrees {
  sha: string;
  url: string;
  tree: GitHubDatabaseTree[];
  truncated: boolean;
}

export interface GitHubDatabaseTree {
  path: string;
  mode: string;
  type: string;
  sha: string;
  size: number;
  url: string;
}

export interface FindFilePathInGitHubRepo {
  folderPath: string;
  shouldCreateNewFile: boolean;
  message?: string;
}
