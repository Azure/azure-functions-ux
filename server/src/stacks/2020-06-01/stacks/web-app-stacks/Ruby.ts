import { WebAppStack } from '../../models/WebAppStackModel';

const ruby2Point4EOL = new Date(2020, 4, 1).toString();
const ruby2Point3EOL = new Date(2019, 3, 31).toString();

export const rubyStack: WebAppStack = {
  displayText: 'Ruby',
  value: 'ruby',
  preferredOs: 'windows',
  majorVersions: [],
};
