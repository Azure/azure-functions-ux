/// <reference types="react-scripts" />

import { ITeachingBubbleProps } from 'office-ui-fabric-react';

declare module 'office-ui-fabric-react/lib/Coachmark' {
  const Coachmark: React.StatelessComponent<ICoachmarkProps>;
}

declare module 'office-ui-fabric-react/lib/TeachingBubble' {
  const TeachingBubbleContent: React.StatelessComponent<ITeachingBubbleProps>;
}

interface Environment {
  hostName: string;
  runtimeType: 'OnPrem' | 'Azure';
  azureResourceManagerEndpoint?: string;
  armToken?: string;
  appName: string;
}

interface Ajax {
  armCall: Function;
  httpRequest: Function;
}

interface Logging {
  trackEvent: Function;
  trackError: Function;
}

interface AppSvc {
  env: Environment;
  version: string;
  sessionId: string;
  resourceId?: string;
  feature?: string;
  cdn?: string;
  cacheBreakQuery?: string;
  frameId?: string;
  officeFabricIconsCdn?: string;
  ajax?: Ajax;
  logging?: Logging;
}

declare global {
  interface Window {
    /**
     * Formats a string based on its key value pair object.
     *
     * @param args The list of arguments format arguments. For example: "String with params {0} and {1}".format("val1", "val2");.
     * @return Formatted string.
     */
    appsvc?: AppSvc;
    updateAuthToken?: (type: string) => Promise<string>;
  }
}
