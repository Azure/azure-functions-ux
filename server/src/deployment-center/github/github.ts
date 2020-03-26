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
}

export interface GitHubSecretPublicKey {
  key_id: string;
  key: string;
}
