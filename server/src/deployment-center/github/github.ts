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

export interface GitHubFileGetTrees {
  sha: string;
  url: string;
  tree: GitHubFileTree[];
  truncated: boolean;
}

export interface GitHubFileTree {
  path: string;
  mode: GitHubFileTreeMode;
  type: string;
  sha: string;
  size: number;
  url: string;
}

export interface GitHubFileSearchResult {
  isFound: boolean;
  folderPath?: string;
}

export enum GitHubFileTreeMode {
  file = '100644',
  folder = '040000',
  blob = '100755',
}
