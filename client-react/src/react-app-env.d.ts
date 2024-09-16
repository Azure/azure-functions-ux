/// <reference types="vite/client" />

/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare module '*.avif' {
  const src: string;
  export default src;
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  import * as React from 'react';

  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;

  const src: string;
  export default src;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
import { ITeachingBubbleProps } from '@fluentui/react';

declare module '@fluentui/react/Coachmark' {
  const Coachmark: React.StatelessComponent<ICoachmarkProps>;
}

declare module '@fluentui/react/TeachingBubble' {
  const TeachingBubbleContent: React.StatelessComponent<ITeachingBubbleProps>;
}

interface Environment {
  hostName: string;
  runtimeType: 'OnPrem' | 'Azure';
  azureResourceManagerEndpoint?: string;
  armToken?: string;
  appName: string;
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
