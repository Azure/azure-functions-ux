import { WebAppStack } from '../../models/WebAppStackModel';

const node14EOL = new Date(2023, 4, 30).toString();
const node12EOL = new Date(2022, 4, 1).toString();
const node10EOL = new Date(2021, 4, 1).toString();
const node9EOL = new Date(2019, 6, 30).toString();
const node8EOL = new Date(2019, 12, 31).toString();
const node7EOL = new Date(2017, 6, 30).toString();
const node6EOL = new Date(2019, 4, 30).toString();
const node4EOL = new Date(2018, 4, 30).toString();

export const nodeStack: WebAppStack = {
  displayText: 'Node',
  value: 'node',
  preferredOs: 'windows',
  majorVersions: [],
};
