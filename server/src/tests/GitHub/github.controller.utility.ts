import { GitHubFileTree } from '../../../src/deployment-center/github/github';

export function gitHubTreeCallMockResponse(mockDataName: GitHubFileTree[]) {
  return {
    data: { tree: mockDataName },
    status: 200,
    statusText: '',
    headers: undefined,
    config: undefined,
  };
}
