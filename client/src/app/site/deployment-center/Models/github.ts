export class FileContent {
  path: string;
  type: string;
  contents: string;
  encoding: string;
  sha: string;
}

export class WorkflowCommitter {
  name: string;
  email: string;
}

export class WorkflowCommit {
  message: string;
  committer: WorkflowCommitter;
  content: string;
  branch: string;
  sha?: string;
}
