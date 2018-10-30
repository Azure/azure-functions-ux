import { RuntimeExtension } from './binding';
export interface ExtensionJobsStatus {
  jobs: Array<{
    id: string;
    status: 'Started'; // validate
    startTime: string;
    properties: RuntimeExtension;
  }>;
  links: Array<{
    rel: string;
    href: string;
  }>;
}
